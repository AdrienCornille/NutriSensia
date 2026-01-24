'use client';

import React from 'react';
import type { WeightEntry } from '@/types/suivi';
import { formatSuiviDate, calculateWeightVariation } from '@/types/suivi';

interface WeightHistoryProps {
  history: WeightEntry[];
  maxItems?: number;
}

export function WeightHistory({ history, maxItems = 5 }: WeightHistoryProps) {
  const displayedHistory = history.slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="font-semibold text-gray-800 mb-4">Dernières pesées</h2>
      <div className="space-y-3">
        {displayedHistory.map((entry, index) => {
          const previousEntry = history[index + 1];
          const variation = previousEntry
            ? calculateWeightVariation(entry.value, previousEntry.value)
            : null;

          return (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1B998B]/10 rounded-full flex items-center justify-center">
                  <span className="text-[#1B998B]">⚖️</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {entry.value.toFixed(1)} kg
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatSuiviDate(entry.date)} 2026
                  </p>
                </div>
              </div>
              {variation && (
                <span
                  className={`text-sm font-medium ${
                    variation.direction === 'down'
                      ? 'text-[#1B998B]'
                      : variation.direction === 'up'
                      ? 'text-amber-600'
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

export default WeightHistory;
