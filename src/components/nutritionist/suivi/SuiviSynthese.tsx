'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { TimeRangeSelector } from './TimeRangeSelector';
import {
  usePatientWeight,
  usePatientMeasurements,
  usePatientWellbeing,
  usePatientActivity,
  usePatientHydration,
} from '@/hooks/useNutritionistSuivi';
import type { TimeRange } from '@/types/suivi';

interface SuiviSyntheseProps {
  patientId: string;
}

function KpiCard({
  label,
  value,
  subValue,
  trend,
  alert,
}: {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'stable' | null;
  alert?: boolean;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-amber-500' : trend === 'down' ? 'text-emerald-500' : 'text-gray-400';
  return (
    <div className='bg-white rounded-xl p-4 border border-gray-200'>
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm font-medium text-gray-600'>{label}</span>
        {alert && <AlertTriangle className='w-4 h-4 text-amber-500' />}
      </div>
      <div className='flex items-baseline gap-1 mb-1'>
        <span className='text-2xl font-bold text-gray-800'>{value}</span>
        {trend && <TrendIcon className={`w-4 h-4 ${trendColor}`} />}
      </div>
      {subValue && <p className='text-xs text-gray-500'>{subValue}</p>}
    </div>
  );
}

export function SuiviSynthese({ patientId }: SuiviSyntheseProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');

  const { data: weightData, isLoading: weightLoading } = usePatientWeight(patientId, timeRange);
  const { data: measData, isLoading: measLoading } = usePatientMeasurements(patientId, undefined, timeRange);
  const { data: wellbeingData, isLoading: wellbeingLoading } = usePatientWellbeing(patientId, timeRange);
  const { data: activityData, isLoading: activityLoading } = usePatientActivity(patientId, timeRange);
  const { data: hydrationData, isLoading: hydrationLoading } = usePatientHydration(patientId, timeRange);

  const isLoading = weightLoading || measLoading || wellbeingLoading || activityLoading || hydrationLoading;

  const weightValue = weightData?.statistics?.current_weight
    ? `${weightData.statistics.current_weight.toFixed(1)} kg`
    : '--';
  const weightTrend = weightData?.statistics?.trend || null;
  const weightSub = weightData?.statistics?.total_change
    ? `${weightData.statistics.total_change > 0 ? '+' : ''}${weightData.statistics.total_change.toFixed(1)} kg`
    : undefined;

  const measCount = measData?.statistics?.types_measured ?? 0;
  const measValue = measCount > 0 ? `${measCount} zones` : '--';
  const measSub = measData?.statistics?.measurements_count
    ? `${measData.statistics.measurements_count} mesures`
    : undefined;

  const energyAvg = wellbeingData?.averages?.energy;
  const energyValue = energyAvg != null ? `${energyAvg.toFixed(1)}/10` : '--';
  const sleepAvg = wellbeingData?.averages?.sleep_hours;
  const sleepSub = sleepAvg != null ? `${sleepAvg.toFixed(1)}h sommeil moy.` : undefined;

  const actSessions = activityData?.weekly_summary?.sessions ?? 0;
  const actGoal = activityData?.weekly_summary?.goal_sessions ?? 3;
  const actValue = `${actSessions}/${actGoal}`;
  const actMinutes = activityData?.weekly_summary?.total_minutes ?? 0;
  const actSub = actMinutes > 0
    ? `${actMinutes >= 60 ? `${Math.floor(actMinutes / 60)}h ${actMinutes % 60}min` : `${actMinutes} min`} cette semaine`
    : undefined;

  const hydAvg = hydrationData?.summary?.average_daily_ml ?? 0;
  const hydGoal = hydrationData?.summary?.goal_ml ?? 2000;
  const hydValue = hydAvg > 0 ? `${(hydAvg / 1000).toFixed(1)}L` : '--';
  const hydPercent = hydGoal > 0 ? Math.round((hydAvg / hydGoal) * 100) : 0;
  const hydSub = hydGoal > 0 ? `Objectif: ${(hydGoal / 1000).toFixed(1)}L (${hydPercent}%)` : undefined;
  const hydAlert = hydrationData?.summary?.alert ?? false;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <TrendingUp className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-base font-semibold text-gray-800'>Vue d&apos;ensemble</h3>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-6 h-6 animate-spin text-gray-400' />
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
          <KpiCard
            label='Poids actuel'
            value={weightValue}
            subValue={weightSub}
            trend={weightTrend}
          />
          <KpiCard
            label='Mensurations'
            value={measValue}
            subValue={measSub}
          />
          <KpiCard
            label='Énergie moy.'
            value={energyValue}
            subValue={sleepSub}
          />
          <KpiCard
            label='Sessions / semaine'
            value={actValue}
            subValue={actSub}
          />
          <KpiCard
            label='Hydratation moy.'
            value={hydValue}
            subValue={hydSub}
            alert={hydAlert}
          />
        </div>
      )}
    </div>
  );
}
