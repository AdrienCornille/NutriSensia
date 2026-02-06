'use client';

import React from 'react';
import { CalendarPicker } from './CalendarPicker';
import { TimeSlotGrid } from './TimeSlotGrid';
import type {
  AppointmentMode,
  AvailableDay,
  AvailableSlot,
} from '@/types/agenda';
import { appointmentModeConfig } from '@/types/agenda';

// Default cabinet address (can be overridden by nutritionist profile)
const DEFAULT_CABINET_ADDRESS = 'Rue du Conseil 12, 2000 Neuchâtel';

interface BookingStepSlotProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedMode: AppointmentMode | null;
  availableDays: AvailableDay[];
  availableSlots: AvailableSlot[];
  currentMonth: Date;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  onModeSelect: (mode: AppointmentMode) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
  isPreferredMode?: boolean;
  modeAvailability?: { visio: boolean; cabinet: boolean };
  cabinetAddress?: string;
}

export function BookingStepSlot({
  selectedDate,
  selectedTime,
  selectedMode,
  availableDays,
  availableSlots,
  currentMonth,
  onDateSelect,
  onTimeSelect,
  onModeSelect,
  onMonthChange,
  isPreferredMode = false,
  modeAvailability = { visio: true, cabinet: true },
  cabinetAddress = DEFAULT_CABINET_ADDRESS,
}: BookingStepSlotProps) {
  const { visio: visioAvailable, cabinet: cabinetAvailable } = modeAvailability;

  return (
    <div className='space-y-6'>
      {/* Date selection */}
      <CalendarPicker
        selectedDate={selectedDate}
        availableDays={availableDays}
        currentMonth={currentMonth}
        onDateSelect={onDateSelect}
        onMonthChange={onMonthChange}
      />

      {/* Time selection */}
      {selectedDate && (
        <TimeSlotGrid
          slots={availableSlots}
          selectedTime={selectedTime}
          onTimeSelect={onTimeSelect}
        />
      )}

      {/* Mode selection */}
      {selectedTime && (
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='font-medium text-gray-800'>Mode de consultation</h4>
            {isPreferredMode && selectedMode && (
              <span className='text-xs text-[#1B998B] bg-[#1B998B]/10 px-2 py-1 rounded-full'>
                ✓ Votre préférence
              </span>
            )}
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <button
              onClick={() => visioAvailable && onModeSelect('visio')}
              disabled={!visioAvailable}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                !visioAvailable
                  ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                  : selectedMode === 'visio'
                    ? 'border-[#1B998B] bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>
                  {appointmentModeConfig.visio.icon}
                </span>
                <div>
                  <p className='font-medium text-gray-800'>Visioconférence</p>
                  <p className='text-sm text-gray-500'>
                    {visioAvailable ? 'Depuis chez vous' : 'Non disponible'}
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => cabinetAvailable && onModeSelect('cabinet')}
              disabled={!cabinetAvailable}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                !cabinetAvailable
                  ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                  : selectedMode === 'cabinet'
                    ? 'border-[#1B998B] bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>
                  {appointmentModeConfig.cabinet.icon}
                </span>
                <div>
                  <p className='font-medium text-gray-800'>Au cabinet</p>
                  <p className='text-sm text-gray-500'>
                    {cabinetAvailable ? 'Neuchâtel' : 'Non disponible'}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {selectedMode === 'cabinet' && (
            <div className='mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100'>
              <p className='text-sm text-blue-700'>
                <span className='font-medium'>Adresse :</span> {cabinetAddress}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingStepSlot;
