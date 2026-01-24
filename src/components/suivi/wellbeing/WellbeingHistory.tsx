'use client';

import React from 'react';
import type { WellbeingEntry } from '@/types/suivi';
import { formatSuiviDate, moodConfig, digestionConfig } from '@/types/suivi';

interface WellbeingHistoryProps {
  history: WellbeingEntry[];
}

export function WellbeingHistory({ history }: WellbeingHistoryProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 h-[420px] flex flex-col">
      <h2 className="font-semibold text-gray-800 mb-4">Historique</h2>
      <div className="divide-y divide-gray-200 flex-1 overflow-y-auto pr-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1B998B]/10 rounded-full flex items-center justify-center">
                <span className="text-lg">{moodConfig[entry.mood]?.emoji}</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {formatSuiviDate(entry.date)}
                </p>
                <p className="text-sm text-gray-500">
                  {entry.energy}/5 énergie • {entry.sleep}h sommeil
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Énergie</p>
                <p className="font-medium text-amber-600">{entry.energy}/5</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Sommeil</p>
                <p className="font-medium text-blue-600">{entry.sleep}h</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Digestion</p>
                <p className="font-medium text-[#1B998B]">
                  {digestionConfig.find((d) => d.id === entry.digestion)?.emoji}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WellbeingHistory;
