/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]/meals
 * PLAN-N-002: Gestion des repas dans un plan
 *
 * POST - Ajouter un repas a un jour
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createPlanMealSchema } from '@/lib/api-schemas';

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

async function verifyPlanOwnership(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
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

  const { data: plan } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('id', planId)
    .eq('patient_id', patient.user_id)
    .eq('nutritionist_id', nutritionistUserId)
    .is('deleted_at', null)
    .single();

  return !!plan;
}

// ============================================================================
// POST - Ajouter un repas
// ============================================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
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

    const hasAccess = await verifyPlanOwnership(s, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!hasAccess) {
      return apiResponse.error('Plan introuvable ou accès non autorisé', 403);
    }

    const body = await req.json();
    const parsed = createPlanMealSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const { day_id, meal_type, title, suggested_time, notes } = parsed.data;

    // Verify day belongs to this plan
    const { data: day } = await s
      .from('meal_plan_days')
      .select('id')
      .eq('id', day_id)
      .eq('meal_plan_id', planId)
      .single();

    if (!day) {
      return apiResponse.error('Jour introuvable dans ce plan', 404);
    }

    // Get next display_order
    const { data: existingMeals } = await s
      .from('meal_plan_meals')
      .select('display_order')
      .eq('plan_day_id', day_id)
      .eq('meal_type', meal_type)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existingMeals && existingMeals.length > 0
      ? (existingMeals[0].display_order || 0) + 1
      : 0;

    // Default suggested times
    const defaultTimes: Record<string, string> = {
      breakfast: '07:30',
      lunch: '12:30',
      snack: '16:00',
      dinner: '19:00',
    };

    const { data: meal, error: createError } = await s
      .from('meal_plan_meals')
      .insert({
        plan_day_id: day_id,
        meal_type,
        title: title || null,
        suggested_time: suggested_time || defaultTimes[meal_type] || null,
        notes: notes || null,
        display_order: nextOrder,
      })
      .select('id, plan_day_id, meal_type, title, description, calories, protein_g, carbs_g, fat_g, suggested_time, display_order, notes')
      .single();

    if (createError) {
      console.error('Error creating meal:', createError);
      return apiResponse.serverError('Erreur lors de la création du repas');
    }

    return apiResponse.success({ ...meal, foods: [] }, 201);
  } catch (error) {
    console.error('Unexpected error in meals POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
