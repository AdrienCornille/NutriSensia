import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateDocumentSchema } from '@/lib/api-schemas';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, documentId } = await params;
    if (!patientProfileId || !documentId) {
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

    // Verify document belongs to patient
    const { data: doc } = await (supabase as any)
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('patient_id', patient.user_id)
      .single();

    if (!doc) {
      return apiResponse.notFound('Document introuvable');
    }

    const body = await req.json();
    const parsed = updateDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.errors[0].message, 400);
    }

    const { error: updateError } = await (supabase as any)
      .from('documents')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour');
    }

    return apiResponse.success({ id: documentId, ...parsed.data });
  } catch (error) {
    console.error('Unexpected error in document PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, documentId } = await params;
    if (!patientProfileId || !documentId) {
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

    const { data: doc } = await (supabase as any)
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('patient_id', patient.user_id)
      .single();

    if (!doc) {
      return apiResponse.notFound('Document introuvable');
    }

    // Soft delete via status or hard delete
    const { error: deleteError } = await (supabase as any)
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      console.error('Error deleting document:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error in document DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
