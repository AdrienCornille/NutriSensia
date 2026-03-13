import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateConsultationSchema } from '@/lib/api-schemas';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; consultationId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, consultationId } = await params;

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
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Fetch consultation
    const { data: consultation, error: fetchError } = await (supabase as any)
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .eq('patient_id', patient.user_id)
      .eq('nutritionist_id', auth.user.id)
      .single();

    if (fetchError || !consultation) {
      return apiResponse.notFound('Consultation introuvable');
    }

    return apiResponse.success(consultation);
  } catch (error) {
    console.error('Unexpected error in consultation GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; consultationId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, consultationId } = await params;

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

    // Verify patient
    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Fetch existing consultation
    const { data: existing } = await (supabase as any)
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .eq('patient_id', patient.user_id)
      .eq('nutritionist_id', auth.user.id)
      .single();

    if (!existing) {
      return apiResponse.notFound('Consultation introuvable');
    }

    // Check 48h edit window (CONSULT-003) — drafts can always be edited
    if (existing.status !== 'draft') {
      const createdAt = new Date(existing.created_at);
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCreation > 48) {
        return apiResponse.error(
          'La modification n\'est plus possible après 48h',
          403
        );
      }
    }

    const body = await req.json();
    const parsed = updateConsultationSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    const { data: updated, error: updateError } = await (supabase as any)
      .from('consultations')
      .update(updateData)
      .eq('id', consultationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating consultation:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour');
    }

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error in consultation PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; consultationId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, consultationId } = await params;

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

    // Verify patient
    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Check consultation exists and belongs to this nutritionist
    const { data: existing } = await (supabase as any)
      .from('consultations')
      .select('id')
      .eq('id', consultationId)
      .eq('patient_id', patient.user_id)
      .eq('nutritionist_id', auth.user.id)
      .single();

    if (!existing) {
      return apiResponse.notFound('Consultation introuvable');
    }

    const { error: deleteError } = await (supabase as any)
      .from('consultations')
      .delete()
      .eq('id', consultationId);

    if (deleteError) {
      console.error('Error deleting consultation:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error in consultation DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
