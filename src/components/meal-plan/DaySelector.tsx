'use client';

import React from 'react';
import type { WeekDay } from '@/types/meal-plan';

interface DaySelectorProps {
  weekDays: WeekDay[];
  selectedDayIndex: number;
  onDaySelect: (index: number) => void;
}

export function DaySelector({
  weekDays,
  selectedDayIndex,
  onDaySelect,
}: DaySelectorProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex gap-2">
        {weekDays.map((day, index) => (
          <button
            key={day.short}
            onClick={() => onDaySelect(index)}
            className={`flex-1 py-3 rounded-xl text-center transition-all ${
              selectedDayIndex === index
                ? 'bg-[#1B998B] text-white'
                : day.isToday
                ? 'bg-[#1B998B]/10 text-[#1B998B] border-2 border-[#1B998B]/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <p className="text-xs font-medium">{day.short}</p>
            <p className="text-lg font-bold">{day.date}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DaySelector;
