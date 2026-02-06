'use client';

import React from 'react';
import type { WeeklyDayData, DailyTargets } from '@/types/meal-plan';

interface WeeklyOverviewProps {
  days: WeeklyDayData[];
  targets: DailyTargets;
  onDayClick?: (dayIndex: number) => void;
}

export function WeeklyOverview({
  days,
  targets,
  onDayClick,
}: WeeklyOverviewProps) {
  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h2 className='font-semibold text-gray-800 mb-4'>
        Vue d&apos;ensemble de la semaine
      </h2>
      <div className='grid grid-cols-7 gap-3'>
        {days.map((dayData, index) => (
          <button
            key={dayData.day.short}
            onClick={() => onDayClick?.(index)}
            className={`p-3 rounded-xl text-center transition-all relative ${
              dayData.day.isToday
                ? 'bg-[#1B998B]/10 border-2 border-[#1B998B] shadow-sm'
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            {/* Badge Aujourd'hui */}
            {dayData.day.isToday && (
              <span className='absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#1B998B] text-white text-[10px] font-medium rounded-full whitespace-nowrap'>
                Aujourd&apos;hui
              </span>
            )}

            <p
              className={`text-xs font-medium ${dayData.day.isToday ? 'text-[#1B998B]' : 'text-gray-500'}`}
            >
              {dayData.day.short}
            </p>
            <p
              className={`text-lg font-bold ${dayData.day.isToday ? 'text-[#1B998B]' : 'text-gray-800'}`}
            >
              {dayData.day.date}
            </p>
            <p
              className={`text-sm font-medium mt-2 ${
                dayData.totalCalories > targets.calories
                  ? 'text-amber-600'
                  : dayData.day.isToday
                    ? 'text-[#1B998B]'
                    : 'text-gray-700'
              }`}
            >
              {dayData.totalCalories}
            </p>
            <p className='text-xs text-gray-400'>kcal</p>

            {/* Indicateur objectif */}
            <div className='mt-2 h-1 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className={`h-full rounded-full transition-all ${
                  dayData.totalCalories > targets.calories
                    ? 'bg-amber-500'
                    : 'bg-[#1B998B]'
                }`}
                style={{
                  width: `${Math.min((dayData.totalCalories / targets.calories) * 100, 100)}%`,
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default WeeklyOverview;
