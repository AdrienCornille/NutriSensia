'use client';

import React from 'react';
import {
  Flame,
  Droplets,
  Wheat,
  Beef,
  Leaf,
  Check,
  ChefHat,
  Clock,
  Users,
  Zap,
  Star,
  MessageSquare,
  User,
  Loader2,
} from 'lucide-react';
import type { NutriRecipe } from '@/types/recipes';
import { AUTO_TAG_LABELS, TAG_GROUP_MAP } from '@/lib/recipe-auto-tags';
import { useNutritionistRecipeReviews } from '@/hooks/useNutritionistRecipes';

// ==================== TYPES ====================

interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface RecipeFormSidebarProps {
  recipe: NutriRecipe | null;
  servings: number;
  ingredientsCount: number;
  stepsCount: number;
  ciqualCount: number;
  title: string;
  imageUrl: string;
  totalTime: number;
  totalWeightGrams: number;
  computedNutrition: NutritionTotals | null;
  realtimeAutoTags: { tag_group: string; tag_value: string }[];
  onOverrideBadges?: () => void;
}

// ==================== MACRO COLORS (aligned with design system) ====================

const MACRO_CONFIG = [
  {
    key: 'calories',
    label: 'Énergie',
    icon: Flame,
    unit: 'kcal',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    bar: 'bg-orange-500',
    border: 'border-orange-200',
  },
  {
    key: 'protein',
    label: 'Protéines',
    icon: Beef,
    unit: 'g',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    bar: 'bg-blue-500',
    border: 'border-blue-200',
  },
  {
    key: 'carbs',
    label: 'Glucides',
    icon: Wheat,
    unit: 'g',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
    border: 'border-amber-200',
  },
  {
    key: 'fat',
    label: 'Lipides',
    icon: Droplets,
    unit: 'g',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    bar: 'bg-rose-500',
    border: 'border-rose-200',
  },
  {
    key: 'fiber',
    label: 'Fibres',
    icon: Leaf,
    unit: 'g',
    bg: 'bg-green-50',
    text: 'text-green-700',
    bar: 'bg-green-500',
    border: 'border-green-200',
  },
] as const;

// ==================== REVIEWS SUB-COMPONENT ====================

function RecipeReviewsSection({ recipeId }: { recipeId: string }) {
  const { data, isLoading: loadingReviews } =
    useNutritionistRecipeReviews(recipeId);
  const reviews = data?.reviews || [];
  const summary = data?.summary || { average: 0, count: 0 };

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <div className='px-4 py-3 border-b border-gray-100 flex items-center gap-2'>
        <MessageSquare className='w-4 h-4 text-amber-500' />
        <h3 className='text-sm font-semibold text-gray-800'>Avis patients</h3>
        {summary.count > 0 && (
          <span className='ml-auto text-xs text-gray-400'>{summary.count}</span>
        )}
      </div>

      <div className='p-4'>
        {loadingReviews ? (
          <div className='flex justify-center py-4'>
            <Loader2 className='w-4 h-4 animate-spin text-gray-300' />
          </div>
        ) : summary.count === 0 ? (
          <p className='text-xs text-gray-400 text-center py-2'>
            Aucun avis pour le moment
          </p>
        ) : (
          <div className='space-y-4'>
            {/* Summary */}
            <div className='flex items-center gap-3 pb-3 border-b border-gray-100'>
              <span className='text-2xl font-bold text-gray-800'>
                {summary.average.toFixed(1)}
              </span>
              <div>
                <div className='flex items-center gap-0.5'>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= Math.round(summary.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <span className='text-[10px] text-gray-400'>
                  {summary.count} avis
                </span>
              </div>
            </div>

            {/* Reviews list */}
            <div className='space-y-3 max-h-[300px] overflow-y-auto'>
              {reviews.map(review => (
                <div key={review.id} className='flex gap-2.5'>
                  <div className='w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0'>
                    <User className='w-3.5 h-3.5 text-gray-400' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-1'>
                      <span className='text-xs font-medium text-gray-700 truncate'>
                        {review.author}
                      </span>
                      <span className='text-[10px] text-gray-400 whitespace-nowrap'>
                        {new Date(review.createdAt).toLocaleDateString(
                          'fr-CH',
                          { day: 'numeric', month: 'short' }
                        )}
                      </span>
                    </div>
                    <div className='flex items-center gap-0.5 mt-0.5'>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className='text-xs text-gray-500 mt-1 leading-relaxed'>
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COMPONENT ====================

export function RecipeFormSidebar({
  recipe,
  servings,
  ingredientsCount,
  stepsCount,
  ciqualCount,
  title,
  imageUrl,
  totalTime,
  totalWeightGrams,
  computedNutrition,
  realtimeAutoTags,
  onOverrideBadges,
}: RecipeFormSidebarProps) {
  // Use real-time computed nutrition (from ingredients), fallback to saved recipe values
  const nutrition =
    computedNutrition ||
    (recipe?.calories !== null && recipe?.calories !== undefined
      ? {
          calories: recipe.calories,
          protein: recipe.proteinG || 0,
          carbs: recipe.carbsG || 0,
          fat: recipe.fatG || 0,
          fiber: recipe.fiberG || 0,
        }
      : null);

  const hasNutrition = nutrition !== null;

  // Convert total recipe values to per-100g
  const toPerHundredG = (totalValue: number) => {
    if (totalWeightGrams <= 0) return totalValue;
    return Math.round((totalValue / totalWeightGrams) * 100 * 10) / 10;
  };

  const macroValues: Record<string, number> = hasNutrition
    ? {
        calories: toPerHundredG(nutrition.calories),
        protein: toPerHundredG(nutrition.protein),
        carbs: toPerHundredG(nutrition.carbs),
        fat: toPerHundredG(nutrition.fat),
        fiber: toPerHundredG(nutrition.fiber),
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  const totalMacroGrams =
    macroValues.protein + macroValues.carbs + macroValues.fat;

  // Per-serving values
  const perServing: Record<string, number> =
    hasNutrition && servings > 0
      ? {
          calories: Math.round(nutrition.calories / servings),
          protein: Math.round((nutrition.protein / servings) * 10) / 10,
          carbs: Math.round((nutrition.carbs / servings) * 10) / 10,
          fat: Math.round((nutrition.fat / servings) * 10) / 10,
          fiber: Math.round((nutrition.fiber / servings) * 10) / 10,
        }
      : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  const isEdit = !!recipe;
  const isDraft = recipe?.status === 'draft';

  // Group badges by category for organized display (matches future filter UI)
  const BADGE_GROUP_ORDER: { key: string; label: string }[] = [
    { key: 'calories', label: 'Calories' },
    { key: 'time', label: 'Temps' },
    { key: 'nutrition', label: 'Profil nutritionnel' },
    { key: 'diet', label: 'Régime alimentaire' },
    { key: 'allergen', label: 'Allergènes' },
  ];

  const badgesByGroup = realtimeAutoTags.reduce<
    Record<string, typeof realtimeAutoTags>
  >((acc, tag) => {
    if (!acc[tag.tag_group]) acc[tag.tag_group] = [];
    acc[tag.tag_group].push(tag);
    return acc;
  }, {});

  return (
    <div className='space-y-4'>
      {/* ── Badges ── */}
      {realtimeAutoTags.length > 0 && (
        <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
          <div className='px-4 py-3 border-b border-gray-100 flex items-center gap-2'>
            <Zap className='w-4 h-4 text-amber-500' />
            <h3 className='text-sm font-semibold text-gray-800'>Badges</h3>
            {recipe?.id && onOverrideBadges && (
              <button
                type='button'
                onClick={onOverrideBadges}
                className='ml-auto text-[10px] text-gray-400 hover:text-[#1B998B] transition-colors'
              >
                Corriger
              </button>
            )}
          </div>
          <div className='p-4 space-y-3'>
            {BADGE_GROUP_ORDER.map(group => {
              const tags = badgesByGroup[group.key];
              if (!tags || tags.length === 0) return null;

              return (
                <div key={group.key}>
                  <p className='text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5'>
                    {group.label}
                  </p>
                  <div className='flex flex-wrap gap-1.5'>
                    {tags.map(tag => {
                      const isUncertain = tag.tag_value.endsWith('-uncertain');
                      const groupConfig =
                        TAG_GROUP_MAP[
                          tag.tag_group as keyof typeof TAG_GROUP_MAP
                        ];
                      const color = isUncertain
                        ? '#D97706'
                        : groupConfig?.color || '#6B7280';
                      return (
                        <span
                          key={`${tag.tag_group}-${tag.tag_value}`}
                          className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                            border: `1px solid ${color}30`,
                          }}
                          title={
                            isUncertain
                              ? 'Non garanti — certains ingrédients ne sont pas liés à la base CIQUAL'
                              : undefined
                          }
                        >
                          {AUTO_TAG_LABELS[tag.tag_value] || tag.tag_value}
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

      {/* ── Valeurs nutritionnelles ── */}
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <div className='px-4 py-3 border-b border-gray-100 flex items-center gap-2'>
          <Flame className='w-4 h-4 text-orange-500' />
          <h3 className='text-sm font-semibold text-gray-800'>
            Valeurs nutritionnelles
          </h3>
        </div>

        {hasNutrition ? (
          <div className='p-4 space-y-4'>
            {/* Dual calories hero: per serving + per 100g */}
            <div className='flex items-stretch gap-0'>
              <div className='flex-1 text-center py-2 bg-orange-50/50 rounded-l-lg'>
                <p className='text-2xl font-bold text-gray-900'>
                  {perServing.calories}
                </p>
                <p className='text-[10px] text-gray-500 mt-0.5'>
                  kcal / {servings} portion{servings > 1 ? 's' : ''}
                </p>
              </div>
              <div className='w-px bg-gray-200 self-stretch my-2' />
              <div className='flex-1 text-center py-2 bg-orange-50/50 rounded-r-lg'>
                <p className='text-2xl font-bold text-gray-900'>
                  {macroValues.calories}
                </p>
                <p className='text-[10px] text-gray-500 mt-0.5'>kcal / 100g</p>
              </div>
            </div>

            {/* Macro distribution bar */}
            {totalMacroGrams > 0 && (
              <div className='flex h-3 rounded-full overflow-hidden bg-gray-100'>
                <div
                  className='bg-blue-500 transition-all duration-300'
                  style={{
                    width: `${(macroValues.protein / totalMacroGrams) * 100}%`,
                  }}
                  title={`Protéines: ${((macroValues.protein / totalMacroGrams) * 100).toFixed(0)}%`}
                />
                <div
                  className='bg-amber-500 transition-all duration-300'
                  style={{
                    width: `${(macroValues.carbs / totalMacroGrams) * 100}%`,
                  }}
                  title={`Glucides: ${((macroValues.carbs / totalMacroGrams) * 100).toFixed(0)}%`}
                />
                <div
                  className='bg-rose-500 transition-all duration-300'
                  style={{
                    width: `${(macroValues.fat / totalMacroGrams) * 100}%`,
                  }}
                  title={`Lipides: ${((macroValues.fat / totalMacroGrams) * 100).toFixed(0)}%`}
                />
              </div>
            )}

            {/* Macro cards — per serving (primary) + per 100g (secondary) */}
            <div className='space-y-2'>
              {MACRO_CONFIG.filter(m => m.key !== 'calories').map(macro => {
                const valuePer100g = macroValues[macro.key];
                const valuePerServing = perServing[macro.key];
                const pct =
                  totalMacroGrams > 0 && macro.key !== 'fiber'
                    ? Math.round((valuePer100g / totalMacroGrams) * 100)
                    : null;
                const Icon = macro.icon;

                return (
                  <div
                    key={macro.key}
                    className={`${macro.bg} rounded-lg p-3 space-y-1.5`}
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-600 flex items-center gap-1.5'>
                        <Icon className='w-3.5 h-3.5' />
                        {macro.label}
                      </span>
                      <div className='text-right'>
                        <span className={`text-sm font-semibold ${macro.text}`}>
                          {pct !== null ? `${pct}% ` : ''}
                          {valuePerServing.toFixed(1)}
                          {macro.unit}
                        </span>
                        <span className='text-[10px] text-gray-400 ml-1.5'>
                          ({valuePer100g.toFixed(1)}/100g)
                        </span>
                      </div>
                    </div>
                    {pct !== null && (
                      <div className='h-1.5 bg-white/60 rounded-full overflow-hidden'>
                        <div
                          className={`h-full rounded-full ${macro.bar} transition-all duration-300`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Note */}
            <p className='text-[10px] text-gray-400 text-center'>
              Calculé depuis les ingrédients CIQUAL ({ciqualCount} lié
              {ciqualCount !== 1 ? 's' : ''}) · {servings} portion
              {servings !== 1 ? 's' : ''}
            </p>
          </div>
        ) : (
          <div className='p-6 text-center'>
            <Flame className='w-10 h-10 text-gray-200 mx-auto mb-2' />
            <p className='text-sm text-gray-500'>
              Ajoutez des ingrédients depuis la base CIQUAL pour calculer les
              valeurs nutritionnelles
            </p>
          </div>
        )}
      </div>

      {/* ── Résumé recette ── */}
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <div className='px-4 py-3 border-b border-gray-100 flex items-center gap-2'>
          <ChefHat className='w-4 h-4 text-[#1B998B]' />
          <h3 className='text-sm font-semibold text-gray-800'>Résumé</h3>
        </div>
        <div className='p-4 space-y-3'>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between text-gray-600'>
              <span>Portions</span>
              <span className='font-medium text-gray-900'>{servings}</span>
            </div>
            {totalTime > 0 && (
              <div className='flex items-center justify-between text-gray-600'>
                <span>Temps total</span>
                <span className='font-medium text-gray-900'>
                  {totalTime} min
                </span>
              </div>
            )}
            <div className='flex items-center justify-between text-gray-600'>
              <span>Ingrédients</span>
              <span className='font-medium text-gray-900'>
                {ingredientsCount}
              </span>
            </div>
            <div className='flex items-center justify-between text-gray-600'>
              <span>Étapes</span>
              <span className='font-medium text-gray-900'>{stepsCount}</span>
            </div>
            <div className='flex items-center justify-between text-gray-600'>
              <span>Liés à CIQUAL</span>
              <span className='font-medium text-[#1B998B]'>{ciqualCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Avis patients ── */}
      {isEdit && recipe?.id && <RecipeReviewsSection recipeId={recipe.id} />}

      {/* ── Checklist publication ── */}
      {(!isEdit || isDraft) && (
        <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
          <div className='px-4 py-3 border-b border-gray-100'>
            <h3 className='text-sm font-semibold text-gray-800'>
              Checklist publication
            </h3>
          </div>
          <div className='p-4 space-y-2'>
            {[
              { ok: title.length >= 3, label: 'Titre (min 3 caractères)' },
              { ok: ingredientsCount > 0, label: 'Au moins 1 ingrédient' },
              { ok: stepsCount > 0, label: 'Au moins 1 étape' },
              { ok: !!imageUrl, label: 'Vignette ajoutée' },
            ].map(item => (
              <div key={item.label} className='flex items-center gap-2.5'>
                {item.ok ? (
                  <div className='w-5 h-5 rounded-full bg-[#1B998B]/10 flex items-center justify-center'>
                    <Check className='w-3 h-3 text-[#1B998B]' />
                  </div>
                ) : (
                  <div className='w-5 h-5 rounded-full border-2 border-gray-200' />
                )}
                <span
                  className={`text-sm ${item.ok ? 'text-gray-700' : 'text-gray-400'}`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
