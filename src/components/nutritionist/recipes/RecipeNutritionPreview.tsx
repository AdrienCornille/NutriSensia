'use client';

import React from 'react';
import { Flame } from 'lucide-react';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface RecipeNutritionPreviewProps {
  nutrition: NutritionData | null;
  servings: number;
}

const MACRO_COLORS = {
  protein: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
  carbs: { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' },
  fat: { bg: 'bg-rose-100', text: 'text-rose-700', bar: 'bg-rose-500' },
  fiber: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
};

export function RecipeNutritionPreview({
  nutrition,
  servings,
}: RecipeNutritionPreviewProps) {
  if (!nutrition) {
    return (
      <div className='bg-gray-50 rounded-xl p-4 text-center'>
        <Flame className='w-8 h-8 text-gray-300 mx-auto mb-2' />
        <p className='text-sm text-gray-500'>
          Ajoutez des ingrédients CIQUAL pour voir les valeurs nutritionnelles
        </p>
      </div>
    );
  }

  const total = nutrition.protein + nutrition.carbs + nutrition.fat;

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-4 space-y-3'>
      <div className='flex items-center justify-between'>
        <h4 className='text-sm font-semibold text-gray-700'>
          Par portion ({servings} portions)
        </h4>
        <span className='text-lg font-bold text-gray-900 flex items-center gap-1'>
          <Flame className='w-4 h-4 text-orange-500' />
          {nutrition.calories} kcal
        </span>
      </div>

      {/* Macro bars */}
      <div className='space-y-2'>
        {(
          [
            {
              key: 'protein' as const,
              label: 'Protéines',
              value: nutrition.protein,
              unit: 'g',
            },
            {
              key: 'carbs' as const,
              label: 'Glucides',
              value: nutrition.carbs,
              unit: 'g',
            },
            {
              key: 'fat' as const,
              label: 'Lipides',
              value: nutrition.fat,
              unit: 'g',
            },
            ...(nutrition.fiber !== undefined
              ? [
                  {
                    key: 'fiber' as const,
                    label: 'Fibres',
                    value: nutrition.fiber,
                    unit: 'g',
                  },
                ]
              : []),
          ] as const
        ).map(macro => {
          const percentage = total > 0 ? (macro.value / total) * 100 : 0;
          const colors = MACRO_COLORS[macro.key];
          return (
            <div key={macro.key} className='flex items-center gap-3'>
              <div className='w-20 text-xs text-gray-600'>{macro.label}</div>
              <div className='flex-1 h-2 bg-gray-100 rounded-full overflow-hidden'>
                <div
                  className={`h-full rounded-full ${colors.bar} transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div
                className={`w-16 text-right text-xs font-medium ${colors.text}`}
              >
                {macro.value.toFixed(1)}
                {macro.unit}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
