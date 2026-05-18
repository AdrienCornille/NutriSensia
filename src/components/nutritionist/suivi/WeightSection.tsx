'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Scale } from 'lucide-react';
import type { TimeRange } from '@/types/suivi';
import { usePatientWeight } from '@/hooks/useNutritionistSuivi';
import { TimeRangeSelector } from './TimeRangeSelector';

const WeightChart = dynamic(
  () => import('./charts/WeightChart').then(m => m.WeightChart),
  {
    ssr: false,
    loading: () => (
      <div className='h-64 rounded-lg bg-gray-100 animate-pulse' />
    ),
  }
);

// ============================================================================
// Types
// ============================================================================

interface WeightSectionProps {
  patientId: string;
}

// ============================================================================
// Component
// ============================================================================

export function WeightSection({ patientId }: WeightSectionProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');
  const { data, isLoading, error } = usePatientWeight(patientId, timeRange);

  // Loading state
  if (isLoading) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <Scale className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-base font-semibold text-gray-800'>
            Evolution du poids
          </h3>
        </div>
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <Scale className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-base font-semibold text-gray-800'>
            Evolution du poids
          </h3>
        </div>
        <p className='text-sm text-red-500 text-center py-4'>
          Erreur lors du chargement des donnees
        </p>
      </div>
    );
  }

  // Empty state
  if (!data || data.entries.length === 0) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <Scale className='w-5 h-5 text-[#1B998B]' />
            <h3 className='text-base font-semibold text-gray-800'>
              Evolution du poids
            </h3>
          </div>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
        <p className='text-sm text-gray-400 text-center py-4'>
          Aucune donnee de poids enregistree
        </p>
      </div>
    );
  }

  const { statistics, goal } = data;

  // Determine colors for variation cards
  const totalChangePositive = statistics.total_change > 0;
  const weeklyChangePositive = statistics.weekly_change > 0;

  // For weight loss scenarios, a negative change is good (emerald), positive is concerning (amber)
  // We don't know the patient's goal direction, so we use neutral coloring:
  // positive change = amber (weight gain), negative = emerald (weight loss), zero = gray
  const totalChangeColor =
    statistics.total_change === 0
      ? 'text-gray-600'
      : totalChangePositive
        ? 'text-amber-600'
        : 'text-emerald-600';
  const weeklyChangeColor =
    statistics.weekly_change === 0
      ? 'text-gray-600'
      : weeklyChangePositive
        ? 'text-amber-600'
        : 'text-emerald-600';
  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2'>
          <Scale className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-base font-semibold text-gray-800'>
            Evolution du poids
          </h3>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-5'>
        {/* Poids actuel */}
        <div className='bg-white rounded-xl p-4 border border-gray-200'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-gray-600'>
              Poids actuel
            </span>
          </div>
          <div className='flex items-baseline gap-1 mb-2'>
            <span className='text-2xl font-bold text-gray-800'>
              {statistics.current_weight !== null
                ? statistics.current_weight.toFixed(1)
                : '--'}
            </span>
            <span className='text-sm text-gray-500'>kg</span>
          </div>
        </div>

        {/* Objectif */}
        <div className='bg-white rounded-xl p-4 border border-gray-200'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-gray-600'>Objectif</span>
          </div>
          <div className='flex items-baseline gap-1 mb-2'>
            <span className='text-2xl font-bold text-[#1B998B]'>
              {statistics.goal_weight !== null
                ? statistics.goal_weight.toFixed(1)
                : '--'}
            </span>
            <span className='text-sm text-gray-500'>kg</span>
          </div>
        </div>

        {/* Variation totale */}
        <div className='bg-white rounded-xl p-4 border border-gray-200'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-gray-600'>
              Variation totale
            </span>
          </div>
          <div className='flex items-baseline gap-1 mb-2'>
            <span className={`text-2xl font-bold ${totalChangeColor}`}>
              {statistics.total_change > 0 ? '+' : ''}
              {statistics.total_change.toFixed(1)}
            </span>
            <span className='text-sm text-gray-500'>kg</span>
          </div>
        </div>

        {/* Variation hebdo */}
        <div className='bg-white rounded-xl p-4 border border-gray-200'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-gray-600'>
              Variation hebdo
            </span>
          </div>
          <div className='flex items-baseline gap-1 mb-2'>
            <span className={`text-2xl font-bold ${weeklyChangeColor}`}>
              {statistics.weekly_change > 0 ? '+' : ''}
              {statistics.weekly_change.toFixed(1)}
            </span>
            <span className='text-sm text-gray-500'>kg</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <WeightChart entries={data.entries} goalWeight={statistics.goal_weight} />
    </div>
  );
}
