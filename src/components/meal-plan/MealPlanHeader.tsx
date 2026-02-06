'use client';

import React from 'react';
import { Download } from 'lucide-react';
import type { MealPlanViewMode } from '@/types/meal-plan';

interface MealPlanHeaderProps {
  weekRange: string;
  viewMode: MealPlanViewMode;
  onViewModeChange: (mode: MealPlanViewMode) => void;
}

export function MealPlanHeader({
  weekRange,
  viewMode,
  onViewModeChange,
}: MealPlanHeaderProps) {
  return (
    <div className='bg-white border-b border-gray-200 px-8 py-4'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h1 className='text-lg font-semibold text-gray-800'>
            Mon plan alimentaire
          </h1>
          <p className='text-sm text-gray-500'>{weekRange}</p>
        </div>
        <div className='flex items-center gap-3'>
          {/* View toggle */}
          <div className='flex bg-gray-100 rounded-lg p-1'>
            <button
              onClick={() => onViewModeChange('day')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => onViewModeChange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Semaine
            </button>
          </div>
          <button
            className='p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors'
            title='Télécharger le plan'
          >
            <Download className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MealPlanHeader;
