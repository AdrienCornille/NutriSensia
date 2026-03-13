import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateObjectiveStatusSchema } from '@/lib/api-schemas';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; objectiveId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, objectiveId } = await params;
    if (!patientProfileId || !objectiveId) {
      return apiResponse.error('Paramètres requis', 400);
    }

    const supabase = await createClient();

    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Get objective with progress logs
    const { data: objective, error: objError } = await (supabase as any)
      .from('patient_objectives')
      .select('*')
      .eq('id', objectiveId)
      .eq('patient_id', patient.user_id)
      .single();

    if (objError || !objective) {
      return apiResponse.notFound('Objectif introuvable');
    }

    // Get progress logs
    const { data: progressLogs } = await (supabase as any)
      .from('objective_progress_logs')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('created_at', { ascending: false });

    return apiResponse.success({
      ...objective,
      progress_logs: progressLogs || [],
    });
  } catch (error) {
    console.error('Unexpected error in objective GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; objectiveId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, objectiveId } = await params;
    if (!patientProfileId || !objectiveId) {
      return apiResponse.error('Paramètres requis', 400);
    }

    const supabase = await createClient();

    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    const { data: objective } = await (supabase as any)
      .from('patient_objectives')
      .select('id')
      .eq('id', objectiveId)
      .eq('patient_id', patient.user_id)
      .single();

    if (!objective) {
      return apiResponse.notFound('Objectif introuvable');
    }

    const body = await req.json();
    const parsed = updateObjectiveStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.errors[0].message, 400);
    }

    const updateData: Record<string, unknown> = {
      ...parsed.data,
      updated_at: new Date().toISOString(),
    };

    // If completing, set completed_at
    if (parsed.data.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await (supabase as any)
      .from('patient_objectives')
      .update(updateData)
      .eq('id', objectiveId);

    if (updateError) {
      console.error('Error updating objective:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour');
    }

    return apiResponse.success({ id: objectiveId, ...parsed.data });
  } catch (error) {
    console.error('Unexpected error in objective PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
