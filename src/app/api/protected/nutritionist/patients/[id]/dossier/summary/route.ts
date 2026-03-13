import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId } = await params;
    if (!patientProfileId) {
      return apiResponse.error('ID patient requis', 400);
    }

    const supabase = await createClient();

    // Get nutritionist profile
    const { data: nutritionistProfile, error: profileError } = await (
      supabase as any
    )
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify patient belongs to nutritionist
    const { data: patient, error: patientError } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (patientError || !patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Call the DB function get_patient_file_summary
    const { data: summary, error: summaryError } = await (supabase as any).rpc(
      'get_patient_file_summary',
      { p_patient_id: patient.user_id }
    );

    if (summaryError) {
      console.error('Error fetching dossier summary:', summaryError);
      return apiResponse.serverError(
        'Erreur lors de la recuperation du resume'
      );
    }

    // The function returns a single row
    const result = Array.isArray(summary) ? summary[0] : summary;

    return apiResponse.success(
      result || {
        anamnesis_status: null,
        anamnesis_updated_at: null,
        pending_questionnaires: 0,
        completed_questionnaires: 0,
        total_documents: 0,
        total_consultations: 0,
        last_consultation_date: null,
        active_objectives: 0,
        objectives_on_track: 0,
        pending_changes: 0,
      }
    );
  } catch (error) {
    console.error('Unexpected error in dossier summary:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
