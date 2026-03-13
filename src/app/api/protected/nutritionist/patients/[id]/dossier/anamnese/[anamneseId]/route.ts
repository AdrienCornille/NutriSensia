import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateAnamneseStatusSchema } from '@/lib/api-schemas';
import {
  SECTION_IDS,
  SECTION_TABLE_MAP,
  SECTION_METADATA,
  convertFromTableData,
} from '@/lib/anamnese-table-mapping';

// ============================================================================
// GET - Load a specific anamnesis version with its sections
// ============================================================================

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; anamneseId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, anamneseId } = await params;
    if (!patientProfileId || !anamneseId) {
      return apiResponse.error('Paramètres requis', 400);
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

    // Fetch anamnesis metadata
    const { data: anamnesis, error: anamnesisError } = await (supabase as any)
      .from('anamneses')
      .select('id, version, status, is_current, created_at, updated_at')
      .eq('id', anamneseId)
      .eq('patient_id', patient.user_id)
      .single();

    if (anamnesisError || !anamnesis) {
      return apiResponse.notFound('Anamnèse introuvable');
    }

    // Try normalized tables first
    const sections: { id: string; label: string; icon: string; fields: { label: string; value: string }[] }[] = [];

    for (const sectionId of SECTION_IDS) {
      const tableName = SECTION_TABLE_MAP[sectionId];
      const { data: row } = await (supabase as any)
        .from(tableName)
        .select('*')
        .eq('anamnesis_id', anamneseId)
        .single();

      if (row) {
        const meta = SECTION_METADATA[sectionId];
        const fields = convertFromTableData(sectionId, row);
        if (fields.length > 0) {
          sections.push({ id: sectionId, label: meta.label, icon: meta.icon, fields });
        }
      }
    }

    // Fallback to legacy JSONB if no normalized data
    if (sections.length === 0) {
      const { data: legacySections } = await (supabase as any)
        .from('anamnesis_sections')
        .select('section_id, section_label, section_icon, fields, display_order')
        .eq('anamnesis_id', anamneseId)
        .order('display_order', { ascending: true });

      if (legacySections) {
        for (const s of legacySections) {
          sections.push({
            id: s.section_id,
            label: s.section_label,
            icon: s.section_icon || '',
            fields: s.fields || [],
          });
        }
      }
    }

    return apiResponse.success({
      id: anamnesis.id,
      version: anamnesis.version,
      status: anamnesis.status,
      is_current: anamnesis.is_current,
      created_at: anamnesis.created_at,
      updated_at: anamnesis.updated_at,
      sections,
    });
  } catch (error) {
    console.error('Unexpected error in anamnese GET by id:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Delete a non-current anamnesis version
// ============================================================================

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; anamneseId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, anamneseId } = await params;
    if (!patientProfileId || !anamneseId) {
      return apiResponse.error('Paramètres requis', 400);
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

    // Fetch anamnesis and check is_current
    const { data: anamnesis, error: anamnesisError } = await (supabase as any)
      .from('anamneses')
      .select('id, is_current, version')
      .eq('id', anamneseId)
      .eq('patient_id', patient.user_id)
      .single();

    if (anamnesisError || !anamnesis) {
      return apiResponse.notFound('Anamnèse introuvable');
    }

    if (anamnesis.is_current) {
      return apiResponse.error(
        'Impossible de supprimer la version actuelle',
        400
      );
    }

    // Delete (CASCADE handles normalized tables + legacy sections)
    const { error: deleteError } = await (supabase as any)
      .from('anamneses')
      .delete()
      .eq('id', anamneseId);

    if (deleteError) {
      console.error('Error deleting anamnesis:', deleteError);
      return apiResponse.serverError("Erreur lors de la suppression");
    }

    // Renumber remaining versions sequentially (1, 2, 3...)
    const { data: remaining } = await (supabase as any)
      .from('anamneses')
      .select('id')
      .eq('patient_id', patient.user_id)
      .order('created_at', { ascending: true });

    if (remaining && remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        await (supabase as any)
          .from('anamneses')
          .update({ version: i + 1 })
          .eq('id', remaining[i].id);
      }
    }

    return apiResponse.success({ deleted: true, id: anamneseId });
  } catch (error) {
    console.error('Unexpected error in anamnese DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// PATCH - Update anamnesis status
// ============================================================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; anamneseId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, anamneseId } = await params;
    if (!patientProfileId || !anamneseId) {
      return apiResponse.error('Paramètres requis', 400);
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

    // Verify anamnesis belongs to patient
    const { data: anamnesis, error: anamnesisError } = await (supabase as any)
      .from('anamneses')
      .select('id, status')
      .eq('id', anamneseId)
      .eq('patient_id', patient.user_id)
      .single();

    if (anamnesisError || !anamnesis) {
      return apiResponse.notFound('Anamnèse introuvable');
    }

    const body = await req.json();
    const parsed = updateAnamneseStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.errors[0].message, 400);
    }

    const { status } = parsed.data;

    // Update status
    const { error: updateError } = await (supabase as any)
      .from('anamneses')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', anamneseId);

    if (updateError) {
      console.error('Error updating anamnesis status:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour');
    }

    return apiResponse.success({ id: anamneseId, status });
  } catch (error) {
    console.error('Unexpected error in anamnese PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
