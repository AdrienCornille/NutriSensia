'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Loader2,
  ArrowRight,
  Save,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Leaf,
  AlertCircle,
  Calendar,
  Check,
  UtensilsCrossed,
  Info,
} from 'lucide-react';
import {
  useCreateMealPlan,
  useUpdateMealPlan,
  usePatientMealPlan,
} from '@/hooks/useNutritionistMealPlans';
import { useActiveNutritionalProfileForPatient } from '@/hooks/useNutritionistNutritionalProfiles';
import { mapProfileToFormTargets } from '@/lib/meal-plan-profile-mapper';
import type { MealPlanSummary, NutritionalTargets, MealType } from '@/types/nutritionist-dossier';

// ============================================================================
// Constants
// ============================================================================

const MEAL_TYPE_OPTIONS: { type: MealType; label: string; icon: string }[] = [
  { type: 'breakfast', label: 'Petit-déjeuner', icon: '\u{1F305}' },
  { type: 'morning_snack', label: 'Collation du matin', icon: '\u{1F950}' },
  { type: 'lunch', label: 'Déjeuner', icon: '\u{2600}\u{FE0F}' },
  { type: 'afternoon_snack', label: 'Collation après-midi', icon: '\u{1F34E}' },
  { type: 'dinner', label: 'Dîner', icon: '\u{1F319}' },
  { type: 'evening_snack', label: 'Collation du soir', icon: '\u{1F375}' },
];

const DEFAULT_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

const DURATION_PRESETS = [
  { weeks: 1, label: '1 semaine' },
  { weeks: 2, label: '2 semaines' },
  { weeks: 3, label: '3 semaines' },
  { weeks: 4, label: '4 semaines' },
];

// ============================================================================
// Types
// ============================================================================

interface MealPlanFormProps {
  patientId: string;
  patientName: string;
  /** If provided, we're editing an existing plan */
  editPlan?: MealPlanSummary | null;
  onClose: () => void;
  onSuccess: () => void;
  /** Called after creation with the new plan - used to navigate to the editor */
  onCreated?: (plan: MealPlanSummary) => void;
}

interface FormData {
  name: string;
  objective: string;
  description: string;
  start_date: string;
  end_date: string;
  notes: string;
  meal_types: MealType[];
  duration_weeks: number | null; // null = personnalisé
  targets: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sodium: string;
  };
}

const defaultTargets = {
  calories: '2000',
  protein: '100',
  carbs: '250',
  fat: '70',
  fiber: '30',
  sodium: '',
};

// ============================================================================
// Target Input Component
// ============================================================================

function TargetInput({
  icon,
  label,
  unit,
  value,
  onChange,
  color,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  unit: string;
  value: string;
  onChange: (val: string) => void;
  color: string;
  placeholder?: string;
}) {
  return (
    <div className='flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3'>
      <div className={`${color} shrink-0`}>{icon}</div>
      <div className='flex-1'>
        <label className='text-xs text-gray-500 block'>{label}</label>
        <div className='flex items-center gap-1'>
          <input
            type='number'
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || '0'}
            className='w-20 bg-transparent text-sm font-medium text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          />
          <span className='text-xs text-gray-400'>{unit}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Form
// ============================================================================

export function MealPlanForm({
  patientId,
  patientName,
  editPlan,
  onClose,
  onSuccess,
  onCreated,
}: MealPlanFormProps) {
  const isEditing = !!editPlan;
  const createMutation = useCreateMealPlan(patientId);
  const updateMutation = useUpdateMealPlan(patientId);

  // Load detail if editing to get nutritional_targets + meal_types
  const { data: planDetail } = usePatientMealPlan(
    isEditing ? patientId : null,
    editPlan?.id || null
  );

  const today = new Date().toISOString().split('T')[0];
  const fourWeeksLater = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [form, setForm] = useState<FormData>({
    name: '',
    objective: '',
    description: '',
    start_date: today,
    end_date: fourWeeksLater,
    notes: '',
    meal_types: [...DEFAULT_MEAL_TYPES],
    duration_weeks: 4,
    targets: { ...defaultTargets },
  });

  // Fetch active nutritional profile (only for new plans)
  const {
    data: activeProfile,
    isLoading: profileLoading,
    hasActiveProfile,
  } = useActiveNutritionalProfileForPatient(!isEditing ? patientId : null);

  const [targetsFromProfile, setTargetsFromProfile] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && planDetail) {
      const targets = planDetail.nutritional_targets;
      // Detect duration from dates
      const start = new Date(planDetail.start_date);
      const end = new Date(planDetail.end_date);
      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const matchingPreset = DURATION_PRESETS.find(p => p.weeks * 7 === diffDays);

      // Map old 'snack' to 'afternoon_snack' for backwards compatibility
      const mealTypes = (planDetail.meal_types || DEFAULT_MEAL_TYPES).map(
        (t: string) => (t === 'snack' ? 'afternoon_snack' : t) as MealType
      );

      setForm({
        name: planDetail.name || '',
        objective: planDetail.objective || '',
        description: planDetail.description || '',
        start_date: planDetail.start_date || today,
        end_date: planDetail.end_date || fourWeeksLater,
        notes: planDetail.notes || '',
        meal_types: mealTypes,
        duration_weeks: matchingPreset ? matchingPreset.weeks : null,
        targets: {
          calories: targets?.calories?.toString() || defaultTargets.calories,
          protein: targets?.protein?.toString() || defaultTargets.protein,
          carbs: targets?.carbs?.toString() || defaultTargets.carbs,
          fat: targets?.fat?.toString() || defaultTargets.fat,
          fiber: targets?.fiber?.toString() || defaultTargets.fiber,
          sodium: targets?.sodium?.toString() || '',
        },
      });
    }
  }, [isEditing, planDetail, today, fourWeeksLater]);

  // Pre-fill targets from active nutritional profile (new plans only)
  useEffect(() => {
    if (isEditing || !activeProfile) return;
    const mapped = mapProfileToFormTargets(activeProfile);
    if (!mapped) return;
    setForm((prev) => ({ ...prev, targets: mapped }));
    setTargetsFromProfile(true);
  }, [isEditing, activeProfile]);

  // Auto-calculate end_date when duration_weeks or start_date changes
  useEffect(() => {
    if (form.duration_weeks && form.start_date) {
      const start = new Date(form.start_date);
      const end = new Date(start.getTime() + form.duration_weeks * 7 * 24 * 60 * 60 * 1000);
      setForm(prev => ({ ...prev, end_date: end.toISOString().split('T')[0] }));
    }
  }, [form.duration_weeks, form.start_date]);

  // Computed date range summary
  const dateRangeSummary = useMemo(() => {
    if (!form.start_date || !form.end_date) return null;
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return null;
    const startLabel = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    const endLabel = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `Du ${startLabel} au ${endLabel} (${diffDays} jour${diffDays > 1 ? 's' : ''})`;
  }, [form.start_date, form.end_date]);

  function updateField(field: keyof Omit<FormData, 'targets' | 'meal_types' | 'duration_weeks'>, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  }

  function updateTarget(field: keyof FormData['targets'], value: string) {
    setForm(prev => ({
      ...prev,
      targets: { ...prev.targets, [field]: value },
    }));
    if (targetsFromProfile) setTargetsFromProfile(false);
  }

  function toggleMealType(type: MealType) {
    setForm(prev => {
      const current = prev.meal_types;
      const isSelected = current.includes(type);
      // Don't allow deselecting the last one
      if (isSelected && current.length <= 1) return prev;
      return {
        ...prev,
        meal_types: isSelected
          ? current.filter(t => t !== type)
          : [...current, type],
      };
    });
    setFormError(null);
  }

  function selectDuration(weeks: number | null) {
    setForm(prev => ({ ...prev, duration_weeks: weeks }));
    setFormError(null);
  }

  function buildTargets(): NutritionalTargets | undefined {
    const cal = parseInt(form.targets.calories);
    const prot = parseFloat(form.targets.protein);
    const carbs = parseFloat(form.targets.carbs);
    const fat = parseFloat(form.targets.fat);

    if (isNaN(cal) || isNaN(prot) || isNaN(carbs) || isNaN(fat)) {
      return undefined;
    }

    return {
      calories: cal,
      protein: prot,
      carbs: carbs,
      fat: fat,
      fiber: form.targets.fiber ? parseFloat(form.targets.fiber) : null,
      sodium: form.targets.sodium ? parseFloat(form.targets.sodium) : null,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!form.name.trim()) {
      setFormError('Le nom du plan est requis');
      return;
    }
    if (form.meal_types.length === 0) {
      setFormError('Sélectionnez au moins un type de repas');
      return;
    }
    if (!form.start_date || !form.end_date) {
      setFormError('Les dates de début et de fin sont requises');
      return;
    }
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      setFormError('La date de fin doit être après la date de début');
      return;
    }

    const nutritionalTargets = buildTargets();

    try {
      if (isEditing && editPlan) {
        await updateMutation.mutateAsync({
          planId: editPlan.id,
          data: {
            name: form.name.trim(),
            objective: form.objective.trim() || null,
            description: form.description.trim() || null,
            start_date: form.start_date,
            end_date: form.end_date,
            nutritional_targets: nutritionalTargets || null,
            notes: form.notes.trim() || null,
            meal_types: form.meal_types,
          },
        });
        onSuccess();
      } else {
        const newPlan = await createMutation.mutateAsync({
          name: form.name.trim(),
          objective: form.objective.trim() || undefined,
          description: form.description.trim() || undefined,
          start_date: form.start_date,
          end_date: form.end_date,
          nutritional_targets: nutritionalTargets,
          notes: form.notes.trim() || undefined,
          meal_types: form.meal_types,
        });
        if (onCreated) {
          onCreated(newPlan);
        } else {
          onSuccess();
        }
      }
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
            {isEditing ? 'Modifier le plan' : 'Nouveau plan alimentaire'}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* General info */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
          <h3 className='text-sm font-medium text-gray-700'>
            Informations générales
          </h3>

          <div>
            <label className='block text-sm text-gray-600 mb-1'>
              Nom du plan *
            </label>
            <input
              type='text'
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder='ex: Plan perte de poids - Phase 1'
              className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent text-sm'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-600 mb-1'>
              Objectif
            </label>
            <input
              type='text'
              value={form.objective}
              onChange={e => updateField('objective', e.target.value)}
              placeholder='ex: Perte de poids progressive -5kg'
              className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent text-sm'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-600 mb-1'>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              rows={3}
              placeholder='Description du plan, contexte, particularités...'
              className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent text-sm resize-none'
            />
          </div>
        </div>

        {/* Meal types selection */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
          <div className='flex items-center gap-2'>
            <UtensilsCrossed className='w-4 h-4 text-[#1B998B]' />
            <h3 className='text-sm font-medium text-gray-700'>
              Types de repas
            </h3>
          </div>
          <p className='text-xs text-gray-500'>
            Sélectionnez les repas à inclure dans le plan alimentaire
          </p>

          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            {MEAL_TYPE_OPTIONS.map(option => {
              const isSelected = form.meal_types.includes(option.type);
              return (
                <button
                  key={option.type}
                  type='button'
                  onClick={() => toggleMealType(option.type)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#1B998B] bg-emerald-50/50 ring-1 ring-[#1B998B]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'border-[#1B998B] bg-[#1B998B]'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className='w-3 h-3 text-white' />}
                  </div>
                  <div className='min-w-0'>
                    <span className='text-sm font-medium text-gray-800'>
                      {option.icon} {option.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className='text-xs text-gray-400'>
            {form.meal_types.length} repas sélectionné{form.meal_types.length > 1 ? 's' : ''} par jour
          </p>
        </div>

        {/* Duration & dates */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-[#1B998B]' />
            <h3 className='text-sm font-medium text-gray-700'>
              Durée et dates
            </h3>
          </div>

          <div>
            <label className='block text-sm text-gray-600 mb-1'>
              Date de début *
            </label>
            <input
              type='date'
              value={form.start_date}
              onChange={e => updateField('start_date', e.target.value)}
              className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent text-sm'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-600 mb-2'>
              Durée du plan
            </label>
            <div className='flex flex-wrap gap-2'>
              {DURATION_PRESETS.map(preset => (
                <button
                  key={preset.weeks}
                  type='button'
                  onClick={() => selectDuration(preset.weeks)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.duration_weeks === preset.weeks
                      ? 'bg-[#1B998B] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type='button'
                onClick={() => selectDuration(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  form.duration_weeks === null
                    ? 'bg-[#1B998B] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Personnalisé
              </button>
            </div>
          </div>

          {/* Show end_date picker only in custom mode */}
          {form.duration_weeks === null && (
            <div>
              <label className='block text-sm text-gray-600 mb-1'>
                Date de fin *
              </label>
              <input
                type='date'
                value={form.end_date}
                onChange={e => updateField('end_date', e.target.value)}
                className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent text-sm'
              />
            </div>
          )}

          {/* Date range summary */}
          {dateRangeSummary && (
            <p className='text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2'>
              {dateRangeSummary}
            </p>
          )}
        </div>

        {/* Nutritional targets */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
          <h3 className='text-sm font-medium text-gray-700'>
            Objectifs nutritionnels journaliers
          </h3>

          {/* Profile banner */}
          {!isEditing && profileLoading && (
            <div className='flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3'>
              <Loader2 className='w-4 h-4 animate-spin text-gray-400 shrink-0' />
              <span className='text-sm text-gray-500'>Chargement du profil nutritionnel...</span>
            </div>
          )}
          {!isEditing && !profileLoading && hasActiveProfile && targetsFromProfile && (
            <div className='flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3'>
              <Info className='w-4 h-4 text-emerald-600 shrink-0' />
              <span className='text-sm text-emerald-700'>
                Valeurs pré-remplies depuis le profil nutritionnel actif
                <span className='font-medium'> &laquo; {activeProfile?.name} &raquo;</span>.
                Vous pouvez les modifier si nécessaire.
              </span>
            </div>
          )}
          {!isEditing && !profileLoading && hasActiveProfile && !targetsFromProfile && (
            <div className='flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3'>
              <Info className='w-4 h-4 text-amber-600 shrink-0' />
              <span className='text-sm text-amber-700'>
                Valeurs modifiées manuellement. Le profil actif suggérait
                {activeProfile?.calculated_calories != null && (
                  <span className='font-medium'> {Math.round(activeProfile.calculated_calories)} kcal</span>
                )}.
              </span>
            </div>
          )}
          {!isEditing && !profileLoading && !hasActiveProfile && (
            <div className='flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3'>
              <Info className='w-4 h-4 text-gray-400 shrink-0' />
              <span className='text-sm text-gray-500'>
                Aucun profil nutritionnel actif. Valeurs par défaut utilisées.
              </span>
            </div>
          )}

          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            <TargetInput
              icon={<Flame className='w-4 h-4' />}
              label='Calories'
              unit='kcal'
              value={form.targets.calories}
              onChange={v => updateTarget('calories', v)}
              color='text-orange-500'
            />
            <TargetInput
              icon={<Beef className='w-4 h-4' />}
              label='Protéines'
              unit='g'
              value={form.targets.protein}
              onChange={v => updateTarget('protein', v)}
              color='text-blue-500'
            />
            <TargetInput
              icon={<Wheat className='w-4 h-4' />}
              label='Glucides'
              unit='g'
              value={form.targets.carbs}
              onChange={v => updateTarget('carbs', v)}
              color='text-amber-500'
            />
            <TargetInput
              icon={<Droplets className='w-4 h-4' />}
              label='Lipides'
              unit='g'
              value={form.targets.fat}
              onChange={v => updateTarget('fat', v)}
              color='text-rose-500'
            />
            <TargetInput
              icon={<Leaf className='w-4 h-4' />}
              label='Fibres'
              unit='g'
              value={form.targets.fiber}
              onChange={v => updateTarget('fiber', v)}
              color='text-green-500'
              placeholder='Optionnel'
            />
            <TargetInput
              icon={<AlertCircle className='w-4 h-4' />}
              label='Sodium'
              unit='mg'
              value={form.targets.sodium}
              onChange={v => updateTarget('sodium', v)}
              color='text-gray-500'
              placeholder='Optionnel'
            />
          </div>
        </div>

        {/* Notes */}
        <div className='bg-red-50 rounded-xl border border-red-100 p-6 space-y-4'>
          <label className='flex items-center gap-2 text-sm font-medium text-red-700'>
            Notes internes
            <span className='text-xs font-normal text-red-500'>
              (non visibles par le patient)
            </span>
          </label>
          <textarea
            value={form.notes}
            onChange={e => updateField('notes', e.target.value)}
            rows={3}
            placeholder='Notes confidentielles pour votre usage personnel...'
            className='w-full px-4 py-2.5 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm resize-none bg-white'
          />
        </div>

        {/* Error */}
        {formError && (
          <div className='flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3'>
            <AlertCircle className='w-4 h-4 shrink-0' />
            <p className='text-sm'>{formError}</p>
          </div>
        )}

        {/* Actions */}
        <div className='flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
          >
            Annuler
          </button>
          <button
            type='submit'
            disabled={isPending}
            className='flex items-center gap-2 px-5 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
          >
            {isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : isEditing ? (
              <Save className='w-4 h-4' />
            ) : (
              <ArrowRight className='w-4 h-4' />
            )}
            {isEditing ? 'Enregistrer' : 'Planifier les repas'}
          </button>
        </div>
      </form>
    </div>
  );
}
