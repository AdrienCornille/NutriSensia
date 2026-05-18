import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateRecipeSchema } from '@/lib/api-schemas';
import { upsertAutoTags } from '@/lib/recipe-auto-tags-db';

const RECIPE_SELECT = `
  *,
  recipe_categories(*),
  recipe_tag_assignments(tag_id, recipe_tags(*)),
  recipe_auto_tags(*),
  recipe_ingredients(*, foods!food_id(calories, proteins, carbohydrates, fat, fiber)),
  recipe_steps(*)
`;

/**
 * GET /api/protected/nutritionist/recipes/[recipeId]
 */
export async function GET(
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

    return apiResponse.success(recipe);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/recipes/[recipeId]
 */
export async function PATCH(
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

    // Verify ownership
    const { data: existing } = await s
      .from('recipes')
      .select('id, status')
      .eq('id', recipeId)
      .eq('created_by', auth.user.id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return apiResponse.error('Recette introuvable', 404);
    }

    const body = await req.json();
    const parsed = updateRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Handle tag updates separately
    const { tags, diet_types, ...recipeFields } = parsed.data;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(recipeFields)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    const { data: updated, error: updateError } = await s
      .from('recipes')
      .update(updateData)
      .eq('id', recipeId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating recipe:', updateError);
      return apiResponse.serverError(
        'Erreur lors de la mise à jour de la recette'
      );
    }

    // Update tag assignments if provided
    if (tags !== undefined || diet_types !== undefined) {
      // Delete existing assignments
      await s.from('recipe_tag_assignments').delete().eq('recipe_id', recipeId);

      // Insert new ones
      const allTagIds = [...new Set([...(tags || []), ...(diet_types || [])])];
      if (allTagIds.length > 0) {
        const assignments = allTagIds.map(tagId => ({
          recipe_id: recipeId,
          tag_id: tagId,
        }));
        await s.from('recipe_tag_assignments').insert(assignments);
      }
    }

    // Recompute auto-tags (in case time, servings, or other fields changed)
    await upsertAutoTags(s, recipeId);

    // Re-fetch with full joins
    const { data: fullRecipe } = await s
      .from('recipes')
      .select(RECIPE_SELECT)
      .eq('id', recipeId)
      .single();

    return apiResponse.success(fullRecipe || updated);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * DELETE /api/protected/nutritionist/recipes/[recipeId]
 * Hard delete — RLS policy recipes_delete_own ensures ownership.
 * Cascade removes ingredients, steps, tag assignments, etc.
 */
export async function DELETE(
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

    // Verify ownership before delete
    const { data: existing } = await s
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .eq('created_by', auth.user.id)
      .single();

    if (!existing) {
      return apiResponse.error('Recette introuvable', 404);
    }

    const { error: deleteError } = await s
      .from('recipes')
      .delete()
      .eq('id', recipeId);

    if (deleteError) {
      console.error('Error deleting recipe:', JSON.stringify(deleteError));
      return apiResponse.error(
        `Suppression échouée: ${deleteError.message || deleteError.code || 'erreur inconnue'}`,
        500
      );
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
