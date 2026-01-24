'use client';

import React from 'react';
import type { ConsultationTypeConfig } from '@/types/agenda';

interface ConsultationTypeCardProps {
  config: ConsultationTypeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

export function ConsultationTypeCard({
  config,
  isSelected,
  onSelect,
}: ConsultationTypeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
        isSelected
          ? 'border-[#1B998B] bg-emerald-50'
          : 'border-gray-200 hover:border-emerald-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            <p className="font-medium text-gray-800">{config.label}</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">{config.description}</p>
          <p className="text-sm text-gray-400 mt-2">⏱ {config.duration} min</p>
        </div>
        <span className="font-semibold text-[#1B998B]">{config.price} CHF</span>
      </div>
    </button>
  );
}

export default ConsultationTypeCard;
