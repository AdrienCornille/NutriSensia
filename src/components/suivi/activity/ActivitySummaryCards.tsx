'use client';

import React from 'react';
import type { WeeklyActivitySummary } from '@/types/suivi';
import { formatActivityDuration } from '@/types/suivi';

interface ActivitySummaryCardsProps {
  summary: WeeklyActivitySummary;
}

export function ActivitySummaryCards({ summary }: ActivitySummaryCardsProps) {
  return (
    <div className='grid grid-cols-3 gap-4'>
      <div className='bg-white rounded-xl p-5 border border-gray-200'>
        <p className='text-sm text-gray-500'>Séances cette semaine</p>
        <p className='text-3xl font-bold text-gray-800 mt-1'>
          {summary.sessions}
        </p>
        <p className='text-sm text-[#1B998B] mt-2'>
          Objectif: {summary.goalSessions} séances
        </p>
      </div>
      <div className='bg-white rounded-xl p-5 border border-gray-200'>
        <p className='text-sm text-gray-500'>Temps total</p>
        <p className='text-3xl font-bold text-blue-600 mt-1'>
          {summary.totalMinutes}{' '}
          <span className='text-lg font-normal'>min</span>
        </p>
        <p className='text-sm text-gray-500 mt-2'>
          {formatActivityDuration(summary.totalMinutes)}
        </p>
      </div>
      <div className='bg-white rounded-xl p-5 border border-gray-200'>
        <p className='text-sm text-gray-500'>Calories brûlées</p>
        <p className='text-3xl font-bold text-amber-600 mt-1'>
          {summary.calories}
        </p>
        <p className='text-sm text-gray-500 mt-2'>kcal estimées</p>
      </div>
    </div>
  );
}

export default ActivitySummaryCards;
