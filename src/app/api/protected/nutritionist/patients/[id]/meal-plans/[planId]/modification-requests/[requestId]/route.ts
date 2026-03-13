/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]/modification-requests/[requestId]
 * PLAN-N-007: Repondre a une demande de modification
 *
 * PATCH - Approuver ou refuser une demande
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { respondModificationRequestSchema } from '@/lib/api-schemas';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveNutritionistId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('nutritionist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

type RouteParams = { params: Promise<{ id: string; planId: string; requestId: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, planId, requestId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify the request exists, belongs to this plan, and is pending
    const { data: patient } = await s
      .from('patient_profiles')
      .select('user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!patient) {
      return apiResponse.error('Patient introuvable', 404);
    }

    const { data: request } = await s
      .from('plan_modification_requests')
      .select('id, status, meal_plan_id')
      .eq('id', requestId)
      .eq('meal_plan_id', planId)
      .eq('nutritionist_id', auth.user.id)
      .single();

    if (!request) {
      return apiResponse.error('Demande introuvable', 404);
    }

    if (request.status !== 'pending') {
      return apiResponse.error('Cette demande a déjà été traitée', 400);
    }

    const body = await req.json();
    const parsed = respondModificationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const { data: updated, error: updateError } = await s
      .from('plan_modification_requests')
      .update({
        status: parsed.data.status,
        response: parsed.data.response || null,
        responded_at: new Date().toISOString(),
        responded_by: auth.user.id,
      })
      .eq('id', requestId)
      .select('id, status, response, responded_at, title, description, request_type, created_at')
      .single();

    if (updateError) {
      console.error('Error updating modification request:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour de la demande');
    }

    // Notify patient of the result
    try {
      const notifType = parsed.data.status === 'approved'
        ? 'plan_modification_approved'
        : 'plan_modification_rejected';
      await s.rpc('create_notification', {
        p_user_id: patient.user_id,
        p_type_code: notifType,
        p_data: {
          request_id: requestId,
          plan_id: planId,
          request_title: updated.title || 'Demande de modification',
          response: parsed.data.response || null,
          action_url: '/dashboard/patient/dossier',
        },
      });
    } catch (notifErr) {
      console.error('Failed to send modification request notification:', notifErr);
    }

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error in modification-request PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
