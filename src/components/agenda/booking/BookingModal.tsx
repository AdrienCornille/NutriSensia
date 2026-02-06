'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { BookingStepIndicator } from './BookingStepIndicator';
import { BookingStepType } from './BookingStepType';
import { BookingStepSlot } from './BookingStepSlot';
import { BookingStepConfirm } from './BookingStepConfirm';
import type {
  BookingState,
  AgendaAction,
  ConsultationTypeDB,
  AppointmentMode,
  BookingFormData,
  AvailableDay,
  AvailableSlot,
  Appointment,
} from '@/types/agenda';
import {
  useConsultationTypes,
  useAvailableSlots,
  type AvailableSlotsResponse,
  type DaySlots,
  type TimeSlot,
} from '@/hooks/useAppointments';

// ==================== LOCAL STORAGE UTILS ====================
const PREFERRED_MODE_KEY = 'nutrisensia-preferred-appointment-mode';

function savePreferredMode(mode: AppointmentMode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PREFERRED_MODE_KEY, mode);
  }
}

function loadPreferredMode(): AppointmentMode | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(PREFERRED_MODE_KEY);
    if (saved === 'visio' || saved === 'cabinet') {
      return saved;
    }
  }
  return null;
}

// ==================== TRANSFORM HELPERS ====================

const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const monthNames = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
];

/**
 * Transforms API DaySlots[] to frontend AvailableDay[]
 * Deduplicates by date string and uses UTC methods to avoid DST issues
 */
function transformDaysToAvailableDays(days: DaySlots[]): AvailableDay[] {
  const seen = new Set<string>();
  const result: AvailableDay[] = [];

  for (const day of days) {
    if (seen.has(day.date)) continue;
    seen.add(day.date);

    // Use noon UTC to avoid any DST edge cases when converting to local
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

/**
 * Transforms API TimeSlot[] to frontend AvailableSlot[]
 */
function transformSlotsToAvailableSlots(slots: TimeSlot[]): (AvailableSlot & {
  visio_available: boolean;
  cabinet_available: boolean;
})[] {
  return slots.map(slot => ({
    time: slot.time,
    available: slot.available,
    visio_available: slot.visio_available,
    cabinet_available: slot.cabinet_available,
  }));
}

// ==================== COMPONENT ====================

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingState: BookingState;
  currentMonth: Date;
  dispatch: React.Dispatch<AgendaAction>;
  onSubmit: (data: BookingFormData) => void;
  editingAppointment?: Appointment | null;
  nutritionistId?: string;
}

export function BookingModal({
  isOpen,
  onClose,
  bookingState,
  currentMonth,
  dispatch,
  onSubmit,
  editingAppointment = null,
  nutritionistId = '',
}: BookingModalProps) {
  const { step, formData, isSubmitting } = bookingState;
  const isEditMode = editingAppointment !== null;

  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [availableSlots, setAvailableSlots] = useState<
    (AvailableSlot & { visio_available: boolean; cabinet_available: boolean })[]
  >([]);
  const [modeFromPreference, setModeFromPreference] = useState(false);

  // Fetch consultation types from API (nutritionist-specific)
  const {
    data: consultationTypes,
    isLoading: isLoadingTypes,
    error: typesError,
  } = useConsultationTypes();

  // Calculate date range for the current month (using local date formatting to avoid UTC offset)
  const dateRange = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const formatLocalDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    return {
      startDate: formatLocalDate(startDate),
      endDate: formatLocalDate(endDate),
    };
  }, [currentMonth]);

  // Fetch available slots from API - pass consultationTypeId for filtering
  const {
    data: slotsData,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useAvailableSlots(nutritionistId, {
    consultationTypeId: formData.consultationTypeId || undefined,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Transform API data when it changes
  useEffect(() => {
    if (slotsData && 'days' in slotsData) {
      const transformed = transformDaysToAvailableDays(slotsData.days);
      setAvailableDays(transformed);
    }
  }, [slotsData]);

  // Load available slots when date is selected
  useEffect(() => {
    if (formData.selectedDate && slotsData && 'days' in slotsData) {
      const d = formData.selectedDate;
      const selectedDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayData = slotsData.days.find(d => d.date === selectedDateStr);
      if (dayData) {
        setAvailableSlots(transformSlotsToAvailableSlots(dayData.slots));
      } else {
        setAvailableSlots([]);
      }
    } else {
      setAvailableSlots([]);
    }
  }, [formData.selectedDate, slotsData]);

  const handleSelectType = (type: ConsultationTypeDB) => {
    dispatch({
      type: 'UPDATE_BOOKING_FORM',
      data: {
        consultationType: type.code as BookingFormData['consultationType'],
        consultationTypeId: type.id,
        consultationTypeData: type,
        // Reset date/time/mode when type changes (slots may differ)
        selectedDate: null,
        selectedTime: null,
        mode: null,
      },
    });
  };

  const handleSelectDate = (date: Date) => {
    dispatch({
      type: 'UPDATE_BOOKING_FORM',
      data: { selectedDate: date, selectedTime: null, mode: null },
    });
    setModeFromPreference(false);
  };

  const handleSelectTime = (time: string) => {
    dispatch({ type: 'UPDATE_BOOKING_FORM', data: { selectedTime: time } });

    // Find the slot to check available modes
    const slot = availableSlots.find(s => s.time === time);

    // Auto-select preferred mode if saved and available
    const preferredMode = loadPreferredMode();
    if (preferredMode && !formData.mode && slot) {
      const isPreferredAvailable =
        (preferredMode === 'visio' && slot.visio_available) ||
        (preferredMode === 'cabinet' && slot.cabinet_available);

      if (isPreferredAvailable) {
        dispatch({
          type: 'UPDATE_BOOKING_FORM',
          data: { mode: preferredMode },
        });
        setModeFromPreference(true);
      }
    }
  };

  const handleSelectMode = (mode: AppointmentMode) => {
    dispatch({ type: 'UPDATE_BOOKING_FORM', data: { mode } });
    savePreferredMode(mode);
    setModeFromPreference(false);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    dispatch({ type: 'SET_CURRENT_MONTH', month: newMonth });
  };

  const handleMessageChange = (message: string) => {
    dispatch({ type: 'UPDATE_BOOKING_FORM', data: { message } });
  };

  const handleReminderChange = (sendReminders: boolean) => {
    dispatch({ type: 'UPDATE_BOOKING_FORM', data: { sendReminders } });
  };

  const handleNext = () => {
    if (step < 3) {
      dispatch({ type: 'SET_BOOKING_STEP', step: (step + 1) as 1 | 2 | 3 });
    }
  };

  const handleBack = () => {
    const minStep = isEditMode ? 2 : 1;
    if (step > minStep) {
      dispatch({ type: 'SET_BOOKING_STEP', step: (step - 1) as 1 | 2 | 3 });
    }
  };

  const handleConfirm = () => {
    onSubmit(formData);
  };

  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return formData.consultationTypeId !== null;
      case 2:
        return (
          formData.selectedDate !== null &&
          formData.selectedTime !== null &&
          formData.mode !== null
        );
      case 3:
        return true;
      default:
        return false;
    }
  }, [step, formData]);

  // Get current slot's mode availability
  const currentSlotModeAvailability = useMemo(() => {
    if (!formData.selectedTime) return { visio: true, cabinet: true };
    const slot = availableSlots.find(s => s.time === formData.selectedTime);
    return {
      visio: slot?.visio_available ?? true,
      cabinet: slot?.cabinet_available ?? true,
    };
  }, [formData.selectedTime, availableSlots]);

  // Check if nutritionist has any availability configured
  const hasAvailabilityConfig = useMemo(() => {
    if (slotsData && 'has_availability_config' in slotsData) {
      return slotsData.has_availability_config;
    }
    return true;
  }, [slotsData]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Modal header */}
        <div className='p-6 border-b border-gray-100 flex-shrink-0'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>
                {isEditMode ? 'Modifier le rendez-vous' : 'Prendre rendez-vous'}
              </h3>
              <p className='text-sm text-gray-500 mt-1'>
                {isEditMode ? `Étape ${step - 1} sur 2` : `Étape ${step} sur 3`}
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg text-gray-400'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Progress bar */}
          <div className='mt-4'>
            <BookingStepIndicator currentStep={step} isEditMode={isEditMode} />
          </div>
        </div>

        {/* Modal content */}
        <div className='p-6 overflow-y-auto flex-1'>
          {/* Error state */}
          {slotsError && step === 2 && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
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
          )}

          {/* No availability config warning */}
          {!hasAvailabilityConfig && step === 2 && !isLoadingSlots && (
            <div className='mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3'>
              <AlertCircle className='w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5' />
              <div>
                <p className='font-medium text-amber-800'>
                  Aucune disponibilité configurée
                </p>
                <p className='text-sm text-amber-600 mt-1'>
                  Le nutritionniste n&apos;a pas encore défini ses plages de
                  disponibilité. Veuillez réessayer plus tard.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <BookingStepType
              consultationTypes={consultationTypes || []}
              isLoading={isLoadingTypes}
              error={typesError}
              selectedTypeId={formData.consultationTypeId}
              onSelectType={handleSelectType}
            />
          )}

          {step === 2 && (
            <>
              {isLoadingSlots ? (
                <div className='flex items-center justify-center py-12'>
                  <Loader2 className='w-8 h-8 animate-spin text-[#1B998B]' />
                  <span className='ml-3 text-gray-500'>
                    Chargement des disponibilités...
                  </span>
                </div>
              ) : (
                <BookingStepSlot
                  selectedDate={formData.selectedDate}
                  selectedTime={formData.selectedTime}
                  selectedMode={formData.mode}
                  availableDays={availableDays}
                  availableSlots={availableSlots}
                  currentMonth={currentMonth}
                  onDateSelect={handleSelectDate}
                  onTimeSelect={handleSelectTime}
                  onModeSelect={handleSelectMode}
                  isPreferredMode={modeFromPreference}
                  onMonthChange={handleMonthChange}
                  modeAvailability={currentSlotModeAvailability}
                />
              )}
            </>
          )}

          {step === 3 && (
            <BookingStepConfirm
              formData={formData}
              onMessageChange={handleMessageChange}
              onReminderChange={handleReminderChange}
            />
          )}
        </div>

        {/* Modal footer */}
        <div className='p-6 border-t border-gray-100 flex gap-3 flex-shrink-0'>
          {(isEditMode ? step > 2 : step > 1) && (
            <button
              onClick={handleBack}
              className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
            >
              Retour
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed || (step === 2 && isLoadingSlots)}
              className={`flex-1 py-3 font-medium rounded-xl transition-colors ${
                canProceed && !(step === 2 && isLoadingSlots)
                  ? 'bg-[#1B998B] text-white hover:bg-[#158578]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors disabled:opacity-50'
            >
              {isSubmitting
                ? 'Confirmation...'
                : isEditMode
                  ? 'Confirmer la modification'
                  : 'Confirmer le rendez-vous'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
