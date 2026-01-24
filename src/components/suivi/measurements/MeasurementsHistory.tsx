'use client';

import React from 'react';
import type { MeasurementEntry, MeasurementType } from '@/types/suivi';
import { measurementTypeConfig, formatSuiviDate } from '@/types/suivi';

interface MeasurementsHistoryProps {
  history: MeasurementEntry[];
  maxItems?: number;
}

// Icônes par type de mesure
const measurementIcons: Record<MeasurementType, string> = {
  poitrine: '👕',
  taille: '📏',
  hanches: '🩳',
  cuisse: '🦵',
  bras: '💪',
  mollet: '🦶',
};

export function MeasurementsHistory({ history, maxItems = 8 }: MeasurementsHistoryProps) {
  const displayedHistory = history.slice(0, maxItems);

  // Fonction pour calculer la variation avec l'entrée précédente du même type
  const getVariation = (entry: MeasurementEntry, index: number) => {
    // Chercher l'entrée précédente du même type
    const previousEntry = history
      .slice(index + 1)
      .find((e) => e.type === entry.type);

    if (!previousEntry) return null;

    const diff = entry.value - previousEntry.value;
    if (Math.abs(diff) < 0.1) return { direction: 'stable' as const, value: 0, formatted: '=' };

    return {
      direction: diff < 0 ? ('down' as const) : ('up' as const),
      value: Math.abs(diff),
      formatted: `${diff > 0 ? '+' : ''}${diff} cm`,
    };
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="font-semibold text-gray-800 mb-4">Historique des mesures</h2>
      <div className="divide-y divide-gray-200">
        {displayedHistory.map((entry, index) => {
          const variation = getVariation(entry, index);
          const config = measurementTypeConfig[entry.type];

          return (
            <div
              key={entry.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1B998B]/10 rounded-full flex items-center justify-center">
                  <span className="text-[#1B998B]">{measurementIcons[entry.type]}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {entry.value} cm
                  </p>
                  <p className="text-sm text-gray-500">
                    {config.label} • {formatSuiviDate(entry.date)}
                  </p>
                </div>
              </div>
              {variation && (
                <span
                  className={`text-sm font-medium ${
                    variation.direction === 'down'
                      ? 'text-[#1B998B]'
                      : variation.direction === 'up'
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                >
                  {variation.direction === 'down' && '↓ '}
                  {variation.direction === 'up' && '↑ '}
                  {variation.formatted}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MeasurementsHistory;
