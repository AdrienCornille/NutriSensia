'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { BookingStepIndicator } from './BookingStepIndicator';
import { BookingStepType } from './BookingStepType';
import { BookingStepSlot } from './BookingStepSlot';
import { BookingStepConfirm } from './BookingStepConfirm';
import type {
  BookingState,
  AgendaAction,
  ConsultationType,
  AppointmentMode,
  BookingFormData,
  AvailableDay,
  AvailableSlot,
  Appointment,
} from '@/types/agenda';
import { getAvailableDays, getSlotsForDate } from '@/data/mock-agenda';

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

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingState: BookingState;
  currentMonth: Date;
  dispatch: React.Dispatch<AgendaAction>;
  onSubmit: (data: BookingFormData) => void;
  editingAppointment?: Appointment | null; // AGENDA-007: Appointment being modified
}

export function BookingModal({
  isOpen,
  onClose,
  bookingState,
  currentMonth,
  dispatch,
  onSubmit,
  editingAppointment = null,
}: BookingModalProps) {
  const { step, formData, isSubmitting } = bookingState;
  const isEditMode = editingAppointment !== null; // AGENDA-007

  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [modeFromPreference, setModeFromPreference] = useState(false);

  // Load available days when month changes
  useEffect(() => {
    if (isOpen) {
      setAvailableDays(getAvailableDays(currentMonth));
    }
  }, [currentMonth, isOpen]);

  // Load available slots when date is selected
  useEffect(() => {
    if (formData.selectedDate) {
      setAvailableSlots(getSlotsForDate(formData.selectedDate));
    } else {
      setAvailableSlots([]);
    }
  }, [formData.selectedDate]);

  const handleSelectType = (type: ConsultationType) => {
    dispatch({ type: 'UPDATE_BOOKING_FORM', data: { consultationType: type } });
  };

  const handleSelectDate = (date: Date) => {
    dispatch({
      type: 'UPDATE_BOOKING_FORM',
      data: { selectedDate: date, selectedTime: null, mode: null },
    });
    // Reset preference indicator when date changes
    setModeFromPreference(false);
  };

  const handleSelectTime = (time: string) => {
    dispatch({ type: 'UPDATE_BOOKING_FORM', data: { selectedTime: time } });

    // Auto-select preferred mode if saved (AGENDA-005)
    const preferredMode = loadPreferredMode();
    if (preferredMode && !formData.mode) {
      dispatch({ type: 'UPDATE_BOOKING_FORM', data: { mode: preferredMode } });
      setModeFromPreference(true);
    }
  };

  const handleSelectMode = (mode: AppointmentMode) => {
    dispatch({ type: 'UPDATE_BOOKING_FORM', data: { mode } });
    // Save preference for next time (AGENDA-005)
    savePreferredMode(mode);
    // If user manually changes, it's no longer "from preference"
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
    // AGENDA-007: In edit mode, don't go back to step 1 (type selection)
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
        return formData.consultationType !== null;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {isEditMode ? 'Modifier le rendez-vous' : 'Prendre rendez-vous'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isEditMode
                  ? `Étape ${step - 1} sur 2`
                  : `Étape ${step} sur 3`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <BookingStepIndicator currentStep={step} isEditMode={isEditMode} />
          </div>
        </div>

        {/* Modal content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <BookingStepType
              selectedType={formData.consultationType}
              onSelectType={handleSelectType}
            />
          )}

          {step === 2 && (
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
            />
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
        <div className="p-6 border-t border-gray-100 flex gap-3 flex-shrink-0">
          {/* AGENDA-007: In edit mode, show back button only from step 3 */}
          {(isEditMode ? step > 2 : step > 1) && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Retour
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex-1 py-3 font-medium rounded-xl transition-colors ${
                canProceed
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
              className="flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors disabled:opacity-50"
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
