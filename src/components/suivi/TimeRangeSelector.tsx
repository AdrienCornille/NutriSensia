'use client';

import React from 'react';
import { type TimeRange } from '@/types/suivi';

interface TimeRangeSelectorProps {
  activeRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

// Configuration des périodes avec labels complets pour accessibilité
const timeRangeLabels: Record<TimeRange, { short: string; full: string }> = {
  '1S': { short: '1S', full: '1 semaine' },
  '1M': { short: '1M', full: '1 mois' },
  '3M': { short: '3M', full: '3 mois' },
  '6M': { short: '6M', full: '6 mois' },
  '1A': { short: '1A', full: '1 an' },
  Tout: { short: 'Tout', full: 'Tout' },
};

// Périodes à afficher (selon les critères d'acceptation BIO-002)
const displayedRanges: TimeRange[] = ['1S', '1M', '3M', 'Tout'];

export function TimeRangeSelector({
  activeRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  return (
    <div
      className='flex items-center gap-1 bg-[rgba(27,153,139,0.05)] p-1 rounded-xl'
      role='tablist'
      aria-label='Sélection de la période'
    >
      {displayedRanges.map(range => {
        const isActive = activeRange === range;
        return (
          <button
            key={range}
            onClick={() => onRangeChange(range)}
            role='tab'
            aria-selected={isActive}
            aria-label={timeRangeLabels[range].full}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-[#1B998B] text-white shadow-sm'
                : 'text-[#41556b] hover:bg-[rgba(27,153,139,0.1)] hover:text-[#1B998B]'
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {timeRangeLabels[range].short}
          </button>
        );
      })}
    </div>
  );
}

export default TimeRangeSelector;
