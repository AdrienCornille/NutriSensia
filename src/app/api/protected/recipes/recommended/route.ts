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
 * GET /api/protected/recipes/recommended
 * Get recipes recommended to the authenticated patient by their nutritionist
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

    // Get patient profile
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile) {
      return apiResponse.success({ recipes: [], assignments: [] });
    }

    // Get assignments for this patient
    const { data: assignments, error } = await s
      .from('recipe_assignments')
      .select(
        `
        id,
        note,
        created_at,
        recipes(${RECIPE_SELECT})
      `
      )
      .eq('patient_id', patientProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      // Table recipe_assignments may not exist yet
      if (
        error.code === 'PGRST205' ||
        error.message?.includes('recipe_assignments')
      ) {
        return apiResponse.success({ recipes: [] });
      }
      console.error('Error fetching recommendations:', error);
      return apiResponse.serverError('Erreur');
    }

    // Also check favorites for enrichment
    const { data: favorites } = await s
      .from('recipe_favorites')
      .select('recipe_id')
      .eq('user_id', auth.user.id);

    const favoriteIds = new Set(
      (favorites || []).map((f: { recipe_id: string }) => f.recipe_id)
    );

    // Extract recipes from assignments with note
    const recipes = (assignments || [])
      .filter((a: { recipes: unknown }) => a.recipes)
      .map(
        (a: {
          id: string;
          note: string | null;
          created_at: string;
          recipes: Record<string, unknown>;
        }) => ({
          ...a.recipes,
          is_favorite: favoriteIds.has(a.recipes.id as string),
          assignment_note: a.note,
          assigned_at: a.created_at,
        })
      );

    // Enrich with real ratings
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
