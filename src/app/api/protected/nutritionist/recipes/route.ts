import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createRecipeSchema } from '@/lib/api-schemas';
import { upsertAutoTags } from '@/lib/recipe-auto-tags-db';

// Helper: resolve nutritionist profile ID from auth user
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveNutritionistId(
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('nutritionist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const RECIPE_SELECT = `
  *,
  recipe_categories(*),
  recipe_tag_assignments(tag_id, recipe_tags(*)),
  recipe_auto_tags(*),
  recipe_ingredients(*, foods!food_id(calories, proteins, carbohydrates, fat, fiber)),
  recipe_steps(*)
`;

// Simpler select without nested joins — used after INSERT (no ingredients yet)
const RECIPE_SELECT_MINIMAL = `
  *,
  recipe_categories(*),
  recipe_tag_assignments(tag_id, recipe_tags(*)),
  recipe_auto_tags(*),
  recipe_ingredients(*),
  recipe_steps(*)
`;

/**
 * GET /api/protected/nutritionist/recipes
 * List all recipes for the authenticated nutritionist
 * Query params: category_id, status, difficulty, search, tags, auto_tags, page, limit
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const autoTags = searchParams.get('auto_tags');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const offset = (page - 1) * limit;

    let query = s
      .from('recipes')
      .select(RECIPE_SELECT, { count: 'exact' })
      .eq('created_by', auth.user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categoryId) query = query.eq('category_id', categoryId);
    if (status) query = query.eq('status', status);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (search) query = query.ilike('title', `%${search}%`);

    // Filter by manual tags (OR logic — recipe must have at least one of the given tags)
    if (tags) {
      const tagIds = tags.split(',').filter(Boolean);
      if (tagIds.length > 0) {
        const { data: matchingRecipes } = await s
          .from('recipe_tag_assignments')
          .select('recipe_id')
          .in('tag_id', tagIds);
        const recipeIds = [
          ...new Set(
            (matchingRecipes || []).map(
              (r: { recipe_id: string }) => r.recipe_id
            )
          ),
        ];
        if (recipeIds.length > 0) {
          query = query.in('id', recipeIds);
        } else {
          return apiResponse.success({
            recipes: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          });
        }
      }
    }

    // Filter by auto-tags (OR logic — recipe must have at least one of the given auto-tag values)
    if (autoTags) {
      const autoTagValues = autoTags.split(',').filter(Boolean);
      if (autoTagValues.length > 0) {
        const { data: matchingRecipes } = await s
          .from('recipe_auto_tags')
          .select('recipe_id')
          .in('tag_value', autoTagValues);
        const recipeIds = [
          ...new Set(
            (matchingRecipes || []).map(
              (r: { recipe_id: string }) => r.recipe_id
            )
          ),
        ];
        if (recipeIds.length > 0) {
          query = query.in('id', recipeIds);
        } else {
          return apiResponse.success({
            recipes: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          });
        }
      }
    }

    const { data: recipes, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Error fetching recipes:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des recettes'
      );
    }

    // Enrich with real ratings from recipe_ratings (trigger may not be migrated)
    const recipeIds = (recipes || []).map((r: { id: string }) => r.id);
    let ratingsMap: Record<string, { avg: number; count: number }> = {};
    if (recipeIds.length > 0) {
      const { data: ratings } = await s
        .from('recipe_ratings')
        .select('recipe_id, rating')
        .in('recipe_id', recipeIds);

      if (ratings && ratings.length > 0) {
        const grouped: Record<string, number[]> = {};
        for (const r of ratings as { recipe_id: string; rating: number }[]) {
          if (!grouped[r.recipe_id]) grouped[r.recipe_id] = [];
          grouped[r.recipe_id].push(r.rating);
        }
        for (const [recipeId, values] of Object.entries(grouped)) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          ratingsMap[recipeId] = {
            avg: Math.round(avg * 100) / 100,
            count: values.length,
          };
        }
      }
    }

    const enrichedRecipes = (recipes || []).map(
      (r: { id: string; average_rating: number; rating_count: number }) => ({
        ...r,
        average_rating: ratingsMap[r.id]?.avg ?? r.average_rating,
        rating_count: ratingsMap[r.id]?.count ?? r.rating_count,
      })
    );

    return apiResponse.success({
      recipes: enrichedRecipes,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/recipes
 * Create a new recipe (draft)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const body = await req.json();
    const parsed = createRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;

    // Generate unique slug
    let slug = generateSlug(data.title);
    const { data: existing } = await s
      .from('recipes')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Extract tags before insert
    const tagIds = data.tags || [];
    const dietTagIds = data.diet_types || [];

    const insertData = {
      created_by: auth.user.id,
      title: data.title,
      slug,
      description: data.description || null,
      category_id: data.category_id || null,
      difficulty: data.difficulty,
      prep_time_minutes: data.prep_time_minutes,
      cook_time_minutes: data.cook_time_minutes,
      servings: data.servings,
      image_url: data.image_url || null,
      tips: data.tips || null,
      status: 'draft' as const,
    };

    const { data: created, error: createError } = await s
      .from('recipes')
      .insert(insertData)
      .select(RECIPE_SELECT_MINIMAL)
      .single();

    if (createError) {
      console.error('Error creating recipe:', createError);
      return apiResponse.serverError(
        'Erreur lors de la création de la recette'
      );
    }

    // Insert tag assignments
    const allTagIds = [...new Set([...tagIds, ...dietTagIds])];
    if (allTagIds.length > 0) {
      const tagAssignments = allTagIds.map(tagId => ({
        recipe_id: created.id,
        tag_id: tagId,
      }));
      await s.from('recipe_tag_assignments').insert(tagAssignments);
    }

    // Compute and persist auto-tags (calories, time, nutrition)
    await upsertAutoTags(s, created.id);

    // Re-fetch with full joins
    const { data: fullRecipe } = await s
      .from('recipes')
      .select(RECIPE_SELECT)
      .eq('id', created.id)
      .single();

    return apiResponse.success(fullRecipe || created, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
