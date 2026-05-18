'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePatientHydration } from '@/hooks/useNutritionistSuivi';
import { TimeRangeSelector } from '@/components/nutritionist/suivi/TimeRangeSelector';
import type { TimeRange } from '@/types/suivi';

const HydrationChart = dynamic(
  () =>
    import('@/components/nutritionist/suivi/charts/HydrationChart').then(
      m => m.HydrationChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className='h-64 rounded-lg bg-gray-100 animate-pulse' />
    ),
  }
);

interface HydrationSectionProps {
  patientId: string;
}

function formatMlToLiters(ml: number): string {
  return `${(ml / 1000).toFixed(1)}L`;
}

export function HydrationSection({ patientId }: HydrationSectionProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const { data, isLoading, error } = usePatientHydration(patientId, timeRange);

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-5 bg-gray-200 rounded w-32' />
          <div className='grid grid-cols-3 gap-4'>
            <div className='h-20 bg-gray-100 rounded-lg' />
            <div className='h-20 bg-gray-100 rounded-lg' />
            <div className='h-20 bg-gray-100 rounded-lg' />
          </div>
          <div className='h-[250px] bg-gray-100 rounded-lg' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <p className='text-red-500 text-sm'>
          Erreur lors du chargement des donnees d&apos;hydratation.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <p className='text-gray-400 text-sm'>
          Aucune donnee d&apos;hydratation disponible.
        </p>
      </div>
    );
  }

  const { daily_totals, summary } = data;

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-5'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-base font-semibold text-gray-800'>Hydratation</h3>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Alert banner */}
      {summary.alert && (
        <div className='flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3'>
          <span className='text-red-500 text-sm font-medium'>
            Moyenne d&apos;hydratation &lt; 50% de l&apos;objectif
          </span>
        </div>
      )}

      {/* KPI cards */}
      <div className='grid grid-cols-3 gap-4'>
        {/* Moyenne quotidienne */}
        <div className='bg-white rounded-xl p-5 border border-gray-200'>
          <p className='text-sm text-gray-500 mb-1'>Moyenne quotidienne</p>
          <p className='text-3xl font-bold text-blue-600'>
            {formatMlToLiters(summary.average_daily_ml)}
          </p>
        </div>

        {/* Objectif */}
        <div className='bg-white rounded-xl p-5 border border-gray-200'>
          <p className='text-sm text-gray-500 mb-1'>Objectif</p>
          <p className='text-3xl font-bold text-[#1B998B]'>
            {formatMlToLiters(summary.goal_ml)}
          </p>
        </div>

        {/* Jours objectif atteint */}
        <div className='bg-white rounded-xl p-5 border border-gray-200'>
          <p className='text-sm text-gray-500 mb-1'>Jours objectif atteint</p>
          <p className='text-3xl font-bold text-gray-800'>
            {summary.days_goal_reached}/{summary.total_days}
            <span className='text-lg font-normal text-gray-500 ml-1'>
              (
              {summary.total_days > 0
                ? Math.round(
                    (summary.days_goal_reached / summary.total_days) * 100
                  )
                : 0}
              %)
            </span>
          </p>
        </div>
      </div>

      {/* Chart */}
      <HydrationChart dailyTotals={daily_totals} />
    </div>
  );
}

export default HydrationSection;
