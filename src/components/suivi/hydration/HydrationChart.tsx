'use client';

import React from 'react';
import type { HydrationData } from '@/types/suivi';

interface HydrationChartProps {
  data: HydrationData;
}

export function HydrationChart({ data }: HydrationChartProps) {
  const maxValue = 2.5; // Max display value for scaling

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="font-semibold text-gray-800 mb-4">Cette semaine</h2>
      <div className="flex items-end justify-between gap-2 h-40">
        {data.history.map((day) => (
          <div key={day.date} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gray-100 rounded-t-lg relative"
              style={{ height: '120px' }}
            >
              {day.value !== null && (
                <div
                  className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                    day.value >= day.goal ? 'bg-blue-500' : 'bg-blue-300'
                  }`}
                  style={{ height: `${(day.value / maxValue) * 100}%` }}
                />
              )}
              {/* Goal line */}
              <div
                className="absolute w-full border-t-2 border-dashed border-blue-400"
                style={{ bottom: `${(day.goal / maxValue) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{day.dayLabel}</p>
            <p className="text-xs font-medium text-gray-700">
              {day.value !== null ? `${day.value}L` : '-'}
            </p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-gray-600">Objectif atteint</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-300 rounded" />
          <span className="text-gray-600">En dessous</span>
        </div>
      </div>
    </div>
  );
}

export default HydrationChart;
