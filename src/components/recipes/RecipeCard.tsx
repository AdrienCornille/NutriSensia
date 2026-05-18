'use client';

import React from 'react';
import {
  Heart,
  Clock,
  Star,
  Flame,
  ShoppingCart,
  Share2,
  UtensilsCrossed,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { NutriRecipe } from '@/types/recipes';
import { DIFFICULTY_LABELS } from '@/types/recipes';

interface RecipeCardProps {
  recipe: NutriRecipe & { isFavorite?: boolean };
  isFavorite: boolean;
  isInShoppingList?: boolean;
  isCooked?: boolean;
  onToggleFavorite: (recipeId: string) => void;
  onClick?: (recipe: NutriRecipe & { isFavorite?: boolean }) => void;
  onAddToShoppingList?: (recipe: NutriRecipe) => void;
  onLogMeal?: (recipe: NutriRecipe) => void;
}

export function RecipeCard({
  recipe,
  isFavorite,
  isInShoppingList = false,
  isCooked = false,
  onToggleFavorite,
  onClick,
  onAddToShoppingList,
  onLogMeal,
}: RecipeCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(recipe);
    } else {
      router.push(`/dashboard/patient/recettes/${recipe.id}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Découvrez cette recette : ${recipe.title}`,
        });
      } catch {
        /* cancelled */
      }
    }
  };

  const showPatientActions = !!(onAddToShoppingList || onLogMeal);

  return (
    <div
      onClick={handleClick}
      className='bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative'
    >
      {/* Image */}
      <div className='relative aspect-[4/3] bg-gray-200'>
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className='absolute inset-0 w-full h-full object-cover'
            loading='lazy'
          />
        ) : (
          <div className='absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center'>
            <span className='text-4xl'>{recipe.category?.emoji || '🍽️'}</span>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite(recipe.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Category badge */}
        {recipe.category && (
          <div className='absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-700'>
            {recipe.category.emoji} {recipe.category.label}
          </div>
        )}

        {/* Action icons row */}
        {showPatientActions && (
          <div className='absolute bottom-2 right-2 flex items-center gap-1.5'>
            {onAddToShoppingList && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onAddToShoppingList(recipe);
                }}
                title='Liste de courses'
                className={`p-2 rounded-full transition-colors ${
                  isInShoppingList
                    ? 'bg-[#1B998B] text-white'
                    : 'bg-white/80 text-[#1B998B] hover:bg-white'
                }`}
              >
                <ShoppingCart
                  className={`w-4 h-4 ${isInShoppingList ? 'fill-current' : ''}`}
                />
              </button>
            )}
            {onLogMeal && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onLogMeal(recipe);
                }}
                title="J'ai cuisiné"
                className={`p-2 rounded-full transition-colors ${
                  isCooked
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/80 text-orange-500 hover:bg-white'
                }`}
              >
                <UtensilsCrossed
                  className={`w-4 h-4 ${isCooked ? 'fill-current' : ''}`}
                />
              </button>
            )}
            <button
              onClick={e => {
                e.stopPropagation();
                handleShare();
              }}
              title='Partager'
              className='p-2 bg-white/80 text-blue-500 rounded-full hover:bg-white transition-colors'
            >
              <Share2 className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-3'>
        <h3 className='font-semibold text-gray-900 line-clamp-2 mb-2'>
          {recipe.title}
        </h3>

        {/* Meta + Nutrition + Menu */}
        {(() => {
          // Compute per-serving nutrition (from DB or ingredients)
          let cal = recipe.calories;
          let prot = recipe.proteinG;
          let carb = recipe.carbsG;
          let fat = recipe.fatG;
          if (cal === null) {
            let eCal = 0,
              eProt = 0,
              eCarb = 0,
              eFat = 0;
            let hasData = false;
            for (const ing of recipe.ingredients) {
              if (ing.caloriesPer100g && ing.quantityValue) {
                const f = ing.quantityValue / 100;
                eCal += ing.caloriesPer100g * f;
                eProt += (ing.proteinPer100g || 0) * f;
                eCarb += (ing.carbsPer100g || 0) * f;
                eFat += (ing.fatPer100g || 0) * f;
                hasData = true;
              }
            }
            if (hasData) {
              cal = eCal;
              prot = eProt;
              carb = eCarb;
              fat = eFat;
            }
          }
          const s = recipe.servings || 1;
          const calPerServing = cal !== null ? Math.round(cal / s) : null;
          const protPerServing = prot !== null ? Math.round(prot / s) : null;
          const carbPerServing = carb !== null ? Math.round(carb / s) : null;
          const fatPerServing = fat !== null ? Math.round(fat / s) : null;

          return (
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-xs text-gray-500 flex-wrap flex-1 min-w-0'>
                <span className='flex items-center gap-1'>
                  <Clock className='w-3.5 h-3.5' />
                  {recipe.totalTimeMinutes} min
                </span>
                {recipe.averageRating > 0 && (
                  <span className='flex items-center gap-1'>
                    <Star className='w-3.5 h-3.5 text-amber-500 fill-amber-500' />
                    {recipe.averageRating.toFixed(1)}
                  </span>
                )}
                <span className='text-gray-400'>
                  {DIFFICULTY_LABELS[recipe.difficulty]}
                </span>
                {calPerServing !== null && (
                  <span className='flex items-center gap-1 text-orange-600'>
                    <Flame className='w-3 h-3' />
                    {calPerServing} kcal
                  </span>
                )}
                {protPerServing !== null && (
                  <span className='text-blue-600'>P: {protPerServing}g</span>
                )}
                {carbPerServing !== null && (
                  <span className='text-amber-600'>G: {carbPerServing}g</span>
                )}
                {fatPerServing !== null && (
                  <span className='text-rose-600'>L: {fatPerServing}g</span>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default RecipeCard;
