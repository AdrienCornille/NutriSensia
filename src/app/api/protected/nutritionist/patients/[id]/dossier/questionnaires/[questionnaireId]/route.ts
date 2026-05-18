import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import {
  ASSIGNMENT_SELECT,
  assignmentToQuestionnaireDetail,
} from '@/lib/questionnaire-mapper';

// =============================================================================
// GET /api/protected/nutritionist/patients/[id]/dossier/questionnaires/[id]
// Returns one assignment flattened to the legacy QuestionnaireDetail shape.
// =============================================================================
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

    const { data: assignment, error: qError } = await (supabase as any)
      .from('questionnaire_assignments')
      .select(ASSIGNMENT_SELECT)
      .eq('id', questionnaireId)
      .eq('patient_id', patient.user_id)
      .single();

    if (qError || !assignment) {
      return apiResponse.notFound('Questionnaire introuvable');
    }

    return apiResponse.success(assignmentToQuestionnaireDetail(assignment));
  } catch (error) {
    console.error('Unexpected error in questionnaire GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// =============================================================================
// DELETE /api/protected/nutritionist/patients/[id]/dossier/questionnaires/[id]
// Deletes an assignment. Cascades to its response/answers via FK rules.
// The associated draft template is intentionally left in place — cleanup
// of orphan drafts is a separate concern (future maintenance task).
// =============================================================================
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

    const { data: assignment } = await (supabase as any)
      .from('questionnaire_assignments')
      .select('id, status')
      .eq('id', questionnaireId)
      .eq('patient_id', patient.user_id)
      .single();

    if (!assignment) {
      return apiResponse.notFound('Questionnaire introuvable');
    }

    // Same rule as before: completed questionnaires are an archived record
    // and cannot be deleted (medical-dossier preservation).
    if (assignment.status === 'completed') {
      return apiResponse.error(
        'Impossible de supprimer un questionnaire complété',
        400
      );
    }

    const { error: deleteError } = await (supabase as any)
      .from('questionnaire_assignments')
      .delete()
      .eq('id', questionnaireId);

    if (deleteError) {
      console.error('Error deleting assignment:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error in questionnaire DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
