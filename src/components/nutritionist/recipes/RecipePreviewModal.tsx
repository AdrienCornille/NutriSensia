'use client';

import React, { useState } from 'react';
import {
  X,
  Clock,
  ChefHat,
  ShoppingCart,
  Users,
  Minus,
  Plus,
  Timer,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Leaf,
  Star,
} from 'lucide-react';
import { DIFFICULTY_LABELS } from '@/types/recipes';
import {
  TAG_GROUP_CONFIG,
  TAG_GROUP_MAP,
  AUTO_TAG_LABELS,
} from '@/lib/recipe-auto-tags';

const UNIT_LABELS: Record<string, string> = {
  g: 'g',
  ml: 'ml',
  c_a_s: 'c. à soupe',
  c_a_c: 'c. à café',
  tasse: 'tasse',
  portion: 'portion',
  piece: 'pièce',
  pièce: 'pièce',
  kg: 'kg',
  l: 'L',
  cl: 'cl',
  dl: 'dl',
};

function formatUnit(unit: string | null | undefined): string {
  if (!unit) return 'g';
  return UNIT_LABELS[unit] || unit;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard: 'bg-red-50 text-red-700',
};

import type { IngredientFormItem } from './RecipeIngredientEditor';
import type { StepFormItem } from './RecipeStepEditor';

interface PreviewTag {
  id: string;
  label: string;
  tagType: string;
}

interface PreviewAutoTag {
  tag_group: string;
  tag_value: string;
}

interface RecipePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl: string;
  difficulty: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  tips: string;
  ingredients: IngredientFormItem[];
  steps: StepFormItem[];
  tags: PreviewTag[];
  autoTags: PreviewAutoTag[];
}

export function RecipePreviewModal({
  isOpen,
  onClose,
  title,
  imageUrl,
  difficulty,
  prepTimeMinutes,
  cookTimeMinutes,
  servings,
  tips,
  ingredients,
  steps,
  tags,
  autoTags,
}: RecipePreviewModalProps) {
  const [servingsMultiplier, setServingsMultiplier] = useState(1);

  if (!isOpen) return null;

  const adjustedServings = servings * servingsMultiplier;
  const totalTime = prepTimeMinutes + cookTimeMinutes;

  // Group ingredients
  const ingredientGroups = new Map<string, IngredientFormItem[]>();
  for (const ing of ingredients) {
    const group = ing.group_name || '';
    if (!ingredientGroups.has(group)) ingredientGroups.set(group, []);
    ingredientGroups.get(group)!.push(ing);
  }

  // Compute nutrition from ingredients
  let cal = 0,
    prot = 0,
    carb = 0,
    fat = 0,
    fib = 0;
  let totalWeightG = 0;
  let hasNutrition = false;
  for (const ing of ingredients) {
    if (ing.calories_per_100g && ing.quantity_value) {
      const f = ing.quantity_value / 100;
      cal += ing.calories_per_100g * f;
      prot += (ing.protein_per_100g || 0) * f;
      carb += (ing.carbs_per_100g || 0) * f;
      fat += (ing.fat_per_100g || 0) * f;
      fib += (ing.fiber_per_100g || 0) * f;
      hasNutrition = true;
    }
    if (ing.quantity_value) totalWeightG += ing.quantity_value;
  }

  const perServing =
    hasNutrition && servings > 0
      ? {
          calories: Math.round((cal / servings) * servingsMultiplier),
          protein: Math.round((prot / servings) * servingsMultiplier * 10) / 10,
          carbs: Math.round((carb / servings) * servingsMultiplier * 10) / 10,
          fat: Math.round((fat / servings) * servingsMultiplier * 10) / 10,
          fiber: Math.round((fib / servings) * servingsMultiplier * 10) / 10,
        }
      : null;

  const per100g =
    hasNutrition && totalWeightG > 0
      ? {
          calories: Math.round((cal / totalWeightG) * 100 * 10) / 10,
          protein: Math.round((prot / totalWeightG) * 100 * 10) / 10,
          carbs: Math.round((carb / totalWeightG) * 100 * 10) / 10,
          fat: Math.round((fat / totalWeightG) * 100 * 10) / 10,
          fiber: Math.round((fib / totalWeightG) * 100 * 10) / 10,
        }
      : null;

  const totalMacroG = per100g
    ? per100g.protein + per100g.carbs + per100g.fat
    : 0;

  const MACROS = [
    {
      key: 'protein' as const,
      label: 'Protéines',
      Icon: Beef,
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      bar: 'bg-blue-500',
    },
    {
      key: 'carbs' as const,
      label: 'Glucides',
      Icon: Wheat,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      bar: 'bg-amber-500',
    },
    {
      key: 'fat' as const,
      label: 'Lipides',
      Icon: Droplets,
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      bar: 'bg-rose-500',
    },
    {
      key: 'fiber' as const,
      label: 'Fibres',
      Icon: Leaf,
      bg: 'bg-green-50',
      text: 'text-green-700',
      bar: 'bg-green-500',
    },
  ];

  // Group tags by category
  const manualByGroup = new Map<string, PreviewTag[]>();
  for (const tag of tags) {
    const group = tag.tagType || 'other';
    if (!manualByGroup.has(group)) manualByGroup.set(group, []);
    manualByGroup.get(group)!.push(tag);
  }
  const autoByGroup = new Map<string, PreviewAutoTag[]>();
  for (const tag of autoTags) {
    if (!autoByGroup.has(tag.tag_group)) autoByGroup.set(tag.tag_group, []);
    autoByGroup.get(tag.tag_group)!.push(tag);
  }
  const allGroupSlugs = new Set([
    ...manualByGroup.keys(),
    ...autoByGroup.keys(),
  ]);
  const orderedGroups = TAG_GROUP_CONFIG.filter(g => allGroupSlugs.has(g.slug));

  return (
    <div className='fixed inset-0 z-[60] flex flex-col bg-[#FBF9F7]'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0'>
        <div className='flex items-center gap-2'>
          <div className='w-2 h-2 rounded-full bg-[#1B998B]' />
          <span className='text-sm font-semibold text-gray-800'>
            Aperçu patient
          </span>
          <span className='text-xs text-gray-400'>
            — Vue telle qu&apos;affichée sur le dashboard patient
          </span>
        </div>
        <button
          onClick={onClose}
          className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
        >
          <X className='w-4 h-4' />
          Retour à l&apos;édition
        </button>
      </div>

      {/* Scrollable content */}
      <div className='flex-1 overflow-y-auto'>
        {/* Hero */}
        <div className='relative h-60 sm:h-80 bg-gradient-to-br from-[#1B998B]/20 to-teal-100'>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <span className='text-7xl drop-shadow-lg'>🍽️</span>
            </div>
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent' />
          <div className='absolute bottom-0 left-0 right-0 p-5'>
            <h1 className='text-2xl font-bold text-white drop-shadow-lg leading-tight'>
              {title || 'Titre de la recette'}
            </h1>
          </div>
        </div>

        <div className='px-6 pb-6'>
          {/* Quick info bar */}
          <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] mt-4 px-2 py-4 grid grid-cols-4 gap-0 divide-x divide-gray-100'>
            <div className='flex flex-col items-center justify-center gap-1'>
              <Clock className='w-4 h-4 text-[#1B998B]' />
              <span className='text-sm font-semibold text-gray-800'>
                {totalTime} min
              </span>
              <span className='text-[10px] text-gray-400'>Total</span>
            </div>
            <div className='flex flex-col items-center justify-center gap-1'>
              <Timer className='w-4 h-4 text-[#E9C46A]' />
              <span className='text-sm font-semibold text-gray-800'>
                {prepTimeMinutes} min
              </span>
              <span className='text-[10px] text-gray-400'>Préparation</span>
            </div>
            <div className='flex flex-col items-center justify-center gap-1'>
              <Users className='w-4 h-4 text-[#78CFC6]' />
              <span className='text-sm font-semibold text-gray-800'>
                {servings}
              </span>
              <span className='text-[10px] text-gray-400'>Portions</span>
            </div>
            <div className='flex flex-col items-center justify-center gap-1'>
              <ChefHat className='w-4 h-4 text-[#E76F51]' />
              <span className='text-sm font-semibold text-gray-800'>
                {DIFFICULTY_LABELS[
                  difficulty as keyof typeof DIFFICULTY_LABELS
                ] || difficulty}
              </span>
              <span className='text-[10px] text-gray-400'>Difficulté</span>
            </div>
          </div>

          {/* 2 columns */}
          <div className='grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mt-5'>
            {/* Left: Ingredients + Steps */}
            <div className='space-y-4'>
              {/* Ingredients */}
              {ingredients.length > 0 && (
                <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5'>
                  <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-base font-semibold text-gray-800 flex items-center gap-2'>
                      <div className='w-7 h-7 rounded-lg bg-[#1B998B]/10 flex items-center justify-center'>
                        <ShoppingCart className='w-3.5 h-3.5 text-[#1B998B]' />
                      </div>
                      Ingrédients
                    </h2>
                    <div className='flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1'>
                      <button
                        onClick={() =>
                          setServingsMultiplier(
                            Math.max(1, servingsMultiplier - 1)
                          )
                        }
                        disabled={servingsMultiplier <= 1}
                        className='w-6 h-6 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30'
                      >
                        <Minus className='w-3 h-3 text-gray-500' />
                      </button>
                      <span className='flex items-center gap-1 text-xs font-medium text-gray-700 min-w-[50px] justify-center'>
                        <Users className='w-3 h-3 text-gray-400' />
                        {adjustedServings}
                      </span>
                      <button
                        onClick={() =>
                          setServingsMultiplier(servingsMultiplier + 1)
                        }
                        className='w-6 h-6 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors'
                      >
                        <Plus className='w-3 h-3 text-gray-500' />
                      </button>
                    </div>
                  </div>
                  {Array.from(ingredientGroups.entries()).map(
                    ([groupName, items]) => (
                      <div
                        key={groupName || '__default'}
                        className='mb-3 last:mb-0'
                      >
                        {groupName && (
                          <p className='text-[10px] font-semibold text-[#1B998B] uppercase tracking-wider mb-1.5 pb-1 border-b border-[#1B998B]/10'>
                            {groupName}
                          </p>
                        )}
                        <ul>
                          {items.map((ing, idx) => (
                            <li
                              key={ing._tempId}
                              className={`flex justify-between items-center py-2.5 ${idx < items.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                              <div className='flex items-center gap-2.5'>
                                <span className='w-1.5 h-1.5 rounded-full bg-[#1B998B]/30 flex-shrink-0' />
                                <span
                                  className={`text-sm ${ing.is_optional ? 'italic text-gray-400' : 'text-gray-700'}`}
                                >
                                  {ing.name}
                                  {ing.is_optional && (
                                    <span className='text-[10px] text-gray-400 ml-1'>
                                      (optionnel)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className='text-sm text-gray-500 font-medium whitespace-nowrap ml-4'>
                                {ing.quantity_value
                                  ? `${Math.round(ing.quantity_value * servingsMultiplier)} ${formatUnit(ing.quantity_unit)}`
                                  : ing.quantity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Steps */}
              {steps.length > 0 && (
                <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5'>
                  <h2 className='text-base font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                    <div className='w-7 h-7 rounded-lg bg-[#1B998B]/10 flex items-center justify-center'>
                      <ChefHat className='w-3.5 h-3.5 text-[#1B998B]' />
                    </div>
                    Préparation
                    <span className='text-xs text-gray-400 font-normal ml-auto'>
                      {steps.length} étapes
                    </span>
                  </h2>
                  <ol className='space-y-4'>
                    {steps.map((step, idx) => (
                      <li key={step._tempId} className='flex gap-3'>
                        <div className='flex flex-col items-center'>
                          <span className='w-7 h-7 bg-[#1B998B] text-white rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0'>
                            {idx + 1}
                          </span>
                          {idx < steps.length - 1 && (
                            <div className='w-px flex-1 bg-[#1B998B]/15 mt-1.5' />
                          )}
                        </div>
                        <div className='flex-1 pb-1'>
                          <p className='text-sm text-gray-700 leading-relaxed'>
                            {step.instruction}
                          </p>
                          {step.duration_minutes && (
                            <span className='inline-flex items-center gap-1 text-[10px] text-gray-400 mt-1.5 bg-gray-50 px-2 py-0.5 rounded-full'>
                              <Clock className='w-2.5 h-2.5' />{' '}
                              {step.duration_minutes} min
                            </span>
                          )}
                          {step.tips && (
                            <div className='flex gap-2 items-start mt-1.5 bg-[#E9C46A]/10 rounded-lg px-2.5 py-1.5'>
                              <span className='text-xs'>💡</span>
                              <p className='text-[11px] text-[#8B7355] leading-relaxed'>
                                {step.tips}
                              </p>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tips */}
              {tips && (
                <div className='bg-[#E9C46A]/10 border border-[#E9C46A]/30 rounded-xl p-5'>
                  <h2 className='text-base font-semibold text-[#8B7355] mb-2 flex items-center gap-2'>
                    <div className='w-7 h-7 rounded-lg bg-[#E9C46A]/20 flex items-center justify-center'>
                      <ChefHat className='w-3.5 h-3.5 text-[#C4A265]' />
                    </div>
                    Conseil du chef
                  </h2>
                  <p className='text-sm text-[#8B7355] leading-relaxed ml-9'>
                    {tips}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Nutrition + Tags */}
            <div className='space-y-4'>
              {/* Nutrition */}
              {perServing && per100g && (
                <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden'>
                  <div className='px-4 py-2.5 border-b border-gray-100 flex items-center gap-2'>
                    <Flame className='w-3.5 h-3.5 text-orange-500' />
                    <h3 className='text-xs font-semibold text-gray-800'>
                      Valeurs nutritionnelles
                    </h3>
                  </div>
                  <div className='p-4 space-y-3'>
                    <div className='flex items-stretch gap-0'>
                      <div className='flex-1 text-center py-2 bg-orange-50/50 rounded-l-lg'>
                        <p className='text-xl font-bold text-gray-900'>
                          {perServing.calories}
                        </p>
                        <p className='text-[9px] text-gray-500 mt-0.5'>
                          kcal / {adjustedServings} portion
                          {adjustedServings > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className='w-px bg-gray-200 self-stretch my-2' />
                      <div className='flex-1 text-center py-2 bg-orange-50/50 rounded-r-lg'>
                        <p className='text-xl font-bold text-gray-900'>
                          {per100g.calories}
                        </p>
                        <p className='text-[9px] text-gray-500 mt-0.5'>
                          kcal / 100g
                        </p>
                      </div>
                    </div>
                    {totalMacroG > 0 && (
                      <div className='flex h-2.5 rounded-full overflow-hidden bg-gray-100'>
                        <div
                          className='bg-blue-500'
                          style={{
                            width: `${(per100g.protein / totalMacroG) * 100}%`,
                          }}
                        />
                        <div
                          className='bg-amber-500'
                          style={{
                            width: `${(per100g.carbs / totalMacroG) * 100}%`,
                          }}
                        />
                        <div
                          className='bg-rose-500'
                          style={{
                            width: `${(per100g.fat / totalMacroG) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                    <div className='space-y-1.5'>
                      {MACROS.map(macro => {
                        const valPer100g = per100g[macro.key];
                        const valPerServing = perServing[macro.key];
                        const pct =
                          totalMacroG > 0 && macro.key !== 'fiber'
                            ? Math.round((valPer100g / totalMacroG) * 100)
                            : null;
                        return (
                          <div
                            key={macro.key}
                            className={`${macro.bg} rounded-lg p-2.5 space-y-1`}
                          >
                            <div className='flex items-center justify-between'>
                              <span className='text-[11px] text-gray-600 flex items-center gap-1'>
                                <macro.Icon className='w-3 h-3' /> {macro.label}
                              </span>
                              <div className='text-right'>
                                <span
                                  className={`text-xs font-semibold ${macro.text}`}
                                >
                                  {pct !== null ? `${pct}% ` : ''}
                                  {valPerServing.toFixed(1)}g
                                </span>
                                <span className='text-[9px] text-gray-400 ml-1'>
                                  ({valPer100g.toFixed(1)}/100g)
                                </span>
                              </div>
                            </div>
                            {pct !== null && (
                              <div className='h-1 bg-white/60 rounded-full overflow-hidden'>
                                <div
                                  className={`h-full rounded-full ${macro.bar}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags by category */}
              {orderedGroups.length > 0 && (
                <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-4'>
                  <h3 className='text-xs font-semibold text-gray-800 mb-3'>
                    Tags
                  </h3>
                  <div className='space-y-2.5'>
                    {orderedGroups.map(groupConfig => {
                      const manual = manualByGroup.get(groupConfig.slug) || [];
                      const auto = autoByGroup.get(groupConfig.slug) || [];
                      if (manual.length === 0 && auto.length === 0) return null;
                      return (
                        <div key={groupConfig.slug}>
                          <p className='text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1'>
                            {groupConfig.label}
                          </p>
                          <div className='flex flex-wrap gap-1'>
                            {manual.map(tag => (
                              <span
                                key={tag.id}
                                className='px-2 py-0.5 rounded-full text-[10px] font-medium border'
                                style={{
                                  backgroundColor: `${groupConfig.color}15`,
                                  color: groupConfig.color,
                                  borderColor: `${groupConfig.color}30`,
                                }}
                              >
                                {tag.label}
                              </span>
                            ))}
                            {auto.map(tag => {
                              const color =
                                TAG_GROUP_MAP[
                                  tag.tag_group as keyof typeof TAG_GROUP_MAP
                                ]?.color || '#6B7280';
                              return (
                                <span
                                  key={tag.tag_value}
                                  className='px-2 py-0.5 rounded-full text-[10px] font-medium border'
                                  style={{
                                    backgroundColor: `${color}15`,
                                    color,
                                    borderColor: `${color}30`,
                                  }}
                                >
                                  {AUTO_TAG_LABELS[tag.tag_value] ||
                                    tag.tag_value}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rating placeholder */}
              <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-4'>
                <div className='flex items-center gap-3'>
                  <span className='text-2xl font-bold text-gray-300'>—</span>
                  <div>
                    <div className='flex items-center gap-0.5'>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className='w-3.5 h-3.5 text-gray-200' />
                      ))}
                    </div>
                    <span className='text-[10px] text-gray-400'>
                      Pas encore noté
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
