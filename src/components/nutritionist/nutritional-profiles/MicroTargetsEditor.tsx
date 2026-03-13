'use client';

import React, { useState, useCallback } from 'react';
import { Pill, RotateCcw, AlertCircle } from 'lucide-react';
import type { MicroTargets } from '@/types/nutritional-profile';

// ============================================================================
// Constants — Micronutrient categories (aligned with CIQUAL database)
// ============================================================================

interface MicroField {
  key: keyof MicroTargets;
  label: string;
  unit: string;
  placeholder: string;
  min: number;
  max: number;
}

interface MicroCategory {
  label: string;
  fields: MicroField[];
}

const MICRO_CATEGORIES: MicroCategory[] = [
  {
    label: 'Fibres',
    fields: [
      { key: 'fiber_g', label: 'Fibres', unit: 'g', placeholder: '30', min: 0, max: 100 },
    ],
  },
  {
    label: 'Minéraux',
    fields: [
      { key: 'sodium_mg', label: 'Sodium', unit: 'mg', placeholder: '2000', min: 0, max: 10000 },
      { key: 'calcium_mg', label: 'Calcium', unit: 'mg', placeholder: '1000', min: 0, max: 5000 },
      { key: 'iron_mg', label: 'Fer', unit: 'mg', placeholder: '14', min: 0, max: 100 },
      { key: 'magnesium_mg', label: 'Magnésium', unit: 'mg', placeholder: '400', min: 0, max: 2000 },
      { key: 'phosphorus_mg', label: 'Phosphore', unit: 'mg', placeholder: '700', min: 0, max: 5000 },
      { key: 'potassium_mg', label: 'Potassium', unit: 'mg', placeholder: '3500', min: 0, max: 10000 },
      { key: 'zinc_mg', label: 'Zinc', unit: 'mg', placeholder: '10', min: 0, max: 100 },
    ],
  },
  {
    label: 'Vitamines',
    fields: [
      { key: 'vitamin_a_ug', label: 'Vitamine A', unit: 'µg', placeholder: '800', min: 0, max: 10000 },
      { key: 'vitamin_b1_mg', label: 'Vitamine B1 (Thiamine)', unit: 'mg', placeholder: '1.2', min: 0, max: 100 },
      { key: 'vitamin_b2_mg', label: 'Vitamine B2 (Riboflavine)', unit: 'mg', placeholder: '1.3', min: 0, max: 100 },
      { key: 'vitamin_b3_mg', label: 'Vitamine B3 (Niacine)', unit: 'mg', placeholder: '16', min: 0, max: 500 },
      { key: 'vitamin_b6_mg', label: 'Vitamine B6', unit: 'mg', placeholder: '1.5', min: 0, max: 100 },
      { key: 'vitamin_b9_ug', label: 'Vitamine B9 (Folate)', unit: 'µg', placeholder: '400', min: 0, max: 2000 },
      { key: 'vitamin_b12_ug', label: 'Vitamine B12', unit: 'µg', placeholder: '2.4', min: 0, max: 100 },
      { key: 'vitamin_c_mg', label: 'Vitamine C', unit: 'mg', placeholder: '90', min: 0, max: 5000 },
      { key: 'vitamin_d_ug', label: 'Vitamine D', unit: 'µg', placeholder: '15', min: 0, max: 200 },
      { key: 'vitamin_e_mg', label: 'Vitamine E', unit: 'mg', placeholder: '12', min: 0, max: 1000 },
      { key: 'vitamin_k_ug', label: 'Vitamine K', unit: 'µg', placeholder: '90', min: 0, max: 500 },
    ],
  },
  {
    label: 'Autres',
    fields: [
      { key: 'cholesterol_mg', label: 'Cholestérol', unit: 'mg', placeholder: '300', min: 0, max: 1000 },
    ],
  },
];

// ============================================================================
// Types
// ============================================================================

interface MicroTargetsEditorProps {
  value: MicroTargets | null;
  onChange: (targets: MicroTargets | null) => void;
  /** Per-field errors keyed as `micro_{field.key}` */
  fieldErrors?: Record<string, string>;
}

// ============================================================================
// Main Component
// ============================================================================

export function MicroTargetsEditor({ value, onChange, fieldErrors = {} }: MicroTargetsEditorProps) {
  const [enabled, setEnabled] = useState(value !== null);

  const handleToggle = useCallback(() => {
    if (enabled) {
      onChange(null);
      setEnabled(false);
    } else {
      onChange({});
      setEnabled(true);
    }
  }, [enabled, onChange]);

  const handleFieldChange = useCallback(
    (key: keyof MicroTargets, rawValue: string) => {
      const num = rawValue === '' ? undefined : parseFloat(rawValue);
      const current = value || {};
      const updated = { ...current };
      if (num === undefined || isNaN(num)) {
        delete updated[key];
      } else {
        updated[key] = num;
      }
      onChange(updated);
    },
    [value, onChange]
  );

  const handleReset = useCallback(() => {
    onChange({});
  }, [onChange]);

  return (
    <div className='space-y-5'>
      {/* Header with toggle */}
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
          <Pill className='w-4 h-4 text-[#1B998B]' />
          Micronutriments
          <span className='text-xs font-normal text-gray-400'>(optionnel)</span>
        </h3>
        <div className='flex items-center gap-3'>
          {enabled && (
            <button
              type='button'
              onClick={handleReset}
              className='flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors'
            >
              <RotateCcw className='w-3.5 h-3.5' />
              Réinitialiser
            </button>
          )}
          <button
            type='button'
            onClick={handleToggle}
            className='relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:ring-offset-1'
            style={{ backgroundColor: enabled ? '#1B998B' : '#D1D5DB' }}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {!enabled && (
        <p className='text-xs text-gray-400'>
          Activez pour définir des objectifs en micronutriments.
        </p>
      )}

      {enabled && (
        <div className='space-y-6'>
          {MICRO_CATEGORIES.map((category) => (
            <div key={category.label}>
              <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
                {category.label}
              </h4>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {category.fields.map((field) => {
                  const errorKey = `micro_${field.key}`;
                  const error = fieldErrors[errorKey];
                  return (
                    <div key={field.key}>
                      <label className='block text-sm text-gray-600 mb-1'>
                        {field.label}
                        <span className='text-[10px] text-gray-400 ml-1'>({field.min}-{field.max})</span>
                      </label>
                      <div className='relative'>
                        <input
                          type='number'
                          step='any'
                          value={value?.[field.key] ?? ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-12 ${
                            error ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-[#1B998B]'
                          }`}
                        />
                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400'>
                          {field.unit}
                        </span>
                      </div>
                      {error && (
                        <p className='mt-1 text-xs text-red-600 flex items-center gap-1'>
                          <AlertCircle className='w-3 h-3 shrink-0' />
                          {error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
