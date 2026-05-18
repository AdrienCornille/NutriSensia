'use client';

import React, { useState, useCallback } from 'react';
import {
  X,
  UtensilsCrossed,
  Calendar,
  Users,
  Loader2,
  Check,
  Flame,
} from 'lucide-react';
import type { NutriRecipe } from '@/types/recipes';

interface LogMealModalProps {
  isOpen: boolean;
  recipe: NutriRecipe | null;
  onClose: () => void;
  onConfirm: (
    recipeId: string,
    mealType: string,
    date: string,
    servingsMultiplier: number
  ) => Promise<void>;
  isSubmitting: boolean;
}

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Petit-déjeuner', emoji: '🌅' },
  { id: 'lunch', label: 'Déjeuner', emoji: '☀️' },
  { id: 'dinner', label: 'Dîner', emoji: '🌙' },
  { id: 'snack', label: 'Collation', emoji: '🍎' },
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function LogMealModal({
  isOpen,
  recipe,
  onClose,
  onConfirm,
  isSubmitting,
}: LogMealModalProps) {
  const [mealType, setMealType] = useState('lunch');
  const [date, setDate] = useState(formatDate(new Date()));
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [success, setSuccess] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!recipe) return;
    await onConfirm(recipe.id, mealType, date, servingsMultiplier);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  }, [recipe, mealType, date, servingsMultiplier, onConfirm, onClose]);

  if (!isOpen || !recipe) return null;

  const adjustedCalories = recipe.calories
    ? Math.round(recipe.calories * servingsMultiplier)
    : null;
  const adjustedProtein = recipe.proteinG
    ? Math.round(recipe.proteinG * servingsMultiplier * 10) / 10
    : null;
  const adjustedCarbs = recipe.carbsG
    ? Math.round(recipe.carbsG * servingsMultiplier * 10) / 10
    : null;
  const adjustedFat = recipe.fatG
    ? Math.round(recipe.fatG * servingsMultiplier * 10) / 10
    : null;

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />
      <div className='relative bg-white rounded-2xl max-w-md w-full mx-4 shadow-xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-100'>
          <h3 className='font-semibold text-gray-900 flex items-center gap-2'>
            <UtensilsCrossed className='w-5 h-5 text-[#1B998B]' />
            J&apos;ai cuisiné cette recette
          </h3>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-full'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {success ? (
          <div className='p-8 text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Check className='w-8 h-8 text-green-600' />
            </div>
            <p className='text-lg font-medium text-gray-900'>
              Repas enregistré !
            </p>
            <p className='text-sm text-gray-500 mt-1'>
              {recipe.title} ajouté au journal
            </p>
          </div>
        ) : (
          <div className='p-4 space-y-4'>
            {/* Recipe name */}
            <div className='bg-gray-50 rounded-lg p-3'>
              <p className='font-medium text-gray-900 text-sm'>
                {recipe.title}
              </p>
            </div>

            {/* Meal type */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Type de repas
              </label>
              <div className='grid grid-cols-4 gap-2'>
                {MEAL_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setMealType(type.id)}
                    className={`p-2 rounded-lg text-center transition-colors ${
                      mealType === type.id
                        ? 'bg-[#1B998B]/10 border-2 border-[#1B998B] text-[#1B998B]'
                        : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className='text-lg block'>{type.emoji}</span>
                    <span className='text-[10px] font-medium mt-0.5 block'>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                <Calendar className='w-3.5 h-3.5 inline mr-1' />
                Date
              </label>
              <input
                type='date'
                value={date}
                onChange={e => setDate(e.target.value)}
                max={formatDate(new Date())}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
              />
            </div>

            {/* Portions */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                <Users className='w-3.5 h-3.5 inline mr-1' />
                Portions consommées
              </label>
              <div className='flex items-center gap-3'>
                <input
                  type='range'
                  min={1}
                  max={10}
                  step={1}
                  value={servingsMultiplier}
                  onChange={e =>
                    setServingsMultiplier(parseFloat(e.target.value))
                  }
                  className='flex-1 accent-[#1B998B]'
                />
                <span className='text-sm font-medium text-gray-700 w-12 text-right'>
                  {servingsMultiplier} port.
                </span>
              </div>
            </div>

            {/* Nutrition summary */}
            {adjustedCalories !== null && (
              <div className='bg-orange-50 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-1'>
                  <Flame className='w-4 h-4 text-orange-500' />
                  <span className='text-sm font-semibold text-gray-800'>
                    {adjustedCalories} kcal
                  </span>
                </div>
                <div className='flex items-center gap-4 text-xs text-gray-600'>
                  {adjustedProtein !== null && (
                    <span>P: {adjustedProtein}g</span>
                  )}
                  {adjustedCarbs !== null && <span>G: {adjustedCarbs}g</span>}
                  {adjustedFat !== null && <span>L: {adjustedFat}g</span>}
                </div>
              </div>
            )}

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className='w-full py-3 bg-[#1B998B] text-white rounded-xl font-medium hover:bg-[#158578] transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
            >
              {isSubmitting ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <UtensilsCrossed className='w-5 h-5' />
              )}
              Enregistrer dans mes recettes cuisinées
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
