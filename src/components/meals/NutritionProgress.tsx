'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { NutritionValues, NutritionTarget } from '@/types/meals';

interface NutritionProgressProps {
  current: NutritionValues;
  target: NutritionTarget;
  mealLabel?: string;
  compact?: boolean;
}

export function NutritionProgress({
  current,
  target,
  mealLabel,
  compact = false,
}: NutritionProgressProps) {
  const nutrients = [
    {
      key: 'calories',
      label: 'Calories',
      current: current.calories,
      target: target.calories,
      unit: '',
      color: 'emerald',
    },
    {
      key: 'protein',
      label: 'Protéines',
      current: current.protein,
      target: target.protein,
      unit: 'g',
      color: 'blue',
    },
    {
      key: 'carbs',
      label: 'Glucides',
      current: current.carbs,
      target: target.carbs,
      unit: 'g',
      color: 'amber',
    },
    {
      key: 'fat',
      label: 'Lipides',
      current: current.fat,
      target: target.fat,
      unit: 'g',
      color: 'rose',
    },
  ];

  if (compact) {
    return (
      <div className='flex gap-4'>
        {nutrients.map(nutrient => (
          <CompactNutrientDisplay
            key={nutrient.key}
            label={nutrient.label}
            current={nutrient.current}
            target={nutrient.target}
            unit={nutrient.unit}
            color={nutrient.color}
          />
        ))}
      </div>
    );
  }

  return (
    <div className='bg-emerald-50 rounded-xl p-6 border border-emerald-200'>
      {mealLabel && (
        <h3 className='font-semibold text-gray-800 mb-4'>
          Total vs Plan ({mealLabel})
        </h3>
      )}
      <div className='grid grid-cols-4 gap-4'>
        {nutrients.map(nutrient => (
          <NutrientProgressBar
            key={nutrient.key}
            label={nutrient.label}
            current={nutrient.current}
            target={nutrient.target}
            unit={nutrient.unit}
            color={nutrient.color}
          />
        ))}
      </div>
    </div>
  );
}

// Individual Nutrient Progress Bar
interface NutrientProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

function NutrientProgressBar({
  label,
  current,
  target,
  unit,
  color,
}: NutrientProgressBarProps) {
  const percentage = Math.round((current / target) * 100);
  const isOver = percentage > 100;
  const displayPercentage = Math.min(percentage, 100);

  // Determine color based on percentage
  const getStatusColor = () => {
    if (isOver && label === 'Calories') {
      return 'amber'; // Over calories = warning
    }
    return color;
  };

  const statusColor = getStatusColor();
  const percentageColor =
    isOver && label === 'Calories' ? 'text-amber-600' : 'text-emerald-600';

  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div>
      <div className='flex justify-between text-sm mb-1'>
        <span className='text-gray-600'>{label}</span>
        <span className={percentageColor}>{percentage}%</span>
      </div>
      <div className='h-2 bg-white rounded-full overflow-hidden'>
        <motion.div
          className={`h-full rounded-full ${colorClasses[statusColor] || colorClasses.emerald}`}
          initial={{ width: 0 }}
          animate={{ width: `${displayPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <p className='text-sm mt-1 font-medium'>
        {current}
        {unit} / {target}
        {unit}
      </p>
    </div>
  );
}

// Compact Nutrient Display
interface CompactNutrientDisplayProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

function CompactNutrientDisplay({
  label,
  current,
  target,
  unit,
  color,
}: CompactNutrientDisplayProps) {
  const percentage = Math.round((current / target) * 100);
  const isOver = percentage > 100;

  const colorClasses: Record<string, string> = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
  };

  return (
    <div className='text-center'>
      <p className={`text-sm font-medium ${colorClasses[color]}`}>
        {current}
        {unit}
      </p>
      <p className='text-xs text-gray-500'>{label}</p>
      {isOver && label === 'Calories' && (
        <span className='text-xs text-amber-500'>+{percentage - 100}%</span>
      )}
    </div>
  );
}

export default NutritionProgress;
