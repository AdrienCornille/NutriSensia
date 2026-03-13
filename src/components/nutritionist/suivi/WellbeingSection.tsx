'use client';

import { useState } from 'react';
import type { TimeRange, MoodType, DigestionType } from '@/types/suivi';
import { moodConfig, digestionConfig } from '@/types/suivi';
import { usePatientWellbeing } from '@/hooks/useNutritionistSuivi';
import { TimeRangeSelector } from './TimeRangeSelector';
import { WellbeingHeatmap } from './charts/WellbeingHeatmap';

interface WellbeingSectionProps {
  patientId: string;
}

function getEnergyEmoji(value: number | null): string {
  if (value == null) return '-';
  if (value <= 3) return '😴';
  if (value <= 5) return '😐';
  if (value <= 7) return '😊';
  return '⚡';
}

export function WellbeingSection({ patientId }: WellbeingSectionProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const { data, isLoading, error } = usePatientWellbeing(patientId, timeRange);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg" />
            ))}
          </div>
          <div className="h-40 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <p className="text-sm text-red-500">
          Erreur lors du chargement des donnees de bien-etre.
        </p>
      </div>
    );
  }

  if (!data || data.count === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Bien-etre & Habitudes
          </h3>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
        <div className="text-center py-8">
          <div className="text-3xl mb-2">😊</div>
          <p className="text-sm text-gray-500">
            Aucune donnee de bien-etre sur cette periode
          </p>
        </div>
      </div>
    );
  }

  const { averages, distributions, logs } = data;

  // Find max mood count for bar width calculation
  const moodEntries = Object.entries(distributions.mood);
  const maxMoodCount =
    moodEntries.length > 0
      ? Math.max(...moodEntries.map(([, count]) => count))
      : 1;

  // Find max digestion count for bar width calculation
  const digestionEntries = Object.entries(distributions.digestion);
  const maxDigestionCount =
    digestionEntries.length > 0
      ? Math.max(...digestionEntries.map(([, count]) => count))
      : 1;

  return (
    <div className="bg-white rounded-xl border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Bien-etre & Habitudes
        </h3>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Energy */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl mb-1">
            {getEnergyEmoji(averages.energy)}
          </div>
          <div className="text-xl font-bold text-gray-800">
            {averages.energy != null ? averages.energy.toFixed(1) : '-'}
            <span className="text-xs font-normal text-gray-400">/10</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Energie moy.</div>
        </div>

        {/* Sleep hours */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl mb-1">🌙</div>
          <div className="text-xl font-bold text-gray-800">
            {averages.sleep_hours != null
              ? `${averages.sleep_hours.toFixed(1)}h`
              : '-'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Sommeil moy.</div>
        </div>

        {/* Sleep quality */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl mb-1">💤</div>
          <div className="text-xl font-bold text-gray-800">
            {averages.sleep_quality != null
              ? averages.sleep_quality.toFixed(1)
              : '-'}
            <span className="text-xs font-normal text-gray-400">/10</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Qualite sommeil moy.</div>
        </div>
      </div>

      {/* Distributions */}
      <div className="grid grid-cols-2 gap-6">
        {/* Mood distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Humeur</h4>
          <div className="space-y-2">
            {moodEntries.length === 0 ? (
              <p className="text-xs text-gray-400">Aucune donnee</p>
            ) : (
              moodEntries
                .sort(([, a], [, b]) => b - a)
                .map(([mood, count]) => {
                  const config = moodConfig[mood as MoodType];
                  const label = config
                    ? `${config.emoji} ${config.label}`
                    : mood;
                  const widthPercent = (count / maxMoodCount) * 100;
                  return (
                    <div key={mood} className="flex items-center gap-2">
                      <span className="text-xs w-24 shrink-0 truncate">
                        {label}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-[#1B998B] h-full rounded-full transition-all"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Digestion distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Digestion</h4>
          <div className="space-y-2">
            {digestionEntries.length === 0 ? (
              <p className="text-xs text-gray-400">Aucune donnee</p>
            ) : (
              digestionEntries
                .sort(([, a], [, b]) => b - a)
                .map(([digestion, count]) => {
                  const config = digestionConfig.find(
                    (d) => d.id === digestion
                  );
                  const label = config
                    ? `${config.emoji} ${config.label}`
                    : digestion;
                  const widthPercent = (count / maxDigestionCount) * 100;
                  return (
                    <div key={digestion} className="flex items-center gap-2">
                      <span className="text-xs w-28 shrink-0 truncate">
                        {label}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Niveau d&apos;energie
        </h4>
        <WellbeingHeatmap logs={logs} />
      </div>
    </div>
  );
}
