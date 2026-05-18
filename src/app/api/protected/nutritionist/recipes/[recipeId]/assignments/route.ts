import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { assignRecipeSchema } from '@/lib/api-schemas';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveNutritionistId(
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('nutritionist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

/**
 * GET /api/protected/nutritionist/recipes/[recipeId]/assignments
 * List all assignments for a recipe
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

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const { data: assignments, error } = await s
      .from('recipe_assignments')
      .select(
        '*, patient_profiles(id, user_id, profiles(first_name, last_name, email, avatar_url))'
      )
      .eq('recipe_id', recipeId)
      .eq('nutritionist_id', nutritionistId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
      return apiResponse.serverError('Erreur');
    }

    return apiResponse.success({ assignments: assignments || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/recipes/[recipeId]/assignments
 * Assign a recipe to patients
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

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify recipe ownership and published status
    const { data: recipe } = await s
      .from('recipes')
      .select('id, title, status')
      .eq('id', recipeId)
      .eq('created_by', auth.user.id)
      .is('deleted_at', null)
      .single();

    if (!recipe) {
      return apiResponse.error('Recette introuvable', 404);
    }
    if (recipe.status !== 'published') {
      return apiResponse.error(
        'La recette doit être publiée pour être recommandée',
        400
      );
    }

    const body = await req.json();
    const parsed = assignRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const { patient_ids, note } = parsed.data;

    // Insert assignments (skip duplicates)
    const assignments = patient_ids.map(patientId => ({
      recipe_id: recipeId,
      patient_id: patientId,
      nutritionist_id: nutritionistId,
      note: note || null,
    }));

    const { data: created, error: insertError } = await s
      .from('recipe_assignments')
      .upsert(assignments, { onConflict: 'recipe_id,patient_id' })
      .select();

    if (insertError) {
      console.error('Error creating assignments:', insertError);
      return apiResponse.serverError('Erreur lors de la recommandation');
    }

    // Send notifications to patients
    for (const patientId of patient_ids) {
      // Get patient's user_id from patient_profiles
      const { data: pp } = await s
        .from('patient_profiles')
        .select('user_id')
        .eq('id', patientId)
        .single();

      if (pp?.user_id) {
        try {
          await s.rpc('create_notification', {
            p_user_id: pp.user_id,
            p_type_code: 'new_recipe',
            p_data: { title: recipe.title, recipe_id: recipeId },
          });
        } catch {
          // Non-blocking
        }
      }
    }

    return apiResponse.success(
      {
        assigned: created?.length || patient_ids.length,
        recipe_title: recipe.title,
      },
      201
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
