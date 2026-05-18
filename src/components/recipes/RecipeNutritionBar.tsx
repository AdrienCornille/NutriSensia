'use client';

import React from 'react';
import { Flame } from 'lucide-react';

interface RecipeNutritionBarProps {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber?: number | null;
  servingsMultiplier?: number;
}

const MACROS = [
  {
    key: 'protein',
    label: 'Protéines',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
  },
  {
    key: 'carbs',
    label: 'Glucides',
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
  },
  {
    key: 'fat',
    label: 'Lipides',
    color: 'bg-rose-500',
    textColor: 'text-rose-600',
  },
  {
    key: 'fiber',
    label: 'Fibres',
    color: 'bg-green-500',
    textColor: 'text-green-600',
  },
] as const;

export function RecipeNutritionBar({
  calories,
  protein,
  carbs,
  fat,
  fiber,
  servingsMultiplier = 1,
}: RecipeNutritionBarProps) {
  if (calories === null && protein === null) return null;

  const values: Record<string, number> = {
    protein: (protein || 0) * servingsMultiplier,
    carbs: (carbs || 0) * servingsMultiplier,
    fat: (fat || 0) * servingsMultiplier,
    fiber: (fiber || 0) * servingsMultiplier,
  };

  const adjustedCalories =
    calories !== null ? Math.round(calories * servingsMultiplier) : null;
  const total = values.protein + values.carbs + values.fat;

  return (
    <div className='bg-gray-50 rounded-xl p-4 mb-4'>
      <h3 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
        <Flame className='w-4 h-4 text-orange-500' />
        Valeurs nutritionnelles par portion
      </h3>

      {/* Calories */}
      {adjustedCalories !== null && (
        <div className='text-center mb-3'>
          <p className='text-2xl font-bold text-gray-900'>{adjustedCalories}</p>
          <p className='text-xs text-gray-500'>kcal</p>
        </div>
      )}

      {/* Macro bars */}
      {total > 0 && (
        <div className='flex h-3 rounded-full overflow-hidden mb-3'>
          {MACROS.filter(m => m.key !== 'fiber' && values[m.key] > 0).map(
            macro => (
              <div
                key={macro.key}
                className={`${macro.color} transition-all duration-300`}
                style={{ width: `${(values[macro.key] / total) * 100}%` }}
              />
            )
          )}
        </div>
      )}

      {/* Macro values */}
      <div className='grid grid-cols-4 gap-2 text-center'>
        {MACROS.map(macro => {
          const val = values[macro.key];
          if (macro.key === 'fiber' && !fiber) return null;
          return (
            <div key={macro.key}>
              <p className={`text-lg font-bold ${macro.textColor}`}>
                {val.toFixed(1)}g
              </p>
              <p className='text-xs text-gray-500'>{macro.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecipeNutritionBar;
