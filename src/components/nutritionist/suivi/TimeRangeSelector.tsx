'use client';

import type { TimeRange } from '@/types/suivi';
import { timeRangesConfig } from '@/types/suivi';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  options?: TimeRange[];
}

const rangeLabels: Record<TimeRange, string> = {
  '1S': '7j',
  '1M': '30j',
  '3M': '3 mois',
  '6M': '6 mois',
  '1A': '1 an',
  Tout: 'Tout',
};

export function TimeRangeSelector({
  value,
  onChange,
  options = timeRangesConfig,
}: TimeRangeSelectorProps) {
  return (
    <div
      className='flex items-center gap-1 bg-[rgba(27,153,139,0.05)] p-1 rounded-xl'
      role='tablist'
      aria-label='Sélection de la période'
    >
      {options.map(range => (
        <button
          key={range}
          onClick={() => onChange(range)}
          role='tab'
          aria-selected={value === range}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            value === range
              ? 'bg-[#1B998B] text-white shadow-sm'
              : 'text-[#41556b] hover:bg-[rgba(27,153,139,0.1)] hover:text-[#1B998B]'
          }`}
        >
          {rangeLabels[range]}
        </button>
      ))}
    </div>
  );
}
