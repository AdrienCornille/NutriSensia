import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

const RECIPE_SELECT = `
  *,
  recipe_categories(*),
  recipe_tag_assignments(tag_id, recipe_tags(*)),
  recipe_auto_tags(*),
  recipe_ingredients(*, foods!food_id(calories, proteins, carbohydrates, fat, fiber)),
  recipe_steps(*)
`;

/**
 * GET /api/protected/recipes
 * Browse published recipes for authenticated patient
 * Only returns recipes from the patient's nutritionist
 * Query params: category_id, difficulty, search, sort, page, limit
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Get patient's nutritionist ID
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('nutritionist_id, nutritionist_profiles(user_id)')
      .eq('user_id', auth.user.id)
      .single();

    const nutritionistUserId = patientProfile?.nutritionist_profiles?.user_id;

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category_id');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const autoTags = searchParams.get('auto_tags');
    const sort = searchParams.get('sort') || 'recent'; // recent, rating, quick
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const offset = (page - 1) * limit;

    let query = s
      .from('recipes')
      .select(RECIPE_SELECT, { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .range(offset, offset + limit - 1);

    // Filter to patient's nutritionist if they have one
    if (nutritionistUserId) {
      query = query.eq('created_by', nutritionistUserId);
    }

    if (categoryId) query = query.eq('category_id', categoryId);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (search) query = query.ilike('title', `%${search}%`);

    // Filter by manual tags (OR logic)
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

    // Filter by auto-tags (OR logic)
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

    // Sort
    if (sort === 'rating') {
      query = query.order('average_rating', { ascending: false });
    } else if (sort === 'quick') {
      query = query.order('total_time_minutes', { ascending: true });
    } else {
      query = query.order('published_at', { ascending: false });
    }

    const { data: recipes, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Error fetching recipes:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des recettes'
      );
    }

    // Also fetch patient's favorites to mark them
    const { data: favorites } = await s
      .from('recipe_favorites')
      .select('recipe_id')
      .eq('user_id', auth.user.id);

    const favoriteIds = new Set(
      (favorites || []).map((f: { recipe_id: string }) => f.recipe_id)
    );

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

    // Enrich recipes with is_favorite flag + real ratings
    const enrichedRecipes = (recipes || []).map(
      (r: Record<string, unknown>) => ({
        ...r,
        is_favorite: favoriteIds.has(r.id as string),
        average_rating: ratingsMap[r.id as string]?.avg ?? r.average_rating,
        rating_count: ratingsMap[r.id as string]?.count ?? r.rating_count,
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
