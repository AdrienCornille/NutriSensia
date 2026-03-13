/**
 * Server-side mapping utility for anamnesis normalized tables.
 * Handles conversion between frontend string format and PostgreSQL typed columns.
 *
 * Used by both PUT (save) and GET (load) API routes.
 */

import {
  ANAMNESE_SECTION_FIELDS,
  type AnamneseFieldConfig,
} from '@/components/nutritionist/dossier/anamnese/anamnese-fields-config';
import type { AnamneseSectionId } from '@/types/dossier';

// ============================================================================
// Section ID -> PostgreSQL table name
// ============================================================================

export const SECTION_TABLE_MAP: Record<string, string> = {
  identite: 'anamnesis_identite',
  morphologie: 'anamnesis_morphologie',
  historique: 'anamnesis_historique',
  sante: 'anamnesis_sante',
  sante_bilan: 'anamnesis_sante_bilan',
  habitudes: 'anamnesis_habitudes',
  consommation: 'anamnesis_consommation',
  lifestyle: 'anamnesis_lifestyle',
  motivation: 'anamnesis_motivation',
  psycho_comportemental: 'anamnesis_psycho',
};

// Fields stored as INTEGER in DB (rest of number fields are NUMERIC)
const INTEGER_FIELDS = new Set([
  'nombre_enfants',
  'age_debut_problemes',
  'nb_repas_jour',
]);

// ============================================================================
// Frontend string -> PostgreSQL typed value (for PUT/save)
// ============================================================================

function convertValue(
  key: string,
  value: string,
  cfg: AnamneseFieldConfig | undefined
): unknown {
  if (!value || value.trim() === '') return null;
  const trimmed = value.trim();

  // Note fields (no config) -> TEXT
  if (!cfg) return trimmed;

  switch (cfg.type) {
    case 'number':
      if (INTEGER_FIELDS.has(key)) {
        const i = parseInt(trimmed, 10);
        return isNaN(i) ? null : i;
      } else {
        const n = parseFloat(trimmed);
        return isNaN(n) ? null : n;
      }

    case 'scale': {
      const s = parseInt(trimmed, 10);
      return isNaN(s) ? null : s;
    }

    case 'boolean':
      return trimmed === 'Oui';

    case 'multiselect':
      return trimmed
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    case 'medications':
    case 'supplements':
    case 'drinks_alcohol':
    case 'drinks_sugary':
    case 'drinks_hot':
    case 'sports':
      try {
        return JSON.parse(trimmed);
      } catch {
        return [];
      }

    case 'date':
      return trimmed || null;

    default:
      // text, select, phone, textarea
      return trimmed;
  }
}

/**
 * Convert frontend field_data (Record<string, string>) to typed column data
 * for upserting into the normalized PostgreSQL table.
 */
export function convertToTableData(
  sectionId: string,
  fieldData: Record<string, string>,
  anamnesisId: string
): Record<string, unknown> {
  const configs = ANAMNESE_SECTION_FIELDS[sectionId as AnamneseSectionId];
  if (!configs) throw new Error(`Unknown section: ${sectionId}`);

  const configMap = new Map(configs.map(c => [c.key, c]));
  const result: Record<string, unknown> = { anamnesis_id: anamnesisId };

  for (const [key, value] of Object.entries(fieldData)) {
    if (key.endsWith('_note')) {
      result[key] = value?.trim() || null;
    } else {
      result[key] = convertValue(key, value, configMap.get(key));
    }
  }

  return result;
}

// ============================================================================
// PostgreSQL typed value -> frontend string (for GET/load)
// ============================================================================

function valueToString(
  value: unknown,
  cfg: AnamneseFieldConfig
): string | null {
  if (value === null || value === undefined) return null;

  switch (cfg.type) {
    case 'boolean':
      return value === true ? 'Oui' : value === false ? 'Non' : null;

    case 'multiselect':
      return Array.isArray(value) ? value.join(', ') : String(value);

    case 'medications':
    case 'supplements':
    case 'drinks_alcohol':
    case 'drinks_sugary':
    case 'drinks_hot':
    case 'sports':
      if (Array.isArray(value) && value.length > 0) {
        return JSON.stringify(value);
      }
      return null;

    default:
      return String(value);
  }
}

/**
 * Convert normalized DB data (from get_current_anamnesis_v2) back to the
 * frontend [{ label, value }] format used by AnamneseSectionForm.
 */
export function convertFromTableData(
  sectionId: string,
  tableData: Record<string, unknown> | null
): { label: string; value: string }[] {
  if (!tableData) return [];

  const configs = ANAMNESE_SECTION_FIELDS[sectionId as AnamneseSectionId];
  if (!configs) return [];

  const fields: { label: string; value: string }[] = [];

  for (const cfg of configs) {
    const rawValue = tableData[cfg.key];
    const stringValue = valueToString(rawValue, cfg);

    if (stringValue) {
      fields.push({ label: cfg.label, value: stringValue });
    }

    // Include note if present
    if (cfg.hasNotes) {
      const noteValue = tableData[`${cfg.key}_note`];
      if (noteValue && String(noteValue).trim()) {
        fields.push({
          label: `${cfg.label} (note)`,
          value: String(noteValue),
        });
      }
    }
  }

  return fields;
}

// ============================================================================
// Section metadata
// ============================================================================

export const SECTION_METADATA: Record<
  string,
  { label: string; icon: string }
> = {
  identite: { label: 'Identit\u00e9 & Coordonn\u00e9es', icon: '\ud83d\udc64' },
  morphologie: { label: 'Donn\u00e9es morphologiques', icon: '\ud83d\udccf' },
  historique: { label: 'Historique pond\u00e9ral', icon: '\ud83d\udcca' },
  sante: { label: 'Ant\u00e9c\u00e9dents & Traitements', icon: '\ud83c\udfe5' },
  sante_bilan: { label: 'Bilan digestif & biologique', icon: '\ud83e\ude7a' },
  habitudes: { label: 'Habitudes alimentaires', icon: '\ud83c\udf7d\ufe0f' },
  consommation: { label: 'Consommation & Boissons', icon: '\ud83e\udd64' },
  lifestyle: { label: 'Mode de vie', icon: '\ud83c\udfc3' },
  motivation: { label: 'Motivation & Objectifs', icon: '\ud83c\udfaf' },
  psycho_comportemental: { label: 'Psycho-comportemental', icon: '\ud83e\udde0' },
};

/** All section IDs in display order */
export const SECTION_IDS = [
  'identite',
  'morphologie',
  'historique',
  'sante',
  'sante_bilan',
  'habitudes',
  'consommation',
  'lifestyle',
  'motivation',
  'psycho_comportemental',
] as const;

/**
 * Reverse-lookup: find the DB column key and field type for a given display label.
 * Used when integrating change reports to update the normalized table directly.
 */
export function findFieldByLabel(
  sectionId: string,
  label: string
): { key: string; type: string } | null {
  const configs = ANAMNESE_SECTION_FIELDS[sectionId as AnamneseSectionId];
  if (!configs) return null;
  const config = configs.find(c => c.label === label);
  return config ? { key: config.key, type: config.type } : null;
}

/**
 * Convert a frontend string value to the correct DB type for a given field.
 * Thin wrapper around the internal convertValue for external use.
 */
export function convertFieldValueForDB(
  fieldKey: string,
  fieldType: string,
  stringValue: string
): unknown {
  if (!stringValue || stringValue.trim() === '') return null;
  const trimmed = stringValue.trim();

  switch (fieldType) {
    case 'boolean':
      return trimmed === 'Oui';
    case 'number': {
      const n = parseFloat(trimmed);
      return isNaN(n) ? null : n;
    }
    case 'scale': {
      const s = parseInt(trimmed, 10);
      return isNaN(s) ? null : s;
    }
    case 'multiselect':
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    case 'medications':
    case 'supplements':
    case 'drinks_alcohol':
    case 'drinks_sugary':
    case 'drinks_hot':
    case 'sports':
      try { return JSON.parse(trimmed); } catch { return []; }
    default:
      return trimmed;
  }
}

/** v2 function column name for each section */
export const SECTION_V2_COLUMN: Record<string, string> = {
  identite: 'identite',
  morphologie: 'morphologie',
  historique: 'historique',
  sante: 'sante',
  sante_bilan: 'sante_bilan',
  habitudes: 'habitudes',
  consommation: 'consommation',
  lifestyle: 'lifestyle',
  motivation: 'motivation',
  psycho_comportemental: 'psycho',
};
