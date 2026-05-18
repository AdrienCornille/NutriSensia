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
 * GET /api/protected/recipes/[recipeId]
 * Get full recipe detail for patient
 * Increments view count
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { recipeId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const { data: recipe, error } = await s
      .from('recipes')
      .select(RECIPE_SELECT)
      .eq('id', recipeId)
      .eq('status', 'published')
      .is('deleted_at', null)
      .single();

    if (error || !recipe) {
      return apiResponse.error('Recette introuvable', 404);
    }

    // Check if favorite
    const { data: fav } = await s
      .from('recipe_favorites')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    // Log view in history (fire and forget)
    s.from('recipe_history')
      .insert({
        user_id: auth.user.id,
        recipe_id: recipeId,
        action_type: 'viewed',
      })
      .then(() => {});

    return apiResponse.success({
      ...recipe,
      is_favorite: !!fav,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
