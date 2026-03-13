import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import {
  SECTION_IDS,
  SECTION_TABLE_MAP,
  SECTION_METADATA,
  convertFromTableData,
} from '@/lib/anamnese-table-mapping';

function formatDateFR(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function GET() {
  try {
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    const userId = auth.user.id;

    // Get current anamnesis for this patient
    const { data: anamnesis, error: anamnesisError } = await (supabase as any)
      .from('anamneses')
      .select('id, version, status, is_current, created_at, updated_at, created_by')
      .eq('patient_id', userId)
      .eq('is_current', true)
      .single();

    if (anamnesisError || !anamnesis) {
      return apiResponse.success({ anamnese: null });
    }

    // Read normalized tables for sections
    const sections: { id: string; label: string; icon: string; fields: { label: string; value: string; previous_value?: string; updated_at?: string; updated_by?: string }[] }[] = [];

    for (const sectionId of SECTION_IDS) {
      const tableName = SECTION_TABLE_MAP[sectionId];
      const { data: row } = await (supabase as any)
        .from(tableName)
        .select('*')
        .eq('anamnesis_id', anamnesis.id)
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
        .eq('anamnesis_id', anamnesis.id)
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

    // Merge field-level metadata from JSONB (updated_by, updated_at, previous_value)
    // These are written by the change report integration and stored in anamnesis_sections
    if (sections.length > 0) {
      const { data: jsonbSections } = await (supabase as any)
        .from('anamnesis_sections')
        .select('section_id, fields')
        .eq('anamnesis_id', anamnesis.id);

      if (jsonbSections && Array.isArray(jsonbSections)) {
        const metadataMap = new Map<string, Map<string, { previous_value?: string; updated_at?: string; updated_by?: string }>>();

        for (const js of jsonbSections) {
          if (!Array.isArray(js.fields)) continue;
          const fieldMap = new Map<string, { previous_value?: string; updated_at?: string; updated_by?: string }>();
          for (const f of js.fields) {
            if (f.updated_by) {
              fieldMap.set(f.label, {
                previous_value: f.previous_value,
                updated_at: f.updated_at,
                updated_by: f.updated_by,
              });
            }
          }
          if (fieldMap.size > 0) {
            metadataMap.set(js.section_id, fieldMap);
          }
        }

        // Merge metadata + updated values into normalized sections
        // Build a value map from JSONB so we can override normalized table values
        const valueMap = new Map<string, Map<string, string>>();
        for (const js of jsonbSections) {
          if (!Array.isArray(js.fields)) continue;
          const fMap = new Map<string, string>();
          for (const f of js.fields) {
            if (f.updated_by && f.value != null) {
              fMap.set(f.label, f.value);
            }
          }
          if (fMap.size > 0) {
            valueMap.set(js.section_id, fMap);
          }
        }

        for (const section of sections) {
          const fieldMeta = metadataMap.get(section.id);
          const fieldValues = valueMap.get(section.id);
          if (!fieldMeta && !fieldValues) continue;
          for (const field of section.fields) {
            const meta = fieldMeta?.get(field.label);
            if (meta) {
              Object.assign(field, meta);
            }
            // Override value from JSONB if it was updated by a patient report
            const updatedValue = fieldValues?.get(field.label);
            if (updatedValue !== undefined) {
              (field as any).value = updatedValue;
            }
          }
        }
      }
    }

    // Get nutritionist name from created_by
    let nutritionist = '';
    if (anamnesis.created_by) {
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', anamnesis.created_by)
        .single();

      if (profile) {
        nutritionist = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }
    }

    return apiResponse.success({
      anamnese: {
        createdAt: formatDateFR(anamnesis.created_at),
        updatedAt: anamnesis.updated_at !== anamnesis.created_at
          ? formatDateFR(anamnesis.updated_at)
          : null,
        nutritionist,
        version: anamnesis.version,
        status: anamnesis.status,
        sections,
      },
    });
  } catch (error) {
    console.error('Unexpected error in patient anamnese GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
