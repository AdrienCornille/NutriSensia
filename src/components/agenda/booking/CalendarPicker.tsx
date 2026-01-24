'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AvailableDay } from '@/types/agenda';
import { formatMonthYear } from '@/types/agenda';

interface CalendarPickerProps {
  selectedDate: Date | null;
  availableDays: AvailableDay[];
  currentMonth: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

export function CalendarPicker({
  selectedDate,
  availableDays,
  currentMonth,
  onDateSelect,
  onMonthChange,
}: CalendarPickerProps) {
  // Get the first day of the month (0 = Sunday)
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const isSelectedDate = (day: AvailableDay) => {
    if (!selectedDate) return false;
    return (
      day.date.getDate() === selectedDate.getDate() &&
      day.date.getMonth() === selectedDate.getMonth() &&
      day.date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div>
      <h4 className="font-medium text-gray-800 mb-4">Choisissez une date</h4>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => onMonthChange('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-gray-600 capitalize">
          {formatMonthYear(currentMonth)}
        </span>
        <button
          onClick={() => onMonthChange('next')}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: startOffset }).map((_, index) => (
          <div key={`empty-${index}`} className="p-3" />
        ))}

        {/* Actual days */}
        {availableDays.map((day) => (
          <button
            key={day.dayNumber}
            disabled={!day.isAvailable}
            onClick={() => onDateSelect(day.date)}
            className={`p-2 rounded-xl text-center transition-all ${
              !day.isAvailable
                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                : isSelectedDate(day)
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-gray-50 hover:bg-emerald-50 text-gray-700'
            }`}
          >
            <p className="font-bold text-sm">{day.dayNumber}</p>
            {day.isAvailable && (
              <p
                className={`text-xs mt-0.5 ${
                  isSelectedDate(day) ? 'text-emerald-100' : 'text-[#1B998B]'
                }`}
              >
                {day.slotsCount} dispo
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CalendarPicker;
