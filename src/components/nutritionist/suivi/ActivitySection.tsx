'use client';

import { useState, useMemo } from 'react';
import type { TimeRange } from '@/types/suivi';
import { formatActivityDuration } from '@/types/suivi';
import { usePatientActivity } from '@/hooks/useNutritionistSuivi';
import { TimeRangeSelector } from './TimeRangeSelector';
import { ActivityChart } from './charts/ActivityChart';

interface ActivitySectionProps {
  patientId: string;
}

export function ActivitySection({ patientId }: ActivitySectionProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const { data, isLoading, error } = usePatientActivity(patientId, timeRange);

  // Compute activity type breakdown from logs
  const typeBreakdown = useMemo(() => {
    if (!data?.logs || data.logs.length === 0) return [];

    const counts = new Map<
      string,
      { slug: string; name_fr: string; emoji: string; count: number }
    >();

    for (const log of data.logs) {
      const at = log.activity_type;
      if (!at) continue;
      const existing = counts.get(at.slug);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(at.slug, {
          slug: at.slug,
          name_fr: at.name_fr,
          emoji: at.emoji,
          count: 1,
        });
      }
    }

    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }, [data?.logs]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg" />
            ))}
          </div>
          <div className="h-[250px] bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <p className="text-sm text-red-500">
          Erreur lors du chargement des donnees d&apos;activite.
        </p>
      </div>
    );
  }

  if (!data || data.count === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Activite physique
          </h3>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🏃</div>
          <p className="text-sm text-gray-500">
            Aucune activite enregistree sur cette periode
          </p>
        </div>
      </div>
    );
  }

  const { weekly_summary, logs } = data;
  const goalPercentage =
    weekly_summary.goal_sessions > 0
      ? Math.min(
          Math.round(
            (weekly_summary.sessions / weekly_summary.goal_sessions) * 100
          ),
          100
        )
      : 0;

  // SVG ring parameters
  const ringSize = 40;
  const strokeWidth = 5;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (goalPercentage / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Activite physique
        </h3>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-4 gap-4">
        {/* Sessions */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-gray-800">
            {weekly_summary.sessions}
            <span className="text-lg font-normal text-gray-400">
              /{weekly_summary.goal_sessions}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-0.5">Sessions</div>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {weekly_summary.total_minutes}
            <span className="text-lg font-normal">min</span>
          </div>
          <div className="text-sm text-gray-500 mt-0.5">Duree totale</div>
        </div>

        {/* Calories */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-amber-600">
            {weekly_summary.total_calories > 0
              ? weekly_summary.total_calories
              : '-'}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">Calories brulees</div>
        </div>

        {/* Goal ring */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col items-center justify-center">
          <div className="relative">
            <svg
              width={ringSize}
              height={ringSize}
              className="-rotate-90"
            >
              {/* Background circle */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke={goalPercentage >= 100 ? '#10B981' : '#1B998B'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-700">
                {goalPercentage}%
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-1">Objectif</div>
        </div>
      </div>

      {/* Activity Type Breakdown */}
      {typeBreakdown.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Types d&apos;activite
          </h4>
          <div className="flex flex-wrap gap-2">
            {typeBreakdown.map((item) => (
              <span
                key={item.slug}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
              >
                <span>{item.emoji}</span>
                <span>{item.name_fr}</span>
                <span className="font-medium text-gray-900">{item.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Activite par jour
        </h4>
        <ActivityChart logs={logs} />
      </div>
    </div>
  );
}
