import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { objectiveProgressLogSchema } from '@/lib/api-schemas';

export async function POST(
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

    // Verify objective belongs to patient
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
    const parsed = objectiveProgressLogSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.errors[0].message, 400);
    }

    const { progress, value, notes } = parsed.data;

    // Insert progress log
    const { data: log, error: logError } = await (supabase as any)
      .from('objective_progress_logs')
      .insert({
        objective_id: objectiveId,
        progress,
        value: value || null,
        notes: notes || null,
        updated_by: auth.user.id,
      })
      .select('id, progress, created_at')
      .single();

    if (logError) {
      console.error('Error creating progress log:', logError);
      return apiResponse.serverError("Erreur lors de l'ajout de progression");
    }

    // Update objective current progress
    await (supabase as any)
      .from('patient_objectives')
      .update({
        progress,
        current_value: value || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', objectiveId);

    return apiResponse.success(log, 201);
  } catch (error) {
    console.error('Unexpected error in progress POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
