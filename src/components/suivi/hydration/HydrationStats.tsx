'use client';

import React from 'react';
import type { HydrationData } from '@/types/suivi';

interface HydrationStatsProps {
  data: HydrationData;
}

export function HydrationStats({ data }: HydrationStatsProps) {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <div className='bg-white rounded-xl p-5 border border-gray-200'>
        <p className='text-sm text-gray-500'>Moyenne cette semaine</p>
        <p className='text-2xl font-bold text-blue-600 mt-1'>
          {data.weekAverage}L{' '}
          <span className='text-base font-normal text-gray-400'>/ jour</span>
        </p>
      </div>
      <div className='bg-white rounded-xl p-5 border border-gray-200'>
        <p className='text-sm text-gray-500'>Jours avec objectif atteint</p>
        <p className='text-2xl font-bold text-emerald-600 mt-1'>
          {data.daysWithGoalReached}{' '}
          <span className='text-base font-normal text-gray-400'>
            / {data.totalDays} jours
          </span>
        </p>
      </div>
    </div>
  );
}

export default HydrationStats;
