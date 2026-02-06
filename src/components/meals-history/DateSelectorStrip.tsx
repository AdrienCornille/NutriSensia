'use client';

import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateDateRange } from '@/lib/date-utils';

interface DateSelectorStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function DateSelectorStrip({
  selectedDate,
  onDateSelect,
  onNavigate,
}: DateSelectorStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = generateDateRange(selectedDate, 7);

  // Scroll to selected date on mount and when selection changes
  useEffect(() => {
    if (selectedButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = selectedButtonRef.current;
      const containerWidth = container.offsetWidth;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;

      container.scrollTo({
        left: buttonLeft - containerWidth / 2 + buttonWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [selectedDate]);

  return (
    <div className='bg-white border-b border-gray-200 px-8 py-3'>
      <div className='flex items-center gap-2'>
        {/* Previous button */}
        <button
          onClick={() => onNavigate('prev')}
          className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0'
          aria-label='Dates precedentes'
        >
          <ChevronLeft className='w-5 h-5' />
        </button>

        {/* Scrollable dates */}
        <div
          ref={scrollContainerRef}
          className='flex-1 flex gap-1 overflow-x-auto pb-1 scrollbar-hide'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const dayName = weekDays[date.getDay()];

            return (
              <button
                key={index}
                ref={isSelected ? selectedButtonRef : null}
                onClick={() => onDateSelect(date)}
                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all min-w-[52px] ${
                  isSelected
                    ? 'bg-[#1B998B] text-white'
                    : isToday
                      ? 'bg-[#1B998B]/10 text-[#1B998B] border-2 border-[#1B998B]/30'
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span className='text-xs font-medium'>{dayName}</span>
                <span className='text-lg font-semibold'>{date.getDate()}</span>
                {isToday && !isSelected && (
                  <div className='w-1.5 h-1.5 bg-[#1B998B] rounded-full mt-0.5' />
                )}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => onNavigate('next')}
          className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0'
          aria-label='Dates suivantes'
        >
          <ChevronRight className='w-5 h-5' />
        </button>
      </div>
    </div>
  );
}

export default DateSelectorStrip;
