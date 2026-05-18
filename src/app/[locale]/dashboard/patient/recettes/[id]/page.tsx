'use client';

import React, { use, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Heart,
  Clock,
  Star,
  ChefHat,
  ShoppingCart,
  Share2,
  Users,
  Minus,
  Plus,
  UtensilsCrossed,
  Loader2,
  Timer,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Leaf,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RecipeRating } from '@/components/recipes/RecipeRating';
import { LogMealModal } from '@/components/recipes/LogMealModal';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';
import {
  usePatientRecipeDetail,
  useToggleFavorite,
  useRecipeRating,
  useRecipeReviews,
  useSubmitRating,
  useLogRecipeAsMeal,
} from '@/hooks/usePatientRecipes';
import { useAddRecipeToShoppingList } from '@/hooks/useShoppingList';
import { DIFFICULTY_LABELS } from '@/types/recipes';
import { TAG_GROUP_CONFIG, TAG_GROUP_MAP } from '@/lib/recipe-auto-tags';
import type { NutriRecipe } from '@/types/recipes';

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

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: recipe, isLoading, error } = usePatientRecipeDetail(id);
  const { data: currentRating } = useRecipeRating(id);
  const { data: reviews = [], isLoading: isLoadingReviews } =
    useRecipeReviews(id);

  const toggleFavorite = useToggleFavorite();
  const submitRating = useSubmitRating();
  const logRecipeAsMeal = useLogRecipeAsMeal();
  const addToShoppingList = useAddRecipeToShoppingList();

  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [showLogMealModal, setShowLogMealModal] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message?: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
  });
  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      setToast({ visible: true, type, title, message });
    },
    []
  );
  const hideToast = useCallback(
    () => setToast(t => ({ ...t, visible: false })),
    []
  );

  const handleToggleFavorite = useCallback(async () => {
    if (!recipe) return;
    try {
      const result = await toggleFavorite.mutateAsync(recipe.id);
      showToast(
        'success',
        result.is_favorite ? 'Ajouté aux favoris' : 'Retiré des favoris'
      );
    } catch {
      showToast('error', 'Erreur', 'Impossible de modifier les favoris');
    }
  }, [recipe, toggleFavorite, showToast]);

  const handleAddToShoppingList = useCallback(async () => {
    if (!recipe) return;
    try {
      await addToShoppingList.mutateAsync({
        recipeId: recipe.id,
        servingsMultiplier,
      });
      showToast(
        'success',
        'Ajouté à la liste de courses',
        `${recipe.ingredients.length} ingrédient(s) ajouté(s)`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'ajout";
      showToast('error', 'Erreur', message);
    }
  }, [recipe, servingsMultiplier, addToShoppingList, showToast]);

  const handleRate = useCallback(
    async (recipeId: string, rating: number, comment: string | null) => {
      try {
        await submitRating.mutateAsync({ recipeId, rating, comment });
        showToast('success', 'Note enregistrée');
      } catch {
        showToast('error', 'Erreur', "Impossible d'enregistrer la note");
      }
    },
    [submitRating, showToast]
  );

  const handleConfirmLogMeal = useCallback(
    async (
      recipeId: string,
      mealType: string,
      date: string,
      servingsMul: number
    ) => {
      try {
        await logRecipeAsMeal.mutateAsync({
          recipeId,
          mealType,
          date,
          servingsMultiplier: servingsMul,
        });
        setShowLogMealModal(false);
        showToast('success', 'Repas enregistré');
      } catch {
        showToast('error', 'Erreur', "Impossible d'enregistrer le repas");
      }
    },
    [logRecipeAsMeal, showToast]
  );

  const handleShare = async () => {
    if (!recipe || !navigator.share) return;
    try {
      await navigator.share({
        title: recipe.title,
        text: `Découvrez cette recette : ${recipe.title}`,
        url: window.location.href,
      });
    } catch {
      /* cancelled */
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className='bg-[#FBF9F7]'>
        <DashboardHeader />
        <div className='flex items-center justify-center py-32'>
          <div className='w-8 h-8 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
        </div>
      </div>
    );
  }

  // Not found
  if (error || !recipe) {
    return (
      <div className='bg-[#FBF9F7]'>
        <DashboardHeader />
        <div className='flex flex-col items-center justify-center py-32 px-4'>
          <span className='text-5xl mb-4'>🍽️</span>
          <h2 className='text-lg font-semibold text-gray-800 mb-2'>
            Recette introuvable
          </h2>
          <button
            onClick={() => router.back()}
            className='text-[#1B998B] font-medium hover:underline'
          >
            Retour aux recettes
          </button>
        </div>
      </div>
    );
  }

  const isFavorite = recipe.isFavorite;
  const adjustedServings = recipe.servings * servingsMultiplier;

  const ingredientGroups = new Map<string, typeof recipe.ingredients>();
  for (const ing of recipe.ingredients) {
    const group = ing.groupName || '';
    if (!ingredientGroups.has(group)) ingredientGroups.set(group, []);
    ingredientGroups.get(group)!.push(ing);
  }

  return (
    <div className='bg-[#FBF9F7]'>
      <DashboardHeader />

      {/* ── Hero Image ── */}
      <div className='relative'>
        <div className='h-60 sm:h-80 bg-gradient-to-br from-[#1B998B]/20 to-teal-100'>
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <span className='text-8xl drop-shadow-lg'>
                {recipe.category?.emoji || '🍽️'}
              </span>
            </div>
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent' />
        </div>

        {/* Navigation bar */}
        <div className='absolute top-4 left-4 right-4 flex items-center justify-between'>
          <button
            onClick={() => router.back()}
            className='w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors'
          >
            <ArrowLeft className='w-5 h-5 text-gray-700' />
          </button>
          <div className='flex gap-2'>
            <button
              onClick={handleToggleFavorite}
              disabled={toggleFavorite.isPending}
              className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
              />
            </button>
            <button
              onClick={handleShare}
              className='w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-white transition-colors'
            >
              <Share2 className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Title overlay on image */}
        <div className='absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between'>
          <div className='flex-1 min-w-0 mr-4'>
            {recipe.category && (
              <span className='inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 mb-3 shadow-sm'>
                {recipe.category.emoji} {recipe.category.label}
              </span>
            )}
            <h1 className='text-2xl sm:text-3xl font-bold text-white drop-shadow-lg leading-tight'>
              {recipe.title}
            </h1>
          </div>

          {/* Action buttons */}
          <div className='flex flex-col gap-2 flex-shrink-0'>
            <button
              onClick={() => setShowLogMealModal(true)}
              title="J'ai cuisiné cette recette"
              className='w-11 h-11 bg-[#1B998B] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1B998B]/90 transition-colors'
            >
              <UtensilsCrossed className='w-5 h-5' />
            </button>
            <button
              onClick={handleAddToShoppingList}
              disabled={addToShoppingList.isPending}
              title='Ajouter à ma liste de courses'
              className='w-11 h-11 bg-white/90 backdrop-blur-sm text-[#1B998B] rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50'
            >
              {addToShoppingList.isPending ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <ShoppingCart className='w-5 h-5' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content: 2 columns on desktop, 1 on mobile ── */}
      <div className='w-full px-6 pb-8 mt-4'>
        <div className='grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start'>
          {/* ══ LEFT COLUMN: Ingredients + Steps ══ */}
          <div className='space-y-4'>
            {/* ── Ingredients Card ── */}
            {recipe.ingredients.length > 0 && (
              <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-6'>
                <div className='flex items-center justify-between mb-5'>
                  <h2 className='text-base font-semibold text-gray-800 flex items-center gap-2'>
                    <div className='w-8 h-8 rounded-lg bg-[#1B998B]/10 flex items-center justify-center'>
                      <ShoppingCart className='w-4 h-4 text-[#1B998B]' />
                    </div>
                    Ingrédients
                  </h2>

                  {/* Portion adjuster */}
                  <div className='flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1'>
                    <button
                      onClick={() =>
                        setServingsMultiplier(
                          Math.max(1, servingsMultiplier - 1)
                        )
                      }
                      disabled={servingsMultiplier <= 1}
                      className='w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30'
                    >
                      <Minus className='w-3.5 h-3.5 text-gray-500' />
                    </button>
                    <span className='flex items-center gap-1 text-sm font-medium text-gray-700 min-w-[60px] justify-center'>
                      <Users className='w-3.5 h-3.5 text-gray-400' />
                      {adjustedServings}
                    </span>
                    <button
                      onClick={() =>
                        setServingsMultiplier(servingsMultiplier + 1)
                      }
                      className='w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors'
                    >
                      <Plus className='w-3.5 h-3.5 text-gray-500' />
                    </button>
                  </div>
                </div>

                {Array.from(ingredientGroups.entries()).map(
                  ([groupName, items]) => (
                    <div
                      key={groupName || '__default'}
                      className='mb-4 last:mb-0'
                    >
                      {groupName && (
                        <p className='text-xs font-semibold text-[#1B998B] uppercase tracking-wider mb-2 pb-1 border-b border-[#1B998B]/10'>
                          {groupName}
                        </p>
                      )}
                      <ul>
                        {items.map((ing, idx) => (
                          <li
                            key={ing.id}
                            className={`flex justify-between items-center py-3 ${
                              idx < items.length - 1
                                ? 'border-b border-gray-100'
                                : ''
                            }`}
                          >
                            <div className='flex items-center gap-3'>
                              <span className='w-2 h-2 rounded-full bg-[#1B998B]/30 flex-shrink-0' />
                              <span
                                className={`text-sm ${ing.isOptional ? 'italic text-gray-400' : 'text-gray-700'}`}
                              >
                                {ing.name}
                                {ing.isOptional && (
                                  <span className='text-[10px] text-gray-400 ml-1'>
                                    (optionnel)
                                  </span>
                                )}
                              </span>
                            </div>
                            <span className='text-sm text-gray-500 font-medium whitespace-nowrap ml-4'>
                              {ing.quantityValue
                                ? `${Math.round(ing.quantityValue * servingsMultiplier)} ${formatUnit(ing.quantityUnit)}`
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

            {/* ── Steps Card ── */}
            {recipe.steps.length > 0 && (
              <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-6'>
                <h2 className='text-base font-semibold text-gray-800 mb-5 flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-lg bg-[#1B998B]/10 flex items-center justify-center'>
                    <ChefHat className='w-4 h-4 text-[#1B998B]' />
                  </div>
                  Préparation
                  <span className='text-xs text-gray-400 font-normal ml-auto'>
                    {recipe.steps.length} étapes
                  </span>
                </h2>
                <ol className='space-y-5'>
                  {recipe.steps.map((step, idx) => (
                    <li key={step.id} className='flex gap-4'>
                      <div className='flex flex-col items-center'>
                        <span className='w-8 h-8 bg-[#1B998B] text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0'>
                          {step.stepNumber}
                        </span>
                        {idx < recipe.steps.length - 1 && (
                          <div className='w-px flex-1 bg-[#1B998B]/15 mt-2' />
                        )}
                      </div>
                      <div className='flex-1 pb-2'>
                        <p className='text-sm text-gray-700 leading-relaxed'>
                          {step.instruction}
                        </p>
                        {step.durationMinutes && (
                          <span className='inline-flex items-center gap-1 text-xs text-gray-400 mt-2 bg-gray-50 px-2 py-0.5 rounded-full'>
                            <Clock className='w-3 h-3' />
                            {step.durationMinutes} min
                          </span>
                        )}
                        {step.tips && (
                          <div className='flex gap-2 items-start mt-2 bg-[#E9C46A]/10 rounded-lg px-3 py-2'>
                            <span className='text-sm'>💡</span>
                            <p className='text-xs text-[#8B7355] leading-relaxed'>
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

            {/* ── Tips Card ── */}
            {recipe.tips && (
              <div className='bg-[#E9C46A]/10 border border-[#E9C46A]/30 rounded-xl p-6'>
                <h2 className='text-base font-semibold text-[#8B7355] mb-2 flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-lg bg-[#E9C46A]/20 flex items-center justify-center'>
                    <ChefHat className='w-4 h-4 text-[#C4A265]' />
                  </div>
                  Conseil du chef
                </h2>
                <p className='text-sm text-[#8B7355] leading-relaxed ml-10'>
                  {recipe.tips}
                </p>
              </div>
            )}
          </div>

          {/* ══ RIGHT COLUMN: Nutrition + Info + Tags + Rating ══ */}
          <div className='space-y-4 lg:sticky lg:top-4'>
            {/* ── Quick info bar ── */}
            <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] px-2 py-4 grid grid-cols-4 gap-0 divide-x divide-gray-100'>
              <div className='flex flex-col items-center justify-center gap-1'>
                <Clock className='w-4 h-4 text-[#1B998B]' />
                <span className='text-sm font-semibold text-gray-800'>
                  {recipe.totalTimeMinutes} min
                </span>
                <span className='text-[10px] text-gray-400'>Total</span>
              </div>
              <div className='flex flex-col items-center justify-center gap-1'>
                <Timer className='w-4 h-4 text-[#E9C46A]' />
                <span className='text-sm font-semibold text-gray-800'>
                  {recipe.prepTimeMinutes} min
                </span>
                <span className='text-[10px] text-gray-400'>Préparation</span>
              </div>
              <div className='flex flex-col items-center justify-center gap-1'>
                <Users className='w-4 h-4 text-[#78CFC6]' />
                <span className='text-sm font-semibold text-gray-800'>
                  {recipe.servings}
                </span>
                <span className='text-[10px] text-gray-400'>Portions</span>
              </div>
              <div className='flex flex-col items-center justify-center gap-1'>
                <ChefHat className='w-4 h-4 text-[#E76F51]' />
                <span className='text-sm font-semibold text-gray-800'>
                  {DIFFICULTY_LABELS[recipe.difficulty]}
                </span>
                <span className='text-[10px] text-gray-400'>Difficulté</span>
              </div>
            </div>

            {/* ── Nutrition Card (same design as nutritionist dashboard) ── */}
            {(() => {
              // Compute totals from ingredients
              let totalCal = 0,
                totalProt = 0,
                totalCarb = 0,
                totalFat = 0,
                totalFib = 0;
              let totalWeightG = 0;
              let ciqualCount = 0;
              let hasData = false;

              for (const ing of recipe.ingredients) {
                if (ing.caloriesPer100g && ing.quantityValue) {
                  const factor = ing.quantityValue / 100;
                  totalCal += ing.caloriesPer100g * factor;
                  totalProt += (ing.proteinPer100g || 0) * factor;
                  totalCarb += (ing.carbsPer100g || 0) * factor;
                  totalFat += (ing.fatPer100g || 0) * factor;
                  totalFib += (ing.fiberPer100g || 0) * factor;
                  ciqualCount++;
                  hasData = true;
                }
                if (ing.quantityValue) totalWeightG += ing.quantityValue;
              }

              // Fallback to recipe-level values if no ingredient data
              if (!hasData) {
                if (recipe.calories === null && recipe.proteinG === null)
                  return null;
                totalCal = (recipe.calories || 0) * recipe.servings;
                totalProt = (recipe.proteinG || 0) * recipe.servings;
                totalCarb = (recipe.carbsG || 0) * recipe.servings;
                totalFat = (recipe.fatG || 0) * recipe.servings;
                totalFib = (recipe.fiberG || 0) * recipe.servings;
              }

              const servings = recipe.servings || 1;
              const perServing = {
                calories: Math.round(
                  (totalCal / servings) * servingsMultiplier
                ),
                protein:
                  Math.round((totalProt / servings) * servingsMultiplier * 10) /
                  10,
                carbs:
                  Math.round((totalCarb / servings) * servingsMultiplier * 10) /
                  10,
                fat:
                  Math.round((totalFat / servings) * servingsMultiplier * 10) /
                  10,
                fiber:
                  Math.round((totalFib / servings) * servingsMultiplier * 10) /
                  10,
              };

              const toPerHundredG = (val: number) =>
                totalWeightG > 0
                  ? Math.round((val / totalWeightG) * 100 * 10) / 10
                  : Math.round(val * 10) / 10;

              const per100g = {
                calories: toPerHundredG(totalCal),
                protein: toPerHundredG(totalProt),
                carbs: toPerHundredG(totalCarb),
                fat: toPerHundredG(totalFat),
                fiber: toPerHundredG(totalFib),
              };

              const totalMacroG = per100g.protein + per100g.carbs + per100g.fat;

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

              return (
                <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden'>
                  <div className='px-4 py-3 border-b border-gray-100 flex items-center gap-2'>
                    <Flame className='w-4 h-4 text-orange-500' />
                    <h3 className='text-sm font-semibold text-gray-800'>
                      Valeurs nutritionnelles
                    </h3>
                  </div>

                  <div className='p-4 space-y-4'>
                    {/* Dual calories hero */}
                    <div className='flex items-stretch gap-0'>
                      <div className='flex-1 text-center py-2 bg-orange-50/50 rounded-l-lg'>
                        <p className='text-2xl font-bold text-gray-900'>
                          {perServing.calories}
                        </p>
                        <p className='text-[10px] text-gray-500 mt-0.5'>
                          kcal / {adjustedServings} portion
                          {adjustedServings > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className='w-px bg-gray-200 self-stretch my-2' />
                      <div className='flex-1 text-center py-2 bg-orange-50/50 rounded-r-lg'>
                        <p className='text-2xl font-bold text-gray-900'>
                          {per100g.calories}
                        </p>
                        <p className='text-[10px] text-gray-500 mt-0.5'>
                          kcal / 100g
                        </p>
                      </div>
                    </div>

                    {/* Macro distribution bar */}
                    {totalMacroG > 0 && (
                      <div className='flex h-3 rounded-full overflow-hidden bg-gray-100'>
                        <div
                          className='bg-blue-500 transition-all duration-300'
                          style={{
                            width: `${(per100g.protein / totalMacroG) * 100}%`,
                          }}
                          title={`Protéines: ${Math.round((per100g.protein / totalMacroG) * 100)}%`}
                        />
                        <div
                          className='bg-amber-500 transition-all duration-300'
                          style={{
                            width: `${(per100g.carbs / totalMacroG) * 100}%`,
                          }}
                          title={`Glucides: ${Math.round((per100g.carbs / totalMacroG) * 100)}%`}
                        />
                        <div
                          className='bg-rose-500 transition-all duration-300'
                          style={{
                            width: `${(per100g.fat / totalMacroG) * 100}%`,
                          }}
                          title={`Lipides: ${Math.round((per100g.fat / totalMacroG) * 100)}%`}
                        />
                      </div>
                    )}

                    {/* Macro cards */}
                    <div className='space-y-2'>
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
                            className={`${macro.bg} rounded-lg p-3 space-y-1.5`}
                          >
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-gray-600 flex items-center gap-1.5'>
                                <macro.Icon className='w-3.5 h-3.5' />
                                {macro.label}
                              </span>
                              <div className='text-right'>
                                <span
                                  className={`text-sm font-semibold ${macro.text}`}
                                >
                                  {pct !== null ? `${pct}% ` : ''}
                                  {valPerServing.toFixed(1)}g
                                </span>
                                <span className='text-[10px] text-gray-400 ml-1.5'>
                                  ({valPer100g.toFixed(1)}/100g)
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
                  </div>
                </div>
              );
            })()}

            {/* ── Tags by category ── */}
            {(recipe.tags.length > 0 || recipe.autoTags.length > 0) &&
              (() => {
                // Group manual tags by tagType (which maps to group slug)
                const manualByGroup = new Map<string, typeof recipe.tags>();
                for (const tag of recipe.tags) {
                  const group = tag.tagType || 'other';
                  if (!manualByGroup.has(group)) manualByGroup.set(group, []);
                  manualByGroup.get(group)!.push(tag);
                }

                // Group auto-tags by group
                const autoByGroup = new Map<string, typeof recipe.autoTags>();
                for (const tag of recipe.autoTags) {
                  if (!autoByGroup.has(tag.group))
                    autoByGroup.set(tag.group, []);
                  autoByGroup.get(tag.group)!.push(tag);
                }

                // Merge all group slugs preserving TAG_GROUP_CONFIG order
                const allGroupSlugs = new Set([
                  ...manualByGroup.keys(),
                  ...autoByGroup.keys(),
                ]);
                const orderedGroups = TAG_GROUP_CONFIG.filter(g =>
                  allGroupSlugs.has(g.slug)
                );

                return (
                  <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-6'>
                    <h2 className='text-base font-semibold text-gray-800 mb-4'>
                      Tags
                    </h2>
                    <div className='space-y-3'>
                      {orderedGroups.map(groupConfig => {
                        const manual =
                          manualByGroup.get(groupConfig.slug) || [];
                        const auto = autoByGroup.get(groupConfig.slug) || [];
                        if (manual.length === 0 && auto.length === 0)
                          return null;

                        return (
                          <div key={groupConfig.slug}>
                            <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5'>
                              {groupConfig.label}
                            </p>
                            <div className='flex flex-wrap gap-1.5'>
                              {manual.map(tag => (
                                <span
                                  key={tag.id}
                                  className='px-2.5 py-1 rounded-full text-xs font-medium border'
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
                                    tag.group as keyof typeof TAG_GROUP_MAP
                                  ]?.color || tag.color;
                                return (
                                  <span
                                    key={tag.value}
                                    className='px-2.5 py-1 rounded-full text-xs font-medium border'
                                    style={{
                                      backgroundColor: `${color}15`,
                                      color: color,
                                      borderColor: `${color}30`,
                                    }}
                                  >
                                    {tag.label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>

        {/* ── Rating Card (full width) ── */}
        <div className='bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-6 mt-4'>
          {(() => {
            // Use reviews as source of truth for average/count (DB trigger may not be migrated)
            const reviewCount = reviews.length;
            const avgRating =
              reviewCount > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                : recipe.averageRating;
            const totalCount =
              reviewCount > 0 ? reviewCount : recipe.ratingCount;

            return (
              <RecipeRating
                recipeId={recipe.id}
                currentRating={currentRating?.rating || null}
                currentComment={currentRating?.comment || null}
                averageRating={avgRating}
                ratingCount={totalCount}
                onRate={handleRate}
                isSubmitting={submitRating.isPending}
                reviews={reviews}
                isLoadingReviews={isLoadingReviews}
              />
            );
          })()}
        </div>
      </div>

      <LogMealModal
        isOpen={showLogMealModal}
        recipe={recipe}
        onClose={() => setShowLogMealModal(false)}
        onConfirm={handleConfirmLogMeal}
        isSubmitting={logRecipeAsMeal.isPending}
      />

      <Toast
        isVisible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
}
