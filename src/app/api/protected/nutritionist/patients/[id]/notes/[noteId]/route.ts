import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updatePatientNoteSchema } from '@/lib/api-schemas';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, noteId } = await params;
    if (!patientProfileId || !noteId) {
      return apiResponse.error('ID patient et ID note requis', 400);
    }

    const supabase = await createClient();

    // Get nutritionist profile
    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify patient belongs to nutritionist
    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Validate body
    const body = await req.json();
    const parsed = updatePatientNoteSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Update note
    const { data: note, error } = await (supabase as any)
      .from('patient_notes')
      .update({ content: parsed.data.content })
      .eq('id', noteId)
      .eq('patient_id', patientProfileId)
      .eq('nutritionist_id', auth.user.id)
      .select('id, content, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error updating patient note:', error);
      return apiResponse.serverError('Erreur lors de la mise à jour de la note');
    }

    if (!note) {
      return apiResponse.notFound('Note introuvable');
    }

    return apiResponse.success(note);
  } catch (error) {
    console.error('Unexpected error in patient note PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, noteId } = await params;
    if (!patientProfileId || !noteId) {
      return apiResponse.error('ID patient et ID note requis', 400);
    }

    const supabase = await createClient();

    // Get nutritionist profile
    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify patient belongs to nutritionist
    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Delete note
    const { error } = await (supabase as any)
      .from('patient_notes')
      .delete()
      .eq('id', noteId)
      .eq('patient_id', patientProfileId)
      .eq('nutritionist_id', auth.user.id);

    if (error) {
      console.error('Error deleting patient note:', error);
      return apiResponse.serverError('Erreur lors de la suppression de la note');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error in patient note DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
