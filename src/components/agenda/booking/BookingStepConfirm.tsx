'use client';

import React from 'react';
import type { BookingFormData } from '@/types/agenda';
import {
  consultationTypeConfig,
  appointmentModeConfig,
  formatAppointmentDate,
} from '@/types/agenda';

interface BookingStepConfirmProps {
  formData: BookingFormData;
  onMessageChange: (message: string) => void;
  onReminderChange: (sendReminders: boolean) => void;
}

export function BookingStepConfirm({
  formData,
  onMessageChange,
  onReminderChange,
}: BookingStepConfirmProps) {
  const typeConfig = formData.consultationType
    ? consultationTypeConfig[formData.consultationType]
    : null;
  const modeConfig = formData.mode ? appointmentModeConfig[formData.mode] : null;

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
        <h4 className="font-semibold text-emerald-800 mb-4">
          Récapitulatif de votre réservation
        </h4>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Type</span>
            <span className="font-medium text-gray-800">{typeConfig?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date</span>
            <span className="font-medium text-gray-800">
              {formData.selectedDate ? formatAppointmentDate(formData.selectedDate) : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Heure</span>
            <span className="font-medium text-gray-800">{formData.selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Durée</span>
            <span className="font-medium text-gray-800">{typeConfig?.duration} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Mode</span>
            <span className="font-medium text-gray-800">
              {modeConfig?.icon} {modeConfig?.label}
            </span>
          </div>
          <div className="border-t border-emerald-200 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-800">Total</span>
              <span className="font-bold text-[#1B998B]">{typeConfig?.price} CHF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes for nutritionist */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message pour votre nutritionniste (optionnel)
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Y a-t-il quelque chose de particulier à aborder lors de cette consultation ?"
          className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] resize-none h-24"
        />
      </div>

      {/* Reminder preferences */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.sendReminders}
            onChange={(e) => onReminderChange(e.target.checked)}
            className="w-4 h-4 text-[#1B998B] rounded focus:ring-[#1B998B]"
          />
          <span className="text-sm text-gray-700">Recevoir un rappel par email 24h avant</span>
        </label>
      </div>
    </div>
  );
}

export default BookingStepConfirm;
