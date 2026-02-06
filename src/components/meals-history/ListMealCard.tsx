'use client';

import React from 'react';
import { ChevronRight, Camera } from 'lucide-react';
import type { LoggedMeal } from '@/types/meals-history';
import { getMealTypeConfig } from '@/types/meals-history';
import { formatTime } from '@/lib/date-utils';
import { contextConfigs } from './NotesAndContextSection';

interface ListMealCardProps {
  meal: LoggedMeal;
  onClick: () => void;
}

export function ListMealCard({ meal, onClick }: ListMealCardProps) {
  const config = getMealTypeConfig(meal.type);
  const foodNames = meal.foods.map(f => f.name).join(', ');

  return (
    <div
      onClick={onClick}
      className='bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer'
    >
      <div className='flex items-center gap-4'>
        {/* Photo or icon */}
        <div className='relative flex-shrink-0'>
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden ${
              meal.photoUrl ? 'bg-gray-100' : `${config.bgColor}`
            }`}
          >
            {meal.photoUrl ? (
              <img
                src={meal.photoUrl}
                alt={config.label}
                className='w-full h-full object-cover'
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl">${config.icon}</span>`;
                }}
              />
            ) : (
              <span className='text-2xl'>{config.icon}</span>
            )}
          </div>
          {/* Photo badge */}
          {meal.photoUrl && (
            <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-[#1B998B] rounded-full flex items-center justify-center shadow-sm'>
              <Camera className='w-3 h-3 text-white' />
            </div>
          )}
        </div>

        {/* Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
            >
              {config.label}
            </span>
            <span className='text-sm text-gray-400'>
              {formatTime(meal.loggedAt)}
            </span>
          </div>
          <p className='text-gray-600 text-sm line-clamp-1'>{foodNames}</p>
          {/* Context tags */}
          {meal.contextTags && meal.contextTags.length > 0 && (
            <div className='flex flex-wrap gap-1 mt-1'>
              {meal.contextTags.slice(0, 2).map(tagId => {
                const config = contextConfigs.find(c => c.id === tagId);
                if (!config) return null;
                return (
                  <span
                    key={tagId}
                    className='inline-flex items-center gap-0.5 text-xs text-gray-400'
                  >
                    <span>{config.icon}</span>
                  </span>
                );
              })}
              {meal.contextTags.length > 2 && (
                <span className='text-xs text-gray-400'>
                  +{meal.contextTags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Calories */}
        <div className='text-right flex-shrink-0'>
          <p className='font-semibold text-gray-800'>
            {meal.totalNutrition.calories} kcal
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight className='w-5 h-5 text-gray-300 flex-shrink-0' />
      </div>
    </div>
  );
}

export default ListMealCard;
