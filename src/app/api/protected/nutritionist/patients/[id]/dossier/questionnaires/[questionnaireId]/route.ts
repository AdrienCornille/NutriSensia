import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; questionnaireId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, questionnaireId } = await params;
    if (!patientProfileId || !questionnaireId) {
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

    const { data: questionnaire, error: qError } = await (supabase as any)
      .from('follow_up_questionnaires')
      .select('*')
      .eq('id', questionnaireId)
      .eq('patient_id', patient.user_id)
      .single();

    if (qError || !questionnaire) {
      return apiResponse.notFound('Questionnaire introuvable');
    }

    return apiResponse.success(questionnaire);
  } catch (error) {
    console.error('Unexpected error in questionnaire GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; questionnaireId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, questionnaireId } = await params;
    if (!patientProfileId || !questionnaireId) {
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

    const { data: q } = await (supabase as any)
      .from('follow_up_questionnaires')
      .select('id, status')
      .eq('id', questionnaireId)
      .eq('patient_id', patient.user_id)
      .single();

    if (!q) {
      return apiResponse.notFound('Questionnaire introuvable');
    }

    // Only allow deletion of pending questionnaires
    if (q.status === 'completed') {
      return apiResponse.error(
        'Impossible de supprimer un questionnaire complété',
        400
      );
    }

    const { error: deleteError } = await (supabase as any)
      .from('follow_up_questionnaires')
      .delete()
      .eq('id', questionnaireId);

    if (deleteError) {
      console.error('Error deleting questionnaire:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error in questionnaire DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
