'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, ChevronDown, Check, MessageSquare } from 'lucide-react';
import type { AnamneseFieldConfig } from './anamnese-fields-config';

interface TypedAnamneseFieldProps {
  config: AnamneseFieldConfig;
  value: string;
  onChange: (value: string) => void;
  noteValue?: string;
  onNoteChange?: (value: string) => void;
  isNoteExpanded?: boolean;
  onToggleNote?: () => void;
}

const inputBase =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]';

const toggleBtn = (active: boolean) =>
  `px-4 py-2 text-sm rounded-lg border transition-colors ${
    active
      ? 'bg-[#1B998B]/10 border-[#1B998B] text-[#1B998B] font-medium'
      : 'border-gray-200 text-gray-500 hover:border-gray-300'
  }`;

// ========== MULTISELECT DROPDOWN ==========

function MultiSelectDropdown({
  options,
  value,
  onChange,
  allowOther,
  noToggle,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  allowOther?: boolean;
  noToggle?: boolean;
}) {
  const allSelected = value ? value.split(', ').filter(Boolean) : [];
  // Filter out legacy "Aucun"/"Aucune" values
  const selected = allSelected.filter(s => s !== 'Aucun' && s !== 'Aucune');
  const regularSelected = selected.filter(s => !s.startsWith('Autre:'));
  const otherEntries = selected.filter(s => s.startsWith('Autre:'));
  const hasOther = allowOther && otherEntries.length > 0;

  // Display chips: regular items (without "Autre" keyword itself) + completed "Autre" entries
  const chipItems = regularSelected.filter(s => s !== 'Autre');
  const completedOtherEntries = otherEntries.filter(e => e.slice(7).trim());
  const totalDisplayCount = chipItems.length + otherEntries.length;

  // Tri-state: null = not answered, true = Oui, false = Non
  const hasLegacyNone = allSelected.length > 0 && selected.length === 0;
  const [answered, setAnswered] = useState<boolean | null>(
    selected.length > 0 ? true : hasLegacyNone ? false : null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show dropdown if value has items, regardless of local state
  const effectiveAnswered = noToggle ? true : selected.length > 0 ? true : answered;

  // Filter "Aucun"/"Aucune" from dropdown options
  const dropdownOptions = options.filter(
    opt => opt !== 'Aucun' && opt !== 'Aucune'
  );

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  function handleNo() {
    onChange('');
    setAnswered(false);
    setDropdownOpen(false);
  }

  function handleYes() {
    setAnswered(true);
  }

  function toggleOption(opt: string) {
    if (opt === 'Autre' && allowOther) {
      if (hasOther) {
        const next = selected.filter(s => !s.startsWith('Autre'));
        onChange(next.join(', '));
      } else {
        onChange([...selected, 'Autre: '].join(', '));
      }
      return;
    }
    const next = selected.includes(opt)
      ? selected.filter(s => s !== opt)
      : [...selected, opt];
    onChange(next.join(', '));
  }

  function removeChip(item: string) {
    const next = selected.filter(s => s !== item);
    onChange(next.join(', '));
  }

  function updateOtherEntry(index: number, text: string) {
    let otherIdx = 0;
    const next = selected.map(s => {
      if (s.startsWith('Autre:')) {
        if (otherIdx === index) {
          otherIdx++;
          return `Autre: ${text}`;
        }
        otherIdx++;
      }
      return s;
    });
    onChange(next.join(', '));
  }

  function removeOtherEntry(index: number) {
    let otherIdx = 0;
    const next = selected.filter(s => {
      if (s.startsWith('Autre:')) {
        if (otherIdx === index) {
          otherIdx++;
          return false;
        }
        otherIdx++;
      }
      return true;
    });
    onChange(next.join(', '));
  }

  function addOtherEntry() {
    onChange([...selected, 'Autre: '].join(', '));
  }

  return (
    <div>
      {/* Oui / Non toggle */}
      {!noToggle && (
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={handleYes}
            className={toggleBtn(effectiveAnswered === true)}
          >
            Oui
          </button>
          <button
            type='button'
            onClick={handleNo}
            className={toggleBtn(effectiveAnswered === false)}
          >
            Non
          </button>
        </div>
      )}

      {/* Dropdown + chips (only when Oui or noToggle) */}
      {effectiveAnswered === true && (
        <div ref={containerRef} className={`relative ${noToggle ? '' : 'mt-3'}`}>
          {/* Dropdown trigger */}
          <button
            type='button'
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg transition-colors ${
              dropdownOpen
                ? 'border-[#1B998B] ring-2 ring-[#1B998B]/30'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span
              className={
                totalDisplayCount === 0 ? 'text-gray-400' : 'text-gray-700'
              }
            >
              {totalDisplayCount === 0
                ? 'Sélectionner...'
                : `${totalDisplayCount} sélectionné${totalDisplayCount > 1 ? 's' : ''}`}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className='absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
              {dropdownOptions.map(opt => {
                const isOtherOpt = opt === 'Autre';
                const isChecked = isOtherOpt
                  ? hasOther
                  : selected.includes(opt);
                return (
                  <button
                    key={opt}
                    type='button'
                    onClick={() => toggleOption(opt)}
                    className='w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left'
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-[#1B998B] border-[#1B998B]'
                          : 'border-gray-300'
                      }`}
                    >
                      {isChecked && <Check className='w-3 h-3 text-white' />}
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
          {totalDisplayCount > 0 && (
            <div className='flex flex-wrap gap-1.5 mt-2'>
              {chipItems.map(item => (
                <span
                  key={item}
                  className='inline-flex items-center gap-1 px-2.5 py-1 bg-[#1B998B]/10 text-[#1B998B] text-xs font-medium rounded-full'
                >
                  {item}
                  <button
                    type='button'
                    onClick={() => removeChip(item)}
                    className='hover:text-[#147569] transition-colors'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </span>
              ))}
              {completedOtherEntries.map((entry, i) => (
                <span
                  key={`autre-${i}`}
                  className='inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full'
                >
                  {entry.slice(7).trim()}
                  <button
                    type='button'
                    onClick={() =>
                      removeOtherEntry(otherEntries.indexOf(entry))
                    }
                    className='hover:text-amber-900 transition-colors'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Autre entries */}
          {hasOther && (
            <div className='space-y-2 mt-2'>
              {otherEntries.map((entry, i) => (
                <div key={i} className='flex items-center gap-2'>
                  <input
                    type='text'
                    value={entry.slice(7)}
                    onChange={e => updateOtherEntry(i, e.target.value)}
                    placeholder='Précisez...'
                    className={inputBase}
                    autoFocus={i === otherEntries.length - 1}
                  />
                  <button
                    type='button'
                    onClick={() => removeOtherEntry(i)}
                    className='shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ))}
              <button
                type='button'
                onClick={addOtherEntry}
                disabled={otherEntries.some(e => !e.slice(7).trim())}
                className='inline-flex items-center gap-1 text-sm text-[#1B998B] hover:text-[#147569] font-medium disabled:text-gray-300 disabled:cursor-not-allowed'
              >
                <Plus className='w-3.5 h-3.5' />
                Ajouter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========== SINGLE SELECT DROPDOWN ==========

function SingleSelectDropdown({
  options,
  value,
  onChange,
  allowOther,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  allowOther?: boolean;
}) {
  const isOtherSelected = allowOther && value.startsWith('Autre:');
  const displayValue = isOtherSelected ? 'Autre' : value;
  const otherText = isOtherSelected ? value.slice(7) : '';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  function selectOption(opt: string) {
    if (allowOther && opt === 'Autre') {
      onChange('Autre: ');
    } else {
      onChange(opt);
    }
  }

  return (
    <div ref={containerRef} className='relative'>
      {/* Dropdown trigger */}
      <button
        type='button'
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg transition-colors ${
          dropdownOpen
            ? 'border-[#1B998B] ring-2 ring-[#1B998B]/30'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={!displayValue ? 'text-gray-400' : 'text-gray-700'}>
          {displayValue || 'Sélectionner...'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {dropdownOpen && (
        <div className='absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
          {options.map(opt => {
            const isSelected =
              opt === 'Autre' ? isOtherSelected : opt === value;
            return (
              <button
                key={opt}
                type='button'
                onClick={() => selectOption(opt)}
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

      {/* Autre text input */}
      {isOtherSelected && (
        <input
          type='text'
          value={otherText}
          onChange={e => onChange(`Autre: ${e.target.value}`)}
          placeholder='Précisez...'
          className={`${inputBase} mt-2`}
          autoFocus
        />
      )}
    </div>
  );
}

// ========== MEDICATIONS REPEATER ==========

interface Medication {
  nom: string;
  dosage: string;
  frequence: string;
}

function parseMedications(value: string): Medication[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Legacy textarea value — try to convert
    if (value.trim()) return [{ nom: value.trim(), dosage: '', frequence: '' }];
  }
  return [];
}

const REPEATER_CONFIG = {
  medications: {
    buttonLabel: 'Ajouter un médicament',
    labels: { nom: 'Nom', dosage: 'Dosage', frequence: 'Fréquence' },
    placeholders: { nom: 'ex: Metformine', dosage: 'ex: 500 mg', frequence: 'ex: 2x/jour' },
  },
  supplements: {
    buttonLabel: 'Ajouter un complément',
    labels: { nom: 'Nom', dosage: 'Dosage', frequence: 'Fréquence' },
    placeholders: { nom: 'ex: Vitamine D', dosage: 'ex: 1000 UI', frequence: 'ex: 1x/jour' },
  },
  drinks_alcohol: {
    buttonLabel: 'Ajouter un alcool',
    labels: { nom: 'Alcool', dosage: 'Volume', frequence: 'Fréquence' },
    placeholders: { nom: 'ex: Vin rouge', dosage: 'ex: 1 verre', frequence: 'ex: 2x/semaine' },
  },
  drinks_sugary: {
    buttonLabel: 'Ajouter une boisson',
    labels: { nom: 'Boisson', dosage: 'Volume', frequence: 'Fréquence' },
    placeholders: { nom: 'ex: Coca-Cola', dosage: 'ex: 33 cl', frequence: 'ex: 1x/jour' },
  },
  drinks_hot: {
    buttonLabel: 'Ajouter une boisson',
    labels: { nom: 'Boisson', dosage: 'Volume', frequence: 'Fréquence' },
    placeholders: { nom: 'ex: Café', dosage: 'ex: 1 tasse', frequence: 'ex: 3x/jour' },
  },
  sports: {
    buttonLabel: 'Ajouter un sport',
    labels: { nom: 'Sport', dosage: 'Durée', frequence: 'Fréquence' },
    placeholders: { nom: 'ex: Course à pied', dosage: 'ex: 1h', frequence: 'ex: 3x/semaine' },
  },
};

function ThreeFieldRepeater({
  value,
  onChange,
  kind,
}: {
  value: string;
  onChange: (v: string) => void;
  kind: 'medications' | 'supplements' | 'drinks_alcohol' | 'drinks_sugary' | 'drinks_hot' | 'sports';
}) {
  const meds = parseMedications(value);
  const cfg = REPEATER_CONFIG[kind];

  function emit(updated: Medication[]) {
    onChange(updated.length > 0 ? JSON.stringify(updated) : '');
  }

  function addMed() {
    emit([...meds, { nom: '', dosage: '', frequence: '' }]);
  }

  function updateMed(index: number, field: keyof Medication, val: string) {
    const updated = meds.map((m, i) =>
      i === index ? { ...m, [field]: val } : m
    );
    emit(updated);
  }

  function removeMed(index: number) {
    emit(meds.filter((_, i) => i !== index));
  }

  return (
    <div className='space-y-3'>
      {meds.map((med, i) => (
        <div
          key={i}
          className='relative border border-gray-200 rounded-lg p-3 bg-white'
        >
          <button
            type='button'
            onClick={() => removeMed(i)}
            className='absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6'>
            <div>
              <label className='block text-xs text-gray-500 mb-1'>{cfg.labels.nom}</label>
              <input
                type='text'
                value={med.nom}
                onChange={e => updateMed(i, 'nom', e.target.value)}
                placeholder={cfg.placeholders.nom}
                className={inputBase}
                autoFocus={i === meds.length - 1 && !med.nom}
              />
            </div>
            <div>
              <label className='block text-xs text-gray-500 mb-1'>
                {cfg.labels.dosage}
              </label>
              <input
                type='text'
                value={med.dosage}
                onChange={e => updateMed(i, 'dosage', e.target.value)}
                placeholder={cfg.placeholders.dosage}
                className={inputBase}
              />
            </div>
            <div>
              <label className='block text-xs text-gray-500 mb-1'>
                {cfg.labels.frequence}
              </label>
              <input
                type='text'
                value={med.frequence}
                onChange={e => updateMed(i, 'frequence', e.target.value)}
                placeholder={cfg.placeholders.frequence}
                className={inputBase}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type='button'
        onClick={addMed}
        className='inline-flex items-center gap-1.5 text-sm text-[#1B998B] hover:text-[#147569] font-medium transition-colors'
      >
        <Plus className='w-4 h-4' />
        {cfg.buttonLabel}
      </button>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

export function TypedAnamneseField({
  config,
  value,
  onChange,
  noteValue,
  onNoteChange,
  isNoteExpanded,
  onToggleNote,
}: TypedAnamneseFieldProps) {
  const {
    type,
    label,
    placeholder,
    options,
    unit,
    min,
    max,
    scaleMax,
    scaleLabels,
    required,
    allowOther,
    noToggle,
    hasNotes,
  } = config;

  return (
    <div className='space-y-1'>
      <div className='flex items-center gap-1.5'>
        <label className='block text-sm font-medium text-gray-700'>
          {label}
          {required && <span className='text-red-400 ml-0.5'>*</span>}
          {unit && (
            <span className='text-xs text-gray-400 font-normal ml-1'>
              ({unit})
            </span>
          )}
        </label>
        {hasNotes && onToggleNote && (
          <button
            type='button'
            onClick={onToggleNote}
            title='Ajouter une note'
            className={`p-0.5 rounded transition-colors ${
              noteValue
                ? 'text-[#1B998B] hover:text-[#147569]'
                : 'text-gray-300 hover:text-gray-500'
            }`}
          >
            <MessageSquare className='w-3.5 h-3.5' />
          </button>
        )}
      </div>

      {type === 'text' && (
        <input
          type='text'
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputBase}
        />
      )}

      {type === 'number' && (
        <input
          type='number'
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step='any'
          className={inputBase}
        />
      )}

      {type === 'date' && (
        <input
          type='date'
          value={value}
          onChange={e => onChange(e.target.value)}
          className={inputBase}
        />
      )}

      {type === 'select' && options && (
        <SingleSelectDropdown
          options={options}
          value={value}
          onChange={onChange}
          allowOther={allowOther}
        />
      )}

      {type === 'multiselect' && options && (
        <MultiSelectDropdown
          options={options}
          value={value}
          onChange={onChange}
          allowOther={allowOther}
          noToggle={noToggle}
        />
      )}

      {type === 'medications' && (
        <ThreeFieldRepeater value={value} onChange={onChange} kind='medications' />
      )}

      {type === 'supplements' && (
        <ThreeFieldRepeater value={value} onChange={onChange} kind='supplements' />
      )}

      {type === 'drinks_alcohol' && (
        <ThreeFieldRepeater value={value} onChange={onChange} kind='drinks_alcohol' />
      )}

      {type === 'drinks_sugary' && (
        <ThreeFieldRepeater value={value} onChange={onChange} kind='drinks_sugary' />
      )}

      {type === 'drinks_hot' && (
        <ThreeFieldRepeater value={value} onChange={onChange} kind='drinks_hot' />
      )}

      {type === 'sports' && (
        <ThreeFieldRepeater value={value} onChange={onChange} kind='sports' />
      )}

      {type === 'phone' && <PhoneInput value={value} onChange={onChange} />}

      {type === 'textarea' && (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${inputBase} resize-none`}
        />
      )}

      {type === 'scale' && (
        <ScaleInput
          value={value}
          onChange={onChange}
          max={scaleMax || 5}
          labels={scaleLabels}
        />
      )}

      {type === 'boolean' && (
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={() => onChange('Oui')}
            className={toggleBtn(value === 'Oui')}
          >
            Oui
          </button>
          <button
            type='button'
            onClick={() => onChange('Non')}
            className={toggleBtn(value === 'Non')}
          >
            Non
          </button>
        </div>
      )}

      {hasNotes && isNoteExpanded && onNoteChange && (
        <textarea
          value={noteValue || ''}
          onChange={e => onNoteChange(e.target.value)}
          placeholder='Ajouter une note...'
          rows={2}
          className='w-full px-3 py-2 text-sm border border-dashed border-gray-300 rounded-lg bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B] resize-y'
        />
      )}
    </div>
  );
}

// ========== HELPER COMPONENTS ==========

function ScaleInput({
  value,
  onChange,
  max,
  labels,
}: {
  value: string;
  onChange: (v: string) => void;
  max: number;
  labels?: { min: string; max: string };
}) {
  const numValue = parseInt(value) || 0;
  const points = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div>
      <div className='flex gap-1.5'>
        {points.map(n => (
          <button
            key={n}
            type='button'
            onClick={() => onChange(String(n))}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              numValue === n
                ? 'bg-[#1B998B] text-white'
                : numValue > 0 && n <= numValue
                  ? 'bg-[#1B998B]/20 text-[#1B998B]'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {labels && (
        <div className='flex justify-between mt-1'>
          <span className='text-xs text-gray-400'>{labels.min}</span>
          <span className='text-xs text-gray-400'>{labels.max}</span>
        </div>
      )}
    </div>
  );
}

const PHONE_PREFIXES = [
  { code: '+41', flag: '🇨🇭', label: 'Suisse' },
  { code: '+33', flag: '🇫🇷', label: 'France' },
  { code: '+32', flag: '🇧🇪', label: 'Belgique' },
  { code: '+352', flag: '🇱🇺', label: 'Luxembourg' },
  { code: '+49', flag: '🇩🇪', label: 'Allemagne' },
  { code: '+39', flag: '🇮🇹', label: 'Italie' },
  { code: '+34', flag: '🇪🇸', label: 'Espagne' },
  { code: '+44', flag: '🇬🇧', label: 'Royaume-Uni' },
  { code: '+351', flag: '🇵🇹', label: 'Portugal' },
  { code: '+1', flag: '🇺🇸', label: 'États-Unis / Canada' },
];

function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const match = value.match(/^(\+\d{1,3})\s?(.*)/);
  const prefix = match ? match[1] : '+41';
  const number = match ? match[2] : value;

  const selectedPrefix = PHONE_PREFIXES.find(p => p.code === prefix);

  return (
    <div className='flex items-center gap-2'>
      <select
        value={prefix}
        onChange={e => onChange(`${e.target.value} ${number}`)}
        className='w-[140px] shrink-0 px-2 py-2 text-sm leading-normal border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B] [&>option]:leading-normal'
      >
        {PHONE_PREFIXES.map(p => (
          <option key={p.code} value={p.code}>
            {p.flag} {p.code}
          </option>
        ))}
      </select>
      <input
        type='tel'
        value={number}
        onChange={e => onChange(`${prefix} ${e.target.value}`)}
        placeholder={
          selectedPrefix?.code === '+41' ? '079 123 45 67' : '6 12 34 56 78'
        }
        className={inputBase}
      />
    </div>
  );
}
