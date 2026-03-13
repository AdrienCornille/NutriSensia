'use client';

import React from 'react';

export interface MacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

const MACRO_CONFIG = [
  {
    key: 'calories' as const,
    label: 'Énergie',
    unit: 'kcal',
    dotColor: 'bg-orange-400',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    labelColor: 'text-orange-600',
  },
  {
    key: 'protein' as const,
    label: 'Protéines',
    unit: 'g',
    dotColor: 'bg-blue-400',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    labelColor: 'text-blue-600',
  },
  {
    key: 'carbs' as const,
    label: 'Glucides',
    unit: 'g',
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    labelColor: 'text-amber-600',
  },
  {
    key: 'fat' as const,
    label: 'Lipides',
    unit: 'g',
    dotColor: 'bg-rose-400',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    labelColor: 'text-rose-600',
  },
  {
    key: 'fiber' as const,
    label: 'Fibres',
    unit: 'g',
    dotColor: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    labelColor: 'text-green-600',
  },
] as const;

/**
 * Grid of 5 colored macro badges (Énergie, Protéines, Glucides, Lipides, Fibres).
 * Used in meal headers for both patient and nutritionist dashboards.
 */
export function MacroBadgesGrid({ values }: { values: MacroValues }) {
  return (
    <div className='grid grid-cols-5 gap-2'>
      {MACRO_CONFIG.map(cfg => {
        const raw = values[cfg.key];
        const display = cfg.key === 'calories' ? Math.round(raw) : Math.round(raw * 10) / 10;

        return (
          <div
            key={cfg.key}
            className={`${cfg.bgColor} rounded-lg px-2 py-2 text-center`}
          >
            <span className={`text-[10px] font-medium ${cfg.labelColor} leading-none mb-0.5`}>
              {cfg.label}
            </span>
            <p className={`text-sm font-bold ${cfg.textColor} leading-tight`}>
              {display}
              <span className='text-[10px] font-normal ml-0.5'>{cfg.unit}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Inline colored macro indicators for individual food items.
 * More compact than the grid — used within expanded meal food lists.
 */
export function MacroInline({
  protein,
  carbs,
  fat,
  fiber,
}: {
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
}) {
  const items = [
    { label: 'P', value: protein, dotColor: 'bg-blue-400', textColor: 'text-blue-600' },
    { label: 'G', value: carbs, dotColor: 'bg-amber-400', textColor: 'text-amber-600' },
    { label: 'L', value: fat, dotColor: 'bg-rose-400', textColor: 'text-rose-600' },
  ];

  if (fiber != null) {
    items.push({ label: 'Fi', value: fiber, dotColor: 'bg-green-500', textColor: 'text-green-600' });
  }

  return (
    <div className='flex items-center gap-2 flex-wrap'>
      {items.map(item => (
        <span key={item.label} className={`text-xs ${item.textColor} font-medium`}>
          {item.label}: {Math.round(item.value * 10) / 10}g
        </span>
      ))}
    </div>
  );
}

export default MacroBadgesGrid;
