import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

const RECIPE_SELECT = `
  recipe_id,
  created_at,
  recipes(
    *,
    recipe_categories(*),
    recipe_tag_assignments(tag_id, recipe_tags(*)),
    recipe_auto_tags(*),
    recipe_ingredients(*, foods!food_id(calories, proteins, carbohydrates, fat, fiber)),
    recipe_steps(*)
  )
`;

/**
 * GET /api/protected/recipes/cooked
 * Get all recipes the patient has cooked, ordered by most recent
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

    const { data: history, error } = await s
      .from('recipe_history')
      .select(RECIPE_SELECT)
      .eq('user_id', auth.user.id)
      .eq('action_type', 'cooked')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cooked recipes:', error);
      return apiResponse.serverError('Erreur lors de la récupération');
    }

    // Deduplicate: keep only the most recent cook per recipe
    const seen = new Set<string>();
    const unique = [];
    for (const entry of history || []) {
      if (!entry.recipes || seen.has(entry.recipe_id)) continue;
      seen.add(entry.recipe_id);
      unique.push({
        ...entry.recipes,
        cooked_at: entry.created_at,
      });
    }

    // Check favorites
    const recipeIds = unique.map((r: { id: string }) => r.id);
    let favoriteIds = new Set<string>();
    if (recipeIds.length > 0) {
      const { data: favorites } = await s
        .from('recipe_favorites')
        .select('recipe_id')
        .eq('user_id', auth.user.id)
        .in('recipe_id', recipeIds);
      favoriteIds = new Set(
        (favorites || []).map((f: { recipe_id: string }) => f.recipe_id)
      );
    }

    const recipes = unique.map((r: { id: string; cooked_at: string }) => ({
      ...r,
      is_favorite: favoriteIds.has(r.id),
    }));

    // Enrich with real ratings
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
        for (const recipe of recipes) {
          const vals = grouped[recipe.id];
          if (vals) {
            (recipe as Record<string, unknown>).average_rating =
              Math.round(
                (vals.reduce((a, b) => a + b, 0) / vals.length) * 100
              ) / 100;
            (recipe as Record<string, unknown>).rating_count = vals.length;
          }
        }
      }
    }

    return apiResponse.success({ recipes });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
