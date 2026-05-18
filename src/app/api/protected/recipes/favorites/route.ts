import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

const RECIPE_SELECT = `
  recipe_id,
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
 * GET /api/protected/recipes/favorites
 * Get all favorite recipes for the authenticated patient
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

    const { data: favorites, error } = await s
      .from('recipe_favorites')
      .select(RECIPE_SELECT)
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return apiResponse.serverError(
        'Erreur lors de la récupération des favoris'
      );
    }

    // Extract recipes from favorites, mark as favorite
    const recipes = (favorites || [])
      .filter((f: { recipes: unknown }) => f.recipes)
      .map((f: { recipes: Record<string, unknown> }) => ({
        ...f.recipes,
        is_favorite: true,
      }));

    // Enrich with real ratings from recipe_ratings
    const recipeIds = recipes.map((r: { id: string }) => r.id);
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
          const vals = grouped[(recipe as { id: string }).id];
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
