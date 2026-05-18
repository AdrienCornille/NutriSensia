'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Heart,
  Clock,
  Star,
  Flame,
  ChefHat,
  ShoppingCart,
  Share2,
  Users,
  Minus,
  Plus,
  UtensilsCrossed,
} from 'lucide-react';
import type { NutriRecipe } from '@/types/recipes';
import { DIFFICULTY_LABELS } from '@/types/recipes';
import { RecipeNutritionBar } from './RecipeNutritionBar';
import { RecipeRating } from './RecipeRating';

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

interface RecipeModalProps {
  isOpen: boolean;
  recipe: (NutriRecipe & { isFavorite?: boolean }) | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (recipeId: string) => void;
  onAddToShoppingList: (
    recipe: NutriRecipe,
    servingsMultiplier: number
  ) => void;
  isAddingToShoppingList?: boolean;
  onLogMeal?: (recipe: NutriRecipe) => void;
  onRate?: (
    recipeId: string,
    rating: number,
    comment: string | null
  ) => Promise<void>;
  currentRating?: { rating: number; comment: string | null } | null;
  isRatingSubmitting?: boolean;
}

export function RecipeModal({
  isOpen,
  recipe,
  isFavorite,
  onClose,
  onToggleFavorite,
  onAddToShoppingList,
  isAddingToShoppingList,
  onLogMeal,
  onRate,
  currentRating,
  isRatingSubmitting,
}: RecipeModalProps) {
  const [servingsMultiplier, setServingsMultiplier] = useState(1);

  if (!isOpen || !recipe) return null;

  const adjustedServings = recipe.servings * servingsMultiplier;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Découvrez cette recette : ${recipe.title}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='relative w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300'>
        {/* Header Image */}
        <div className='relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100'>
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className='absolute inset-0 w-full h-full object-cover'
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-6xl'>{recipe.category?.emoji || '🍽️'}</span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className='absolute top-4 left-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors'
          >
            <X className='w-5 h-5 text-gray-700' />
          </button>

          {/* Action buttons */}
          <div className='absolute top-4 right-4 flex gap-2'>
            <button
              onClick={() => onToggleFavorite(recipe.id)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
              />
            </button>
            <button
              onClick={handleShare}
              className='p-2 bg-white/80 rounded-full text-gray-600 hover:bg-white transition-colors'
            >
              <Share2 className='w-5 h-5' />
            </button>
          </div>

          {/* Category badge */}
          {recipe.category && (
            <div className='absolute bottom-4 left-4 px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-700'>
              {recipe.category.emoji} {recipe.category.label}
            </div>
          )}
        </div>

        {/* Content */}
        <div className='overflow-y-auto max-h-[calc(90vh-12rem)]'>
          <div className='p-4'>
            {/* Title */}
            <h2 className='text-xl font-bold text-gray-900 mb-2'>
              {recipe.title}
            </h2>

            {/* Meta info */}
            <div className='flex items-center gap-4 text-sm text-gray-500 mb-4'>
              <span className='flex items-center gap-1'>
                <Clock className='w-4 h-4' />
                {recipe.totalTimeMinutes} min
              </span>
              <span className='flex items-center gap-1'>
                <ChefHat className='w-4 h-4' />
                {DIFFICULTY_LABELS[recipe.difficulty]}
              </span>
              {recipe.averageRating > 0 && (
                <span className='flex items-center gap-1'>
                  <Star className='w-4 h-4 text-amber-500 fill-amber-500' />
                  {recipe.averageRating.toFixed(1)} ({recipe.ratingCount})
                </span>
              )}
            </div>

            {/* Nutrition Bar */}
            <RecipeNutritionBar
              calories={recipe.calories}
              protein={recipe.proteinG}
              carbs={recipe.carbsG}
              fat={recipe.fatG}
              fiber={recipe.fiberG}
              servingsMultiplier={servingsMultiplier}
            />

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div className='flex flex-wrap gap-2 mb-4'>
                {recipe.tags.map(tag => (
                  <span
                    key={tag.id}
                    className='px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm'
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            {/* Ingredients */}
            {recipe.ingredients.length > 0 && (
              <div className='mb-4'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='font-semibold text-gray-900 flex items-center gap-2'>
                    <ShoppingCart className='w-4 h-4' />
                    Ingrédients
                  </h3>
                  {/* Portion adjuster */}
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() =>
                        setServingsMultiplier(
                          Math.max(1, servingsMultiplier - 1)
                        )
                      }
                      disabled={servingsMultiplier <= 1}
                      className='p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
                    >
                      <Minus className='w-3.5 h-3.5 text-gray-600' />
                    </button>
                    <span className='flex items-center gap-1 text-sm text-gray-600 min-w-[80px] justify-center'>
                      <Users className='w-4 h-4' />
                      {adjustedServings} port.
                    </span>
                    <button
                      onClick={() =>
                        setServingsMultiplier(servingsMultiplier + 1)
                      }
                      className='p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
                    >
                      <Plus className='w-3.5 h-3.5 text-gray-600' />
                    </button>
                  </div>
                </div>

                {/* Group ingredients */}
                {(() => {
                  const groups = new Map<string, typeof recipe.ingredients>();
                  for (const ing of recipe.ingredients) {
                    const group = ing.groupName || '';
                    if (!groups.has(group)) groups.set(group, []);
                    groups.get(group)!.push(ing);
                  }
                  return Array.from(groups.entries()).map(
                    ([groupName, items]) => (
                      <div key={groupName || '__default'} className='mb-2'>
                        {groupName && (
                          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>
                            {groupName}
                          </p>
                        )}
                        <ul className='space-y-1'>
                          {items.map(ing => (
                            <li
                              key={ing.id}
                              className='flex justify-between items-center py-2 border-b border-gray-100 last:border-0'
                            >
                              <span
                                className={`text-gray-700 ${ing.isOptional ? 'italic text-gray-500' : ''}`}
                              >
                                {ing.name}
                                {ing.isOptional && (
                                  <span className='text-xs ml-1'>
                                    (optionnel)
                                  </span>
                                )}
                              </span>
                              <span className='text-gray-500 text-sm'>
                                {ing.quantityValue
                                  ? `${Math.round(ing.quantityValue * servingsMultiplier)} ${formatUnit(ing.quantityUnit)}`
                                  : ing.quantity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  );
                })()}
              </div>
            )}

            {/* Steps */}
            {recipe.steps.length > 0 && (
              <div className='mb-4'>
                <h3 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                  <ChefHat className='w-4 h-4' />
                  Préparation
                </h3>
                <ol className='space-y-3'>
                  {recipe.steps.map(step => (
                    <li key={step.id} className='flex gap-3'>
                      <span className='flex-shrink-0 w-6 h-6 bg-[#1B998B] text-white rounded-full text-sm flex items-center justify-center font-medium'>
                        {step.stepNumber}
                      </span>
                      <div className='flex-1'>
                        <p className='text-gray-700 text-sm leading-relaxed pt-0.5'>
                          {step.instruction}
                        </p>
                        {step.durationMinutes && (
                          <span className='text-xs text-gray-400 flex items-center gap-1 mt-1'>
                            <Clock className='w-3 h-3' />
                            {step.durationMinutes} min
                          </span>
                        )}
                        {step.tips && (
                          <p className='text-xs text-amber-600 mt-1'>
                            Astuce : {step.tips}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tips */}
            {recipe.tips && (
              <div className='bg-amber-50 rounded-xl p-4 mb-4'>
                <h3 className='font-semibold text-amber-800 mb-2'>
                  Conseil du chef
                </h3>
                <p className='text-amber-700 text-sm'>{recipe.tips}</p>
              </div>
            )}
          </div>

          {/* Rating */}
          {onRate && (
            <div className='px-4'>
              <RecipeRating
                recipeId={recipe.id}
                currentRating={currentRating?.rating || null}
                currentComment={currentRating?.comment || null}
                averageRating={recipe.averageRating}
                ratingCount={recipe.ratingCount}
                onRate={onRate}
                isSubmitting={isRatingSubmitting}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className='sticky bottom-0 p-4 bg-white border-t border-gray-100 space-y-2'>
            {onLogMeal && (
              <button
                onClick={() => onLogMeal(recipe)}
                className='w-full py-3 bg-[#1B998B] text-white rounded-xl font-medium hover:bg-[#158578] transition-colors flex items-center justify-center gap-2'
              >
                <UtensilsCrossed className='w-5 h-5' />
                J&apos;ai cuisiné cette recette
              </button>
            )}
            <button
              onClick={() => onAddToShoppingList(recipe, servingsMultiplier)}
              disabled={isAddingToShoppingList}
              className='w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
            >
              {isAddingToShoppingList ? (
                <div className='w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin' />
              ) : (
                <ShoppingCart className='w-5 h-5' />
              )}
              {isAddingToShoppingList
                ? 'Ajout en cours...'
                : 'Ajouter à ma liste de courses'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeModal;
