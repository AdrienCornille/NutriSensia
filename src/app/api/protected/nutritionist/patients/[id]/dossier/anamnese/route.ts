import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import {
  SECTION_IDS,
  SECTION_METADATA,
  SECTION_V2_COLUMN,
  convertFromTableData,
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

    const url = new URL(req.url);
    const includeHistory = url.searchParams.get('include_history') === 'true';

    // Try normalized tables first (v2)
    const { data: v2Data, error: v2Error } = await (supabase as any).rpc(
      'get_current_anamnesis_v2',
      { p_patient_id: patient.user_id }
    );

    const v2Row = Array.isArray(v2Data) ? v2Data[0] : v2Data;
    const hasV2Data =
      v2Row &&
      v2Row.anamnesis_id &&
      SECTION_IDS.some(
        sid => v2Row[SECTION_V2_COLUMN[sid]] !== null
      );

    let current = null;

    if (hasV2Data && !v2Error) {
      // Build sections from normalized tables
      const sections = SECTION_IDS.map(sectionId => {
        const colName = SECTION_V2_COLUMN[sectionId];
        const tableData = v2Row[colName] as Record<string, unknown> | null;
        const meta = SECTION_METADATA[sectionId];

        return {
          id: sectionId,
          label: meta.label,
          icon: meta.icon,
          fields: convertFromTableData(sectionId, tableData),
        };
      }).filter(s => s.fields.length > 0);

      // Merge field-level metadata from JSONB (updated_by, updated_at, previous_value)
      const { data: jsonbSections } = await (supabase as any)
        .from('anamnesis_sections')
        .select('section_id, fields')
        .eq('anamnesis_id', v2Row.anamnesis_id);

      if (jsonbSections && Array.isArray(jsonbSections)) {
        for (const js of jsonbSections) {
          if (!Array.isArray(js.fields)) continue;
          const section = sections.find(s => s.id === js.section_id);
          if (!section) continue;
          for (const jf of js.fields) {
            if (!jf.updated_by) continue;
            const field = section.fields.find((f: { label: string }) => f.label === jf.label);
            if (field) {
              Object.assign(field, {
                previous_value: jf.previous_value,
                updated_at: jf.updated_at,
                updated_by: jf.updated_by,
              });
              // Override value from JSONB if it was updated by a patient report
              if (jf.value != null) {
                (field as any).value = jf.value;
              }
            }
          }
        }
      }

      current = {
        id: v2Row.anamnesis_id,
        version: v2Row.version,
        status: v2Row.status,
        created_at: v2Row.created_at,
        updated_at: v2Row.updated_at,
        sections,
      };
    } else {
      // Fallback to legacy JSONB tables (v1)
      const { data: v1Data, error: v1Error } = await (supabase as any).rpc(
        'get_current_anamnesis',
        { p_patient_id: patient.user_id }
      );

      if (v1Error) {
        console.error('Error fetching anamnesis:', v1Error);
        return apiResponse.serverError(
          "Erreur lors de la recuperation de l'anamnese"
        );
      }

      const v1Row = Array.isArray(v1Data) ? v1Data[0] : v1Data;

      if (v1Row && v1Row.anamnesis_id) {
        const sections = (v1Row.sections || []).map(
          (s: {
            section_id: string;
            section_label: string;
            section_icon: string;
            fields: { label: string; value: string }[];
            display_order: number;
          }) => ({
            id: s.section_id,
            label: s.section_label,
            icon: s.section_icon || '',
            fields: s.fields || [],
          })
        );

        current = {
          id: v1Row.anamnesis_id,
          version: v1Row.version,
          status: v1Row.status,
          created_at: v1Row.created_at,
          updated_at: v1Row.updated_at,
          sections,
        };
      }
    }

    // Optionally fetch version history
    let history: {
      id: string;
      version: number;
      status: string;
      is_current: boolean;
      created_at: string;
      updated_at: string;
    }[] = [];
    if (includeHistory) {
      const { data: versions, error: historyError } = await (supabase as any)
        .from('anamneses')
        .select('id, version, status, is_current, created_at, updated_at')
        .eq('patient_id', patient.user_id)
        .order('version', { ascending: false });

      if (!historyError && versions) {
        history = versions;
      }
    }

    return apiResponse.success({
      current,
      ...(includeHistory ? { history } : {}),
    });
  } catch (error) {
    console.error('Unexpected error in anamnese GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function POST(
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

    // Create new anamnesis version via DB function
    const { data: newAnamnesisId, error: createError } = await (
      supabase as any
    ).rpc('create_anamnesis_version', {
      p_patient_id: patient.user_id,
      p_created_by: auth.user.id,
    });

    if (createError) {
      console.error('Error creating anamnesis:', createError);
      return apiResponse.serverError(
        "Erreur lors de la creation de l'anamnese"
      );
    }

    // Get the created anamnesis details
    const { data: newAnamnesis } = await (supabase as any)
      .from('anamneses')
      .select('id, version, status, created_at')
      .eq('id', newAnamnesisId)
      .single();

    // Optionally pre-fill from previous version (copies normalized tables)
    const body = await req.json().catch(() => ({}));
    if (body.prefill_from_version) {
      const { data: sourceAnamnesis } = await (supabase as any)
        .from('anamneses')
        .select('id')
        .eq('patient_id', patient.user_id)
        .eq('version', body.prefill_from_version)
        .single();

      if (sourceAnamnesis) {
        // Copy from normalized tables
        const normalizedTables = [
          'anamnesis_identite',
          'anamnesis_morphologie',
          'anamnesis_historique',
          'anamnesis_sante',
          'anamnesis_sante_bilan',
          'anamnesis_habitudes',
          'anamnesis_consommation',
          'anamnesis_lifestyle',
          'anamnesis_motivation',
          'anamnesis_psycho',
        ];

        for (const table of normalizedTables) {
          const { data: sourceRow } = await (supabase as any)
            .from(table)
            .select('*')
            .eq('anamnesis_id', sourceAnamnesis.id)
            .single();

          if (sourceRow) {
            // Remove metadata columns, set new anamnesis_id
            const { id: _id, anamnesis_id: _aid, created_at: _ca, updated_at: _ua, ...columns } = sourceRow;
            await (supabase as any).from(table).insert({
              ...columns,
              anamnesis_id: newAnamnesisId,
            });
          }
        }

        // Also copy legacy sections if they exist
        const { data: sourceSections } = await (supabase as any)
          .from('anamnesis_sections')
          .select(
            'section_id, section_label, section_icon, fields, display_order'
          )
          .eq('anamnesis_id', sourceAnamnesis.id);

        if (sourceSections && sourceSections.length > 0) {
          const sectionsToInsert = sourceSections.map(
            (s: {
              section_id: string;
              section_label: string;
              section_icon: string;
              fields: unknown;
              display_order: number;
            }) => ({
              anamnesis_id: newAnamnesisId,
              section_id: s.section_id,
              section_label: s.section_label,
              section_icon: s.section_icon,
              fields: s.fields,
              display_order: s.display_order,
            })
          );
          await (supabase as any)
            .from('anamnesis_sections')
            .insert(sectionsToInsert);
        }
      }
    }

    return apiResponse.success(
      {
        id: newAnamnesisId,
        version: newAnamnesis?.version || 1,
        status: newAnamnesis?.status || 'pending',
      },
      201
    );
  } catch (error) {
    console.error('Unexpected error in anamnese POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
