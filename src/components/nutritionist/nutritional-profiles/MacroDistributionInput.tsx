'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Beef, Wheat, Droplets, ChevronDown, AlertCircle, Check, PieChart } from 'lucide-react';
import { MACRO_TEMPLATES } from '@/lib/nutritional-profile-calculator';
import type { MacroTemplate } from '@/lib/nutritional-profile-calculator';

// ============================================================================
// Types
// ============================================================================

interface MacroDistributionInputProps {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  onChange: (protein: number, carbs: number, fat: number) => void;
  macroTemplate: string | null;
  onTemplateChange: (template: string | null) => void;
  /** Optional: target calories for showing gram calculations */
  targetCalories?: number | null;
  /** Optional: additional CSS classes for the root element */
  className?: string;
}

// ============================================================================
// Template Picker
// ============================================================================

function TemplatePicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (template: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const templateEntries = Object.entries(MACRO_TEMPLATES) as [MacroTemplate, (typeof MACRO_TEMPLATES)[MacroTemplate]][];
  const activeKey = selected || 'custom';
  const activeTemplate = templateEntries.find(([key]) => key === activeKey);
  const activeLabel = activeTemplate ? activeTemplate[1].label : 'Personnalisé';

  return (
    <div className='space-y-2'>
      <label className='text-xs text-gray-500 block'>Modèle de répartition</label>
      <div className='relative'>
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all flex items-center justify-between ${
            isOpen
              ? 'border-[#1B998B] ring-2 ring-[#1B998B]/20 bg-white'
              : activeKey !== 'custom'
                ? 'border-[#1B998B] bg-emerald-50/50'
                : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-800'>{activeLabel}</span>
            {activeTemplate && activeKey !== 'custom' && (
              <span className='text-xs text-gray-400'>
                P{activeTemplate[1].protein}% G{activeTemplate[1].carbs}% L{activeTemplate[1].fat}%
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />
            <div className='absolute z-20 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden'>
              <div className='py-1 max-h-64 overflow-y-auto'>
                {templateEntries.map(([key, tmpl]) => {
                  const isActive = key === activeKey;
                  return (
                    <button
                      key={key}
                      type='button'
                      onClick={() => {
                        onSelect(key === 'custom' ? null : key);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-[#1B998B]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className='flex items-center gap-2.5'>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isActive ? 'border-[#1B998B] bg-[#1B998B]' : 'border-gray-300'
                        }`}>
                          {isActive && <Check className='w-2.5 h-2.5 text-white' />}
                        </div>
                        <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{tmpl.label}</span>
                      </div>
                      {key !== 'custom' && (
                        <span className='text-xs text-gray-400'>
                          P{tmpl.protein}% G{tmpl.carbs}% L{tmpl.fat}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Slider (used for preset templates)
// ============================================================================

function MacroSlider({
  label,
  icon,
  color,
  value,
  onChange,
  grams,
  kcal,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  value: number;
  onChange: (val: number) => void;
  grams: number | null;
  kcal?: number | null;
}) {
  const trackColor: Record<string, string> = {
    blue: 'accent-blue-500',
    amber: 'accent-amber-500',
    rose: 'accent-rose-500',
  };

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between'>
        <span className='text-xs text-gray-600 flex items-center gap-1.5'>
          {icon}
          {label}
        </span>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold text-gray-800 tabular-nums'>{value}%</span>
          {grams !== null && (
            <span className='text-xs text-gray-400 tabular-nums'>({grams}g)</span>
          )}
          {kcal != null && (
            <span className='text-xs text-gray-400 tabular-nums'>· {kcal} kcal</span>
          )}
        </div>
      </div>
      <input
        type='range'
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${trackColor[color] || ''}`}
      />
    </div>
  );
}

// ============================================================================
// Custom Macro Row (used for "Personnalisé" mode — editable % / g / kcal)
// Uses local string state so the user can freely type (clear, retype)
// and propagates valid values on blur.
// ============================================================================

function CustomMacroRow({
  label,
  icon,
  colorClasses,
  pct,
  grams,
  kcal,
  onPctChange,
  onGramsChange,
  targetCalories,
}: {
  label: string;
  icon: React.ReactNode;
  colorClasses: { bg: string; border: string; text: string };
  pct: number;
  grams: number | null;
  kcal: number | null;
  onPctChange: (val: number) => void;
  onGramsChange: (grams: number) => void;
  targetCalories: number | null;
}) {
  // Local string state for free typing
  const [localPct, setLocalPct] = useState(String(pct));
  const [localGrams, setLocalGrams] = useState(grams !== null ? String(grams) : '');

  // Sync from parent when value changes externally (e.g. other row edited)
  useEffect(() => { setLocalPct(String(pct)); }, [pct]);
  useEffect(() => { setLocalGrams(grams !== null ? String(grams) : ''); }, [grams]);

  const handlePctBlur = () => {
    const val = parseInt(localPct);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      onPctChange(val);
    } else {
      setLocalPct(String(pct)); // revert on invalid
    }
  };

  const handleGramsBlur = () => {
    const g = parseFloat(localGrams);
    if (!isNaN(g) && g >= 0) {
      onGramsChange(g);
    } else {
      setLocalGrams(grams !== null ? String(grams) : '');
    }
  };

  const inputBase = 'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-right pr-10 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border ${colorClasses.border} ${colorClasses.bg}`}>
      {/* Label */}
      <div className='flex items-center gap-1.5 w-[88px] shrink-0'>
        {icon}
        <span className={`text-sm font-medium ${colorClasses.text}`}>{label}</span>
      </div>

      {/* Percentage input */}
      <div className='relative flex-1 min-w-0'>
        <input
          type='text'
          inputMode='numeric'
          value={localPct}
          onChange={(e) => setLocalPct(e.target.value)}
          onBlur={handlePctBlur}
          onKeyDown={(e) => { if (e.key === 'Enter') handlePctBlur(); }}
          className={inputBase}
        />
        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none'>%</span>
      </div>

      {/* Grams input */}
      <div className='relative flex-1 min-w-0'>
        <input
          type='text'
          inputMode='decimal'
          value={localGrams}
          disabled={!targetCalories}
          onChange={(e) => setLocalGrams(e.target.value)}
          onBlur={handleGramsBlur}
          onKeyDown={(e) => { if (e.key === 'Enter') handleGramsBlur(); }}
          className={`${inputBase} disabled:bg-gray-50 disabled:text-gray-400`}
        />
        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none'>g</span>
      </div>

      {/* Kcal display (read-only) */}
      <div className='w-[72px] shrink-0 text-right'>
        <span className='text-sm tabular-nums text-gray-600'>
          {kcal !== null ? kcal : '—'}
        </span>
        <span className='text-[10px] text-gray-400 ml-0.5'>kcal</span>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function MacroDistributionInput({
  proteinPct,
  carbsPct,
  fatPct,
  onChange,
  macroTemplate,
  onTemplateChange,
  targetCalories,
  className,
}: MacroDistributionInputProps) {
  const sum = proteinPct + carbsPct + fatPct;
  const isValid = sum === 100;

  // Calculate grams and kcal from calories
  const grams = useMemo(() => {
    if (!targetCalories || targetCalories <= 0) return { protein: null, carbs: null, fat: null };
    return {
      protein: Math.round((targetCalories * proteinPct / 100) / 4 * 10) / 10,
      carbs: Math.round((targetCalories * carbsPct / 100) / 4 * 10) / 10,
      fat: Math.round((targetCalories * fatPct / 100) / 9 * 10) / 10,
    };
  }, [targetCalories, proteinPct, carbsPct, fatPct]);

  const kcals = useMemo(() => {
    if (!targetCalories || targetCalories <= 0) return { protein: null, carbs: null, fat: null };
    return {
      protein: Math.round(targetCalories * proteinPct / 100),
      carbs: Math.round(targetCalories * carbsPct / 100),
      fat: Math.round(targetCalories * fatPct / 100),
    };
  }, [targetCalories, proteinPct, carbsPct, fatPct]);

  const handleTemplateChange = useCallback(
    (template: string | null) => {
      onTemplateChange(template);
      if (template && template !== 'custom' && template in MACRO_TEMPLATES) {
        const tmpl = MACRO_TEMPLATES[template as MacroTemplate];
        onChange(tmpl.protein, tmpl.carbs, tmpl.fat);
      }
    },
    [onChange, onTemplateChange]
  );

  const isCustom = !macroTemplate;

  const handleSliderChange = useCallback(
    (macro: 'protein' | 'carbs' | 'fat', val: number) => {
      // Switch to custom template when manually adjusting
      if (macroTemplate && macroTemplate !== 'custom') {
        onTemplateChange(null);
      }
      if (macro === 'protein') onChange(val, carbsPct, fatPct);
      else if (macro === 'carbs') onChange(proteinPct, val, fatPct);
      else onChange(proteinPct, carbsPct, val);
    },
    [proteinPct, carbsPct, fatPct, onChange, macroTemplate, onTemplateChange]
  );

  const handlePctChange = useCallback(
    (macro: 'protein' | 'carbs' | 'fat', val: number) => {
      if (macro === 'protein') onChange(val, carbsPct, fatPct);
      else if (macro === 'carbs') onChange(proteinPct, val, fatPct);
      else onChange(proteinPct, carbsPct, val);
    },
    [proteinPct, carbsPct, fatPct, onChange]
  );

  const handleGramsChange = useCallback(
    (macro: 'protein' | 'carbs' | 'fat', g: number) => {
      if (!targetCalories || targetCalories <= 0) return;
      const kcalPerG = macro === 'fat' ? 9 : 4;
      const newPct = Math.round((g * kcalPerG / targetCalories) * 100);
      const clamped = Math.max(0, newPct);
      handlePctChange(macro, clamped);
    },
    [targetCalories, handlePctChange]
  );

  // Visual bar
  const barSegments = [
    { pct: proteinPct, color: 'bg-blue-500', label: 'P' },
    { pct: carbsPct, color: 'bg-amber-500', label: 'G' },
    { pct: fatPct, color: 'bg-rose-500', label: 'L' },
  ];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 space-y-5${className ? ` ${className}` : ''}`}>
      <h3 className='text-sm font-medium text-gray-700 flex items-center gap-2'>
        <PieChart className='w-4 h-4 text-[#1B998B]' />
        Répartition des macronutriments
      </h3>

      {/* Template picker */}
      <TemplatePicker selected={macroTemplate} onSelect={handleTemplateChange} />

      {/* Visual bar */}
      <div className='flex h-4 rounded-full overflow-hidden bg-gray-100'>
        {barSegments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-200`}
            style={{ width: `${Math.max(seg.pct, 0)}%` }}
          />
        ))}
      </div>

      {/* Macro sliders */}
      <div className='space-y-4'>
        <MacroSlider
          label='Protéines'
          icon={<Beef className='w-3.5 h-3.5 text-blue-500' />}
          color='blue'
          value={proteinPct}
          onChange={(v) => handleSliderChange('protein', v)}
          grams={grams.protein}
          kcal={kcals.protein}
        />
        <MacroSlider
          label='Glucides'
          icon={<Wheat className='w-3.5 h-3.5 text-amber-500' />}
          color='amber'
          value={carbsPct}
          onChange={(v) => handleSliderChange('carbs', v)}
          grams={grams.carbs}
          kcal={kcals.carbs}
        />
        <MacroSlider
          label='Lipides'
          icon={<Droplets className='w-3.5 h-3.5 text-rose-500' />}
          color='rose'
          value={fatPct}
          onChange={(v) => handleSliderChange('fat', v)}
          grams={grams.fat}
          kcal={kcals.fat}
        />
        {/* Total kcal row */}
        {kcals.protein !== null && kcals.carbs !== null && kcals.fat !== null && (
          <div className={`flex items-center justify-end border-t border-gray-200 pt-2 ${
            sum > 100 ? 'text-red-600' : 'text-gray-800'
          }`}>
            <span className='text-xs text-gray-500 mr-2'>Total</span>
            <span className='text-sm tabular-nums font-semibold'>
              {(kcals.protein + kcals.carbs + kcals.fat).toLocaleString('fr-FR')}
            </span>
            <span className='text-[10px] text-gray-400 ml-0.5'>kcal</span>
          </div>
        )}
      </div>

      {/* Sum indicator */}
      <div
        className={`px-3 py-2 rounded-lg text-xs font-medium ${
          isValid
            ? 'bg-emerald-50 text-emerald-700'
            : sum > 100
              ? 'bg-red-50 text-red-700'
              : 'bg-amber-50 text-amber-700'
        }`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {isValid ? (
              <>
                <Check className='w-3.5 h-3.5' />
                Répartition valide
              </>
            ) : (
              <>
                <AlertCircle className='w-3.5 h-3.5' />
                {sum > 100
                  ? `Dépassement de ${sum - 100}%`
                  : `Il reste ${100 - sum}% à répartir`
                }
              </>
            )}
          </div>
          <span className='tabular-nums font-semibold'>
            {sum}%
          </span>
        </div>
        {sum > 100 && targetCalories && targetCalories > 0 && (
          <div className='flex items-center justify-between mt-1 pt-1 border-t border-red-200/50'>
            <span>Total calorique macro</span>
            <span className='tabular-nums font-semibold'>
              {Math.round(targetCalories * sum / 100).toLocaleString('fr-FR')} kcal
              <span className='font-normal ml-1'>(+{Math.round(targetCalories * (sum - 100) / 100).toLocaleString('fr-FR')} kcal)</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
