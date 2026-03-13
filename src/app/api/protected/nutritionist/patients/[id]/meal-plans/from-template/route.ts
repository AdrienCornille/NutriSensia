/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/from-template
 * PLAN-N-005: Dupliquer un template pour un patient
 *
 * POST - Créer un plan à partir d'un template via duplicate_meal_plan()
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { duplicateFromTemplateSchema } from '@/lib/api-schemas';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveNutritionistId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('nutritionist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyPatientAccess(supabase: any, patientProfileId: string, nutritionistId: string): Promise<{ userId: string } | null> {
  const { data } = await supabase
    .from('patient_profiles')
    .select('user_id')
    .eq('id', patientProfileId)
    .eq('nutritionist_id', nutritionistId)
    .single();
  return data ? { userId: data.user_id } : null;
}

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) return apiResponse.unauthorized();

    const { id: patientProfileId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) return apiResponse.error('Profil nutritionniste introuvable', 404);

    const patientAccess = await verifyPatientAccess(s, patientProfileId, nutritionistId);
    if (!patientAccess) return apiResponse.error('Patient introuvable ou accès non autorisé', 403);

    const body = await req.json();
    const parsed = duplicateFromTemplateSchema.safeParse(body);
    if (!parsed.success) return apiResponse.error(parsed.error.issues[0].message, 400);

    const { template_plan_id, name, start_date, end_date } = parsed.data;

    // Verify the template belongs to this nutritionist
    const { data: template } = await s
      .from('meal_plans')
      .select('id, nutritionist_id')
      .eq('id', template_plan_id)
      .eq('nutritionist_id', auth.user.id)
      .is('deleted_at', null)
      .single();

    if (!template) return apiResponse.error('Template introuvable', 404);

    // Call duplicate_meal_plan DB function
    const { data: newPlanId, error: rpcError } = await s
      .rpc('duplicate_meal_plan', {
        p_plan_id: template_plan_id,
        p_new_patient_id: patientAccess.userId,
        p_new_name: name,
      });

    if (rpcError || !newPlanId) {
      console.error('Error duplicating plan:', rpcError);
      return apiResponse.serverError('Erreur lors de la duplication du template');
    }

    // Update dates and ensure is_template is false on the new plan
    await s
      .from('meal_plans')
      .update({
        start_date,
        end_date,
        is_template: false,
        status: 'draft',
      })
      .eq('id', newPlanId);

    // Fetch the new plan to return
    const { data: newPlan } = await s
      .from('meal_plans')
      .select('id, name, objective, description, status, start_date, end_date, is_template, notes, nutritional_targets, created_at, updated_at')
      .eq('id', newPlanId)
      .single();

    return apiResponse.success(
      {
        ...(newPlan || { id: newPlanId }),
        patient_id: patientAccess.userId,
        nutritionist_id: auth.user.id,
        days_count: 0,
        meals_count: 0,
      },
      201
    );
  } catch (error) {
    console.error('Unexpected error in from-template POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
