import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { z } from 'zod';

const overrideAutoTagsSchema = z.object({
  auto_tags: z.array(
    z.object({
      tag_group: z.string(),
      tag_value: z.string(),
    })
  ),
});

/**
 * GET /api/protected/nutritionist/recipes/[recipeId]/auto-tags
 * Returns current auto-tags for a recipe
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

    const { data, error } = await s
      .from('recipe_auto_tags')
      .select('tag_group, tag_value')
      .eq('recipe_id', recipeId);

    if (error) {
      return apiResponse.serverError(
        'Erreur lors de la recuperation des auto-tags'
      );
    }

    return apiResponse.success({ auto_tags: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PUT /api/protected/nutritionist/recipes/[recipeId]/auto-tags
 * Override auto-tags for a recipe (nutritionist manually corrects badges)
 */
export async function PUT(
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
    const { data: recipe } = await s
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .eq('created_by', auth.user.id)
      .single();

    if (!recipe) {
      return apiResponse.error('Recette introuvable', 404);
    }

    const body = await req.json();
    const parsed = overrideAutoTagsSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Replace all auto-tags with the overridden set
    await s.from('recipe_auto_tags').delete().eq('recipe_id', recipeId);

    if (parsed.data.auto_tags.length > 0) {
      const { error: insertError } = await s.from('recipe_auto_tags').insert(
        parsed.data.auto_tags.map(t => ({
          recipe_id: recipeId,
          tag_group: t.tag_group,
          tag_value: t.tag_value,
        }))
      );

      if (insertError) {
        console.error('Error inserting auto-tags:', insertError);
        return apiResponse.serverError(
          'Erreur lors de la sauvegarde des badges'
        );
      }
    }

    return apiResponse.success({ updated: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
