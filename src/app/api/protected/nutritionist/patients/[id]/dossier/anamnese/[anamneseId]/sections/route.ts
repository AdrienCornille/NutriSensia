import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { upsertAnamneseSectionSchema } from '@/lib/api-schemas';
import {
  SECTION_TABLE_MAP,
  convertToTableData,
} from '@/lib/anamnese-table-mapping';

export async function PUT(
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

    // Parse body
    const body = await req.json();
    const parsed = upsertAnamneseSectionSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.errors[0].message, 400);
    }

    const { section_id, field_data } = parsed.data;

    // Get the normalized table name
    const tableName = SECTION_TABLE_MAP[section_id];
    if (!tableName) {
      return apiResponse.error(`Section inconnue: ${section_id}`, 400);
    }

    // Convert frontend string values to typed PostgreSQL values
    let typedData: Record<string, unknown>;
    try {
      typedData = convertToTableData(section_id, field_data, anamneseId);
    } catch (convError) {
      console.error('Conversion error:', convError);
      return apiResponse.error(
        `Erreur de conversion: ${convError instanceof Error ? convError.message : convError}`,
        400
      );
    }

    console.log(`[sections PUT] table=${tableName}, data=`, JSON.stringify(typedData));

    // Upsert into the normalized table (UNIQUE constraint on anamnesis_id)
    const { data: existing } = await (supabase as any)
      .from(tableName)
      .select('id')
      .eq('anamnesis_id', anamneseId)
      .single();

    if (existing) {
      // Update existing row - remove anamnesis_id from update payload
      const { anamnesis_id: _aid, ...updatePayload } = typedData;
      const { error: updateError } = await (supabase as any)
        .from(tableName)
        .update(updatePayload)
        .eq('id', existing.id);

      if (updateError) {
        console.error(`Error updating ${tableName}:`, updateError);
        return apiResponse.error(
          `Erreur mise à jour ${tableName}: ${updateError.message}`,
          500
        );
      }
    } else {
      // Insert new row
      const { error: insertError } = await (supabase as any)
        .from(tableName)
        .insert(typedData);

      if (insertError) {
        console.error(`Error inserting into ${tableName}:`, insertError);
        return apiResponse.error(
          `Erreur insertion ${tableName}: ${insertError.message}`,
          500
        );
      }
    }

    // Update anamnesis updated_at
    await (supabase as any)
      .from('anamneses')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', anamneseId);

    return apiResponse.success({
      anamnesis_id: anamneseId,
      section_id,
      action: existing ? 'updated' : 'created',
    });
  } catch (error) {
    console.error('Unexpected error in sections PUT:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
