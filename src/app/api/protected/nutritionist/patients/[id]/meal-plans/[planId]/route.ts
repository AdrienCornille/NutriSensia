/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]
 * PLAN-N-001: Gestion d'un plan alimentaire individuel
 *
 * GET    - Détail du plan
 * PATCH  - Mise à jour du plan
 * DELETE - Suppression soft du plan
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateMealPlanNutriSchema } from '@/lib/api-schemas';

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

async function verifyPatientAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  patientProfileId: string,
  nutritionistId: string
): Promise<{ userId: string } | null> {
  const { data } = await supabase
    .from('patient_profiles')
    .select('user_id')
    .eq('id', patientProfileId)
    .eq('nutritionist_id', nutritionistId)
    .single();
  return data ? { userId: data.user_id } : null;
}

type RouteParams = { params: Promise<{ id: string; planId: string }> };

// ============================================================================
// GET - Détail du plan
// ============================================================================

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, planId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const patientAccess = await verifyPatientAccess(
      s,
      patientProfileId,
      nutritionistId
    );
    if (!patientAccess) {
      return apiResponse.error('Patient introuvable ou accès non autorisé', 403);
    }

    const { data: plan, error: planError } = await s
      .from('meal_plans')
      .select('*')
      .eq('id', planId)
      .eq('patient_id', patientAccess.userId)
      .eq('nutritionist_id', auth.user.id)
      .is('deleted_at', null)
      .single();

    if (planError || !plan) {
      return apiResponse.error('Plan alimentaire introuvable', 404);
    }

    // Get counts
    const { data: days } = await s
      .from('meal_plan_days')
      .select('id')
      .eq('meal_plan_id', planId);

    const dayIds = (days || []).map((d: { id: string }) => d.id);
    let mealsCount = 0;
    if (dayIds.length > 0) {
      const { count } = await s
        .from('meal_plan_meals')
        .select('id', { count: 'exact', head: true })
        .in('plan_day_id', dayIds);
      mealsCount = count || 0;
    }

    return apiResponse.success({
      id: plan.id,
      name: plan.name,
      objective: plan.objective,
      description: plan.description,
      status: plan.status,
      start_date: plan.start_date,
      end_date: plan.end_date,
      is_template: plan.is_template,
      notes: plan.notes,
      nutritional_targets: plan.nutritional_targets || null,
      meal_types: plan.meal_types || null,
      patient_id: plan.patient_id,
      nutritionist_id: plan.nutritionist_id,
      created_at: plan.created_at,
      updated_at: plan.updated_at,
      days_count: dayIds.length,
      meals_count: mealsCount,
    });
  } catch (error) {
    console.error('Unexpected error in meal plan GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// PATCH - Mise à jour du plan
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

    const { id: patientProfileId, planId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const patientAccess = await verifyPatientAccess(
      s,
      patientProfileId,
      nutritionistId
    );
    if (!patientAccess) {
      return apiResponse.error('Patient introuvable ou accès non autorisé', 403);
    }

    // Verify plan exists and belongs to this nutritionist
    const { data: existing, error: existingError } = await s
      .from('meal_plans')
      .select('id, status')
      .eq('id', planId)
      .eq('patient_id', patientAccess.userId)
      .eq('nutritionist_id', auth.user.id)
      .is('deleted_at', null)
      .single();

    if (existingError || !existing) {
      return apiResponse.error('Plan alimentaire introuvable', 404);
    }

    // Parse body
    const body = await req.json();
    const parsed = updateMealPlanNutriSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // If activating, archive any other active plan for this patient
    if (parsed.data.status === 'active' && existing.status !== 'active') {
      await s
        .from('meal_plans')
        .update({ status: 'archived' })
        .eq('patient_id', patientAccess.userId)
        .eq('nutritionist_id', auth.user.id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .neq('id', planId);
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    const fields = [
      'name',
      'objective',
      'description',
      'start_date',
      'end_date',
      'status',
      'is_template',
      'nutritional_targets',
      'notes',
      'meal_types',
    ] as const;
    for (const field of fields) {
      if (parsed.data[field] !== undefined) {
        updateData[field] = parsed.data[field];
      }
    }

    const { data: updated, error: updateError } = await s
      .from('meal_plans')
      .update(updateData)
      .eq('id', planId)
      .select('id, name, objective, description, status, start_date, end_date, is_template, notes, nutritional_targets, meal_types, created_at, updated_at')
      .single();

    if (updateError) {
      console.error('Error updating meal plan:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour du plan');
    }

    // Notify patient when plan is published (draft → active)
    if (parsed.data.status === 'active' && existing.status !== 'active' && updated) {
      try {
        await s.rpc('create_notification', {
          p_user_id: patientAccess.userId,
          p_type_code: 'new_meal_plan',
          p_data: {
            plan_id: updated.id,
            plan_name: updated.name || 'Plan alimentaire',
            action_url: '/dashboard/patient/dossier',
          },
        });
      } catch (notifErr) {
        // Non-blocking: log but don't fail the publish
        console.error('Failed to send meal plan notification:', notifErr);
      }
    }

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error in meal plan PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Suppression soft du plan
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

    const { id: patientProfileId, planId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const patientAccess = await verifyPatientAccess(
      s,
      patientProfileId,
      nutritionistId
    );
    if (!patientAccess) {
      return apiResponse.error('Patient introuvable ou accès non autorisé', 403);
    }

    const { error: deleteError } = await s
      .from('meal_plans')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', planId)
      .eq('patient_id', patientAccess.userId)
      .eq('nutritionist_id', auth.user.id)
      .is('deleted_at', null);

    if (deleteError) {
      console.error('Error deleting meal plan:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression du plan');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error in meal plan DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
