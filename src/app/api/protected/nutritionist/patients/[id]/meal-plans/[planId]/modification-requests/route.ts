/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]/modification-requests
 * PLAN-N-007: Liste des demandes de modification du patient
 *
 * GET - Liste les demandes de modification pour ce plan
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

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
async function verifyPlanAccess(supabase: any, planId: string, nutritionistUserId: string, patientProfileId: string, nutritionistId: string): Promise<boolean> {
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

type RouteParams = { params: Promise<{ id: string; planId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
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

    const hasAccess = await verifyPlanAccess(s, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!hasAccess) {
      return apiResponse.error('Plan introuvable ou accès non autorisé', 403);
    }

    const { data: requests, error } = await s
      .from('plan_modification_requests')
      .select(`
        id, meal_plan_id, patient_id, nutritionist_id,
        plan_meal_id, plan_day_id,
        request_type, title, description, suggested_alternative,
        status, response, responded_at,
        created_at, updated_at
      `)
      .eq('meal_plan_id', planId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching modification requests:', error);
      return apiResponse.serverError('Erreur lors de la récupération des demandes');
    }

    return apiResponse.success(requests || []);
  } catch (error) {
    console.error('Unexpected error in modification-requests GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
