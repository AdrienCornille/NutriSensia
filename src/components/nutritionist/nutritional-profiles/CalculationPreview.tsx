'use client';

import React, { useMemo } from 'react';
import {
  Flame,
  Activity,
  Target,
  Beef,
  Wheat,
  Droplets,
  Scale,
  Zap,
  Pill,
} from 'lucide-react';
import {
  calculateNutritionalProfile,
  calculateBMI,
  getBMIInterpretation,
  ACTIVITY_LEVELS,
  BMR_FORMULAS,
  GOAL_ADJUSTMENTS,
  SPECIAL_CASE_ADJUSTMENTS,
} from '@/lib/nutritional-profile-calculator';
import type { CalculationInput } from '@/lib/nutritional-profile-calculator';
import type { MicroTargets } from '@/types/nutritional-profile';

// ============================================================================
// Micro labels (key → { label, unit }) for display in preview
// ============================================================================

const MICRO_DISPLAY: { category: string; fields: { key: keyof MicroTargets; label: string; unit: string }[] }[] = [
  {
    category: 'Fibres',
    fields: [
      { key: 'fiber_g', label: 'Fibres', unit: 'g' },
    ],
  },
  {
    category: 'Minéraux',
    fields: [
      { key: 'sodium_mg', label: 'Sodium', unit: 'mg' },
      { key: 'calcium_mg', label: 'Calcium', unit: 'mg' },
      { key: 'iron_mg', label: 'Fer', unit: 'mg' },
      { key: 'magnesium_mg', label: 'Magnésium', unit: 'mg' },
      { key: 'phosphorus_mg', label: 'Phosphore', unit: 'mg' },
      { key: 'potassium_mg', label: 'Potassium', unit: 'mg' },
      { key: 'zinc_mg', label: 'Zinc', unit: 'mg' },
    ],
  },
  {
    category: 'Vitamines',
    fields: [
      { key: 'vitamin_a_ug', label: 'Vitamine A', unit: 'µg' },
      { key: 'vitamin_b1_mg', label: 'Vit. B1', unit: 'mg' },
      { key: 'vitamin_b2_mg', label: 'Vit. B2', unit: 'mg' },
      { key: 'vitamin_b3_mg', label: 'Vit. B3', unit: 'mg' },
      { key: 'vitamin_b6_mg', label: 'Vit. B6', unit: 'mg' },
      { key: 'vitamin_b9_ug', label: 'Vit. B9', unit: 'µg' },
      { key: 'vitamin_b12_ug', label: 'Vit. B12', unit: 'µg' },
      { key: 'vitamin_c_mg', label: 'Vit. C', unit: 'mg' },
      { key: 'vitamin_d_ug', label: 'Vit. D', unit: 'µg' },
      { key: 'vitamin_e_mg', label: 'Vit. E', unit: 'mg' },
      { key: 'vitamin_k_ug', label: 'Vit. K', unit: 'µg' },
    ],
  },
  {
    category: 'Autres',
    fields: [
      { key: 'cholesterol_mg', label: 'Cholestérol', unit: 'mg' },
    ],
  },
];

// ============================================================================
// Types
// ============================================================================

interface CalculationPreviewProps {
  input: CalculationInput | null;
  microTargets?: MicroTargets | null;
}

// ============================================================================
// Main Component
// ============================================================================

export function CalculationPreview({ input, microTargets }: CalculationPreviewProps) {
  const result = useMemo(() => {
    if (!input) return null;
    if (!input.weight_kg || !input.height_cm || !input.age) return null;
    if (input.bmr_formula === 'katch_mcardle' && !input.body_fat_pct) return null;
    if (input.protein_pct + input.carbs_pct + input.fat_pct !== 100) return null;

    try {
      return calculateNutritionalProfile(input);
    } catch {
      return null;
    }
  }, [input]);

  const bmi = useMemo(() => {
    if (!input?.weight_kg || !input?.height_cm) return null;
    return calculateBMI(input.weight_kg, input.height_cm);
  }, [input?.weight_kg, input?.height_cm]);

  const bmiInterpretation = useMemo(() => {
    if (!bmi) return null;
    return getBMIInterpretation(bmi);
  }, [bmi]);

  if (!input || !result) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6 text-center flex-1'>
        <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
          <Zap className='w-6 h-6 text-gray-300' />
        </div>
        <p className='text-sm text-gray-500'>
          Complétez les données patient et les paramètres de calcul pour voir l&apos;aperçu en temps réel.
        </p>
      </div>
    );
  }

  const formulaLabel = BMR_FORMULAS[input.bmr_formula]?.label ?? input.bmr_formula;
  const activityLabel = ACTIVITY_LEVELS[input.activity_level]?.label ?? input.activity_level;
  const activityFactor = ACTIVITY_LEVELS[input.activity_level]?.factor ?? 1;
  const goalLabel = GOAL_ADJUSTMENTS[input.goal]?.label ?? input.goal;
  const goalKcal = input.goal_adjustment_kcal ?? GOAL_ADJUSTMENTS[input.goal]?.kcal ?? 0;
  const specialLabel = SPECIAL_CASE_ADJUSTMENTS[input.special_case]?.label ?? 'Aucun';
  const specialDefaultKcal = SPECIAL_CASE_ADJUSTMENTS[input.special_case]?.kcal ?? 0;
  const specialKcal = input.special_case_adjustment_kcal ?? specialDefaultKcal;
  const specialIsCustom = input.special_case_adjustment_kcal != null && input.special_case_adjustment_kcal !== specialDefaultKcal;

  const bmiColorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    red: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4 flex-1'>
      <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
        <Zap className='w-4 h-4 text-[#1B998B]' />
        Récapitulatif du profil
      </h3>

      {/* BMI */}
      {bmi !== null && bmiInterpretation && (
        <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-800 flex items-center gap-1.5'>
              <Scale className='w-3.5 h-3.5 text-gray-400' />
              IMC
            </span>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-gray-800'>{bmi}</span>
              <span className='text-xs text-gray-500'>kg/m²</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium border ${bmiColorMap[bmiInterpretation.color] || 'text-gray-600 bg-gray-50 border-gray-200'}`}
              >
                {bmiInterpretation.label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MB (Métabolisme de Base) */}
      <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5 space-y-1'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-gray-800 flex items-center gap-1.5'>
            <Flame className='w-3.5 h-3.5 text-gray-400' />
            Métabolisme de Base (MB)
          </span>
          <span className='text-sm font-semibold text-gray-800'>
            {result.bmr.toLocaleString('fr-FR')} kcal
          </span>
        </div>
        <p className='text-xs text-gray-500'>Formule : {formulaLabel}</p>
      </div>

      {/* DET (Dépense Énergétique Totale) */}
      <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5 space-y-1'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-gray-800 flex items-center gap-1.5'>
            <Activity className='w-3.5 h-3.5 text-gray-400' />
            Dépense Énergétique Totale (DET)
          </span>
          <span className='text-sm font-semibold text-gray-800'>
            {result.tdee.toLocaleString('fr-FR')} kcal
          </span>
        </div>
        <p className='text-xs text-gray-500'>
          MB x {activityFactor} ({activityLabel})
        </p>
      </div>

      {/* Adjustments */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-gray-500 flex items-center gap-1.5'>
            <Target className='w-3.5 h-3.5' />
            Ajustement objectif : {goalLabel}
          </span>
          <span className={`text-sm font-medium ${goalKcal < 0 ? 'text-blue-600' : goalKcal > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
            {goalKcal > 0 ? '+' : ''}{goalKcal} kcal
          </span>
        </div>
        {input.special_case !== 'none' && (
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-500'>
              Cas particulier : {specialLabel}
              {specialIsCustom && <span className='text-orange-500 ml-1'>(ajusté)</span>}
            </span>
            <span className={`text-sm font-medium ${specialKcal > 0 ? 'text-orange-600' : specialKcal < 0 ? 'text-blue-600' : 'text-gray-500'}`}>
              {specialKcal > 0 ? '+' : ''}{specialKcal} kcal
            </span>
          </div>
        )}
      </div>

      {/* Target Calories */}
      <div className='bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100'>
        <p className='text-sm text-emerald-600 font-medium mb-0.5'>
          Calories Cibles Journalières
        </p>
        <p className='text-2xl font-bold text-emerald-700'>
          {result.targetCalories.toLocaleString('fr-FR')}
        </p>
        <p className='text-xs text-emerald-500 mt-0.5'>kcal / jour</p>
      </div>

      {/* Macro breakdown */}
      <div className='grid grid-cols-3 gap-3'>
        <div className='bg-blue-50 rounded-lg p-3 text-center'>
          <Beef className='w-4 h-4 text-blue-500 mx-auto mb-1' />
          <p className='text-lg font-semibold text-blue-700'>{result.protein_g}g</p>
          <p className='text-xs text-blue-500'>Protéines ({input.protein_pct}%)</p>
        </div>
        <div className='bg-amber-50 rounded-lg p-3 text-center'>
          <Wheat className='w-4 h-4 text-amber-500 mx-auto mb-1' />
          <p className='text-lg font-semibold text-amber-700'>{result.carbs_g}g</p>
          <p className='text-xs text-amber-500'>Glucides ({input.carbs_pct}%)</p>
        </div>
        <div className='bg-rose-50 rounded-lg p-3 text-center'>
          <Droplets className='w-4 h-4 text-rose-500 mx-auto mb-1' />
          <p className='text-lg font-semibold text-rose-700'>{result.fat_g}g</p>
          <p className='text-xs text-rose-500'>Lipides ({input.fat_pct}%)</p>
        </div>
      </div>

      {/* Micro targets */}
      {microTargets && Object.keys(microTargets).length > 0 && (() => {
        // Filter categories to only those with at least one filled value
        const filledCategories = MICRO_DISPLAY
          .map((cat) => ({
            ...cat,
            fields: cat.fields.filter((f) => microTargets[f.key] != null),
          }))
          .filter((cat) => cat.fields.length > 0);

        if (filledCategories.length === 0) return null;

        return (
          <div className='space-y-3'>
            <h4 className='text-sm font-semibold text-gray-800 flex items-center gap-2 pt-1'>
              <Pill className='w-4 h-4 text-[#1B998B]' />
              Objectifs micronutriments
            </h4>
            {filledCategories.map((cat) => (
              <div key={cat.category}>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                  {cat.category}
                </p>
                <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2 space-y-1'>
                  {cat.fields.map((f) => (
                    <div key={f.key} className='flex items-center justify-between'>
                      <span className='text-xs text-gray-600'>{f.label}</span>
                      <span className='text-xs font-medium text-gray-800'>
                        {microTargets[f.key]} {f.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
