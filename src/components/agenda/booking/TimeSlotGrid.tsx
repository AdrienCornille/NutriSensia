'use client';

import React from 'react';
import type { AvailableSlot } from '@/types/agenda';

interface TimeSlotGridProps {
  slots: AvailableSlot[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

export function TimeSlotGrid({ slots, selectedTime, onTimeSelect }: TimeSlotGridProps) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Aucun créneau disponible pour cette date
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-medium text-gray-800 mb-4">Choisissez un horaire</h4>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => onTimeSelect(slot.time)}
            className={`p-3 rounded-lg text-center transition-all ${
              !slot.available
                ? 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                : selectedTime === slot.time
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-gray-50 hover:bg-emerald-50 text-gray-700'
            }`}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TimeSlotGrid;
