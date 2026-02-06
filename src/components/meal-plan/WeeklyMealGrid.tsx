'use client';

import React from 'react';
import type {
  WeeklyDayData,
  DailyTargets,
  PlanMealType,
} from '@/types/meal-plan';
import { mealTypeConfig } from '@/types/meal-plan';

interface WeeklyMealGridProps {
  days: WeeklyDayData[];
  targets: DailyTargets;
  onCellClick: (dayIndex: number, mealId: PlanMealType) => void;
}

const mealTypes: PlanMealType[] = [
  'petit-dejeuner',
  'dejeuner',
  'collation',
  'diner',
];

export function WeeklyMealGrid({
  days,
  targets,
  onCellClick,
}: WeeklyMealGridProps) {
  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50 border-b border-gray-200'>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 w-32'>
                Repas
              </th>
              {days.map(dayData => (
                <th
                  key={dayData.day.short}
                  className={`px-3 py-3 text-center text-sm font-medium relative ${
                    dayData.day.isToday
                      ? 'text-[#1B998B] bg-[#1B998B]/10'
                      : 'text-gray-500'
                  }`}
                >
                  {/* Badge Aujourd'hui dans le header */}
                  {dayData.day.isToday && (
                    <span className='absolute -top-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#1B998B] text-white text-[9px] font-medium rounded-b-md'>
                      Aujourd&apos;hui
                    </span>
                  )}
                  <span
                    className={dayData.day.isToday ? 'mt-1 inline-block' : ''}
                  >
                    {dayData.day.short} {dayData.day.date}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealTypes.map((mealId, mealIndex) => {
              const config = mealTypeConfig[mealId];
              const isLastMeal = mealIndex === mealTypes.length - 1;

              return (
                <tr
                  key={mealId}
                  className={isLastMeal ? '' : 'border-b border-gray-100'}
                >
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-2'>
                      <span>{config.icon}</span>
                      <span className='text-sm font-medium text-gray-700'>
                        {config.label}
                      </span>
                    </div>
                  </td>
                  {days.map((dayData, dayIndex) => (
                    <td
                      key={dayData.day.short}
                      className={`px-2 py-2 ${
                        dayData.day.isToday
                          ? 'bg-[#1B998B]/5 border-l-2 border-r-2 border-[#1B998B]/20'
                          : ''
                      }`}
                    >
                      <button
                        onClick={() => onCellClick(dayIndex, mealId)}
                        className={`w-full text-left p-2 rounded-lg transition-colors ${
                          dayData.day.isToday
                            ? 'hover:bg-[#1B998B]/10 bg-white shadow-sm border border-[#1B998B]/10'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <p className='text-xs text-gray-600 line-clamp-2'>
                          {dayData.meals[mealId].summary}
                        </p>
                        <p
                          className={`text-xs font-medium mt-1 ${
                            dayData.day.isToday
                              ? 'text-[#1B998B]'
                              : 'text-gray-800'
                          }`}
                        >
                          {dayData.meals[mealId].calories} kcal
                        </p>
                      </button>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className='bg-gray-50 border-t border-gray-200'>
              <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                Total
              </td>
              {days.map(dayData => (
                <td
                  key={dayData.day.short}
                  className={`px-3 py-3 text-center ${
                    dayData.day.isToday
                      ? 'bg-[#1B998B]/10 border-l-2 border-r-2 border-b-2 border-[#1B998B]/20 rounded-b-lg'
                      : ''
                  }`}
                >
                  <p
                    className={`text-sm font-bold ${
                      dayData.totalCalories > targets.calories
                        ? 'text-amber-600'
                        : dayData.day.isToday
                          ? 'text-[#1B998B]'
                          : 'text-gray-800'
                    }`}
                  >
                    {dayData.totalCalories}
                  </p>
                  <p className='text-xs text-gray-500'>/ {targets.calories}</p>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default WeeklyMealGrid;
