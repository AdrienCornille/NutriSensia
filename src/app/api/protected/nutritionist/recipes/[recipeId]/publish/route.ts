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
 * POST /api/protected/nutritionist/recipes/[recipeId]/publish
 * Toggle publish state: draft → published or published → draft
 * Validates requirements before publishing
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { recipeId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Fetch recipe with relations
    const { data: recipe, error } = await s
      .from('recipes')
      .select(RECIPE_SELECT)
      .eq('id', recipeId)
      .eq('created_by', auth.user.id)
      .is('deleted_at', null)
      .single();

    if (error || !recipe) {
      return apiResponse.error('Recette introuvable', 404);
    }

    if (recipe.status === 'draft') {
      // Validate requirements for publishing
      const errors: string[] = [];
      if (!recipe.title || recipe.title.trim().length < 3) {
        errors.push('Le titre est requis (min 3 caractères)');
      }
      if (
        !recipe.recipe_ingredients ||
        recipe.recipe_ingredients.length === 0
      ) {
        errors.push('Au moins un ingrédient est requis');
      }
      if (!recipe.recipe_steps || recipe.recipe_steps.length === 0) {
        errors.push('Au moins une étape est requise');
      }
      if (!recipe.image_url) {
        errors.push('Une image est requise pour publier');
      }

      if (errors.length > 0) {
        return apiResponse.error(errors.join('. '), 400);
      }

      // Publish
      const { data: updated, error: updateError } = await s
        .from('recipes')
        .update({
          status: 'published',
          published_at: recipe.published_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', recipeId)
        .select(RECIPE_SELECT)
        .single();

      if (updateError) {
        console.error('Error publishing recipe:', updateError);
        return apiResponse.serverError('Erreur lors de la publication');
      }

      return apiResponse.success(updated);
    } else {
      // Unpublish (published → draft)
      const { data: updated, error: updateError } = await s
        .from('recipes')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', recipeId)
        .select(RECIPE_SELECT)
        .single();

      if (updateError) {
        console.error('Error unpublishing recipe:', updateError);
        return apiResponse.serverError('Erreur lors de la dé-publication');
      }

      return apiResponse.success(updated);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
