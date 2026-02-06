'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Clock, Loader2, AlertCircle } from 'lucide-react';
import { CalendarPicker } from '@/components/agenda/booking/CalendarPicker';
import { TimeSlotGrid } from '@/components/agenda/booking/TimeSlotGrid';
import { useAvailableSlots, type DaySlots } from '@/hooks/useAppointments';
import type { NutritionistAppointment } from '@/hooks/useNutritionistAppointments';
import type { AvailableDay, AvailableSlot } from '@/types/agenda';

interface ProposeNewTimeModalProps {
  isOpen: boolean;
  appointment: NutritionistAppointment | null;
  onClose: () => void;
  onConfirm: (proposedAt: string, message?: string) => void;
  isLoading?: boolean;
  title?: string;
  confirmLabel?: string;
}

const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const monthNames = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
];

function transformDaysToAvailableDays(days: DaySlots[]): AvailableDay[] {
  const seen = new Set<string>();
  const result: AvailableDay[] = [];

  for (const day of days) {
    if (seen.has(day.date)) continue;
    seen.add(day.date);

    const date = new Date(day.date + 'T12:00:00Z');
    result.push({
      dateStr: day.date,
      date,
      dayNumber: day.dayNumber,
      dayName: dayNames[date.getUTCDay()],
      monthName: monthNames[date.getUTCMonth()],
      isAvailable: day.isAvailable,
      slotsCount: day.slotsCount,
    });
  }

  return result;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ProposeNewTimeModal({
  isOpen,
  appointment,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  confirmLabel,
}: ProposeNewTimeModalProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  // Date range for current month
  const dateRange = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    return { startDate: fmt(startDate), endDate: fmt(endDate) };
  }, [currentMonth]);

  // Fetch available slots using the nutritionist_id directly from the appointment
  const nutritionistId = appointment?.nutritionist_id;
  const {
    data: slotsData,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useAvailableSlots(nutritionistId || undefined, {
    consultationTypeId: appointment?.consultation_type_id || undefined,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    enabled: !!nutritionistId,
  });

  // Transform API data
  useEffect(() => {
    if (slotsData && 'days' in slotsData) {
      setAvailableDays(transformDaysToAvailableDays(slotsData.days));
    }
  }, [slotsData]);

  // Update available slots when date is selected
  useEffect(() => {
    if (selectedDate && slotsData && 'days' in slotsData) {
      const d = selectedDate;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayData = slotsData.days.find((day: DaySlots) => day.date === dateStr);
      if (dayData) {
        setAvailableSlots(
          dayData.slots.map(s => ({
            time: s.time,
            available: s.available,
          }))
        );
      } else {
        setAvailableSlots([]);
      }
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, slotsData]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(null);
      setSelectedTime(null);
      setMessage('');
      setCurrentMonth(new Date());
    }
  }, [isOpen]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;

    const proposedDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    proposedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    onConfirm(proposedDate.toISOString(), message || undefined);
  };

  if (!isOpen || !appointment) return null;

  const canConfirm = selectedDate !== null && selectedTime !== null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='p-6 border-b border-gray-100 flex-shrink-0'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>
                {title || 'Proposer un autre horaire'}
              </h3>
              <p className='text-sm text-gray-500 mt-1'>
                Sélectionnez un créneau disponible
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg text-gray-400'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto flex-1'>
          {/* Current request info */}
          <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg mb-6'>
            <Clock className='w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5' />
            <div>
              <p className='text-sm text-gray-500'>Horaire actuellement demandé</p>
              <p className='text-sm font-medium text-gray-800 capitalize'>
                {formatDate(appointment.scheduled_at)} à{' '}
                {formatTime(appointment.scheduled_at)}
              </p>
            </div>
          </div>

          {/* Calendar + Slots */}
          {slotsError ? (
            <div className='p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
              <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
              <div>
                <p className='font-medium text-red-800'>
                  Erreur lors du chargement des disponibilités
                </p>
                <p className='text-sm text-red-600 mt-1'>
                  {slotsError.message}
                </p>
              </div>
            </div>
          ) : isLoadingSlots ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='w-8 h-8 animate-spin text-[#1B998B]' />
              <span className='ml-3 text-gray-500'>
                Chargement des disponibilités...
              </span>
            </div>
          ) : (
            <div className='space-y-6'>
              <CalendarPicker
                selectedDate={selectedDate}
                availableDays={availableDays}
                currentMonth={currentMonth}
                onDateSelect={handleDateSelect}
                onMonthChange={handleMonthChange}
              />

              {selectedDate && (
                <TimeSlotGrid
                  slots={availableSlots}
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                />
              )}
            </div>
          )}

          {/* Message */}
          {selectedTime && (
            <div className='mt-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Message pour le patient (optionnel)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder='Ex: Je ne suis pas disponible à cet horaire, je vous propose...'
                rows={2}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent resize-none text-sm'
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-100 flex gap-3 flex-shrink-0'>
          <button
            onClick={onClose}
            className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className={`flex-1 py-3 font-medium rounded-xl transition-colors ${
              canConfirm && !isLoading
                ? 'bg-[#1B998B] text-white hover:bg-[#158578]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Envoi...' : (confirmLabel || 'Proposer ce créneau')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProposeNewTimeModal;
