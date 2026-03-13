import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { reviewChangeReportSchema } from '@/lib/api-schemas';
import {
  SECTION_METADATA,
  SECTION_TABLE_MAP,
  findFieldByLabel,
  convertFieldValueForDB,
} from '@/lib/anamnese-table-mapping';

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

    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'all';

    let query = (supabase as any)
      .from('change_reports')
      .select('*')
      .eq('patient_id', patient.user_id)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: reports, error: reportsError } = await query;

    if (reportsError) {
      console.error('Error fetching change reports:', reportsError);
      return apiResponse.serverError('Erreur lors de la récupération');
    }

    return apiResponse.success(reports || []);
  } catch (error) {
    console.error('Unexpected error in change-reports GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function PATCH(
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

    const body = await req.json();
    const { report_id, ...reviewData } = body;

    if (!report_id) {
      return apiResponse.error('report_id requis', 400);
    }

    const parsed = reviewChangeReportSchema.safeParse(reviewData);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Verify report belongs to patient – fetch full data for integration
    const { data: report } = await (supabase as any)
      .from('change_reports')
      .select('*')
      .eq('id', report_id)
      .eq('patient_id', patient.user_id)
      .single();

    if (!report) {
      return apiResponse.notFound('Signalement introuvable');
    }

    const now = new Date().toISOString();

    const { error: updateError } = await (supabase as any)
      .from('change_reports')
      .update({
        status: parsed.data.status,
        reviewer_notes: parsed.data.reviewer_notes || null,
        reviewed_by: auth.user.id,
        reviewed_at: now,
      })
      .eq('id', report_id);

    if (updateError) {
      console.error('Error reviewing change report:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour');
    }

    // When integrating, auto-apply the change to the anamnesis field
    if (
      parsed.data.status === 'integrated' &&
      report.title &&
      report.new_value
    ) {
      try {
        // Get current anamnesis for the patient
        const { data: anamnesis } = await (supabase as any)
          .from('anamneses')
          .select('id')
          .eq('patient_id', patient.user_id)
          .eq('is_current', true)
          .single();

        if (anamnesis) {
          // Search ALL sections for the field by label (robust against section mismatch)
          const { data: allSections } = await (supabase as any)
            .from('anamnesis_sections')
            .select('id, section_id, fields')
            .eq('anamnesis_id', anamnesis.id);

          const sectionsList = Array.isArray(allSections) ? allSections : [];

          // Find the section that actually contains the field
          const targetSection = sectionsList.find(
            (s: { fields: { label: string }[] }) =>
              Array.isArray(s.fields) &&
              s.fields.some((f: { label: string }) => f.label === report.title)
          );

          if (targetSection) {
            // Update existing field in JSONB section
            const updatedFields = targetSection.fields.map(
              (f: { label: string; value: string }) => {
                if (f.label === report.title) {
                  return {
                    ...f,
                    previous_value: f.value,
                    value: report.new_value,
                    updated_at: now,
                    updated_by: 'patient_report',
                  };
                }
                return f;
              }
            );

            await (supabase as any)
              .from('anamnesis_sections')
              .update({ fields: updatedFields })
              .eq('id', targetSection.id);

            // If the report had the wrong section, correct it for traceability
            if (
              report.anamnesis_section_id &&
              report.anamnesis_section_id !== targetSection.section_id
            ) {
              await (supabase as any)
                .from('change_reports')
                .update({ anamnesis_section_id: targetSection.section_id })
                .eq('id', report_id);
            }
          } else {
            // No JSONB section contains this field – create or update section row
            const sectionId = report.anamnesis_section_id || 'other';
            const newField = {
              label: report.title,
              value: report.new_value,
              previous_value: report.old_value || null,
              updated_at: now,
              updated_by: 'patient_report',
            };

            // Check if a section row exists for this section_id
            const existingRow = sectionsList.find(
              (s: { section_id: string }) => s.section_id === sectionId
            );

            if (existingRow) {
              // Add the field to the existing section's fields array
              const updatedFields = [...(existingRow.fields || []), newField];
              await (supabase as any)
                .from('anamnesis_sections')
                .update({ fields: updatedFields })
                .eq('id', existingRow.id);
            } else {
              // Create a new JSONB section row
              const meta = SECTION_METADATA[sectionId as keyof typeof SECTION_METADATA];
              await (supabase as any)
                .from('anamnesis_sections')
                .insert({
                  anamnesis_id: anamnesis.id,
                  section_id: sectionId,
                  section_label: meta?.label || sectionId,
                  section_icon: meta?.icon || '',
                  fields: [newField],
                  display_order: 0,
                });
            }
          }

          // Update the normalized table directly (source of truth for values)
          const effectiveSectionId = report.anamnesis_section_id;
          if (effectiveSectionId) {
            const tableName = SECTION_TABLE_MAP[effectiveSectionId];
            const fieldInfo = findFieldByLabel(effectiveSectionId, report.title);
            if (tableName && fieldInfo) {
              const dbValue = convertFieldValueForDB(
                fieldInfo.key,
                fieldInfo.type,
                report.new_value
              );
              const { error: normalizedError } = await (supabase as any)
                .from(tableName)
                .update({ [fieldInfo.key]: dbValue })
                .eq('anamnesis_id', anamnesis.id);
              if (normalizedError) {
                console.error('Error updating normalized table:', normalizedError);
              }
            }
          }

          // Bump anamnesis updated_at
          await (supabase as any)
            .from('anamneses')
            .update({ updated_at: now })
            .eq('id', anamnesis.id);
        }
      } catch (integrationError) {
        // Log but don't fail – the report status is already updated
        console.error('Error auto-applying change to anamnesis:', integrationError);
      }
    }

    return apiResponse.success({ id: report_id, status: parsed.data.status });
  } catch (error) {
    console.error('Unexpected error in change-reports PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
