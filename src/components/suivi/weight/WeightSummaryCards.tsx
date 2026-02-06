'use client';

import React from 'react';
import type { WeightData } from '@/types/suivi';
import { calculateWeightProgress } from '@/types/suivi';

interface WeightSummaryCardsProps {
  data: WeightData;
}

export function WeightSummaryCards({ data }: WeightSummaryCardsProps) {
  const progress = calculateWeightProgress(
    data.initial,
    data.current,
    data.goal
  );
  const remaining = data.current - data.goal;
  const isGoalLoss = data.goal < data.initial;
  const progressKg = Math.abs(data.initial - data.current);
  const isPositiveChange =
    (data.change < 0 && isGoalLoss) || (data.change > 0 && !isGoalLoss);
  const isPositiveTrend =
    (data.weeklyChange < 0 && isGoalLoss) ||
    (data.weeklyChange > 0 && !isGoalLoss);

  // Déterminer le statut de la tendance pour le badge
  const getTrendStatus = () => {
    const absChange = Math.abs(data.weeklyChange);
    if (absChange >= 0.3 && absChange <= 0.5) return 'good';
    if (absChange < 0.3) return 'under';
    return 'over';
  };

  const trendStatus = getTrendStatus();

  return (
    <div className='grid grid-cols-4 gap-4'>
      {/* Current Weight */}
      <div className='bg-white rounded-xl p-4 border border-gray-200'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium text-gray-600'>
            Poids actuel
          </span>
        </div>
        <div className='flex items-baseline gap-1 mb-2'>
          <span className='text-2xl font-bold text-gray-800'>
            {data.current.toFixed(1)}
          </span>
          <span className='text-sm text-gray-500'>kg</span>
        </div>
        <p
          className={`text-xs font-medium flex items-center gap-1 ${
            isPositiveChange ? 'text-[#1B998B]' : 'text-amber-600'
          }`}
        >
          <span>{data.change < 0 ? '↓' : '↑'}</span>
          {Math.abs(data.change).toFixed(1)} kg depuis le début
        </p>
      </div>

      {/* Goal */}
      <div className='bg-white rounded-xl p-4 border border-gray-200'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium text-gray-600'>Objectif</span>
        </div>
        <div className='flex items-baseline gap-1 mb-2'>
          <span className='text-2xl font-bold text-[#1B998B]'>
            {data.goal.toFixed(1)}
          </span>
          <span className='text-sm text-gray-500'>kg</span>
        </div>
        <p className='text-xs text-gray-500'>
          Encore {remaining.toFixed(1)} kg
        </p>
      </div>

      {/* Progress - Affiche % ET kg */}
      <div className='bg-white rounded-xl p-4 border border-gray-200'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium text-gray-600'>Progression</span>
          <span className='text-xs px-2 py-0.5 rounded-full bg-[#1B998B]/20 text-[#1B998B]'>
            {progressKg.toFixed(1)} kg
          </span>
        </div>
        <div className='flex items-baseline gap-1 mb-2'>
          <span className='text-2xl font-bold text-gray-800'>{progress}%</span>
        </div>
        <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
          <div
            className='h-full rounded-full transition-all duration-300 bg-[#1B998B]'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Trend */}
      <div className='bg-white rounded-xl p-4 border border-gray-200'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium text-gray-600'>
            Tendance hebdo
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              trendStatus === 'good'
                ? 'bg-[#1B998B]/20 text-[#1B998B]'
                : trendStatus === 'under'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {trendStatus === 'good'
              ? 'Optimal'
              : trendStatus === 'under'
                ? 'À accélérer'
                : 'À modérer'}
          </span>
        </div>
        <div className='flex items-baseline gap-1 mb-2'>
          <span
            className={`text-2xl font-bold ${
              isPositiveTrend ? 'text-[#1B998B]' : 'text-amber-600'
            }`}
          >
            {data.weeklyChange > 0 ? '+' : ''}
            {data.weeklyChange.toFixed(1)}
          </span>
          <span className='text-sm text-gray-500'>kg/sem</span>
        </div>
        <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              trendStatus === 'good'
                ? 'bg-[#1B998B]'
                : trendStatus === 'under'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
            }`}
            style={{
              width: `${Math.min((Math.abs(data.weeklyChange) / 0.5) * 100, 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default WeightSummaryCards;
