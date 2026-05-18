import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { upsertRecipeStepsSchema } from '@/lib/api-schemas';

/**
 * PUT /api/protected/nutritionist/recipes/[recipeId]/steps
 * Bulk upsert steps — replaces all existing steps
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
      .is('deleted_at', null)
      .single();

    if (!recipe) {
      return apiResponse.error('Recette introuvable', 404);
    }

    const body = await req.json();
    const parsed = upsertRecipeStepsSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Delete all existing steps
    await s.from('recipe_steps').delete().eq('recipe_id', recipeId);

    // Insert new steps
    const steps = parsed.data.steps.map(step => ({
      recipe_id: recipeId,
      step_number: step.step_number,
      instruction: step.instruction,
      duration_minutes: step.duration_minutes || null,
      image_url: step.image_url || null,
      tips: step.tips || null,
    }));

    const { error: insertError } = await s.from('recipe_steps').insert(steps);

    if (insertError) {
      console.error('Error inserting steps:', insertError);
      return apiResponse.serverError(
        "Erreur lors de l'enregistrement des étapes"
      );
    }

    // Fetch updated steps
    const { data: updated } = await s
      .from('recipe_steps')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('step_number', { ascending: true });

    return apiResponse.success({ steps: updated || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
