import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * POST /api/protected/recipes/[recipeId]/favorite
 * Toggle favorite: add if not exists, remove if exists
 */
export async function POST(
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

    // Check if already favorited
    const { data: existing } = await s
      .from('recipe_favorites')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    if (existing) {
      // Remove favorite
      await s.from('recipe_favorites').delete().eq('id', existing.id);

      // Decrement counter
      const { data: recipe } = await s
        .from('recipes')
        .select('favorite_count')
        .eq('id', recipeId)
        .single();

      if (recipe) {
        await s
          .from('recipes')
          .update({
            favorite_count: Math.max(0, (recipe.favorite_count || 0) - 1),
          })
          .eq('id', recipeId);
      }

      return apiResponse.success({ is_favorite: false });
    } else {
      // Add favorite
      const { error } = await s
        .from('recipe_favorites')
        .insert({ user_id: auth.user.id, recipe_id: recipeId });

      if (error) {
        console.error('Error adding favorite:', error);
        return apiResponse.serverError("Erreur lors de l'ajout aux favoris");
      }

      // Increment counter
      const { data: recipe } = await s
        .from('recipes')
        .select('favorite_count')
        .eq('id', recipeId)
        .single();

      if (recipe) {
        await s
          .from('recipes')
          .update({ favorite_count: (recipe.favorite_count || 0) + 1 })
          .eq('id', recipeId);
      }

      return apiResponse.success({ is_favorite: true });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
