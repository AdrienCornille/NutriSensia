'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Loader2,
  AlertCircle,
  Settings,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  RefreshCw,
  BookmarkPlus,
  BookmarkMinus,
  ShoppingCart,
  ChevronDown,
  Check,
  X,
  AlertTriangle,
  Copy,
  GripVertical,
  TrendingUp,
  Pill,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MacroBadgesGrid, MacroInline } from '@/components/ui/MacroBadgesGrid';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  usePlanDays,
  usePatientMealPlan,
  useCreatePlanMeal,
  useAddFoodToMeal,
  useDeleteMealFood,
  useUpdateMealPlan,
  useUpdateMealFood,
  useReorderMealFoods,
  useFoodUnits,
  useCopyDayMeals,
  usePlanAdherence,
} from '@/hooks/useNutritionistMealPlans';
import type { FoodUnitOption } from '@/hooks/useNutritionistMealPlans';
import { FoodSearchModal } from './FoodSearchModal';
import { AlternativeModal } from './AlternativeModal';
import { ModificationRequestsBanner } from './ModificationRequestsBanner';
import { ShoppingListModal } from './ShoppingListModal';
import type { FoodAddPayload } from './FoodSearchModal';
import { decodeHtmlEntities } from '@/lib/utils';
import type { FoodUnit } from '@/lib/api-schemas';
import { Toast } from '@/components/suivi/shared/Toast';
import type { ToastType } from '@/components/suivi/shared/Toast';
import type { Micronutrient, NutrientStatus } from '@/types/meal-plan';
import { useActiveNutritionalProfileForPatient } from '@/hooks/useNutritionistNutritionalProfiles';
import type { MicroTargets } from '@/types/nutritional-profile';
import type {
  MealPlanSummary,
  MealPlanDay,
  MealPlanMeal,
  MealPlanFood,
  MealType,
  NutritionalTargets,
  FoodMicronutrientData,
} from '@/types/nutritionist-dossier';

// ============================================================================
// Constants
// ============================================================================

const MEAL_CONFIG: {
  type: MealType;
  label: string;
  icon: string;
  defaultTime: string;
}[] = [
  { type: 'breakfast', label: 'Petit-déjeuner', icon: '\u{1F305}', defaultTime: '07:30' },
  { type: 'morning_snack', label: 'Collation du matin', icon: '\u{1F950}', defaultTime: '10:00' },
  { type: 'lunch', label: 'Déjeuner', icon: '\u{2600}\u{FE0F}', defaultTime: '12:30' },
  { type: 'afternoon_snack', label: 'Collation après-midi', icon: '\u{1F34E}', defaultTime: '16:00' },
  { type: 'dinner', label: 'Dîner', icon: '\u{1F319}', defaultTime: '19:00' },
  { type: 'evening_snack', label: 'Collation du soir', icon: '\u{1F375}', defaultTime: '21:00' },
];

const UNIT_LABELS: Record<string, string> = {
  g: 'g',
  ml: 'ml',
  c_a_s: 'c.à.s.',
  c_a_c: 'c.à.c.',
  tasse: 'tasse',
  portion: 'portion',
  piece: 'pièce',
};

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Brouillon', bg: 'bg-amber-50', text: 'text-amber-700' },
  active: { label: 'Actif', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  paused: { label: 'En pause', bg: 'bg-gray-100', text: 'text-gray-600' },
  completed: { label: 'Terminé', bg: 'bg-blue-50', text: 'text-blue-700' },
  archived: { label: 'Archivé', bg: 'bg-gray-100', text: 'text-gray-500' },
};

interface MicronutrientCfg {
  key: keyof FoodMicronutrientData;
  profileKey: string; // key in MicroTargets from nutritional profile
  name: string;
  unit: string;
  defaultTarget: number;
}

interface MicronutrientCategory {
  label: string;
  icon: string;
  items: MicronutrientCfg[];
}

const MICRONUTRIENT_CATEGORIES: MicronutrientCategory[] = [
  {
    label: 'Vitamines',
    icon: '\u{1F48A}',
    items: [
      { key: 'vitamin_a', profileKey: 'vitamin_a_ug', name: 'Vitamine A', unit: 'µg', defaultTarget: 800 },
      { key: 'vitamin_c', profileKey: 'vitamin_c_mg', name: 'Vitamine C', unit: 'mg', defaultTarget: 90 },
      { key: 'vitamin_d', profileKey: 'vitamin_d_ug', name: 'Vitamine D', unit: 'µg', defaultTarget: 15 },
      { key: 'vitamin_e', profileKey: 'vitamin_e_mg', name: 'Vitamine E', unit: 'mg', defaultTarget: 15 },
      { key: 'vitamin_k', profileKey: 'vitamin_k_ug', name: 'Vitamine K', unit: 'µg', defaultTarget: 90 },
      { key: 'vitamin_b1', profileKey: 'vitamin_b1_mg', name: 'Vit. B1 (Thiamine)', unit: 'mg', defaultTarget: 1.2 },
      { key: 'vitamin_b2', profileKey: 'vitamin_b2_mg', name: 'Vit. B2 (Riboflavine)', unit: 'mg', defaultTarget: 1.3 },
      { key: 'vitamin_b3', profileKey: 'vitamin_b3_mg', name: 'Vit. B3 (Niacine)', unit: 'mg', defaultTarget: 16 },
      { key: 'vitamin_b6', profileKey: 'vitamin_b6_mg', name: 'Vitamine B6', unit: 'mg', defaultTarget: 1.3 },
      { key: 'vitamin_b9', profileKey: 'vitamin_b9_ug', name: 'Vit. B9 (Folate)', unit: 'µg', defaultTarget: 330 },
      { key: 'vitamin_b12', profileKey: 'vitamin_b12_ug', name: 'Vitamine B12', unit: 'µg', defaultTarget: 2.4 },
    ],
  },
  {
    label: 'Minéraux',
    icon: '\u{26CF}\u{FE0F}',
    items: [
      { key: 'calcium', profileKey: 'calcium_mg', name: 'Calcium', unit: 'mg', defaultTarget: 1000 },
      { key: 'iron', profileKey: 'iron_mg', name: 'Fer', unit: 'mg', defaultTarget: 18 },
      { key: 'magnesium', profileKey: 'magnesium_mg', name: 'Magnésium', unit: 'mg', defaultTarget: 400 },
      { key: 'phosphorus', profileKey: 'phosphorus_mg', name: 'Phosphore', unit: 'mg', defaultTarget: 700 },
      { key: 'zinc', profileKey: 'zinc_mg', name: 'Zinc', unit: 'mg', defaultTarget: 11 },
    ],
  },
];

// Flat list for iteration
const ALL_MICRONUTRIENTS = MICRONUTRIENT_CATEGORIES.flatMap(c => c.items);

// ============================================================================
// Helpers
// ============================================================================

function getTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// ============================================================================
// Types
// ============================================================================

interface MealPlanEditorProps {
  patientId: string;
  patientName: string;
  plan: MealPlanSummary;
  onBack: () => void;
  onEditSettings: (plan: MealPlanSummary) => void;
}

// ============================================================================
// DayTabs — Patient-style day selector + week tabs
// ============================================================================

function DayTabs({
  days,
  activeIndex,
  onSelect,
}: {
  days: MealPlanDay[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const totalWeeks = Math.ceil(days.length / 7);
  const activeWeek = Math.floor(activeIndex / 7);
  const [selectedWeek, setSelectedWeek] = useState(activeWeek);
  const todayStr = getTodayStr();

  // Sync selected week when activeIndex changes externally
  React.useEffect(() => {
    setSelectedWeek(Math.floor(activeIndex / 7));
  }, [activeIndex]);

  // Get days for the selected week
  const weekStart = selectedWeek * 7;
  const weekDays = days.slice(weekStart, weekStart + 7);

  function handleWeekSelect(weekIdx: number) {
    setSelectedWeek(weekIdx);
    // Select the first day of that week
    onSelect(weekIdx * 7);
  }

  return (
    <div className='space-y-2'>
      {/* Week tabs - only show if more than 1 week */}
      {totalWeeks > 1 && (
        <>
          <div className='flex gap-1 bg-gray-50 p-1 rounded-lg'>
            {Array.from({ length: totalWeeks }, (_, i) => {
              const isActive = i === selectedWeek;
              const weekDaysSlice = days.slice(i * 7, i * 7 + 7);
              const filledCount = weekDaysSlice.filter(d => d.meals.some(m => (m.foods || []).length > 0)).length;
              return (
                <button
                  key={i}
                  onClick={() => handleWeekSelect(i)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex-1 ${
                    isActive
                      ? 'bg-[#1B998B] text-white shadow-sm'
                      : filledCount > 0
                        ? 'text-[#1B998B] hover:bg-gray-100'
                        : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Semaine {i + 1}
                  <span className={`ml-1 text-[10px] ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                    ({filledCount}/{weekDaysSlice.length})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mini dots overview */}
          <div className='flex justify-center gap-4 px-2'>
            {Array.from({ length: totalWeeks }, (_, wi) => (
              <div key={wi} className='flex gap-0.5 items-center'>
                <span className='text-[9px] text-gray-400 mr-1'>S{wi + 1}</span>
                {days.slice(wi * 7, wi * 7 + 7).map((d, di) => {
                  const hasMeals = d.meals.some(m => (m.foods || []).length > 0);
                  return (
                    <div
                      key={di}
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasMeals ? 'bg-[#1B998B]' : 'bg-gray-200'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Day buttons — patient-style */}
      <div className='bg-white border border-gray-200 rounded-xl px-4 py-3'>
        <div className='flex gap-2'>
          {weekDays.map((day, i) => {
            const globalIndex = weekStart + i;
            const isActive = globalIndex === activeIndex;
            const hasFoods = day.meals.some(m => (m.foods || []).length > 0);
            const isToday = day.date === todayStr;
            const dateObj = day.date ? new Date(day.date + 'T00:00:00') : null;
            const dateNum = dateObj ? dateObj.getDate() : day.day_number;
            const monthLabel = dateObj
              ? dateObj.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
              : '';

            return (
              <button
                key={day.id}
                onClick={() => onSelect(globalIndex)}
                className={`flex-1 py-3 rounded-xl text-center transition-all ${
                  isActive
                    ? 'bg-[#1B998B] text-white'
                    : isToday
                      ? 'bg-[#1B998B]/10 text-[#1B998B] border-2 border-[#1B998B]/30'
                      : hasFoods
                        ? 'bg-white text-[#1B998B] border border-[#1B998B]/20'
                        : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <p className='text-xs font-medium'>
                  {day.day_name.slice(0, 3)}
                </p>
                <p className='text-lg font-bold'>{dateNum}</p>
                {monthLabel && (
                  <p className={`text-[10px] ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                    {monthLabel}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ConfirmDeleteModal
// ============================================================================

function ConfirmDeleteModal({
  foodName,
  onConfirm,
  onCancel,
}: {
  foodName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-sm'>
        <div className='p-6 text-center'>
          <div className='w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
            <AlertTriangle className='w-6 h-6 text-red-500' />
          </div>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>
            Supprimer cet aliment ?
          </h3>
          <p className='text-sm text-gray-500'>
            <span className='font-medium text-gray-700'>{foodName}</span> sera retiré du repas. Les macros seront recalculées.
          </p>
        </div>
        <div className='px-6 pb-6 flex gap-3'>
          <button
            onClick={onCancel}
            className='flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium'
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className='flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium'
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CopyDayModal - Select target days to copy meals to
// ============================================================================

function CopyDayModal({
  sourceDay,
  allDays,
  onCopy,
  onClose,
  isPending,
}: {
  sourceDay: MealPlanDay;
  allDays: MealPlanDay[];
  onCopy: (sourceDayId: string, targetDayIds: string[]) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const totalWeeks = Math.ceil(allDays.length / 7);

  function toggleTarget(dayId: string) {
    setSelectedTargets(prev => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  }

  // Shortcut: select all days with the same day_name (e.g. all "Lundi")
  function selectAllSameName() {
    const name = sourceDay.day_name;
    const matching = allDays.filter(d => d.day_name === name && d.id !== sourceDay.id);
    setSelectedTargets(prev => {
      const next = new Set(prev);
      const allSelected = matching.every(d => next.has(d.id));
      if (allSelected) {
        matching.forEach(d => next.delete(d.id));
      } else {
        matching.forEach(d => next.add(d.id));
      }
      return next;
    });
  }

  // Shortcut: select an entire week
  function selectWeek(weekIdx: number) {
    const weekDays = allDays.slice(weekIdx * 7, weekIdx * 7 + 7).filter(d => d.id !== sourceDay.id);
    setSelectedTargets(prev => {
      const next = new Set(prev);
      const allSelected = weekDays.every(d => next.has(d.id));
      if (allSelected) {
        weekDays.forEach(d => next.delete(d.id));
      } else {
        weekDays.forEach(d => next.add(d.id));
      }
      return next;
    });
  }

  const sourceWeek = Math.floor((sourceDay.day_number - 1) / 7);

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col'>
        {/* Header */}
        <div className='p-5 border-b border-gray-100'>
          <div className='flex items-center gap-3 mb-1'>
            <div className='w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center'>
              <Copy className='w-4.5 h-4.5 text-[#1B998B]' />
            </div>
            <div>
              <h3 className='text-base font-semibold text-gray-800'>
                Copier J{sourceDay.day_number} ({sourceDay.day_name}{sourceDay.date ? ` ${new Date(sourceDay.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}` : ''})
              </h3>
              <p className='text-xs text-gray-500'>
                S{sourceWeek + 1} &middot; Sélectionnez les jours de destination
              </p>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className='px-5 pt-4 pb-2'>
          <p className='text-xs font-medium text-gray-500 uppercase mb-2'>Raccourcis</p>
          <div className='flex flex-wrap gap-1.5'>
            <button
              onClick={selectAllSameName}
              className='px-2.5 py-1 text-xs font-medium text-[#1B998B] bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors'
            >
              Tous les {sourceDay.day_name.toLowerCase()}s
            </button>
            {totalWeeks > 1 && Array.from({ length: totalWeeks }, (_, i) => {
              if (i === sourceWeek) return null;
              return (
                <button
                  key={i}
                  onClick={() => selectWeek(i)}
                  className='px-2.5 py-1 text-xs font-medium text-[#1B998B] bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors'
                >
                  Semaine {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day list grouped by week */}
        <div className='flex-1 overflow-y-auto px-5 py-3 space-y-4'>
          {Array.from({ length: totalWeeks }, (_, wi) => {
            const weekDays = allDays.slice(wi * 7, wi * 7 + 7);
            return (
              <div key={wi}>
                <p className='text-xs font-medium text-gray-500 mb-2'>Semaine {wi + 1}</p>
                <div className='grid grid-cols-4 gap-1.5'>
                  {weekDays.map(day => {
                    const isSource = day.id === sourceDay.id;
                    const isSelected = selectedTargets.has(day.id);
                    const hasMeals = day.meals.some(m => (m.foods || []).length > 0);
                    return (
                      <button
                        key={day.id}
                        disabled={isSource}
                        onClick={() => toggleTarget(day.id)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors text-center ${
                          isSource
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isSelected
                              ? 'bg-[#1B998B] text-white shadow-sm'
                              : hasMeals
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {day.day_name.slice(0, 3)}
                        {day.date ? (
                          <span className='block text-[10px] opacity-70'>
                            {new Date(day.date + 'T00:00:00').getDate()}/{String(new Date(day.date + 'T00:00:00').getMonth() + 1).padStart(2, '0')}
                          </span>
                        ) : (
                          <span className='block text-[10px] opacity-70'>J{day.day_number}</span>
                        )}
                        {isSource && <span className='block text-[9px] mt-0.5'>(source)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning + actions */}
        <div className='p-5 border-t border-gray-100 space-y-3'>
          {selectedTargets.size > 0 && (
            <div className='flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-2'>
              <AlertTriangle className='w-3.5 h-3.5 shrink-0 mt-0.5' />
              <p className='text-xs'>Les repas existants des jours sélectionnés seront remplacés.</p>
            </div>
          )}
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              disabled={isPending}
              className='flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50'
            >
              Annuler
            </button>
            <button
              onClick={() => onCopy(sourceDay.id, Array.from(selectedTargets))}
              disabled={selectedTargets.size === 0 || isPending}
              className='flex-1 px-4 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#178a7d] transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2'
            >
              {isPending ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Copy className='w-4 h-4' />
              )}
              Copier ({selectedTargets.size} jour{selectedTargets.size > 1 ? 's' : ''})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FoodRow — Compact patient-style layout
// ============================================================================

function SortableFoodRow({
  food,
  mealId,
  onDeleteFood,
  onOpenAlternatives,
  onUpdateFood,
  isUpdating,
}: {
  food: MealPlanFood;
  mealId: string;
  onDeleteFood: (mealId: string, food: MealPlanFood) => void;
  onOpenAlternatives: (mealId: string, food: MealPlanFood) => void;
  onUpdateFood: (mealId: string, foodItemId: string, data: { quantity?: number; unit?: FoodUnit }) => void;
  isUpdating: boolean;
}) {
  const isOptimistic = food.id.startsWith('optimistic-');
  const [editing, setEditing] = useState(false);
  const [editQty, setEditQty] = useState(food.quantity);
  const [editUnit, setEditUnit] = useState<FoodUnit>(food.unit as FoodUnit);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: food.id, disabled: isOptimistic });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  // Always fetch available units for CIQUAL foods (cached 30min, ready when user clicks edit)
  const { data: availableUnits, isLoading: unitsLoading } = useFoodUnits(food.food_id || null);
  const units: FoodUnitOption[] = availableUnits || [{ unit: 'g' as const, label: 'grammes', gram_equivalent: 1 }];

  const foodName = decodeHtmlEntities(food.custom_name || '') || 'Aliment';

  function handleStartEdit() {
    if (isOptimistic || isUpdating) return;
    setEditQty(food.quantity);
    setEditUnit(food.unit as FoodUnit);
    setEditing(true);
  }

  function handleConfirm() {
    const changes: { quantity?: number; unit?: FoodUnit } = {};
    if (editQty !== food.quantity) changes.quantity = editQty;
    if (editUnit !== food.unit) changes.unit = editUnit;

    if (Object.keys(changes).length > 0) {
      onUpdateFood(mealId, food.id, changes);
    }
    setEditing(false);
  }

  function handleCancel() {
    setEditing(false);
    setEditQty(food.quantity);
    setEditUnit(food.unit as FoodUnit);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') handleCancel();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg mx-3 my-1.5 p-3 ${isOptimistic ? 'opacity-60' : ''}`}
    >
      <div className='flex items-center gap-3'>
        {/* Drag handle */}
        {!isOptimistic && !editing && (
          <button
            {...attributes}
            {...listeners}
            className='touch-none p-1 -ml-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0'
            tabIndex={-1}
          >
            <GripVertical className='w-4 h-4' />
          </button>
        )}

        {/* Food info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-medium text-gray-800 truncate'>
              {foodName}
            </p>
            {isOptimistic && <Loader2 className='w-3.5 h-3.5 animate-spin text-[#1B998B] shrink-0' />}
            {isUpdating && <Loader2 className='w-3.5 h-3.5 animate-spin text-[#1B998B] shrink-0' />}
          </div>
          {editing ? (
            <div className='flex items-center gap-1.5 mt-1.5'>
              <input
                type='number'
                value={editQty}
                onChange={e => setEditQty(Number(e.target.value) || 0)}
                onKeyDown={handleKeyDown}
                min={1}
                autoFocus
                className='w-16 px-1.5 py-0.5 border border-[#1B998B] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#1B998B] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
              />
              <div className='relative'>
                <select
                  value={editUnit}
                  onChange={e => setEditUnit(e.target.value as FoodUnit)}
                  onKeyDown={handleKeyDown}
                  className='appearance-none pl-1.5 pr-5 py-0.5 border border-[#1B998B] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#1B998B] bg-white cursor-pointer'
                >
                  {units.map(u => (
                    <option key={u.unit} value={u.unit}>{u.label}</option>
                  ))}
                </select>
                {unitsLoading ? (
                  <Loader2 className='absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-[#1B998B] animate-spin pointer-events-none' />
                ) : (
                  <ChevronDown className='absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none' />
                )}
              </div>
              <button
                onClick={handleConfirm}
                className='p-1 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors'
                title='Confirmer'
              >
                <Check className='w-3.5 h-3.5' />
              </button>
              <button
                onClick={handleCancel}
                className='p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors'
                title='Annuler'
              >
                <X className='w-3.5 h-3.5' />
              </button>
            </div>
          ) : (
            <p
              className={`text-xs text-gray-500 mt-0.5 ${!isOptimistic ? 'cursor-pointer hover:text-[#1B998B] transition-colors' : ''}`}
              onClick={handleStartEdit}
              title={!isOptimistic ? 'Cliquer pour modifier la quantité' : undefined}
            >
              {food.quantity} {UNIT_LABELS[food.unit] || food.unit}
            </p>
          )}
        </div>

        {/* Compact macros — colored inline */}
        <div className='text-right shrink-0'>
          <p className='font-medium text-gray-700 text-sm mb-0.5'>{food.calories || 0} kcal</p>
          <MacroInline
            protein={food.protein_g || 0}
            carbs={food.carbs_g || 0}
            fat={food.fat_g || 0}
            fiber={food.fiber_g}
          />
        </div>

        {/* Actions */}
        {!isOptimistic && !editing && (
          <div className='flex items-center gap-1 shrink-0'>
            <button
              onClick={() => onOpenAlternatives(mealId, food)}
              className='p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-[#1B998B] transition-colors'
              title='Alternatives'
            >
              <RefreshCw className='w-4 h-4' />
            </button>
            <button
              onClick={() => onDeleteFood(mealId, food)}
              className='p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors'
              title='Supprimer'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MealSection — Expandable card style (patient design)
// ============================================================================

function MealSection({
  config,
  meal,
  isExpanded,
  onToggle,
  onAddFood,
  onDeleteFood,
  onOpenAlternatives,
  onUpdateFood,
  onReorderFoods,
  updatingFoodId,
}: {
  config: (typeof MEAL_CONFIG)[number];
  meal: MealPlanMeal | null;
  isExpanded: boolean;
  onToggle: () => void;
  onAddFood: () => void;
  onDeleteFood: (mealId: string, food: MealPlanFood) => void;
  onOpenAlternatives: (mealId: string, food: MealPlanFood) => void;
  onUpdateFood: (mealId: string, foodItemId: string, data: { quantity?: number; unit?: FoodUnit }) => void;
  onReorderFoods: (mealId: string, oldIndex: number, newIndex: number) => void;
  updatingFoodId: string | null;
}) {
  const foods = meal?.foods || [];
  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
    for (const f of foods) {
      calories += f.calories || 0;
      protein += f.protein_g || 0;
      carbs += f.carbs_g || 0;
      fat += f.fat_g || 0;
      fiber += f.fiber_g || 0;
    }
    return { calories, protein: Math.round(protein * 10) / 10, carbs: Math.round(carbs * 10) / 10, fat: Math.round(fat * 10) / 10, fiber: Math.round(fiber * 10) / 10 };
  }, [foods]);
  const time = meal?.suggested_time
    ? (meal.suggested_time as string).slice(0, 5)
    : config.defaultTime;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const foodIds = useMemo(() => foods.map(f => f.id), [foods]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !meal) return;
    const oldIndex = foods.findIndex(f => f.id === active.id);
    const newIndex = foods.findIndex(f => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorderFoods(meal.id, oldIndex, newIndex);
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Meal header — clickable to expand/collapse */}
      <div
        role='button'
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        className='w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer'
      >
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-[#1B998B]/10 rounded-xl flex items-center justify-center'>
            <span className='text-2xl'>{config.icon}</span>
          </div>
          <div className='text-left'>
            <p className='font-semibold text-gray-800'>{config.label}</p>
            <p className='text-sm text-gray-500'>{time}</p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {foods.length > 0 && (
            <p className='font-semibold text-gray-800'>{totals.calories} kcal</p>
          )}
          {/* Add button (stopPropagation to avoid toggling) */}
          <button
            onClick={(e) => { e.stopPropagation(); onAddFood(); }}
            className='flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors'
          >
            <Plus className='w-3.5 h-3.5' />
            Ajouter
          </button>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Foods list — expandable */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='border-t border-gray-100 bg-gray-50 py-2'>
              {foods.length === 0 ? (
                <div className='px-4 py-6 text-center text-sm text-gray-400'>
                  Aucun aliment pour ce repas
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={foodIds} strategy={verticalListSortingStrategy}>
                    {foods.map(food => (
                      <SortableFoodRow
                        key={food.id}
                        food={food}
                        mealId={meal!.id}
                        onDeleteFood={onDeleteFood}
                        onOpenAlternatives={onOpenAlternatives}
                        onUpdateFood={onUpdateFood}
                        isUpdating={updatingFoodId === food.id}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}

              {/* Macro totals below foods */}
              {foods.length > 0 && (
                <div className='px-4 pb-3 pt-2'>
                  <MacroBadgesGrid
                    values={{
                      calories: totals.calories,
                      protein: totals.protein,
                      carbs: totals.carbs,
                      fat: totals.fat,
                      fiber: totals.fiber,
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getNutrientStatus(current: number, target: number): NutrientStatus {
  const ratio = target > 0 ? current / target : 0;
  if (ratio >= 0.9) return 'good';
  if (ratio >= 0.7) return 'warning';
  return 'low';
}

// ============================================================================
// Day totals helper
// ============================================================================

function useDayTotals(day: MealPlanDay) {
  return useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;

    for (const meal of day.meals) {
      if (meal.foods && meal.foods.length > 0) {
        for (const food of meal.foods) {
          calories += food.calories || 0;
          protein += food.protein_g || 0;
          carbs += food.carbs_g || 0;
          fat += food.fat_g || 0;
          fiber += food.fiber_g || 0;
        }
      } else {
        calories += meal.calories || 0;
        protein += meal.protein_g || 0;
        carbs += meal.carbs_g || 0;
        fat += meal.fat_g || 0;
      }
    }

    return { calories, protein, carbs, fat, fiber };
  }, [day.meals]);
}

// ============================================================================
// NutritionistObjectivesDropdown — Full-width compact dropdown (same as patient)
// ============================================================================

const MACRO_ITEMS = [
  { key: 'calories' as const, label: 'Énergie', unit: 'kcal', bgColor: 'bg-orange-50', textColor: 'text-orange-700', labelColor: 'text-orange-600' },
  { key: 'protein' as const, label: 'Protéines', unit: 'g', bgColor: 'bg-blue-50', textColor: 'text-blue-700', labelColor: 'text-blue-600' },
  { key: 'carbs' as const, label: 'Glucides', unit: 'g', bgColor: 'bg-amber-50', textColor: 'text-amber-700', labelColor: 'text-amber-600' },
  { key: 'fat' as const, label: 'Lipides', unit: 'g', bgColor: 'bg-rose-50', textColor: 'text-rose-700', labelColor: 'text-rose-600' },
  { key: 'fiber' as const, label: 'Fibres', unit: 'g', bgColor: 'bg-green-50', textColor: 'text-green-700', labelColor: 'text-green-600' },
] as const;

function getNutrientStatusColor(status: NutrientStatus): string {
  switch (status) {
    case 'good': return 'text-[#1B998B]';
    case 'warning': return 'text-amber-600';
    case 'low': return 'text-red-500';
  }
}

function NutritionistMicroItem({ nutrient }: { nutrient: Micronutrient }) {
  return (
    <div className='p-2.5 bg-gray-50 rounded-lg'>
      <p className='text-xs font-medium text-gray-700 mb-0.5'>{nutrient.name}</p>
      <div className='flex items-baseline gap-0.5'>
        <span className={`text-sm font-bold ${getNutrientStatusColor(nutrient.status)}`}>{nutrient.value}</span>
        <span className='text-[10px] text-gray-500'>/ {nutrient.target} {nutrient.unit}</span>
      </div>
    </div>
  );
}

function NutritionistObjectivesDropdown({
  day,
  targets,
  microTargets,
}: {
  day: MealPlanDay;
  targets: NutritionalTargets | null;
  microTargets: MicroTargets | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const totals = useDayTotals(day);

  const calTarget = targets?.calories || 2000;
  const protTarget = targets?.protein || 100;
  const carbsTarget = targets?.carbs || 250;
  const fatTarget = targets?.fat || 70;
  const fiberTarget = targets?.fiber || 30;

  const targetMap: Record<string, number> = {
    calories: calTarget,
    protein: protTarget,
    carbs: carbsTarget,
    fat: fatTarget,
    fiber: fiberTarget,
  };

  const totalsMap: Record<string, number> = {
    calories: totals.calories,
    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat,
    fiber: totals.fiber,
  };

  // Compute micronutrients by category
  const microByCategory = useMemo(() => {
    const sums: Record<string, number> = {};
    for (const cfg of ALL_MICRONUTRIENTS) {
      sums[cfg.key] = 0;
    }

    for (const meal of day.meals) {
      for (const food of meal.foods || []) {
        if (food.micronutrients) {
          for (const cfg of ALL_MICRONUTRIENTS) {
            const val = food.micronutrients[cfg.key];
            if (val != null) sums[cfg.key] += val;
          }
        }
      }
    }

    return MICRONUTRIENT_CATEGORIES.map(cat => ({
      label: cat.label,
      icon: cat.icon,
      nutrients: cat.items.map(cfg => {
        const value = Math.round(sums[cfg.key] * 10) / 10;
        // Use profile micro_targets when available, fall back to hardcoded defaults
        const profileValue = microTargets?.[cfg.profileKey as keyof MicroTargets];
        const target = profileValue != null ? profileValue : cfg.defaultTarget;
        const status = getNutrientStatus(value, target);
        return {
          id: cfg.key,
          name: cfg.name,
          value,
          target,
          unit: cfg.unit,
          status,
        } as Micronutrient;
      }),
    }));
  }, [day.meals, microTargets]);

  // Day label
  const dayLabel = day.date
    ? `${day.day_name} ${new Date(day.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
    : `Jour ${day.day_number} — ${day.day_name}`;

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Header — always visible */}
      <div className='p-4'>
        <h2 className='font-semibold text-gray-800 mb-3'>
          Objectifs du {dayLabel.toLowerCase()}
        </h2>

        {/* Compact macro badges */}
        <div className='grid grid-cols-5 gap-2'>
          {MACRO_ITEMS.map(cfg => {
            const current = totalsMap[cfg.key];
            const target = targetMap[cfg.key];
            const display = cfg.key === 'calories' ? Math.round(current) : Math.round(current * 10) / 10;

            return (
              <div key={cfg.key} className={`${cfg.bgColor} rounded-lg px-3 py-3 text-center`}>
                <span className={`text-xs font-medium ${cfg.labelColor} leading-none mb-1 block`}>
                  {cfg.label}
                </span>
                <p className={`text-base font-bold ${cfg.textColor} leading-tight`}>
                  {display}
                  <span className='text-xs font-normal ml-0.5'>/ {target} {cfg.unit}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Micronutrients toggle button */}
      <div className='px-4 pb-3'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            isOpen
              ? 'bg-[#1B998B]/10 text-[#1B998B] hover:bg-[#1B998B]/15'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Pill className='w-4 h-4' />
          {isOpen ? 'Masquer les micronutriments' : 'Voir les micronutriments'}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Expanded panel — micronutrients by category */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='border-t border-gray-100 p-4'>
              <div className='space-y-5'>
                {microByCategory.map(cat => (
                  <div key={cat.label}>
                    <h4 className='text-sm font-medium text-gray-600 mb-2 flex items-center gap-1.5'>
                      <span>{cat.icon}</span>
                      {cat.label}
                    </h4>
                    <div className='grid grid-cols-5 gap-2'>
                      {cat.nutrients.map(nutrient => (
                        <NutritionistMicroItem key={nutrient.id} nutrient={nutrient} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// NutritionistAdherenceCard — Sidebar card (same design as PatientAdherenceCard)
// ============================================================================

function getRateColor(rate: number | null): string {
  if (rate == null) return 'text-gray-400';
  if (rate >= 80) return 'text-[#1B998B]';
  if (rate >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function getRateRingColor(rate: number | null): string {
  if (rate == null) return 'stroke-gray-200';
  if (rate >= 80) return 'stroke-[#1B998B]';
  if (rate >= 50) return 'stroke-amber-500';
  return 'stroke-red-500';
}

function AdherenceRing({ rate }: { rate: number | null }) {
  const displayRate = rate ?? 0;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (displayRate / 100) * circumference;

  return (
    <div className='relative w-28 h-28 mx-auto'>
      <svg className='w-full h-full -rotate-90' viewBox='0 0 96 96'>
        <circle cx='48' cy='48' r='40' fill='none' strokeWidth='6' className='stroke-gray-100' />
        <circle
          cx='48' cy='48' r='40' fill='none' strokeWidth='6' strokeLinecap='round'
          className={getRateRingColor(rate)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className={`text-2xl font-bold ${getRateColor(rate)}`}>
          {rate != null ? `${Math.round(rate)}%` : '—'}
        </span>
      </div>
    </div>
  );
}

const ADHERENCE_STATUS_CONFIG = [
  { key: 'followed_meals', label: 'Suivi', color: 'bg-[#1B998B]', textColor: 'text-[#1B998B]' },
  { key: 'partial_meals', label: 'Partiel', color: 'bg-amber-500', textColor: 'text-amber-600' },
  { key: 'skipped_meals', label: 'Manqué', color: 'bg-red-500', textColor: 'text-red-600' },
  { key: 'not_tracked_meals', label: 'Non suivi', color: 'bg-gray-300', textColor: 'text-gray-500' },
] as const;

function NutritionistAdherenceCard({
  patientId,
  planId,
}: {
  patientId: string;
  planId: string;
}) {
  const { data, isLoading } = usePlanAdherence(patientId, planId);

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  const totalMeals = summary?.total_meals ?? 0;
  const rate = summary?.adherence_rate ?? null;

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-5'>
      <div className='flex items-center gap-2 mb-4'>
        <TrendingUp className='w-5 h-5 text-[#1B998B]' />
        <h3 className='font-semibold text-gray-800'>Adhérence au plan</h3>
      </div>

      {totalMeals === 0 ? (
        <div className='text-center py-6'>
          <div className='w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <TrendingUp className='w-7 h-7 text-gray-300' />
          </div>
          <p className='text-sm text-gray-500 mb-1'>Pas encore de données</p>
          <p className='text-xs text-gray-400'>
            Les statistiques apparaîtront une fois le plan actif suivi par le patient.
          </p>
        </div>
      ) : (
        <>
          <AdherenceRing rate={rate} />

          {/* Stacked bar */}
          <div className='h-2.5 bg-gray-100 rounded-full overflow-hidden flex mt-4 mb-4'>
            {ADHERENCE_STATUS_CONFIG.map(cfg => {
              const count = (summary as unknown as Record<string, number>)?.[cfg.key] ?? 0;
              const pct = totalMeals > 0 ? (count / totalMeals) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={cfg.key}
                  className={`${cfg.color} h-full transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>

          {/* Breakdown */}
          <div className='space-y-2'>
            {ADHERENCE_STATUS_CONFIG.map(cfg => {
              const count = (summary as unknown as Record<string, number>)?.[cfg.key] ?? 0;
              return (
                <div key={cfg.key} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                    <span className='text-sm text-gray-600'>{cfg.label}</span>
                  </div>
                  <span className={`text-sm font-medium ${cfg.textColor}`}>{count}</span>
                </div>
              );
            })}
          </div>

          <div className='mt-3 pt-3 border-t border-gray-100'>
            <p className='text-xs text-gray-400 text-center'>
              Sur {totalMeals} repas planifiés
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Main Editor Component
// ============================================================================

export function MealPlanEditor({
  patientId,
  patientName,
  plan,
  onBack,
  onEditSettings,
}: MealPlanEditorProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [foodSearchMealType, setFoodSearchMealType] = useState<MealType | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [alternativeTarget, setAlternativeTarget] = useState<{
    mealId: string;
    food: MealPlanFood;
  } | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  // Expandable meals state — only first meal expanded by default
  const [expandedMeals, setExpandedMeals] = useState<Set<MealType>>(
    () => new Set([MEAL_CONFIG[0].type])
  );

  function toggleMealExpanded(type: MealType) {
    setExpandedMeals(prev => {
      if (prev.has(type)) return new Set();
      return new Set([type]);
    });
  }

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Publish confirmation modal state
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastMessage(message || '');
    setToastVisible(true);
  }, []);

  // Confirm delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    mealId: string;
    food: MealPlanFood;
  } | null>(null);

  // Copy day state
  const [copySourceDay, setCopySourceDay] = useState<MealPlanDay | null>(null);

  const { data: days, isLoading: daysLoading, error: daysError } = usePlanDays(patientId, plan.id);
  const { data: planDetail } = usePatientMealPlan(patientId, plan.id);

  const createMeal = useCreatePlanMeal(patientId, plan.id);
  const addFood = useAddFoodToMeal(patientId, plan.id);
  const deleteFood = useDeleteMealFood(patientId, plan.id);
  const updatePlan = useUpdateMealPlan(patientId);
  const updateFood = useUpdateMealFood(patientId, plan.id);
  const reorderFoods = useReorderMealFoods(patientId, plan.id);
  const copyDayMutation = useCopyDayMeals(patientId, plan.id);
  const [updatingFoodId, setUpdatingFoodId] = useState<string | null>(null);

  // Fetch active nutritional profile for micro targets
  const { data: activeProfile } = useActiveNutritionalProfileForPatient(patientId);

  const activeDay = days?.[activeDayIndex] || null;
  const targets = planDetail?.nutritional_targets || null;
  const currentStatus = planDetail?.status || plan.status;
  const currentName = planDetail?.name || plan.name;
  const currentObjective = planDetail?.objective ?? plan.objective;
  const status = STATUS_LABELS[currentStatus] || STATUS_LABELS.draft;

  // Filter MEAL_CONFIG based on the plan's selected meal_types
  const activeMealConfig = useMemo(() => {
    const planMealTypes = planDetail?.meal_types;
    if (!planMealTypes || planMealTypes.length === 0) return MEAL_CONFIG;
    // Map old 'snack' to 'afternoon_snack' for backwards compatibility
    const mapped = planMealTypes.map((t: string) => (t === 'snack' ? 'afternoon_snack' : t));
    return MEAL_CONFIG.filter(c => mapped.includes(c.type));
  }, [planDetail?.meal_types]);

  // Group meals by type for current day - one meal per type
  const mealsByType = useMemo(() => {
    if (!activeDay) return new Map<MealType, MealPlanMeal>();
    const map = new Map<MealType, MealPlanMeal>();
    for (const config of activeMealConfig) {
      const meal = activeDay.meals.find(m => m.meal_type === config.type);
      if (meal) map.set(config.type, meal);
    }
    return map;
  }, [activeDay, activeMealConfig]);

  function handleOpenFoodSearch(mealType: MealType) {
    setFoodSearchMealType(mealType);
    setShowFoodSearch(true);
  }

  async function handleAddFood(payload: FoodAddPayload) {
    if (!activeDay || !foodSearchMealType) return;

    const existingMeal = mealsByType.get(foodSearchMealType);
    let mealId: string;

    if (existingMeal) {
      mealId = existingMeal.id;
    } else {
      const config = activeMealConfig.find(c => c.type === foodSearchMealType);
      const newMeal = await createMeal.mutateAsync({
        day_id: activeDay.id,
        meal_type: foodSearchMealType,
        title: config?.label || undefined,
        suggested_time: config?.defaultTime,
      });
      mealId = newMeal.id;
    }

    addFood.mutate(
      {
        mealId,
        food_id: payload.food_id,
        quantity: payload.quantity,
        unit: payload.unit,
        _foodName: payload.name,
        _calories_per_100g: payload.calories_per_100g,
        _protein_per_100g: payload.protein_per_100g,
        _carbs_per_100g: payload.carbs_per_100g,
        _fat_per_100g: payload.fat_per_100g,
        _gram_equivalent: payload.gram_equivalent,
      },
      {
        onSuccess: () => {
          showToast('success', 'Aliment ajouté', `${payload.name} (${payload.quantity} ${UNIT_LABELS[payload.unit] || payload.unit})`);
        },
        onError: () => {
          showToast('error', 'Erreur', 'Impossible d\'ajouter l\'aliment');
        },
      }
    );

    setShowFoodSearch(false);
    setFoodSearchMealType(null);
  }

  function handleDeleteFood(mealId: string, food: MealPlanFood) {
    setDeleteTarget({ mealId, food });
  }

  function confirmDeleteFood() {
    if (!deleteTarget) return;
    deleteFood.mutate(
      { mealId: deleteTarget.mealId, foodItemId: deleteTarget.food.id },
      {
        onSuccess: () => {
          const name = decodeHtmlEntities(deleteTarget.food.custom_name || '') || 'Aliment';
          showToast('success', 'Aliment supprimé', `${name} a été retiré du repas`);
        },
        onError: () => {
          showToast('error', 'Erreur', 'Impossible de supprimer l\'aliment');
        },
      }
    );
    setDeleteTarget(null);
  }

  function handleUpdateFood(mealId: string, foodItemId: string, data: { quantity?: number; unit?: FoodUnit }) {
    setUpdatingFoodId(foodItemId);
    updateFood.mutate(
      { mealId, foodItemId, data },
      { onSettled: () => setUpdatingFoodId(null) }
    );
  }

  // Reorder foods within a meal (drag-and-drop)
  function handleReorderFoods(mealId: string, oldIndex: number, newIndex: number) {
    if (!activeDay) return;
    const meal = activeDay.meals.find(m => m.id === mealId);
    if (!meal) return;
    const reordered = arrayMove(meal.foods, oldIndex, newIndex);
    const items = reordered.map((f, i) => ({ id: f.id, display_order: i }));
    reorderFoods.mutate({ mealId, items });
  }

  // Copy day handler
  async function handleCopyDay(sourceDayId: string, targetDayIds: string[]) {
    try {
      await copyDayMutation.mutateAsync({ source_day_id: sourceDayId, target_day_ids: targetDayIds });
      setCopySourceDay(null);
      showToast('success', 'Jour copié', `Repas copiés vers ${targetDayIds.length} jour(s)`);
    } catch {
      showToast('error', 'Erreur', 'Impossible de copier les repas');
    }
  }

  // PLAN-N-006: Publish plan
  async function handlePublish() {
    setPublishError(null);
    if (!days) return;

    // Validation: each day must have at least one meal with food
    const incompleteDays: string[] = [];
    for (const day of days) {
      const mealsWithFood = day.meals.filter(m => (m.foods || []).length > 0).length;
      if (mealsWithFood === 0) {
        let label = day.day_name || `Jour ${day.day_number}`;
        if (day.date) {
          const d = new Date(day.date + 'T00:00:00');
          label += ` ${d.getDate()} ${d.toLocaleDateString('fr-FR', { month: 'short' })}`;
        }
        incompleteDays.push(label);
      }
    }

    if (incompleteDays.length > 0) {
      const total = days.length;
      const incomplete = incompleteDays.length;
      if (incomplete === total) {
        setPublishError('Aucun jour ne contient de repas. Ajoutez des aliments avant de publier.');
      } else if (incomplete <= 3) {
        setPublishError(
          `${incomplete} jour${incomplete > 1 ? 's' : ''} sans repas : ${incompleteDays.join(', ')}. Complétez-les avant de publier.`
        );
      } else {
        setPublishError(
          `${incomplete} jours sur ${total} ne contiennent aucun repas. Complétez tous les jours avant de publier.`
        );
      }
      return;
    }

    // Validation passed — show confirmation modal
    setShowPublishModal(true);
  }

  async function confirmPublish() {
    setShowPublishModal(false);
    try {
      await updatePlan.mutateAsync({ planId: plan.id, data: { status: 'active' } });
      showToast('success', 'Plan publié', 'Le patient peut maintenant consulter son plan alimentaire.');
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Erreur lors de la publication');
    }
  }

  if (daysLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        <span className='ml-2 text-sm text-gray-500'>Chargement du plan...</span>
      </div>
    );
  }

  if (daysError || !days) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
        <AlertCircle className='w-8 h-8 text-red-500 mx-auto mb-3' />
        <p className='text-gray-800 font-medium mb-1'>Erreur de chargement</p>
        <p className='text-sm text-gray-500'>
          {daysError?.message || 'Impossible de charger les jours du plan'}
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header — card style */}
      <div className='bg-white rounded-xl border border-gray-200 p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <h2 className='text-lg font-semibold text-gray-800'>{currentName}</h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <p className='text-sm text-gray-500'>
              Patient : {patientName}
              {currentObjective && <> &middot; {currentObjective}</>}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {/* Shopping list (PLAN-N-009) */}
            <button
              onClick={() => setShowShoppingList(true)}
              className='flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-[#1B998B] hover:bg-emerald-50 rounded-lg transition-colors text-sm'
              title='Liste de courses'
            >
              <ShoppingCart className='w-4 h-4' />
            </button>
            {/* Save as template toggle (PLAN-N-005) */}
            <button
              onClick={() => setShowTemplateModal(true)}
              disabled={updatePlan.isPending}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm ${
                planDetail?.is_template
                  ? 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                  : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
              title={planDetail?.is_template ? 'Retirer des modèles' : 'Sauvegarder comme modèle'}
            >
              {planDetail?.is_template ? (
                <BookmarkMinus className='w-4 h-4' />
              ) : (
                <BookmarkPlus className='w-4 h-4' />
              )}
            </button>
            <button
              onClick={() => onEditSettings(planDetail || plan)}
              className='flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm'
            >
              <Settings className='w-4 h-4' />
              Paramètres
            </button>
            {currentStatus === 'draft' && (
              <button
                onClick={handlePublish}
                disabled={updatePlan.isPending}
                className='flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#178a7d] transition-colors text-sm font-medium disabled:opacity-50'
              >
                {updatePlan.isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Play className='w-4 h-4' />
                )}
                Publier le plan
              </button>
            )}
            {currentStatus === 'active' && (
              <span className='flex items-center gap-1.5 px-3 py-2 text-[#1B998B] text-sm font-medium'>
                <CheckCircle2 className='w-4 h-4' />
                Publié
              </span>
            )}
            <button
              onClick={onBack}
              className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors'
            >
              Retour aux plans
            </button>
          </div>
        </div>
      </div>

      {/* Publish error */}
      {publishError && (
        <div className='flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3'>
          <AlertCircle className='w-4 h-4 shrink-0' />
          <p className='text-sm'>{publishError}</p>
        </div>
      )}

      {/* Day tabs */}
      <DayTabs days={days} activeIndex={activeDayIndex} onSelect={setActiveDayIndex} />

      {/* Objectives dropdown — full width */}
      {activeDay && (
        <NutritionistObjectivesDropdown day={activeDay} targets={targets} microTargets={activeProfile?.micro_targets ?? null} />
      )}

      {/* Day header with copy button — outside grid for alignment */}
      {activeDay && (
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-medium text-gray-800'>
            Jour {activeDay.day_number} &middot; {activeDay.day_name}
            {activeDay.date && (
              <span className='ml-1'>
                {new Date(activeDay.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </span>
            )}
          </h3>
          {activeDay.meals.some(m => (m.foods || []).length > 0) && (
            <button
              onClick={() => setCopySourceDay(activeDay)}
              className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1B998B] bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors'
            >
              <Copy className='w-3.5 h-3.5' />
              Copier vers...
            </button>
          )}
        </div>
      )}

      {/* Content: meals + optional sidebar */}
      {activeDay && (
        <div className={currentStatus === 'draft' ? '' : 'grid grid-cols-4 gap-6 items-start'}>
          {/* Meals column */}
          <div className={currentStatus === 'draft' ? 'space-y-3' : 'col-span-3 space-y-3'}>
            {/* Meal sections */}
            {activeMealConfig.map(config => (
              <MealSection
                key={config.type}
                config={config}
                meal={mealsByType.get(config.type) || null}
                isExpanded={expandedMeals.has(config.type)}
                onToggle={() => toggleMealExpanded(config.type)}
                onAddFood={() => handleOpenFoodSearch(config.type)}
                onDeleteFood={handleDeleteFood}
                onOpenAlternatives={(mealId, food) =>
                  setAlternativeTarget({ mealId, food })
                }
                onUpdateFood={handleUpdateFood}
                onReorderFoods={handleReorderFoods}
                updatingFoodId={updatingFoodId}
              />
            ))}
          </div>

          {/* Right column — 1/4: sidebar (sticky) — only for published plans */}
          {currentStatus !== 'draft' && (
            <div className='col-span-1 sticky top-4 space-y-4'>
              <NutritionistAdherenceCard patientId={patientId} planId={plan.id} />
            </div>
          )}
        </div>
      )}

      {/* Modification requests banner — full width (PLAN-N-007) */}
      <ModificationRequestsBanner patientId={patientId} planId={plan.id} />

      {/* Food search modal */}
      {showFoodSearch && foodSearchMealType && (
        <FoodSearchModal
          mealTypeLabel={activeMealConfig.find(c => c.type === foodSearchMealType)?.label || ''}
          onAdd={handleAddFood}
          onClose={() => { setShowFoodSearch(false); setFoodSearchMealType(null); }}
        />
      )}

      {/* Alternative modal (PLAN-N-004) */}
      {alternativeTarget && (
        <AlternativeModal
          patientId={patientId}
          planId={plan.id}
          mealId={alternativeTarget.mealId}
          food={alternativeTarget.food}
          onClose={() => setAlternativeTarget(null)}
        />
      )}

      {/* Shopping list modal (PLAN-N-009) */}
      {showShoppingList && (
        <ShoppingListModal
          patientId={patientId}
          planId={plan.id}
          planName={currentName}
          isPublished={currentStatus === 'active'}
          onClose={() => setShowShoppingList(false)}
        />
      )}

      {/* Confirm delete modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          foodName={decodeHtmlEntities(deleteTarget.food.custom_name || '') || 'cet aliment'}
          onConfirm={confirmDeleteFood}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Copy day modal */}
      {copySourceDay && days && (
        <CopyDayModal
          sourceDay={copySourceDay}
          allDays={days}
          onCopy={handleCopyDay}
          onClose={() => setCopySourceDay(null)}
          isPending={copyDayMutation.isPending}
        />
      )}

      {/* Publish confirmation modal (PLAN-N-006) */}
      {showPublishModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6'>
            <div className='flex items-center justify-center w-12 h-12 bg-[#E0F5F2] rounded-full mx-auto mb-4'>
              <Play className='w-6 h-6 text-[#1B998B]' />
            </div>
            <h3 className='text-lg font-semibold text-gray-800 text-center mb-2'>
              Publier le plan ?
            </h3>
            <p className='text-sm text-gray-500 text-center mb-6'>
              Le plan <span className='font-medium text-gray-700'>&laquo; {currentName} &raquo;</span> sera
              visible par le patient. Le plan actif précédent sera automatiquement archivé.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowPublishModal(false)}
                className='flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
              >
                Annuler
              </button>
              <button
                onClick={confirmPublish}
                disabled={updatePlan.isPending}
                className='flex-1 px-4 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#178a7d] transition-colors text-sm font-medium disabled:opacity-50'
              >
                {updatePlan.isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin mx-auto' />
                ) : (
                  'Publier'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template modal (PLAN-N-005) */}
      {showTemplateModal && (
        planDetail?.is_template ? (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
            <div className='bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6'>
              <div className='flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4'>
                <BookmarkMinus className='w-6 h-6 text-purple-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 text-center mb-2'>
                Retirer des modèles ?
              </h3>
              <p className='text-sm text-gray-500 text-center mb-6'>
                Le plan <span className='font-medium text-gray-700'>&laquo; {currentName} &raquo;</span> ne
                sera plus disponible comme modèle réutilisable. Le plan lui-même ne sera pas supprimé.
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className='flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    updatePlan.mutate(
                      { planId: plan.id, data: { is_template: false } },
                      {
                        onSuccess: () => {
                          setShowTemplateModal(false);
                          showToast('success', 'Modèle retiré', `Le plan « ${currentName} » n'est plus un modèle.`);
                        },
                        onError: () => showToast('error', 'Erreur', 'Impossible de retirer le modèle.'),
                      }
                    );
                  }}
                  disabled={updatePlan.isPending}
                  className='flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50'
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
            <div className='bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6'>
              <div className='flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4'>
                <BookmarkPlus className='w-6 h-6 text-purple-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 text-center mb-2'>
                Sauvegarder comme modèle ?
              </h3>
              <p className='text-sm text-gray-500 text-center mb-6'>
                Le plan <span className='font-medium text-gray-700'>&laquo; {currentName} &raquo;</span> sera
                enregistré comme modèle réutilisable pour vos futurs patients.
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className='flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    updatePlan.mutate(
                      { planId: plan.id, data: { is_template: true } },
                      {
                        onSuccess: () => {
                          setShowTemplateModal(false);
                          showToast('success', 'Modèle enregistré', `Le plan « ${currentName} » est maintenant un modèle réutilisable.`);
                        },
                        onError: () => showToast('error', 'Erreur', 'Impossible d\'enregistrer comme modèle.'),
                      }
                    );
                  }}
                  disabled={updatePlan.isPending}
                  className='flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50'
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* Toast notifications */}
      <Toast
        isVisible={toastVisible}
        type={toastType}
        title={toastTitle}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
