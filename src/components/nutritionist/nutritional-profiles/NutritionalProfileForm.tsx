'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Save,
  AlertCircle,
  User,
  Calculator,
  Target,
  Pill,
  FileText,
  Check,
  ChevronDown,
  Scale,
  Info,
  X,
  Play,
} from 'lucide-react';
import {
  useCreateNutritionalProfile,
  useUpdateNutritionalProfile,
  useNutritionalProfile,
  useNutritionalProfilePrefill,
} from '@/hooks/useNutritionistNutritionalProfiles';
import {
  calculateNutritionalProfile as calcProfile,
  calculateBMI,
  getBMIInterpretation,
  calculateBodyFat,
  getBodyFatInterpretation,
  calculateIdealWeight,
  ACTIVITY_LEVELS,
  GOAL_ADJUSTMENTS,
  SPECIAL_CASE_ADJUSTMENTS,
  BMR_FORMULAS,
  BODY_FAT_FORMULAS,
  IDEAL_WEIGHT_FORMULAS,
} from '@/lib/nutritional-profile-calculator';
import type {
  CalculationInput,
  ActivityLevel,
  ProfileGoal,
  SpecialCase,
  BmrFormula,
  BodyFatFormula,
  IdealWeightFormula,
} from '@/lib/nutritional-profile-calculator';
import { MacroDistributionInput } from './MacroDistributionInput';
import { CalculationPreview } from './CalculationPreview';
import { MicroTargetsEditor } from './MicroTargetsEditor';
import type {
  MicroTargets,
  ProfileStatus,
  CreateNutritionalProfilePayload,
} from '@/types/nutritional-profile';

// ============================================================================
// Constants
// ============================================================================

const STEPS = [
  { id: 1, label: 'Données patient', icon: User },
  { id: 2, label: 'Calcul & Activité', icon: Calculator },
  { id: 3, label: 'Macronutriments', icon: Target },
  { id: 4, label: 'Micronutriments', icon: Pill },
  { id: 5, label: 'Finalisation', icon: FileText },
];

// ============================================================================
// Types
// ============================================================================

interface NutritionalProfileFormProps {
  patientId: string;
  patientName: string;
  /** If provided, we're editing an existing profile (pass the profile ID) */
  editProfileId?: string | null;
  onClose: () => void;
  onSuccess: (action: 'created_draft' | 'created_active' | 'updated') => void;
}

interface FormState {
  // Step 1 — Patient data
  weight_kg: string;
  height_cm: string;
  age: string;
  gender: 'male' | 'female';
  body_fat_pct: string;

  // Step 2 — Calculation
  bmr_formula: BmrFormula;
  activity_level: ActivityLevel;
  goal: ProfileGoal;
  goal_adjustment_kcal: string;
  special_case: SpecialCase;
  special_case_adjustment_kcal: string;

  // Step 3 — Macros
  macro_template: string | null;
  protein_pct: number;
  carbs_pct: number;
  fat_pct: number;

  // Step 4 — Micros
  micro_targets: MicroTargets | null;

  // Step 5 — Finalization
  name: string;
  notes: string;
  private_notes: string;
  status: ProfileStatus;
}

const defaultFormState: FormState = {
  weight_kg: '',
  height_cm: '',
  age: '',
  gender: 'female',
  body_fat_pct: '',
  bmr_formula: 'mifflin_st_jeor',
  activity_level: 'moderatelyActive',
  goal: 'maintain',
  goal_adjustment_kcal: '',
  special_case: 'none',
  special_case_adjustment_kcal: '',
  macro_template: 'equilibre_anses',
  protein_pct: 15,
  carbs_pct: 50,
  fat_pct: 35,
  micro_targets: null,
  name: '',
  notes: '',
  private_notes: '',
  status: 'draft',
};

// ============================================================================
// Field-level validation constraints (aligned with Zod schemas in api-schemas.ts)
// ============================================================================

type FieldConstraint = {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  integer?: boolean;
  required?: boolean;
  messages: { min?: string; max?: string; minLength?: string; maxLength?: string; required?: string };
};

const FIELD_CONSTRAINTS: Record<string, FieldConstraint> = {
  weight_kg: { min: 30, max: 300, messages: { min: 'Poids minimum : 30 kg', max: 'Poids maximum : 300 kg' } },
  height_cm: { min: 100, max: 250, messages: { min: 'Taille minimum : 100 cm', max: 'Taille maximum : 250 cm' } },
  age: { min: 13, max: 120, integer: true, messages: { min: 'Âge minimum : 13 ans', max: 'Âge maximum : 120 ans' } },
  body_fat_pct: { min: 1, max: 60, messages: { min: 'Minimum : 1%', max: 'Maximum : 60%' } },
  goal_adjustment_kcal: { min: -1000, max: 1000, integer: true, messages: { min: 'Minimum : -1000 kcal', max: 'Maximum : +1000 kcal' } },
  name: { minLength: 3, maxLength: 200, required: true, messages: { minLength: 'Minimum 3 caractères', maxLength: 'Maximum 200 caractères', required: 'Le nom du profil est requis' } },
  notes: { maxLength: 2000, messages: { maxLength: 'Maximum 2000 caractères' } },
  private_notes: { maxLength: 2000, messages: { maxLength: 'Maximum 2000 caractères' } },
};

const MICRO_CONSTRAINTS: Record<string, { min: number; max: number }> = {
  fiber_g: { min: 0, max: 100 },
  sodium_mg: { min: 0, max: 10000 },
  calcium_mg: { min: 0, max: 5000 },
  iron_mg: { min: 0, max: 100 },
  magnesium_mg: { min: 0, max: 2000 },
  phosphorus_mg: { min: 0, max: 5000 },
  potassium_mg: { min: 0, max: 10000 },
  zinc_mg: { min: 0, max: 100 },
  vitamin_a_ug: { min: 0, max: 10000 },
  vitamin_b1_mg: { min: 0, max: 100 },
  vitamin_b2_mg: { min: 0, max: 100 },
  vitamin_b3_mg: { min: 0, max: 500 },
  vitamin_b6_mg: { min: 0, max: 100 },
  vitamin_b9_ug: { min: 0, max: 2000 },
  vitamin_b12_ug: { min: 0, max: 100 },
  vitamin_c_mg: { min: 0, max: 5000 },
  vitamin_d_ug: { min: 0, max: 200 },
  vitamin_e_mg: { min: 0, max: 1000 },
  vitamin_k_ug: { min: 0, max: 500 },
  cholesterol_mg: { min: 0, max: 1000 },
};

function validateFieldValue(field: string, rawValue: string): string | null {
  const constraint = FIELD_CONSTRAINTS[field];
  if (!constraint) return null;
  if (rawValue === '' || rawValue === undefined) {
    if (constraint.required) return constraint.messages.required || 'Champ requis';
    return null;
  }
  // String length checks
  if (constraint.minLength != null && rawValue.length < constraint.minLength)
    return constraint.messages.minLength || `Minimum ${constraint.minLength} caractères`;
  if (constraint.maxLength != null && rawValue.length > constraint.maxLength)
    return constraint.messages.maxLength || `Maximum ${constraint.maxLength} caractères`;
  // Numeric checks
  if (constraint.min != null || constraint.max != null) {
    const num = parseFloat(rawValue);
    if (isNaN(num)) return null;
    if (constraint.min != null && num < constraint.min) return constraint.messages.min || `Minimum ${constraint.min}`;
    if (constraint.max != null && num > constraint.max) return constraint.messages.max || `Maximum ${constraint.max}`;
  }
  return null;
}

function validateMicroField(key: string, value: number): string | null {
  const c = MICRO_CONSTRAINTS[key];
  if (!c) return null;
  if (value < c.min) return `Minimum : ${c.min}`;
  if (value > c.max) return `Maximum : ${c.max}`;
  return null;
}

/** Inline error message shown below a field */
function FieldError({ error }: { error?: string | null }) {
  if (!error) return null;
  return (
    <p className='mt-1 text-xs text-red-600 flex items-center gap-1'>
      <AlertCircle className='w-3 h-3 shrink-0' />
      {error}
    </p>
  );
}

// ============================================================================
// Step indicator
// ============================================================================

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className='flex items-center gap-1'>
      {STEPS.map((step, idx) => {
        const StepIcon = step.icon;
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <React.Fragment key={step.id}>
            {idx > 0 && (
              <div
                className={`h-0.5 w-6 ${
                  isCompleted ? 'bg-[#1B998B]' : 'bg-gray-200'
                }`}
              />
            )}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#1B998B] text-white'
                  : isCompleted
                  ? 'bg-emerald-50 text-[#1B998B]'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isCompleted ? (
                <Check className='w-3.5 h-3.5' />
              ) : (
                <StepIcon className='w-3.5 h-3.5' />
              )}
              <span className='hidden md:inline'>{step.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// Step 1: Patient Data
// ============================================================================

function Step1PatientData({
  form,
  updateField,
  bmrRequiresBodyFat,
  prefillSources,
  fieldErrors,
}: {
  form: FormState;
  updateField: (field: keyof FormState, value: string) => void;
  bmrRequiresBodyFat: boolean;
  prefillSources?: Record<string, string> | null;
  fieldErrors: Record<string, string>;
}) {
  const sourceLabels: Record<string, string> = {
    patient_profiles: 'Profil patient',
    weight_entries: 'Dernier poids enregistré',
    anamnese_morphologie: 'Anamnèse (morphologie)',
    anamnese_identite: 'Anamnèse (identité)',
    anamnese_lifestyle: 'Anamnèse (mode de vie)',
  };

  function SourceBadge({ field }: { field: string }) {
    if (!prefillSources?.[field]) return null;
    return (
      <span className='ml-1.5 text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-normal'>
        {sourceLabels[prefillSources[field]] || prefillSources[field]}
      </span>
    );
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
        <User className='w-4 h-4 text-[#1B998B]' />
        Données patient
      </h3>
      {prefillSources && Object.keys(prefillSources).length > 0 && (
        <div className='bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2'>
          <p className='text-xs text-emerald-700'>
            Certains champs ont été pré-remplis à partir des données connues du patient. Vous pouvez les modifier.
          </p>
        </div>
      )}

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm text-gray-600 mb-1'>Poids (kg) *<SourceBadge field='weight_kg' /></label>
          <input
            type='number'
            step='0.1'
            value={form.weight_kg}
            onChange={(e) => updateField('weight_kg', e.target.value)}
            placeholder='70'
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              fieldErrors.weight_kg ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-[#1B998B]'
            }`}
          />
          <FieldError error={fieldErrors.weight_kg} />
        </div>
        <div>
          <label className='block text-sm text-gray-600 mb-1'>Taille (cm) *<SourceBadge field='height_cm' /></label>
          <input
            type='number'
            value={form.height_cm}
            onChange={(e) => updateField('height_cm', e.target.value)}
            placeholder='170'
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              fieldErrors.height_cm ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-[#1B998B]'
            }`}
          />
          <FieldError error={fieldErrors.height_cm} />
        </div>
        <div>
          <label className='block text-sm text-gray-600 mb-1'>Âge *<SourceBadge field='age' /></label>
          <input
            type='number'
            value={form.age}
            onChange={(e) => updateField('age', e.target.value)}
            placeholder='30'
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              fieldErrors.age ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-[#1B998B]'
            }`}
          />
          <FieldError error={fieldErrors.age} />
        </div>
        <div>
          <label className='block text-sm text-gray-600 mb-1'>Genre *<SourceBadge field='gender' /></label>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => updateField('gender', 'female')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                form.gender === 'female'
                  ? 'bg-[#1B998B] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Femme
            </button>
            <button
              type='button'
              onClick={() => updateField('gender', 'male')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                form.gender === 'male'
                  ? 'bg-[#1B998B] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Homme
            </button>
          </div>
        </div>
      </div>

      {/* Body fat (conditional for Katch-McArdle) */}
      {bmrRequiresBodyFat && (
        <div>
          <label className='block text-sm text-gray-600 mb-1'>
            Masse grasse (%) *<SourceBadge field='body_fat_pct' />
            <span className='text-xs text-amber-600 ml-1'>
              Requis pour la formule Katch-McArdle
            </span>
          </label>
          <input
            type='number'
            step='0.1'
            value={form.body_fat_pct}
            onChange={(e) => updateField('body_fat_pct', e.target.value)}
            placeholder='20'
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              fieldErrors.body_fat_pct ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-[#1B998B]'
            }`}
          />
          <FieldError error={fieldErrors.body_fat_pct} />
        </div>
      )}
      {!bmrRequiresBodyFat && (
        <div>
          <label className='block text-sm text-gray-600 mb-1'>
            Masse grasse (%)<SourceBadge field='body_fat_pct' />
            <span className='text-xs text-gray-400 ml-1'>Optionnel</span>
          </label>
          <input
            type='number'
            step='0.1'
            value={form.body_fat_pct}
            onChange={(e) => updateField('body_fat_pct', e.target.value)}
            placeholder='Optionnel'
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              fieldErrors.body_fat_pct ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-[#1B998B]'
            }`}
          />
          <FieldError error={fieldErrors.body_fat_pct} />
        </div>
      )}

    </div>
  );
}

// ============================================================================
// Step 1 — Repères pondéraux (sidebar card)
// ============================================================================

function Step1ReperesCard({
  form,
  updateField,
  referenceWeights,
}: {
  form: FormState;
  updateField: (field: keyof FormState, value: string) => void;
  referenceWeights?: {
    target_weight_kg?: number;
    comfort_weight_kg?: number;
  } | null;
}) {
  const [bodyFatFormula, setBodyFatFormula] = useState<BodyFatFormula>('deurenberg');
  const [idealWeightFormula, setIdealWeightFormula] = useState<IdealWeightFormula>('lorentz');
  const [showBodyFatDropdown, setShowBodyFatDropdown] = useState(false);
  const [showIdealWeightDropdown, setShowIdealWeightDropdown] = useState(false);
  const [infoModal, setInfoModal] = useState<FormulaInfoTopic | null>(null);

  const weight = parseFloat(form.weight_kg);
  const height = parseFloat(form.height_cm);
  const age = parseInt(form.age);
  const hasBasicData = weight > 0 && height > 0;
  const hasAllData = hasBasicData && age > 0;

  const bmi = useMemo(() => {
    if (!hasBasicData) return null;
    return calculateBMI(weight, height);
  }, [hasBasicData, weight, height]);

  const bmiInterpretation = useMemo(() => {
    if (!bmi) return null;
    return getBMIInterpretation(bmi);
  }, [bmi]);

  const estimatedBodyFat = useMemo(() => {
    if (!bmi || !hasAllData) return null;
    return calculateBodyFat(bodyFatFormula, bmi, age, form.gender);
  }, [bmi, hasAllData, bodyFatFormula, age, form.gender]);

  const bodyFatInterpretation = useMemo(() => {
    if (estimatedBodyFat == null) return null;
    return getBodyFatInterpretation(estimatedBodyFat, form.gender);
  }, [estimatedBodyFat, form.gender]);

  const idealWeight = useMemo(() => {
    if (!hasBasicData || !age) return null;
    return calculateIdealWeight(idealWeightFormula, height, form.gender, age);
  }, [hasBasicData, height, form.gender, age, idealWeightFormula]);

  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    red: 'text-red-600 bg-red-50 border-red-200',
  };

  const bodyFatEntries = Object.entries(BODY_FAT_FORMULAS) as [BodyFatFormula, (typeof BODY_FAT_FORMULAS)[BodyFatFormula]][];
  const idealWeightEntries = Object.entries(IDEAL_WEIGHT_FORMULAS) as [IdealWeightFormula, (typeof IDEAL_WEIGHT_FORMULAS)[IdealWeightFormula]][];

  if (!hasBasicData) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6 flex-1 flex flex-col items-center justify-center text-center'>
        <Scale className='w-8 h-8 text-gray-300 mb-3' />
        <p className='text-sm font-medium text-gray-500'>Repères pondéraux</p>
        <p className='text-xs text-gray-400 mt-1'>Renseignez le poids et la taille pour afficher les calculs.</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-5 flex-1 space-y-3'>
      {infoModal && <FormulaInfoModal topic={infoModal} onClose={() => setInfoModal(null)} />}

      <h4 className='text-sm font-semibold text-gray-800 flex items-center gap-1.5'>
        <Scale className='w-4 h-4 text-[#1B998B]' />
        Repères pondéraux
      </h4>

      {/* BMI */}
      {bmi !== null && bmiInterpretation && (
        <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5'>
              <p className='text-sm font-medium text-gray-800'>IMC</p>
              <button type='button' onClick={() => setInfoModal('bmi')} className='p-0.5 text-gray-400 hover:text-[#1B998B] transition-colors'>
                <Info className='w-3.5 h-3.5' />
              </button>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-gray-800'>{bmi}</span>
              <span className='text-xs text-gray-500'>kg/m²</span>
            </div>
          </div>
          <div className='flex items-center justify-between mt-1'>
            <p className='text-xs text-gray-500'>poids / taille²</p>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium border ${
                colorMap[bmiInterpretation.color] || 'text-gray-600 bg-gray-50 border-gray-200'
              }`}
            >
              {bmiInterpretation.label}
            </span>
          </div>
        </div>
      )}

      {/* Body Fat % */}
      {hasAllData && estimatedBodyFat !== null && bodyFatInterpretation && (
        <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5'>
              <p className='text-sm font-medium text-gray-800'>Masse grasse</p>
              <button type='button' onClick={() => setInfoModal('body_fat')} className='p-0.5 text-gray-400 hover:text-[#1B998B] transition-colors'>
                <Info className='w-3.5 h-3.5' />
              </button>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-gray-800'>{estimatedBodyFat}%</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium border ${
                  colorMap[bodyFatInterpretation.color] || 'text-gray-600 bg-gray-50 border-gray-200'
                }`}
              >
                {bodyFatInterpretation.label}
              </span>
            </div>
          </div>
          {/* Formula selector */}
          <div className='relative mt-1'>
            <button
              type='button'
              onClick={() => setShowBodyFatDropdown(!showBodyFatDropdown)}
              className='flex items-center gap-1 text-xs text-[#1B998B] hover:text-[#147569] transition-colors'
            >
              <span>{BODY_FAT_FORMULAS[bodyFatFormula].label}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showBodyFatDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showBodyFatDropdown && (
              <>
                <div className='fixed inset-0 z-10' onClick={() => setShowBodyFatDropdown(false)} />
                <div className='absolute z-20 mt-1 left-0 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden'>
                  <div className='py-1'>
                    {bodyFatEntries.map(([key, formula]) => {
                      const isActive = key === bodyFatFormula;
                      return (
                        <button
                          key={key}
                          type='button'
                          onClick={() => {
                            setBodyFatFormula(key);
                            setShowBodyFatDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-[#1B998B]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className='flex items-center gap-2'>
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isActive ? 'border-[#1B998B] bg-[#1B998B]' : 'border-gray-300'
                            }`}>
                              {isActive && <Check className='w-2 h-2 text-white' />}
                            </div>
                            <div>
                              <p className={`text-xs ${isActive ? 'font-medium' : ''}`}>{formula.label}</p>
                              <p className='text-[10px] text-gray-400'>{formula.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className='border-t border-gray-100 px-3 py-2'>
                    <p className='text-[9px] text-gray-400'>
                      {BODY_FAT_FORMULAS[bodyFatFormula].reference}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Hint: use as body_fat_pct */}
          {!form.body_fat_pct && estimatedBodyFat > 0 && (
            <button
              type='button'
              onClick={() => updateField('body_fat_pct', String(estimatedBodyFat))}
              className='mt-1 text-xs text-[#1B998B] hover:text-[#147569] underline underline-offset-2 transition-colors'
            >
              Utiliser comme masse grasse
            </button>
          )}
        </div>
      )}

      {/* Ideal Weight */}
      {hasAllData && idealWeight !== null && (
        <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5'>
              <p className='text-sm font-medium text-gray-800'>Poids idéal</p>
              <button type='button' onClick={() => setInfoModal('ideal_weight')} className='p-0.5 text-gray-400 hover:text-[#1B998B] transition-colors'>
                <Info className='w-3.5 h-3.5' />
              </button>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-gray-800'>{idealWeight} kg</span>
              {weight > 0 && (
                <span className={`text-xs font-medium ${
                  weight - idealWeight > 2 ? 'text-orange-600' : weight - idealWeight < -2 ? 'text-blue-600' : 'text-emerald-600'
                }`}>
                  {weight - idealWeight > 0 ? '+' : ''}
                  {(weight - idealWeight).toFixed(1)} kg
                </span>
              )}
            </div>
          </div>
          {/* Formula selector */}
          <div className='relative mt-1'>
            <button
              type='button'
              onClick={() => setShowIdealWeightDropdown(!showIdealWeightDropdown)}
              className='flex items-center gap-1 text-xs text-[#1B998B] hover:text-[#147569] transition-colors'
            >
              <span>{IDEAL_WEIGHT_FORMULAS[idealWeightFormula].label}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showIdealWeightDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showIdealWeightDropdown && (
              <>
                <div className='fixed inset-0 z-10' onClick={() => setShowIdealWeightDropdown(false)} />
                <div className='absolute z-20 mt-1 left-0 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden'>
                  <div className='py-1'>
                    {idealWeightEntries.map(([key, formula]) => {
                      const isActive = key === idealWeightFormula;
                      const iw = calculateIdealWeight(key, height, form.gender, age);
                      const delta = weight > 0 ? weight - iw : null;
                      return (
                        <button
                          key={key}
                          type='button'
                          onClick={() => {
                            setIdealWeightFormula(key);
                            setShowIdealWeightDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-[#1B998B]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isActive ? 'border-[#1B998B] bg-[#1B998B]' : 'border-gray-300'
                              }`}>
                                {isActive && <Check className='w-2 h-2 text-white' />}
                              </div>
                              <div>
                                <p className={`text-xs ${isActive ? 'font-medium' : ''}`}>{formula.label}</p>
                                <p className='text-[10px] text-gray-400'>{formula.description}</p>
                              </div>
                            </div>
                            <div className='text-right shrink-0 ml-2'>
                              <p className='text-xs font-semibold text-gray-700'>{iw} kg</p>
                              {delta !== null && (
                                <p className={`text-[10px] ${
                                  delta > 2 ? 'text-orange-500' : delta < -2 ? 'text-blue-500' : 'text-emerald-500'
                                }`}>
                                  {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Anamnesis-sourced references */}
      {referenceWeights && (referenceWeights.target_weight_kg || referenceWeights.comfort_weight_kg) && (
        <div className='space-y-3'>
          {referenceWeights.target_weight_kg && (
            <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5'>
              <p className='text-sm font-medium text-gray-800 mb-0.5'>Poids cible</p>
              <p className='text-sm font-semibold text-gray-800'>
                {referenceWeights.target_weight_kg} kg
              </p>
              <p className='text-xs text-gray-500'>Anamnèse (motivation)</p>
            </div>
          )}
          {referenceWeights.comfort_weight_kg && (
            <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5'>
              <p className='text-sm font-medium text-gray-800 mb-0.5'>Poids de forme</p>
              <p className='text-sm font-semibold text-gray-800'>
                {referenceWeights.comfort_weight_kg} kg
              </p>
              <p className='text-xs text-gray-500'>Anamnèse (historique)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Special Case Dropdown (custom NutriSensia design)
// ============================================================================

function SpecialCaseDropdown({
  value,
  entries,
  customKcal,
  onChange,
  onKcalChange,
  onInfoClick,
}: {
  value: string;
  entries: [SpecialCase, { label: string; kcal: number; description?: string }][];
  customKcal: string;
  onChange: (val: string) => void;
  onKcalChange: (val: string) => void;
  onInfoClick?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = entries.find(([key]) => key === value);
  const selectedLabel = selected ? selected[1].label : 'Aucun';
  const defaultKcal = selected ? selected[1].kcal : 0;
  const displayKcal = customKcal !== '' ? parseInt(customKcal) : defaultKcal;
  const isCustom = customKcal !== '' && parseInt(customKcal) !== defaultKcal;
  const showKcalField = value !== 'none';

  return (
    <div className='space-y-3'>
      <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
        Cas particulier
        {onInfoClick && (
          <button type='button' onClick={onInfoClick} className='p-0.5 text-gray-400 hover:text-[#1B998B] transition-colors'>
            <Info className='w-4 h-4' />
          </button>
        )}
      </h3>
      <div className='flex items-start gap-3'>
        {/* Dropdown */}
        <div className={`relative ${showKcalField ? 'flex-1' : 'w-full'}`}>
          <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all flex items-center justify-between ${
              isOpen
                ? 'border-[#1B998B] ring-2 ring-[#1B998B]/20 bg-white'
                : value !== 'none'
                  ? 'border-[#1B998B] bg-emerald-50/50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-800'>{selectedLabel}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <>
              <div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />
              <div className='absolute z-20 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden'>
                <div className='py-1 max-h-64 overflow-y-auto'>
                  {entries.map(([key, sc]) => {
                    const isActive = key === value;
                    return (
                      <button
                        key={key}
                        type='button'
                        onClick={() => {
                          onChange(key);
                          // Reset custom kcal to the new default
                          onKcalChange(key === 'none' ? '' : String(sc.kcal));
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
                          <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{sc.label}</span>
                        </div>
                        {sc.kcal !== 0 && (
                          <span className={`text-xs font-medium ${
                            sc.kcal > 0 ? 'text-emerald-600' : 'text-orange-600'
                          }`}>
                            {sc.kcal > 0 ? '+' : ''}{sc.kcal} kcal
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

        {/* Kcal override input */}
        {showKcalField && (
          <div className='w-36 shrink-0'>
            <div className='relative'>
              <input
                type='number'
                value={customKcal !== '' ? customKcal : String(defaultKcal)}
                onChange={(e) => onKcalChange(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-right pr-12 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  isCustom
                    ? 'border-orange-300 bg-orange-50/50'
                    : 'border-gray-200 bg-white'
                }`}
              />
              <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none'>
                kcal
              </span>
            </div>
            {isCustom && (
              <p className='text-[10px] text-orange-500 mt-1'>
                Défaut : {defaultKcal > 0 ? '+' : ''}{defaultKcal}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Step 2: Formula Info Modal
// ============================================================================

type FormulaInfoTopic = 'bmi' | 'body_fat' | 'ideal_weight' | 'bmr' | 'activity' | 'special' | 'goal';

const FORMULA_INFO: Record<FormulaInfoTopic, { title: string; sections: { heading: string; content: string }[] }> = {
  bmi: {
    title: 'Indice de Masse Corporelle (IMC)',
    sections: [
      {
        heading: 'Définition',
        content:
          'L\'IMC est un indicateur simple du rapport entre le poids et la taille, utilisé pour évaluer le statut pondéral d\'un adulte.\n\n' +
          'Formule : IMC = poids (kg) / taille² (m²)\n\n' +
          'Exemple : 70 kg / (1.70 m)² = 24.2 kg/m²',
      },
      {
        heading: 'Classification OMS',
        content:
          '• < 18.5 : Insuffisance pondérale\n' +
          '• 18.5 – 24.9 : Poids normal\n' +
          '• 25.0 – 29.9 : Surpoids\n' +
          '• 30.0 – 34.9 : Obésité classe I\n' +
          '• 35.0 – 39.9 : Obésité classe II\n' +
          '• ≥ 40.0 : Obésité classe III',
      },
      {
        heading: 'Limites',
        content:
          'L\'IMC ne distingue pas la masse grasse de la masse musculaire. Il peut surestimer l\'adiposité chez les sportifs et la sous-estimer chez les personnes âgées ayant perdu de la masse musculaire.\n\n' +
          'Il ne tient pas compte de la répartition de la graisse corporelle (abdominale vs périphérique).\n\n' +
          'Source : Organisation Mondiale de la Santé (OMS).',
      },
    ],
  },
  body_fat: {
    title: 'Estimation de la masse grasse',
    sections: [
      {
        heading: 'Deurenberg (1991)',
        content:
          'Formule basée sur l\'IMC, l\'âge et le sexe. Simple et ne nécessite pas de mesures anthropométriques.\n\n' +
          '% MG = (1.20 × IMC) + (0.23 × âge) − (10.8 × sexe) − 5.4\n' +
          'où sexe = 1 (homme) ou 0 (femme)\n\n' +
          'Référence : Deurenberg P, et al. Indice de masse corporelle comme mesure de l\'adiposité. Br J Nutr, 1991.',
      },
      {
        heading: 'Deurenberg révisée (1998)',
        content:
          'Version corrigée tenant mieux compte des différences ethniques et de la variabilité individuelle.\n\n' +
          '% MG = (1.29 × IMC) + (0.20 × âge) − (11.4 × sexe) − 8.0\n\n' +
          'Référence : Deurenberg P, et al. Relation IMC/pourcentage de masse grasse selon les populations. Obes Rev, 1998.',
      },
      {
        heading: 'CUN-BAE (2012)',
        content:
          'Formule développée par la Clínica Universidad de Navarra. Considérée plus précise que les formules de Deurenberg, en particulier pour les populations européennes.\n\n' +
          '% MG = −44.988 + (0.503 × âge) + (10.689 × sexe) + (3.172 × IMC) − (0.026 × IMC²) + (0.181 × IMC × sexe) − (0.02 × IMC × âge) − (0.005 × IMC² × sexe) + (0.00021 × IMC² × âge)\n' +
          'où sexe = 0 (homme) ou 1 (femme)\n\n' +
          'Référence : Gómez-Ambrosi J, et al. Utilité clinique d\'une nouvelle équation d\'estimation de la masse grasse. Diabetes Care, 2012.',
      },
      {
        heading: 'Classification ACE',
        content:
          'Le Conseil américain de l\'exercice (ACE) classe le taux de masse grasse ainsi :\n\n' +
          'Femmes :\n' +
          '• < 14% : Essentiel\n' +
          '• 14–20% : Athlète\n' +
          '• 21–24% : Fitness\n' +
          '• 25–31% : Acceptable\n' +
          '• > 31% : Excès\n\n' +
          'Hommes :\n' +
          '• < 6% : Essentiel\n' +
          '• 6–13% : Athlète\n' +
          '• 14–17% : Fitness\n' +
          '• 18–24% : Acceptable\n' +
          '• > 24% : Excès',
      },
    ],
  },
  ideal_weight: {
    title: 'Formules du poids idéal',
    sections: [
      {
        heading: 'Lorentz (1929)',
        content:
          'Formule simple basée uniquement sur la taille et le sexe.\n\n' +
          'Homme : PI = taille(cm) − 100 − (taille − 150) / 4\n' +
          'Femme : PI = taille(cm) − 100 − (taille − 150) / 2.5',
      },
      {
        heading: 'Devine (1974)',
        content:
          'Développée pour le dosage médicamenteux, devenue un standard clinique.\n\n' +
          'Homme : PI = 50 + 2.3 × (taille(in) − 60)\n' +
          'Femme : PI = 45.5 + 2.3 × (taille(in) − 60)\n\n' +
          'Référence : Devine BJ. Thérapie à la gentamicine. Drug Intell Clin Pharm, 1974.',
      },
      {
        heading: 'Robinson (1983)',
        content:
          'Révision de Devine pour une meilleure précision chez les deux sexes.\n\n' +
          'Homme : PI = 52 + 1.9 × (taille(in) − 60)\n' +
          'Femme : PI = 49 + 1.7 × (taille(in) − 60)',
      },
      {
        heading: 'Miller (1983)',
        content:
          'Alternative à Devine avec des coefficients légèrement différents.\n\n' +
          'Homme : PI = 56.2 + 1.41 × (taille(in) − 60)\n' +
          'Femme : PI = 53.1 + 1.36 × (taille(in) − 60)',
      },
    ],
  },
  bmr: {
    title: 'Formules du Métabolisme de Base (MB)',
    sections: [
      {
        heading: 'Mifflin-St Jeor (1990)',
        content:
          'Considérée comme la plus précise pour la majorité des adultes par l\'Académie de nutrition et de diététique.\n\n' +
          'Homme : MB = (10 × poids en kg) + (6.25 × taille en cm) − (5 × âge) + 5\n' +
          'Femme : MB = (10 × poids en kg) + (6.25 × taille en cm) − (5 × âge) − 161\n\n' +
          'Référence : Mifflin MD, St Jeor ST, et al. Nouvelle équation prédictive de la dépense énergétique de repos chez les individus sains. Am J Clin Nutr, 1990.',
      },
      {
        heading: 'Harris-Benedict révisée (1984)',
        content:
          'Révision de la formule originale, largement utilisée en pratique clinique.\n\n' +
          'Homme : MB = (13.397 × poids) + (4.799 × taille) − (5.677 × âge) + 88.362\n' +
          'Femme : MB = (9.247 × poids) + (3.098 × taille) − (4.330 × âge) + 447.593\n\n' +
          'Référence : Roza AM, Shizgal HM. Réévaluation de l\'équation de Harris-Benedict. Am J Clin Nutr, 1984.',
      },
      {
        heading: 'Harris-Benedict originale (1919)',
        content:
          'Formule historique, tend à surestimer le MB de 5 à 15 % chez les individus modernes.\n\n' +
          'Homme : MB = 66.5 + (13.75 × poids) + (5.003 × taille) − (6.755 × âge)\n' +
          'Femme : MB = 655.1 + (9.563 × poids) + (1.850 × taille) − (4.676 × âge)\n\n' +
          'Référence : Harris JA, Benedict FG. Étude biométrique du métabolisme de base humain. PNAS, 1918.',
      },
      {
        heading: 'Katch-McArdle',
        content:
          'Utilise la masse maigre (LBM) au lieu du poids total, ce qui la rend plus précise pour les personnes ayant une composition corporelle atypique (athlètes, obésité).\n\n' +
          'MB = 370 + (21.6 × masse maigre en kg)\n' +
          'où masse maigre = poids × (1 − % masse grasse / 100)\n\n' +
          'Nécessite la connaissance du taux de masse grasse.\n\n' +
          'Référence : Katch F, McArdle WD. Prédiction de la densité corporelle à partir de mesures anthropométriques simples. Hum Biol, 1973.',
      },
    ],
  },
  activity: {
    title: 'Niveaux d\'activité physique (NAP)',
    sections: [
      {
        heading: 'Sédentaire (×1.2)',
        content: 'Travail de bureau, peu ou pas d\'exercice physique. Déplacements essentiellement en voiture. Loisirs principalement assis (lecture, écrans).',
      },
      {
        heading: 'Légèrement actif (×1.375)',
        content: 'Exercice léger ou sport 1 à 3 jours par semaine. Marche quotidienne modérée. Travail nécessitant quelques déplacements à pied.',
      },
      {
        heading: 'Modérément actif (×1.55)',
        content: 'Exercice modéré ou sport 3 à 5 jours par semaine. Travail actif (debout, déplacements fréquents). Activités physiques régulières.',
      },
      {
        heading: 'Très actif (×1.725)',
        content: 'Exercice intense ou sport 6 à 7 jours par semaine. Travail physiquement exigeant. Entraînement sportif quotidien significatif.',
      },
      {
        heading: 'Extrêmement actif (×1.9)',
        content: 'Athlète professionnel ou travail physique très intense. Double entraînement quotidien ou travail manuel lourd combiné à de l\'exercice.',
      },
      {
        heading: 'Calcul',
        content: 'La Dépense Énergétique Totale (DET) est obtenue en multipliant le Métabolisme de Base par le coefficient d\'activité :\n\nDET = MB × NAP\n\nCes coefficients sont basés sur les recommandations de l\'OMS et de l\'EFSA.',
      },
    ],
  },
  special: {
    title: 'Cas particuliers',
    sections: [
      {
        heading: 'Grossesse',
        content:
          'Les besoins énergétiques augmentent progressivement au cours de la grossesse :\n\n' +
          '• Trimestre 1 : +0 kcal (pas de surplus recommandé)\n' +
          '• Trimestre 2 : +340 kcal/jour\n' +
          '• Trimestre 3 : +450 kcal/jour\n\n' +
          'Source : Institut de médecine (IOM), Apports nutritionnels de référence, 2005.',
      },
      {
        heading: 'Allaitement (+500 kcal)',
        content: 'L\'allaitement maternel exclusif nécessite environ 500 kcal supplémentaires par jour pour assurer une production de lait adéquate.\n\nSource : IOM, 2005.',
      },
      {
        heading: 'Senior 65+ (−150 kcal)',
        content: 'Avec l\'âge, le métabolisme de base diminue en raison de la perte de masse musculaire et de la réduction de l\'activité physique. Un ajustement de −150 kcal est appliqué par défaut.',
      },
      {
        heading: 'Adolescent (+300 kcal)',
        content: 'Pendant la croissance, les besoins énergétiques sont augmentés pour soutenir le développement musculo-squelettique et hormonal. Un surplus de +300 kcal est recommandé.',
      },
      {
        heading: 'Athlète (PAL élevé)',
        content: 'Pour les athlètes, l\'ajustement se fait principalement via le niveau d\'activité physique (NAP). Le cas particulier « Athlète » n\'ajoute pas de calories supplémentaires par défaut mais permet au nutritionniste d\'ajuster manuellement.',
      },
    ],
  },
  goal: {
    title: 'Objectifs caloriques',
    sections: [
      {
        heading: 'Perte de poids (−500 kcal)',
        content:
          'Un déficit de 500 kcal/jour correspond à une perte d\'environ 0.5 kg par semaine (3 500 kcal ≈ 0.5 kg de graisse).\n\n' +
          'Un déficit modéré est recommandé pour préserver la masse musculaire et assurer une perte durable. Ne pas descendre en dessous de 1 200 kcal/jour (femmes) ou 1 500 kcal/jour (hommes) sans supervision.',
      },
      {
        heading: 'Maintien (0 kcal)',
        content: 'Les calories cibles correspondent exactement à la Dépense Énergétique Totale (DET). L\'objectif est de maintenir le poids stable.',
      },
      {
        heading: 'Prise de poids (+300 kcal)',
        content:
          'Un surplus modéré de 300 kcal/jour favorise une prise de poids progressive, principalement sous forme de masse musculaire lorsqu\'il est combiné à un entraînement en résistance.\n\n' +
          'Un surplus trop important favorise le stockage adipeux.',
      },
      {
        heading: 'Ajustement personnalisé',
        content: 'Le curseur permet d\'ajuster l\'objectif calorique de −1000 à +1000 kcal. Les valeurs par défaut (−500, 0, +300) sont des recommandations standards mais le nutritionniste peut les adapter au profil du patient.',
      },
    ],
  },
};

function FormulaInfoModal({
  topic,
  onClose,
}: {
  topic: FormulaInfoTopic;
  onClose: () => void;
}) {
  const info = FORMULA_INFO[topic];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='fixed inset-0 bg-black/40' onClick={onClose} />
      <div className='relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
            <Info className='w-4 h-4 text-[#1B998B]' />
            {info.title}
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Content */}
        <div className='overflow-y-auto px-6 py-4 space-y-4'>
          {info.sections.map((section, i) => (
            <div key={i} className='space-y-1.5'>
              <h4 className='text-sm font-medium text-gray-800'>{section.heading}</h4>
              <p className='text-xs text-gray-500 whitespace-pre-line leading-relaxed'>
                {section.content}
              </p>
              {i < info.sections.length - 1 && <div className='border-b border-gray-100 pt-2' />}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className='px-6 py-3 border-t border-gray-100'>
          <button
            type='button'
            onClick={onClose}
            className='w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 2: Calculation & Activity
// ============================================================================

function Step2LivePreview({ calculationInput }: { calculationInput: CalculationInput | null }) {
  const result = useMemo(() => {
    if (!calculationInput) return null;
    try {
      return calcProfile(calculationInput);
    } catch {
      return null;
    }
  }, [calculationInput]);

  const bmi = useMemo(() => {
    if (!calculationInput?.weight_kg || !calculationInput?.height_cm) return null;
    return calculateBMI(calculationInput.weight_kg, calculationInput.height_cm);
  }, [calculationInput?.weight_kg, calculationInput?.height_cm]);

  const goalKcal = calculationInput
    ? (calculationInput.goal_adjustment_kcal ?? GOAL_ADJUSTMENTS[calculationInput.goal]?.kcal ?? 0)
    : 0;
  const specialDefaultKcal = calculationInput
    ? (SPECIAL_CASE_ADJUSTMENTS[calculationInput.special_case]?.kcal ?? 0)
    : 0;
  const specialKcal = calculationInput
    ? (calculationInput.special_case_adjustment_kcal ?? specialDefaultKcal)
    : 0;

  if (!result) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6 text-center'>
        <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2'>
          <Calculator className='w-5 h-5 text-gray-300' />
        </div>
        <p className='text-xs text-gray-400'>
          Complétez les données patient (étape 1) pour voir le calcul en temps réel.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4 sticky top-4'>
      <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
        <Calculator className='w-4 h-4 text-[#1B998B]' />
        Calcul en direct
      </h3>

      {/* BMI reminder */}
      {bmi !== null && (
        <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-gray-800'>IMC</p>
            <span className='text-sm font-semibold text-gray-800'>{bmi} kg/m²</span>
          </div>
        </div>
      )}

      {/* BMR */}
      <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5 space-y-1'>
        <div className='flex items-center justify-between'>
          <p className='text-sm font-medium text-gray-800'>Métabolisme de Base (MB)</p>
          <span className='text-sm font-semibold text-gray-800'>
            {result.bmr.toLocaleString('fr-FR')} kcal
          </span>
        </div>
        <p className='text-xs text-gray-500'>
          {BMR_FORMULAS[calculationInput!.bmr_formula]?.label}
        </p>
      </div>

      {/* TDEE */}
      <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5 space-y-1'>
        <div className='flex items-center justify-between'>
          <p className='text-sm font-medium text-gray-800'>Dépense Énergétique Totale (DET)</p>
          <span className='text-sm font-semibold text-gray-800'>
            {result.tdee.toLocaleString('fr-FR')} kcal
          </span>
        </div>
        <p className='text-xs text-gray-500'>
          MB x {ACTIVITY_LEVELS[calculationInput!.activity_level]?.factor} ({ACTIVITY_LEVELS[calculationInput!.activity_level]?.label})
        </p>
      </div>

      {/* Adjustments breakdown */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-gray-500'>Ajustement objectif</span>
          <span className={`text-sm font-medium ${goalKcal < 0 ? 'text-blue-600' : goalKcal > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
            {goalKcal > 0 ? '+' : ''}{goalKcal} kcal
          </span>
        </div>
        {calculationInput!.special_case !== 'none' && (
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-500'>Cas particulier</span>
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

    </div>
  );
}

function Step2Calculation({
  form,
  updateField,
  calculationInput,
}: {
  form: FormState;
  updateField: (field: keyof FormState, value: string) => void;
  calculationInput: CalculationInput | null;
}) {
  const [infoModal, setInfoModal] = useState<FormulaInfoTopic | null>(null);
  const formulaEntries = Object.entries(BMR_FORMULAS) as [BmrFormula, (typeof BMR_FORMULAS)[BmrFormula]][];
  const activityEntries = Object.entries(ACTIVITY_LEVELS) as [ActivityLevel, (typeof ACTIVITY_LEVELS)[ActivityLevel]][];
  const goalEntries = Object.entries(GOAL_ADJUSTMENTS) as [ProfileGoal, (typeof GOAL_ADJUSTMENTS)[ProfileGoal]][];
  const specialEntries = Object.entries(SPECIAL_CASE_ADJUSTMENTS) as [SpecialCase, (typeof SPECIAL_CASE_ADJUSTMENTS)[SpecialCase]][];

  return (
    <div className='space-y-6'>
      {infoModal && <FormulaInfoModal topic={infoModal} onClose={() => setInfoModal(null)} />}

      {/* BMR Formula */}
      <div className='space-y-3'>
        <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
          <Calculator className='w-4 h-4 text-[#1B998B]' />
          Formule du Métabolisme de Base (MB)
          <button type='button' onClick={() => setInfoModal('bmr')} className='p-0.5 text-gray-400 hover:text-[#1B998B] transition-colors'>
            <Info className='w-4 h-4' />
          </button>
        </h3>
        <div className='space-y-2'>
          {formulaEntries.map(([key, formula]) => (
            <button
              key={key}
              type='button'
              onClick={() => updateField('bmr_formula', key)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                form.bmr_formula === key
                  ? 'border-[#1B998B] bg-emerald-50/50 ring-1 ring-[#1B998B]'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className='flex items-center gap-3'>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    form.bmr_formula === key
                      ? 'border-[#1B998B] bg-[#1B998B]'
                      : 'border-gray-300'
                  }`}
                >
                  {form.bmr_formula === key && <Check className='w-3 h-3 text-white' />}
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-800'>{formula.label}</p>
                  <p className='text-xs text-gray-500'>{formula.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Activity Level */}
      <div className='space-y-3'>
        <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
          Niveau d&apos;activité
          <button type='button' onClick={() => setInfoModal('activity')} className='p-0.5 text-gray-400 hover:text-[#1B998B] transition-colors'>
            <Info className='w-4 h-4' />
          </button>
        </h3>
        <div className='space-y-2'>
          {activityEntries.map(([key, level]) => (
            <button
              key={key}
              type='button'
              onClick={() => updateField('activity_level', key)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                form.activity_level === key
                  ? 'border-[#1B998B] bg-emerald-50/50 ring-1 ring-[#1B998B]'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      form.activity_level === key
                        ? 'border-[#1B998B] bg-[#1B998B]'
                        : 'border-gray-300'
                    }`}
                  >
                    {form.activity_level === key && <Check className='w-3 h-3 text-white' />}
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-800'>{level.label}</p>
                    <p className='text-xs text-gray-500'>{level.description}</p>
                  </div>
                </div>
                <span className='text-xs text-gray-400 font-mono'>x{level.factor}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Special case */}
      <SpecialCaseDropdown
        value={form.special_case}
        entries={specialEntries}
        customKcal={form.special_case_adjustment_kcal}
        onChange={(val) => updateField('special_case', val)}
        onKcalChange={(val) => updateField('special_case_adjustment_kcal', val)}
        onInfoClick={() => setInfoModal('special')}
      />

      {/* Goal */}
      <div className='space-y-3'>
        <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
          Objectif
          <button type='button' onClick={() => setInfoModal('goal')} className='p-0.5 text-gray-400 hover:text-[#1B998B] transition-colors'>
            <Info className='w-4 h-4' />
          </button>
        </h3>
        <div className='grid grid-cols-3 gap-3'>
          {goalEntries.map(([key, goal]) => (
            <button
              key={key}
              type='button'
              onClick={() => {
                updateField('goal', key);
                updateField('goal_adjustment_kcal', String(goal.kcal));
              }}
              className={`px-4 py-3 rounded-xl border text-center transition-all ${
                form.goal === key
                  ? 'border-[#1B998B] bg-emerald-50/50 ring-1 ring-[#1B998B]'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <p className='text-sm font-medium text-gray-800'>{goal.label}</p>
            </button>
          ))}
        </div>

        {/* Caloric adjustment slider */}
        {(() => {
          const currentKcal = form.goal_adjustment_kcal
            ? parseInt(form.goal_adjustment_kcal)
            : GOAL_ADJUSTMENTS[form.goal]?.kcal ?? 0;
          const isDefault = currentKcal === (GOAL_ADJUSTMENTS[form.goal]?.kcal ?? 0);
          return (
            <div className='space-y-2 pt-1'>
              <div className='flex items-center justify-between'>
                <label className='text-sm text-gray-600'>
                  Ajustement calorique
                </label>
                <span className={`text-sm font-semibold tabular-nums ${
                  currentKcal < 0 ? 'text-blue-600' : currentKcal > 0 ? 'text-orange-600' : 'text-gray-700'
                }`}>
                  {currentKcal > 0 ? '+' : ''}{currentKcal} kcal
                  {isDefault && (
                    <span className='text-xs font-normal text-gray-400 ml-1'>(défaut)</span>
                  )}
                </span>
              </div>
              <input
                type='range'
                min={-1000}
                max={1000}
                step={50}
                value={currentKcal}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateField('goal_adjustment_kcal', e.target.value);
                  // Sync goal button with slider direction
                  if (val === 0) updateField('goal', 'maintain');
                  else if (val < 0 && form.goal !== 'lose') updateField('goal', 'lose');
                  else if (val > 0 && form.goal !== 'gain') updateField('goal', 'gain');
                }}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B998B]'
              />
              <div className='flex justify-between text-[10px] text-gray-400'>
                <span>-1000</span>
                <span>0</span>
                <span>+1000</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ============================================================================
// Step 3: Calorie Summary Side Card
// ============================================================================

function Step3CalorieSummary({
  calculationInput,
  proteinPct,
  carbsPct,
  fatPct,
}: {
  calculationInput: CalculationInput | null;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}) {
  const result = useMemo(() => {
    if (!calculationInput) return null;
    try {
      return calcProfile(calculationInput);
    } catch {
      return null;
    }
  }, [calculationInput]);

  if (!result) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6 text-center flex-1'>
        <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2'>
          <Target className='w-5 h-5 text-gray-300' />
        </div>
        <p className='text-xs text-gray-400'>
          Complétez les étapes précédentes pour voir le résumé calorique.
        </p>
      </div>
    );
  }

  const proteinG = Math.round((result.targetCalories * proteinPct / 100) / 4);
  const carbsG = Math.round((result.targetCalories * carbsPct / 100) / 4);
  const fatG = Math.round((result.targetCalories * fatPct / 100) / 9);
  const sum = proteinPct + carbsPct + fatPct;

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4 flex-1'>
      <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
        <Target className='w-4 h-4 text-[#1B998B]' />
        Résumé calorique
      </h3>

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
      <div className='space-y-2'>
        <p className='text-sm font-medium text-gray-800'>Répartition en grammes</p>
        <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-500 flex items-center gap-1.5'>
              <span className='w-2 h-2 rounded-full bg-blue-500' />
              Protéines
            </span>
            <span className='text-sm font-semibold text-gray-800'>{proteinPct}% · {proteinG}g</span>
          </div>
        </div>
        <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-500 flex items-center gap-1.5'>
              <span className='w-2 h-2 rounded-full bg-amber-500' />
              Glucides
            </span>
            <span className='text-sm font-semibold text-gray-800'>{carbsPct}% · {carbsG}g</span>
          </div>
        </div>
        <div className='bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-500 flex items-center gap-1.5'>
              <span className='w-2 h-2 rounded-full bg-rose-500' />
              Lipides
            </span>
            <span className='text-sm font-semibold text-gray-800'>{fatPct}% · {fatG}g</span>
          </div>
        </div>
      </div>

      {/* Sum check */}
      {sum !== 100 && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
          sum > 100 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
        }`}>
          <AlertCircle className='w-3.5 h-3.5 shrink-0' />
          {sum > 100 ? `Dépassement de ${sum - 100}%` : `Il reste ${100 - sum}%`}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Step 5: Finalization
// ============================================================================

function Step5Finalization({
  form,
  updateField,
  fieldErrors,
}: {
  form: FormState;
  updateField: (field: keyof FormState, value: string) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className='space-y-4'>
      <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
        <FileText className='w-4 h-4 text-[#1B998B]' />
        Finalisation
      </h3>

      <div>
        <label className='block text-sm text-gray-600 mb-1'>Nom du profil *</label>
        <input
          type='text'
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder='ex: Profil perte de poids - Phase 1'
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm ${
            fieldErrors.name ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-[#1B998B]'
          }`}
        />
        <FieldError error={fieldErrors.name} />
      </div>

      <div>
        <label className='block text-sm text-gray-600 mb-1'>Notes <span className='text-xs text-gray-400'>(max 2000 car.)</span></label>
        <textarea
          value={form.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={3}
          placeholder='Notes visibles par le patient...'
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm resize-none ${
            fieldErrors.notes ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-[#1B998B]'
          }`}
        />
        <FieldError error={fieldErrors.notes} />
      </div>

      <div className='bg-red-50 rounded-xl border border-red-100 p-4 space-y-2'>
        <label className='flex items-center gap-2 text-sm font-medium text-red-700'>
          Notes privées
          <span className='text-xs font-normal text-red-500'>(non visibles par le patient)</span>
        </label>
        <textarea
          value={form.private_notes}
          onChange={(e) => updateField('private_notes', e.target.value)}
          rows={3}
          placeholder='Notes confidentielles...'
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm resize-none bg-white ${
            fieldErrors.private_notes ? 'border-red-200 focus:ring-red-300' : 'border-red-200 focus:ring-red-300'
          }`}
        />
        <FieldError error={fieldErrors.private_notes} />
      </div>

    </div>
  );
}

// ============================================================================
// Main Form Component
// ============================================================================

export function NutritionalProfileForm({
  patientId,
  patientName,
  editProfileId,
  onClose,
  onSuccess,
}: NutritionalProfileFormProps) {
  const isEditing = !!editProfileId;
  const createMutation = useCreateNutritionalProfile(patientId);
  const updateMutation = useUpdateNutritionalProfile(patientId);

  // Load detail if editing to populate form
  const { data: editProfile } = useNutritionalProfile(
    isEditing ? patientId : null,
    editProfileId || null
  );

  // Load prefill data when creating a new profile
  const { data: prefillData, isLoading: isPrefillLoading } = useNutritionalProfilePrefill(
    !isEditing ? patientId : null
  );

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ ...defaultFormState });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'draft' | 'active' | null>(null);

  // Populate form when editing and detail is loaded
  useEffect(() => {
    if (isEditing && editProfile) {
      setForm({
        weight_kg: editProfile.weight_kg.toString(),
        height_cm: editProfile.height_cm.toString(),
        age: editProfile.age.toString(),
        gender: editProfile.gender,
        body_fat_pct: editProfile.body_fat_pct?.toString() || '',
        bmr_formula: editProfile.bmr_formula,
        activity_level: editProfile.activity_level,
        goal: editProfile.goal,
        goal_adjustment_kcal: editProfile.goal_adjustment_kcal?.toString() || '',
        special_case: editProfile.special_case,
        special_case_adjustment_kcal: editProfile.special_case_adjustment_kcal?.toString() || '',
        macro_template: editProfile.macro_template,
        protein_pct: editProfile.protein_pct,
        carbs_pct: editProfile.carbs_pct,
        fat_pct: editProfile.fat_pct,
        micro_targets: editProfile.micro_targets,
        name: editProfile.name,
        notes: editProfile.notes || '',
        private_notes: editProfile.private_notes || '',
        status: editProfile.status,
      });
    }
  }, [isEditing, editProfile]);

  // Pre-fill form with patient data when creating
  useEffect(() => {
    if (!isEditing && prefillData?.prefill && !prefillApplied) {
      const pf = prefillData.prefill;
      const goal = (pf.goal as ProfileGoal) || undefined;
      // Set default kcal adjustment matching the goal
      const goalKcal = goal ? GOAL_ADJUSTMENTS[goal]?.kcal : undefined;
      setForm((prev) => ({
        ...prev,
        weight_kg: pf.weight_kg ? pf.weight_kg.toString() : prev.weight_kg,
        height_cm: pf.height_cm ? pf.height_cm.toString() : prev.height_cm,
        age: pf.age ? pf.age.toString() : prev.age,
        gender: pf.gender || prev.gender,
        body_fat_pct: pf.body_fat_pct ? pf.body_fat_pct.toString() : prev.body_fat_pct,
        activity_level: (pf.activity_level as ActivityLevel) || prev.activity_level,
        goal: goal || prev.goal,
        goal_adjustment_kcal: goalKcal !== undefined ? String(goalKcal) : prev.goal_adjustment_kcal,
      }));
      setPrefillApplied(true);
    }
  }, [isEditing, prefillData, prefillApplied]);

  const updateField = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
    // Inline field validation
    const error = validateFieldValue(field, value);
    setFieldErrors((prev) => {
      if (error) return { ...prev, [field]: error };
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const updateMacros = useCallback((protein: number, carbs: number, fat: number) => {
    setForm((prev) => ({ ...prev, protein_pct: protein, carbs_pct: carbs, fat_pct: fat }));
    setFormError(null);
  }, []);

  const updateMacroTemplate = useCallback((template: string | null) => {
    setForm((prev) => ({ ...prev, macro_template: template }));
  }, []);

  const updateMicroTargets = useCallback((targets: MicroTargets | null) => {
    setForm((prev) => ({ ...prev, micro_targets: targets }));
    // Validate all micro fields
    if (targets) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(MICRO_CONSTRAINTS)) {
          const val = targets[key as keyof MicroTargets];
          if (val != null) {
            const err = validateMicroField(key, val);
            if (err) next[`micro_${key}`] = err;
            else delete next[`micro_${key}`];
          } else {
            delete next[`micro_${key}`];
          }
        }
        return next;
      });
    } else {
      // Clear all micro errors
      setFieldErrors((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(MICRO_CONSTRAINTS)) {
          delete next[`micro_${key}`];
        }
        return next;
      });
    }
  }, []);

  // BMR formula requires body fat?
  const bmrRequiresBodyFat = BMR_FORMULAS[form.bmr_formula]?.requiresBodyFat ?? false;

  // Build calculation input for preview
  const calculationInput: CalculationInput | null = useMemo(() => {
    const weight = parseFloat(form.weight_kg);
    const height = parseFloat(form.height_cm);
    const age = parseInt(form.age);
    if (!weight || !height || !age) return null;
    if (form.bmr_formula === 'katch_mcardle' && !form.body_fat_pct) return null;

    return {
      weight_kg: weight,
      height_cm: height,
      age,
      gender: form.gender,
      body_fat_pct: form.body_fat_pct ? parseFloat(form.body_fat_pct) : null,
      bmr_formula: form.bmr_formula,
      activity_level: form.activity_level,
      goal: form.goal,
      goal_adjustment_kcal: form.goal_adjustment_kcal ? parseInt(form.goal_adjustment_kcal) : undefined,
      special_case: form.special_case,
      special_case_adjustment_kcal: form.special_case_adjustment_kcal !== '' ? parseInt(form.special_case_adjustment_kcal) : undefined,
      protein_pct: form.protein_pct,
      carbs_pct: form.carbs_pct,
      fat_pct: form.fat_pct,
    };
  }, [form]);

  // Target calories for macro gram calculation
  const targetCalories = useMemo(() => {
    if (!calculationInput) return null;
    try {
      const result = calcProfile(calculationInput);
      return result.targetCalories;
    } catch {
      return null;
    }
  }, [calculationInput]);

  // Step validation
  function validateStep(s: number): string | null {
    switch (s) {
      case 1: {
        if (!form.weight_kg || parseFloat(form.weight_kg) <= 0)
          return 'Le poids est requis';
        if (!form.height_cm || parseFloat(form.height_cm) <= 0)
          return 'La taille est requise';
        if (!form.age || parseInt(form.age) <= 0) return 'L\'âge est requis';
        if (bmrRequiresBodyFat && (!form.body_fat_pct || parseFloat(form.body_fat_pct) <= 0))
          return 'Le taux de masse grasse est requis pour la formule Katch-McArdle';
        // Check inline field errors for step 1
        const step1Fields = ['weight_kg', 'height_cm', 'age', 'body_fat_pct'];
        for (const f of step1Fields) {
          if (fieldErrors[f]) return fieldErrors[f];
        }
        return null;
      }
      case 2:
        return null; // All fields have defaults
      case 3: {
        const sum = form.protein_pct + form.carbs_pct + form.fat_pct;
        if (sum !== 100)
          return `La somme des macros doit être 100% (actuellement ${sum}%)`;
        return null;
      }
      case 4: {
        // Check for any micro field errors
        const microErrors = Object.keys(fieldErrors).filter(k => k.startsWith('micro_'));
        if (microErrors.length > 0) return 'Certaines valeurs de micronutriments sont hors limites. Veuillez les corriger.';
        return null;
      }
      case 5: {
        if (!form.name.trim()) return 'Le nom du profil est requis';
        const step5Fields = ['name', 'notes', 'private_notes'];
        for (const f of step5Fields) {
          if (fieldErrors[f]) return fieldErrors[f];
        }
        return null;
      }
      default:
        return null;
    }
  }

  function handleNext() {
    const error = validateStep(step);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);
    setStep((prev) => Math.min(prev + 1, 5));
  }

  function handlePrev() {
    setFormError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  }

  function handleRequestSubmit(status: 'draft' | 'active') {
    // Validate all steps before showing confirmation
    for (let s = 1; s <= 5; s++) {
      const err = validateStep(s);
      if (err) {
        setFormError(err);
        setStep(s);
        return;
      }
    }
    setFormError(null);
    setConfirmAction(status);
  }

  async function handleSubmit(statusOverride?: ProfileStatus) {
    const status = statusOverride || (form.status as ProfileStatus);

    // Validate all steps
    for (let s = 1; s <= 5; s++) {
      const err = validateStep(s);
      if (err) {
        setFormError(err);
        setStep(s);
        return;
      }
    }

    const payload: CreateNutritionalProfilePayload = {
      name: form.name.trim(),
      status,
      weight_kg: parseFloat(form.weight_kg),
      height_cm: parseFloat(form.height_cm),
      age: parseInt(form.age),
      gender: form.gender,
      body_fat_pct: form.body_fat_pct ? parseFloat(form.body_fat_pct) : null,
      bmr_formula: form.bmr_formula,
      activity_level: form.activity_level,
      goal: form.goal,
      goal_adjustment_kcal: form.goal_adjustment_kcal
        ? parseInt(form.goal_adjustment_kcal)
        : undefined,
      special_case: form.special_case,
      special_case_adjustment_kcal: form.special_case_adjustment_kcal !== ''
        ? parseInt(form.special_case_adjustment_kcal)
        : undefined,
      macro_template: form.macro_template,
      protein_pct: form.protein_pct,
      carbs_pct: form.carbs_pct,
      fat_pct: form.fat_pct,
      micro_targets: form.micro_targets,
      notes: form.notes.trim() || null,
      private_notes: form.private_notes.trim() || null,
    };

    try {
      if (isEditing && editProfileId) {
        await updateMutation.mutateAsync({
          profileId: editProfileId,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      const action = isEditing ? 'updated' : status === 'active' ? 'created_active' : 'created_draft';
      onSuccess(action);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      );
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-gray-800'>
            {isEditing ? 'Modifier le profil' : 'Nouveau profil nutritionnel'}
          </h2>
          <p className='text-sm text-gray-500'>Patient : {patientName}</p>
        </div>
        <button
          onClick={onClose}
          className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors'
        >
          Annuler
        </button>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Step content */}
      {step === 1 && !isEditing && isPrefillLoading ? (
        <div className='bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center'>
          <Loader2 className='w-8 h-8 text-[#1B998B] animate-spin mb-4' />
          <p className='text-sm font-medium text-gray-700'>Chargement des données patient…</p>
          <p className='text-xs text-gray-400 mt-1'>Récupération depuis le dossier et l&apos;anamnèse</p>
        </div>
      ) : step === 1 ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch'>
          <div className='lg:col-span-2 flex'>
            <div className='bg-white rounded-xl border border-gray-200 p-6 flex-1'>
              <Step1PatientData
                form={form}
                updateField={updateField}
                bmrRequiresBodyFat={bmrRequiresBodyFat}
                prefillSources={!isEditing ? prefillData?.sources : null}
                fieldErrors={fieldErrors}
              />
            </div>
          </div>
          <div className='lg:col-span-1 flex'>
            <Step1ReperesCard
              form={form}
              updateField={updateField}
              referenceWeights={!isEditing ? prefillData?.referenceWeights : null}
            />
          </div>
        </div>
      ) : step === 2 ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6'>
            <Step2Calculation form={form} updateField={updateField} calculationInput={calculationInput} />
          </div>
          <div className='lg:col-span-1'>
            <Step2LivePreview calculationInput={calculationInput} />
          </div>
        </div>
      ) : step === 3 ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch'>
          <div className='lg:col-span-2 flex'>
            <MacroDistributionInput
              proteinPct={form.protein_pct}
              carbsPct={form.carbs_pct}
              fatPct={form.fat_pct}
              onChange={updateMacros}
              macroTemplate={form.macro_template}
              onTemplateChange={updateMacroTemplate}
              targetCalories={targetCalories}
              className='flex-1'
            />
          </div>
          <div className='lg:col-span-1 flex'>
            <Step3CalorieSummary
              calculationInput={calculationInput}
              proteinPct={form.protein_pct}
              carbsPct={form.carbs_pct}
              fatPct={form.fat_pct}
            />
          </div>
        </div>
      ) : step === 5 ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch'>
          <div className='lg:col-span-2 flex'>
            <CalculationPreview input={calculationInput} microTargets={form.micro_targets} />
          </div>
          <div className='lg:col-span-1 flex'>
            <div className='bg-white rounded-xl border border-gray-200 p-6 flex-1'>
              <Step5Finalization
                form={form}
                updateField={updateField}
                fieldErrors={fieldErrors}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          {step === 4 && (
            <MicroTargetsEditor
              value={form.micro_targets}
              onChange={updateMicroTargets}
              fieldErrors={fieldErrors}
            />
          )}
        </div>
      )}

      {/* Error */}
      {formError && (
        <div className='flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3'>
          <AlertCircle className='w-4 h-4 shrink-0' />
          <p className='text-sm'>{formError}</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className='flex items-center justify-between'>
        <button
          type='button'
          onClick={step === 1 ? onClose : handlePrev}
          className='flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
        >
          <ArrowLeft className='w-4 h-4' />
          {step === 1 ? 'Annuler' : 'Précédent'}
        </button>

        {step < 5 ? (
          <button
            type='button'
            onClick={handleNext}
            className='flex items-center gap-2 px-5 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium'
          >
            Suivant
            <ArrowRight className='w-4 h-4' />
          </button>
        ) : isEditing ? (
          <button
            type='button'
            onClick={() => handleSubmit()}
            disabled={isPending}
            className='flex items-center gap-2 px-5 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
          >
            {isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Save className='w-4 h-4' />
            )}
            Enregistrer les modifications
          </button>
        ) : (
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => handleRequestSubmit('draft')}
              disabled={isPending}
              className='flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium disabled:opacity-50'
            >
              {isPending && confirmAction === 'draft' ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Save className='w-4 h-4' />
              )}
              Enregistrer en brouillon
            </button>
            <button
              type='button'
              onClick={() => handleRequestSubmit('active')}
              disabled={isPending}
              className='flex items-center gap-2 px-5 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
            >
              {isPending && confirmAction === 'active' ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Play className='w-4 h-4' />
              )}
              Créer et activer le profil
            </button>
          </div>
        )}
      </div>

      {/* Confirmation modal — Draft */}
      {confirmAction === 'draft' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6'>
            <div className='flex items-center justify-center w-12 h-12 bg-amber-50 rounded-full mx-auto mb-4'>
              <Save className='w-6 h-6 text-amber-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-800 text-center mb-2'>
              Enregistrer en brouillon ?
            </h3>
            <p className='text-sm text-gray-500 text-center mb-6'>
              Le profil sera sauvegardé en tant que <span className='font-medium text-amber-700'>brouillon</span>.
              Il ne sera pas visible par le patient. Vous pourrez le modifier et l&apos;activer ultérieurement depuis la liste des profils.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setConfirmAction(null)}
                className='flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setConfirmAction(null);
                  handleSubmit('draft');
                }}
                disabled={isPending}
                className='flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium disabled:opacity-50'
              >
                {isPending ? <Loader2 className='w-4 h-4 animate-spin mx-auto' /> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal — Activate */}
      {confirmAction === 'active' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6'>
            <div className='flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-full mx-auto mb-4'>
              <Play className='w-6 h-6 text-[#1B998B]' />
            </div>
            <h3 className='text-lg font-semibold text-gray-800 text-center mb-2'>
              Créer et activer le profil ?
            </h3>
            <p className='text-sm text-gray-500 text-center mb-6'>
              Le profil sera créé et <span className='font-medium text-emerald-700'>activé immédiatement</span>.
              Le patient pourra le consulter dès maintenant. Si un profil actif existe déjà, il sera automatiquement archivé.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setConfirmAction(null)}
                className='flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setConfirmAction(null);
                  handleSubmit('active');
                }}
                disabled={isPending}
                className='flex-1 px-4 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
              >
                {isPending ? <Loader2 className='w-4 h-4 animate-spin mx-auto' /> : 'Confirmer et activer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
