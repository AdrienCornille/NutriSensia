/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]/meals/[mealId]
 * PLAN-N-002: Gestion d'un repas individuel
 *
 * PATCH  - Modifier un repas
 * DELETE - Supprimer un repas
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updatePlanMealSchema } from '@/lib/api-schemas';

// ============================================================================
// Helpers
// ============================================================================

async function resolveNutritionistId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

async function verifyMealAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  mealId: string,
  planId: string,
  nutritionistUserId: string,
  patientProfileId: string,
  nutritionistId: string
): Promise<boolean> {
  const { data: patient } = await supabase
    .from('patient_profiles')
    .select('user_id')
    .eq('id', patientProfileId)
    .eq('nutritionist_id', nutritionistId)
    .single();

  if (!patient) return false;

  // Verify plan belongs to this nutritionist
  const { data: plan } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('id', planId)
    .eq('patient_id', patient.user_id)
    .eq('nutritionist_id', nutritionistUserId)
    .is('deleted_at', null)
    .single();

  if (!plan) return false;

  // Verify meal belongs to a day of this plan
  const { data: meal } = await supabase
    .from('meal_plan_meals')
    .select('id, plan_day_id')
    .eq('id', mealId)
    .single();

  if (!meal) return false;

  const { data: day } = await supabase
    .from('meal_plan_days')
    .select('id')
    .eq('id', meal.plan_day_id)
    .eq('meal_plan_id', planId)
    .single();

  return !!day;
}

type RouteParams = { params: Promise<{ id: string; planId: string; mealId: string }> };

// ============================================================================
// PATCH - Modifier un repas
// ============================================================================

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, planId, mealId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const hasAccess = await verifyMealAccess(s, mealId, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!hasAccess) {
      return apiResponse.error('Repas introuvable ou accès non autorisé', 403);
    }

    const body = await req.json();
    const parsed = updatePlanMealSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const updateData: Record<string, unknown> = {};
    const fields = ['title', 'suggested_time', 'notes', 'display_order'] as const;
    for (const field of fields) {
      if (parsed.data[field] !== undefined) {
        updateData[field] = parsed.data[field];
      }
    }

    const { data: updated, error: updateError } = await s
      .from('meal_plan_meals')
      .update(updateData)
      .eq('id', mealId)
      .select('id, plan_day_id, meal_type, title, description, calories, protein_g, carbs_g, fat_g, suggested_time, display_order, notes')
      .single();

    if (updateError) {
      console.error('Error updating meal:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour du repas');
    }

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error in meal PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Supprimer un repas
// ============================================================================

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, planId, mealId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const hasAccess = await verifyMealAccess(s, mealId, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!hasAccess) {
      return apiResponse.error('Repas introuvable ou accès non autorisé', 403);
    }

    const { error: deleteError } = await s
      .from('meal_plan_meals')
      .delete()
      .eq('id', mealId);

    if (deleteError) {
      console.error('Error deleting meal:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression du repas');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error in meal DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
