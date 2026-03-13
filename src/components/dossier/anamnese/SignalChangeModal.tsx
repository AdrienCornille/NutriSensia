'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useCreateChangeReport } from '@/hooks/usePatientDossier';
import type { AnamneseSection, AnamneseField, AnamneseSectionId } from '@/types/dossier';
import {
  ANAMNESE_SECTION_FIELDS,
  type AnamneseFieldConfig,
} from '@/components/nutritionist/dossier/anamnese/anamnese-fields-config';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SECTION_CHANGE_TYPE: Record<string, string> = {
  sante: 'health',
  sante_bilan: 'health',
  lifestyle: 'lifestyle',
  habitudes: 'lifestyle',
  consommation: 'lifestyle',
};

const CHANGE_TYPES = [
  { value: 'health', label: 'Santé', icon: '🏥' },
  { value: 'medication', label: 'Médicament', icon: '💊' },
  { value: 'allergy', label: 'Allergie', icon: '⚠️' },
  { value: 'lifestyle', label: 'Mode de vie', icon: '🏃' },
  { value: 'other', label: 'Autre', icon: '📝' },
] as const;

type ChangeType = (typeof CHANGE_TYPES)[number]['value'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncate(value: string, max = 40): string {
  if (value.startsWith('[')) return '(liste)';
  return value.length > max ? value.slice(0, max) + '…' : value;
}

function deriveChangeType(sectionId: string): ChangeType {
  return (SECTION_CHANGE_TYPE[sectionId] as ChangeType) || 'other';
}

function findFieldConfig(
  sectionId: string,
  fieldLabel: string
): AnamneseFieldConfig | null {
  const sectionFields = ANAMNESE_SECTION_FIELDS[sectionId as AnamneseSectionId];
  if (!sectionFields) return null;
  return sectionFields.find(f => f.label === fieldLabel) ?? null;
}

// ---------------------------------------------------------------------------
// Single Select Dropdown (matches nutritionist dashboard style)
// ---------------------------------------------------------------------------

function SelectDropdown({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg transition-colors ${
          open
            ? 'border-[#1B998B] ring-2 ring-[#1B998B]/30'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={!value ? 'text-gray-400' : 'text-gray-700'}>
          {value || 'Sélectionner...'}
        </span>
        <span
          className={`text-gray-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className='absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
          {options.map(opt => {
            const isSelected = opt === value;
            return (
              <button
                key={opt}
                type='button'
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className='w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left'
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#1B998B] border-[#1B998B]'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className='w-1.5 h-1.5 rounded-full bg-white' />
                  )}
                </div>
                <span
                  className={
                    isSelected
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600'
                  }
                >
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multi Select Dropdown (matches nutritionist dashboard style)
// ---------------------------------------------------------------------------

function MultiSelectDropdown({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (option: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const count = values.length;

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg transition-colors ${
          open
            ? 'border-[#1B998B] ring-2 ring-[#1B998B]/30'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={count === 0 ? 'text-gray-400' : 'text-gray-700'}>
          {count === 0
            ? 'Sélectionner...'
            : `${count} sélectionné${count > 1 ? 's' : ''}`}
        </span>
        <span
          className={`text-gray-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className='absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
          {options.map(opt => {
            const isChecked = values.includes(opt);
            return (
              <button
                key={opt}
                type='button'
                onClick={() => onToggle(opt)}
                className='w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left'
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-[#1B998B] border-[#1B998B]'
                      : 'border-gray-300'
                  }`}
                >
                  {isChecked && (
                    <span className='text-white text-[10px] leading-none'>
                      ✓
                    </span>
                  )}
                </div>
                <span
                  className={
                    isChecked
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600'
                  }
                >
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected chips */}
      {count > 0 && (
        <div className='flex flex-wrap gap-1.5 mt-2'>
          {values.map(item => (
            <span
              key={item}
              className='inline-flex items-center gap-1 px-2.5 py-1 bg-[#1B998B]/10 text-[#1B998B] text-xs font-medium rounded-full'
            >
              {item}
              <button
                type='button'
                onClick={() => onToggle(item)}
                className='hover:text-[#147569] transition-colors'
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface SignalChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: AnamneseSection[];
}

export function SignalChangeModal({
  isOpen,
  onClose,
  sections,
}: SignalChangeModalProps) {
  const [step, setStep] = useState<'section' | 'form'>('section');
  const [selectedSection, setSelectedSection] =
    useState<AnamneseSection | null>(null);
  const [selectedField, setSelectedField] = useState<AnamneseField | null>(
    null
  );
  const [isOtherMode, setIsOtherMode] = useState(false);

  // Form state
  const [newValue, setNewValue] = useState('');
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  // "Other" mode
  const [otherChangeType, setOtherChangeType] = useState<ChangeType>('health');
  const [otherTitle, setOtherTitle] = useState('');
  const [otherOldValue, setOtherOldValue] = useState('');
  const [otherNewValue, setOtherNewValue] = useState('');

  const { mutate: createReport, isPending } = useCreateChangeReport();

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (type: ToastType, title: string, message?: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastMessage(message || '');
    setToastVisible(true);
  };

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const resetAll = () => {
    setStep('section');
    setSelectedSection(null);
    setSelectedField(null);
    setIsOtherMode(false);
    setNewValue('');
    setMultiSelectValues([]);
    setDescription('');
    setOtherChangeType('health');
    setOtherTitle('');
    setOtherOldValue('');
    setOtherNewValue('');
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleSelectSection = (section: AnamneseSection) => {
    setSelectedSection(section);
    setIsOtherMode(false);
    setStep('form');
  };

  const handleSelectOther = () => {
    setSelectedSection(null);
    setIsOtherMode(true);
    setStep('form');
  };

  const handleBack = () => {
    setStep('section');
    setSelectedSection(null);
    setSelectedField(null);
    setIsOtherMode(false);
    setNewValue('');
    setMultiSelectValues([]);
    setDescription('');
  };

  // Resolve field config for the selected field
  const fieldConfig = useMemo<AnamneseFieldConfig | null>(() => {
    if (!selectedSection || !selectedField) return null;
    return findFieldConfig(selectedSection.id, selectedField.label);
  }, [selectedSection, selectedField]);

  const handleSelectField = (field: AnamneseField) => {
    setSelectedField(field);
    setNewValue('');
    setMultiSelectValues([]);
    setDescription('');
  };

  const toggleMultiSelectValue = (option: string) => {
    setMultiSelectValues(prev =>
      prev.includes(option)
        ? prev.filter(v => v !== option)
        : [...prev, option]
    );
  };

  const handleSubmitSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection || !selectedField) return;

    const isMulti = fieldConfig?.type === 'multiselect';
    const resolvedNewValue = isMulti
      ? multiSelectValues.join(', ')
      : newValue.trim();

    createReport(
      {
        change_type: deriveChangeType(selectedSection.id),
        title: selectedField.label,
        description:
          description.trim() || `Changement de "${selectedField.label}"`,
        anamnesis_section_id: selectedSection.id,
        old_value: selectedField.value,
        new_value: resolvedNewValue,
      },
      {
        onSuccess: () => {
          resetAll();
          onClose();
          showToast(
            'success',
            'Signalement envoyé',
            'Votre demande de changement est en cours de traitement par votre nutritionniste.'
          );
        },
        onError: () => {
          showToast('error', 'Erreur lors de l\'envoi du signalement');
        },
      }
    );
  };

  const handleSubmitOther = (e: React.FormEvent) => {
    e.preventDefault();

    createReport(
      {
        change_type: otherChangeType,
        title: otherTitle.trim(),
        description: description.trim(),
        ...(otherOldValue.trim() && { old_value: otherOldValue.trim() }),
        ...(otherNewValue.trim() && { new_value: otherNewValue.trim() }),
      },
      {
        onSuccess: () => {
          resetAll();
          onClose();
          showToast(
            'success',
            'Signalement envoyé',
            'Votre demande de changement est en cours de traitement par votre nutritionniste.'
          );
        },
        onError: () => {
          showToast('error', 'Erreur lors de l\'envoi du signalement');
        },
      }
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Toast must render even when modal is closed (it shows after close)
  const toastElement = (
    <Toast
      isVisible={toastVisible}
      type={toastType}
      title={toastTitle}
      message={toastMessage}
      onClose={() => setToastVisible(false)}
    />
  );

  if (!isOpen) return toastElement;

  // Step 1: Section picker
  const renderSectionPicker = () => (
    <>
      <p className='text-sm text-gray-500 mb-4'>
        Quelle catégorie d&apos;information a changé ?
      </p>

      <div className='grid grid-cols-2 gap-3'>
        {sections.map(section => (
          <button
            key={section.id}
            type='button'
            onClick={() => handleSelectSection(section)}
            className='flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#1B998B] hover:bg-[#1B998B]/5 transition-colors text-left'
          >
            <span className='text-2xl shrink-0'>{section.icon}</span>
            <span className='text-sm font-medium text-gray-700 leading-tight'>
              {section.label}
            </span>
          </button>
        ))}

        <button
          type='button'
          onClick={handleSelectOther}
          className='flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 hover:border-[#1B998B] hover:bg-[#1B998B]/5 transition-colors text-left'
        >
          <span className='text-2xl shrink-0'>📝</span>
          <span className='text-sm font-medium text-gray-500 leading-tight'>
            Autre changement
          </span>
        </button>
      </div>
    </>
  );

  // Step 2a: Section form
  const isSectionFormValid = (() => {
    if (!selectedField) return false;
    if (fieldConfig?.type === 'multiselect') return multiSelectValues.length >= 1;
    return newValue.trim().length >= 1;
  })();

  const renderSectionForm = () => {
    if (!selectedSection) return null;

    const fields = selectedSection.fields.filter(
      f => !f.label.endsWith('(note)')
    );

    return (
      <form onSubmit={handleSubmitSection} className='space-y-4'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleBack}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            ←
          </button>
          <span className='text-lg'>{selectedSection.icon}</span>
          <span className='font-medium text-gray-800'>
            {selectedSection.label}
          </span>
        </div>

        {/* Field selector */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Quel champ a changé ?
          </label>
          <div className='flex flex-wrap gap-2'>
            {fields.map((field, i) => {
              const isSelected =
                selectedField?.label === field.label &&
                selectedField?.value === field.value;
              return (
                <button
                  key={i}
                  type='button'
                  onClick={() => handleSelectField(field)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors text-left ${
                    isSelected
                      ? 'bg-[#1B998B]/10 border-[#1B998B] border text-[#1B998B] font-medium'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className='font-medium'>{field.label}</span>
                  <span className='text-gray-400 ml-1'>
                    {truncate(field.value)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedField && (
          <>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Valeur actuelle
              </label>
              <div className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600'>
                {selectedField.value}
              </div>
            </div>

            {/* New value — adapts to field type */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Nouvelle valeur
              </label>

              {fieldConfig?.type === 'select' && fieldConfig.options ? (
                <SelectDropdown
                  options={fieldConfig.options}
                  value={newValue}
                  onChange={setNewValue}
                />
              ) : fieldConfig?.type === 'multiselect' && fieldConfig.options ? (
                <MultiSelectDropdown
                  options={fieldConfig.options}
                  values={multiSelectValues}
                  onToggle={toggleMultiSelectValue}
                />
              ) : fieldConfig?.type === 'boolean' ? (
                <div className='flex gap-3'>
                  {['Oui', 'Non'].map(option => (
                    <button
                      key={option}
                      type='button'
                      onClick={() => setNewValue(option)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        newValue === option
                          ? 'bg-[#1B998B]/10 border-[#1B998B] text-[#1B998B] font-medium'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  id='signal-new-value'
                  type='text'
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder='Indiquez la nouvelle valeur...'
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
                  maxLength={500}
                  autoFocus
                />
              )}
            </div>

            <div>
              <label
                htmlFor='signal-desc'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Précision{' '}
                <span className='text-gray-400 font-normal'>(optionnel)</span>
              </label>
              <textarea
                id='signal-desc'
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Contexte supplémentaire...'
                rows={2}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B] resize-none'
                maxLength={2000}
              />
            </div>
          </>
        )}

        <div className='flex justify-end gap-3 pt-1'>
          <button
            type='button'
            onClick={handleClose}
            className='px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors'
          >
            Annuler
          </button>
          <button
            type='submit'
            disabled={!isSectionFormValid || isPending}
            className='px-5 py-2 bg-[#1B998B] text-white text-sm font-medium rounded-lg hover:bg-[#178578] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isPending ? 'Envoi...' : 'Envoyer le signalement'}
          </button>
        </div>
      </form>
    );
  };

  // Step 2b: "Other" free-form
  const isOtherFormValid =
    otherTitle.trim().length >= 3 && description.trim().length >= 5;

  const renderOtherForm = () => (
    <form onSubmit={handleSubmitOther} className='space-y-4'>
      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={handleBack}
          className='text-gray-400 hover:text-gray-600 transition-colors'
        >
          ←
        </button>
        <span className='text-lg'>📝</span>
        <span className='font-medium text-gray-800'>Autre changement</span>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Type de changement
        </label>
        <div className='flex flex-wrap gap-2'>
          {CHANGE_TYPES.map(type => (
            <button
              key={type.value}
              type='button'
              onClick={() => setOtherChangeType(type.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                otherChangeType === type.value
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor='other-title'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Titre
        </label>
        <input
          id='other-title'
          type='text'
          value={otherTitle}
          onChange={e => setOtherTitle(e.target.value)}
          placeholder='Ex: Nouveau traitement prescrit'
          className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
          maxLength={200}
        />
      </div>

      <div>
        <label
          htmlFor='other-desc'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Description
        </label>
        <textarea
          id='other-desc'
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder='Décrivez le changement en détail...'
          rows={3}
          className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B] resize-none'
          maxLength={2000}
        />
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label
            htmlFor='other-old'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Avant{' '}
            <span className='text-gray-400 font-normal'>(optionnel)</span>
          </label>
          <input
            id='other-old'
            type='text'
            value={otherOldValue}
            onChange={e => setOtherOldValue(e.target.value)}
            placeholder='Ancienne valeur'
            className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
            maxLength={500}
          />
        </div>
        <div>
          <label
            htmlFor='other-new'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Après{' '}
            <span className='text-gray-400 font-normal'>(optionnel)</span>
          </label>
          <input
            id='other-new'
            type='text'
            value={otherNewValue}
            onChange={e => setOtherNewValue(e.target.value)}
            placeholder='Nouvelle valeur'
            className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
            maxLength={500}
          />
        </div>
      </div>

      <div className='flex justify-end gap-3 pt-1'>
        <button
          type='button'
          onClick={handleClose}
          className='px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors'
        >
          Annuler
        </button>
        <button
          type='submit'
          disabled={!isOtherFormValid || isPending}
          className='px-5 py-2 bg-[#1B998B] text-white text-sm font-medium rounded-lg hover:bg-[#178578] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isPending ? 'Envoi...' : 'Envoyer le signalement'}
        </button>
      </div>
    </form>
  );

  return (
    <>
      <div className='fixed inset-0 z-50 flex items-center justify-center'>
        <div className='absolute inset-0 bg-black/40' onClick={handleClose} />

        <div className='relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-5'>
              <h2 className='text-lg font-semibold text-gray-800'>
                Signaler un changement
              </h2>
              <button
                onClick={handleClose}
                className='text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none'
              >
                ✕
              </button>
            </div>

            {step === 'section' && renderSectionPicker()}
            {step === 'form' && !isOtherMode && renderSectionForm()}
            {step === 'form' && isOtherMode && renderOtherForm()}
          </div>
        </div>
      </div>
      {toastElement}
    </>
  );
}

export default SignalChangeModal;
