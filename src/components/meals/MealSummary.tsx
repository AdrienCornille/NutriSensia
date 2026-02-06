'use client';

import React from 'react';
import type {
  MealType,
  MealTypeConfig,
  SelectedFood,
  NutritionValues,
  MealContext,
  MealContextConfig,
} from '@/types/meals';

interface MealSummaryProps {
  mealType: MealType;
  mealTypeConfigs: MealTypeConfig[];
  foods: SelectedFood[];
  totalNutrition: NutritionValues;
  photoUrl?: string | null;
  notes?: string;
  contextTags: MealContext[];
  contextConfigs: MealContextConfig[];
}

export function MealSummary({
  mealType,
  mealTypeConfigs,
  foods,
  totalNutrition,
  photoUrl,
  notes,
  contextTags,
  contextConfigs,
}: MealSummaryProps) {
  const mealConfig = mealTypeConfigs.find(m => m.id === mealType);
  const selectedContexts = contextConfigs.filter(c =>
    contextTags.includes(c.id)
  );

  return (
    <div className='bg-emerald-50 rounded-xl p-6 border border-emerald-200'>
      <h3 className='font-semibold text-gray-800 mb-4'>Récapitulatif</h3>

      {/* Meal Info and Total */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          {mealConfig && (
            <span className='text-2xl' role='img' aria-hidden='true'>
              {mealConfig.icon}
            </span>
          )}
          <div>
            <p className='text-lg font-semibold text-gray-800'>
              {mealConfig?.label || 'Repas'}
            </p>
            <p className='text-sm text-gray-500'>
              {foods.length} aliment{foods.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className='text-right'>
          <p className='text-2xl font-bold text-emerald-600'>
            {totalNutrition.calories} kcal
          </p>
          <p className='text-sm text-gray-500'>
            P: {totalNutrition.protein}g • G: {totalNutrition.carbs}g • L:{' '}
            {totalNutrition.fat}g
          </p>
        </div>
      </div>

      {/* Food Pills */}
      {foods.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-4'>
          {foods.map(food => (
            <span
              key={food.id}
              className='px-3 py-1 bg-white rounded-full text-sm text-gray-700'
            >
              {food.emoji && (
                <span className='mr-1' role='img' aria-hidden='true'>
                  {food.emoji}
                </span>
              )}
              {food.name}
            </span>
          ))}
        </div>
      )}

      {/* Photo Preview */}
      {photoUrl && (
        <div className='mb-4'>
          <p className='text-sm text-gray-600 mb-2'>Photo:</p>
          <div className='w-24 h-24 rounded-lg overflow-hidden bg-gray-100'>
            <img
              src={photoUrl}
              alt='Photo du repas'
              className='w-full h-full object-cover'
            />
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && notes.trim() && (
        <div className='mb-4'>
          <p className='text-sm text-gray-600 mb-1'>Notes:</p>
          <p className='text-sm text-gray-700 bg-white rounded-lg p-3'>
            {notes}
          </p>
        </div>
      )}

      {/* Context Tags */}
      {selectedContexts.length > 0 && (
        <div>
          <p className='text-sm text-gray-600 mb-2'>Contexte:</p>
          <div className='flex flex-wrap gap-2'>
            {selectedContexts.map(context => (
              <span
                key={context.id}
                className='px-3 py-1 bg-white rounded-full text-sm text-gray-700 flex items-center gap-1'
              >
                <span role='img' aria-hidden='true'>
                  {context.icon}
                </span>
                {context.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MealSummary;
