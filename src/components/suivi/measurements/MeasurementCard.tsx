'use client';

import React from 'react';
import type { Measurement, MeasurementType } from '@/types/suivi';

// Icônes par type de mesure
const measurementIcons: Record<MeasurementType, string> = {
  poitrine: '👕',
  taille: '📏',
  hanches: '🩳',
  cuisse: '🦵',
  bras: '💪',
  mollet: '🦶',
};

interface MeasurementCardProps {
  measurement: Measurement;
}

export function MeasurementCard({ measurement }: MeasurementCardProps) {
  const isLoss = measurement.change < 0;
  const isGain = measurement.change > 0;
  const icon = measurementIcons[measurement.type];

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#1B998B]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">{icon}</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">{measurement.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {measurement.current}{' '}
              <span className="text-base font-normal text-gray-400">
                {measurement.unit}
              </span>
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            isLoss
              ? 'bg-[#1B998B]/20 text-[#1B998B]'
              : isGain
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {measurement.change > 0 ? '+' : ''}
          {measurement.change} {measurement.unit}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>
            Départ: {measurement.initial} {measurement.unit}
          </span>
          <span>
            Actuel: {measurement.current} {measurement.unit}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isLoss ? 'bg-[#1B998B]' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(Math.abs(measurement.change) * 10, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default MeasurementCard;
