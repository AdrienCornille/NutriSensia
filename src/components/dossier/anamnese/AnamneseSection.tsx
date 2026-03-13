'use client';

import React, { useMemo } from 'react';
import type {
  AnamneseSection as AnamneseSectionType,
  AnamneseSectionId,
  AnamneseField,
} from '@/types/dossier';

interface MergedField {
  label: string;
  value: string;
  previous_value?: string;
  note?: string;
  updated_at?: string;
  updated_by?: string;
}

/**
 * Merge fields with their corresponding "(note)" fields into single entries.
 * e.g. "Allergies" + "Allergies (note)" => one MergedField with note.
 */
function mergeFieldsWithNotes(fields: AnamneseField[]): MergedField[] {
  const noteMap = new Map<string, string>();
  const mainFields: AnamneseField[] = [];

  for (const field of fields) {
    if (field.label.endsWith('(note)')) {
      const parentLabel = field.label.replace(/\s*\(note\)$/, '');
      noteMap.set(parentLabel, field.value);
    } else {
      mainFields.push(field);
    }
  }

  return mainFields.map(field => ({
    label: field.label,
    value: field.value,
    previous_value: field.previous_value,
    note: noteMap.get(field.label),
    updated_at: field.updated_at,
    updated_by: field.updated_by,
  }));
}

/**
 * Try to parse a JSON array of {nom, dosage, frequence} items.
 * Returns null if the value is not a valid JSON array of this shape.
 */
function tryParseStructuredList(
  value: string
): { nom: string; dosage: string; frequence: string }[] | null {
  if (!value.startsWith('[')) return null;
  try {
    const parsed = JSON.parse(value);
    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      typeof parsed[0]?.nom !== 'string'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function FieldValue({ value }: { value: string }) {
  const items = useMemo(() => tryParseStructuredList(value), [value]);

  if (!items) {
    return (
      <span className='block text-sm font-medium text-gray-800 break-words'>
        {value}
      </span>
    );
  }

  return (
    <div className='space-y-1.5'>
      {items.map((item, i) => (
        <div key={i} className='flex items-baseline gap-1.5 text-sm'>
          <span className='font-medium text-gray-800'>{item.nom}</span>
          {item.dosage && (
            <span className='text-gray-500'>{item.dosage}</span>
          )}
          {item.frequence && (
            <span className='text-xs text-gray-400'>
              ({item.frequence})
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

interface AnamneseSectionProps {
  section: AnamneseSectionType;
  isExpanded: boolean;
  onToggle: (sectionId: AnamneseSectionId) => void;
}

export function AnamneseSection({
  section,
  isExpanded,
  onToggle,
}: AnamneseSectionProps) {
  const mergedFields = useMemo(
    () => mergeFieldsWithNotes(section.fields),
    [section.fields]
  );

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <button
        onClick={() => onToggle(section.id)}
        className='w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-[#1B998B]/10 rounded-lg flex items-center justify-center'>
            <span className='text-xl'>{section.icon}</span>
          </div>
          <span className='font-medium text-gray-800'>{section.label}</span>
        </div>
        <span
          className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className='border-t border-gray-100 p-5 bg-gray-50'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {mergedFields.map((field, index) => {
              const wasUpdatedByPatient = field.updated_by === 'patient_report' && field.updated_at;
              return (
                <div
                  key={index}
                  className={`p-3 bg-white rounded-lg border ${
                    wasUpdatedByPatient
                      ? 'border-[#1B998B]/40 ring-1 ring-[#1B998B]/10'
                      : 'border-gray-100'
                  }`}
                >
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-xs text-gray-400'>
                      {field.label}
                    </span>
                    {wasUpdatedByPatient && (
                      <span className='text-[10px] font-medium text-[#1B998B] bg-[#1B998B]/10 px-1.5 py-0.5 rounded-full'>
                        Mis à jour
                      </span>
                    )}
                  </div>
                  {wasUpdatedByPatient ? (
                    <div className='space-y-1'>
                      {field.previous_value && (
                        <span className='block text-sm text-gray-400 line-through break-words'>
                          {field.previous_value}
                        </span>
                      )}
                      <div className='flex items-baseline gap-1.5 flex-wrap'>
                        <FieldValue value={field.value} />
                        <span className='text-[10px] text-[#1B998B]/70 whitespace-nowrap'>
                          ({new Date(field.updated_at!).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <FieldValue value={field.value} />
                  )}
                  {field.note && (
                    <span className='block text-sm text-gray-600 mt-1.5 break-words'>
                      {field.note}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnamneseSection;
