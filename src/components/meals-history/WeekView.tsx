'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import type { MealType } from '@/types/meals';
import type { WeeklyMealsData, WeekDayData } from '@/types/meals-history';
import { getMealTypeConfig, mealTypeConfigs } from '@/types/meals-history';

interface WeekViewProps {
  data: WeeklyMealsData;
  onCellClick: (date: Date, mealType: MealType) => void;
  onDayClick: (date: Date) => void;
}

interface WeekGridCellProps {
  isLogged: boolean;
  isFuture: boolean;
  isCurrentDay: boolean;
  onClick: () => void;
}

function WeekGridCell({
  isLogged,
  isFuture,
  isCurrentDay,
  onClick,
}: WeekGridCellProps) {
  const baseCellClass = `p-2 border-l border-gray-100 flex items-center justify-center ${
    isCurrentDay ? 'bg-[#1B998B]/5' : ''
  }`;

  if (isLogged) {
    return (
      <div className={baseCellClass}>
        <button
          onClick={onClick}
          className='w-8 h-8 bg-[#1B998B]/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#1B998B]/20 transition-colors'
        >
          <Check className='w-4 h-4 text-[#1B998B]' />
        </button>
      </div>
    );
  }

  if (isFuture) {
    return (
      <div className={baseCellClass}>
        <div className='w-8 h-8 rounded-lg border-2 border-dashed border-gray-200' />
      </div>
    );
  }

  return (
    <div className={baseCellClass}>
      <button
        onClick={onClick}
        className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors'
      >
        <Plus className='w-4 h-4 text-gray-400' />
      </button>
    </div>
  );
}

export function WeekView({ data, onCellClick, onDayClick }: WeekViewProps) {
  const mealRows: { key: MealType; label: string; icon: string }[] =
    mealTypeConfigs.map(config => ({
      key: config.type,
      label:
        config.type === 'breakfast'
          ? 'Petit-déj.'
          : config.type === 'lunch'
            ? 'Déjeuner'
            : config.type === 'dinner'
              ? 'Dîner'
              : 'Collation',
      icon: config.icon,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className='bg-white rounded-xl border border-gray-200 overflow-hidden'
    >
      {/* Week header */}
      <div className='grid grid-cols-8 border-b border-gray-200'>
        <div className='p-3 bg-gray-50' />
        {data.days.map((day, index) => (
          <div
            key={index}
            onClick={() => onDayClick(day.date)}
            className={`p-3 text-center border-l border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
              day.isToday ? 'bg-[#1B998B]/10' : 'bg-gray-50'
            }`}
          >
            <p className='text-xs text-gray-500'>{day.dayName}</p>
            <p
              className={`font-semibold ${
                day.isToday ? 'text-[#1B998B]' : 'text-gray-800'
              }`}
            >
              {day.dayNumber}
            </p>
          </div>
        ))}
      </div>

      {/* Meal rows */}
      {mealRows.map(mealType => (
        <div
          key={mealType.key}
          className='grid grid-cols-8 border-b border-gray-100 last:border-0'
        >
          <div className='p-3 bg-gray-50 flex items-center gap-2'>
            <span>{mealType.icon}</span>
            <span className='text-sm text-gray-600'>{mealType.label}</span>
          </div>
          {data.days.map((day, dayIndex) => (
            <WeekGridCell
              key={dayIndex}
              isLogged={day.meals[mealType.key]}
              isFuture={day.isFuture}
              isCurrentDay={day.isToday}
              onClick={() => onCellClick(day.date, mealType.key)}
            />
          ))}
        </div>
      ))}

      {/* Totals row */}
      <div className='grid grid-cols-8 bg-gray-50 border-t border-gray-200'>
        <div className='p-3 text-sm font-medium text-gray-600'>Total</div>
        {data.days.map((day, index) => {
          const hasCalories = day.totalCalories > 0;
          const percentage = day.caloriePercentage;
          const isOnTarget = percentage >= 90 && percentage <= 110;

          return (
            <div
              key={index}
              className={`p-3 border-l border-gray-200 text-center ${
                day.isToday ? 'bg-[#1B998B]/10' : ''
              }`}
            >
              <p
                className={`font-semibold text-sm ${
                  hasCalories ? 'text-gray-800' : 'text-gray-300'
                }`}
              >
                {hasCalories ? day.totalCalories : '-'}
              </p>
              {hasCalories && (
                <p
                  className={`text-xs ${
                    isOnTarget ? 'text-[#1B998B]' : 'text-gray-500'
                  }`}
                >
                  {percentage}%
                </p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default WeekView;
