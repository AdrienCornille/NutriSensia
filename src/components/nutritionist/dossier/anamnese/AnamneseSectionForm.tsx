'use client';

import React, { useState, useMemo } from 'react';
import { Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { TypedAnamneseField } from './TypedAnamneseField';
import type { AnamneseFieldConfig } from './anamnese-fields-config';

interface Field {
  label: string;
  value: string;
}

interface AnamneseSectionFormProps {
  sectionId: string;
  sectionLabel: string;
  sectionIcon: string;
  initialFields: Field[];
  predefinedFields?: AnamneseFieldConfig[];
  displayOrder: number;
  onSave: (fieldData: Record<string, string>) => Promise<void>;
  isSaving?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export function AnamneseSectionForm({
  sectionLabel,
  sectionIcon,
  initialFields,
  predefinedFields,
  onSave,
  isSaving,
  isExpanded,
  onToggle,
}: AnamneseSectionFormProps) {
  // Build initial values for predefined fields from existing data
  const { initialPredefinedValues, initialNoteValues } = useMemo(() => {
    const map: Record<string, string> = {};
    const notes: Record<string, string> = {};
    if (predefinedFields) {
      for (const cfg of predefinedFields) {
        const existing = initialFields.find(f => f.label === cfg.label || f.label === cfg.key);
        map[cfg.key] = existing?.value || '';
        // Load existing notes
        if (cfg.hasNotes) {
          const noteField = initialFields.find(f => f.label === `${cfg.label} (note)`);
          if (noteField?.value) notes[cfg.key] = noteField.value;
        }
      }
    }
    return { initialPredefinedValues: map, initialNoteValues: notes };
  }, [initialFields, predefinedFields]);

  const [predefinedValues, setPredefinedValues] = useState<
    Record<string, string>
  >(initialPredefinedValues);
  const [noteValues, setNoteValues] = useState<Record<string, string>>(initialNoteValues);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(() => {
    // Auto-expand notes that already have content
    return new Set(Object.keys(initialNoteValues).filter(k => initialNoteValues[k]));
  });
  const [hasChanges, setHasChanges] = useState(false);

  function updatePredefinedValue(key: string, value: string) {
    setPredefinedValues(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  function updateNoteValue(key: string, value: string) {
    setNoteValues(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  function toggleNote(key: string) {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Filter visible fields (respecting dependsOn conditions)
  const visibleFields = useMemo(() => {
    if (!predefinedFields) return [];
    return predefinedFields.filter(cfg => {
      if (!cfg.dependsOn) return true;
      return predefinedValues[cfg.dependsOn.field] === cfg.dependsOn.value;
    });
  }, [predefinedFields, predefinedValues]);

  // Count filled fields (only visible ones)
  const totalFilled = visibleFields.filter(f => predefinedValues[f.key]?.trim()).length;
  const totalPossible = visibleFields.length;

  async function handleSave() {
    const fieldData: Record<string, string> = {};

    if (predefinedFields) {
      for (const cfg of predefinedFields) {
        const val = predefinedValues[cfg.key]?.trim();
        if (val) {
          fieldData[cfg.key] = val;
        }
        // Include note if present
        if (cfg.hasNotes) {
          const noteVal = noteValues[cfg.key]?.trim();
          if (noteVal) {
            fieldData[`${cfg.key}_note`] = noteVal;
          }
        }
      }
    }

    if (Object.keys(fieldData).length === 0) return;
    await onSave(fieldData);
    setHasChanges(false);
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200'>
      <button
        type='button'
        onClick={onToggle}
        className='w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-[#1B998B]/10 rounded-lg flex items-center justify-center'>
            <span className='text-xl'>{sectionIcon}</span>
          </div>
          <div className='text-left'>
            <span className='font-medium text-gray-800'>{sectionLabel}</span>
            <span className='ml-2 text-xs text-gray-400'>
              {totalFilled}/{totalPossible} champ
              {totalPossible > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {hasChanges && (
            <span className='px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700'>
              Modifié
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className='w-5 h-5 text-gray-400' />
          ) : (
            <ChevronDown className='w-5 h-5 text-gray-400' />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className='border-t border-gray-100 p-4 bg-gray-50'>
          {/* Predefined typed fields */}
          {visibleFields.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              {visibleFields.map(cfg => (
                <React.Fragment key={cfg.key}>
                  {cfg.groupLabel && (
                    <div className='md:col-span-2 pt-2 first:pt-0'>
                      <h4 className='text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2'>
                        {cfg.groupLabel}
                      </h4>
                    </div>
                  )}
                  <div
                    className={
                      !cfg.halfWidth &&
                      (cfg.type === 'textarea' ||
                        cfg.type === 'multiselect' ||
                        cfg.type === 'medications' ||
                        cfg.type === 'supplements' ||
                        cfg.type === 'drinks_alcohol' ||
                        cfg.type === 'drinks_sugary' ||
                        cfg.type === 'drinks_hot' ||
                        cfg.type === 'sports')
                        ? 'md:col-span-2'
                        : ''
                    }
                  >
                    <TypedAnamneseField
                      config={cfg}
                      value={predefinedValues[cfg.key] || ''}
                      onChange={val => updatePredefinedValue(cfg.key, val)}
                      noteValue={noteValues[cfg.key] || ''}
                      onNoteChange={val => updateNoteValue(cfg.key, val)}
                      isNoteExpanded={expandedNotes.has(cfg.key)}
                      onToggleNote={() => toggleNote(cfg.key)}
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {hasChanges && (
            <div className='flex justify-end mt-4'>
              <button
                type='button'
                onClick={handleSave}
                disabled={isSaving}
                className='inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
              >
                {isSaving ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Save className='w-4 h-4' />
                )}
                Enregistrer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
