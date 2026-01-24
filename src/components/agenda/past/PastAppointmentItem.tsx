'use client';

import React from 'react';
import type { Appointment } from '@/types/agenda';
import {
  appointmentModeConfig,
  appointmentStatusConfig,
  formatDateParts,
} from '@/types/agenda';

interface PastAppointmentItemProps {
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
}

export function PastAppointmentItem({ appointment, onClick }: PastAppointmentItemProps) {
  const modeConfig = appointmentModeConfig[appointment.mode];
  const statusConfig = appointmentStatusConfig[appointment.status];
  const dateParts = formatDateParts(appointment.date);

  return (
    <div
      onClick={() => onClick(appointment)}
      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 font-medium">{dateParts.month}</span>
            <span className="text-xl font-bold text-gray-600">{dateParts.day}</span>
          </div>
          <div>
            <p className="font-medium text-gray-800">{appointment.typeName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">{appointment.time}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">{appointment.duration} min</span>
            </div>
            {appointment.summary && (
              <p className="text-sm text-gray-500 mt-2 max-w-md">{appointment.summary}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${modeConfig.bgColor} ${modeConfig.textColor}`}
          >
            {modeConfig.icon} {modeConfig.label}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
          >
            {statusConfig.label}
          </span>
          <span className="text-gray-400">→</span>
        </div>
      </div>
    </div>
  );
}

export default PastAppointmentItem;
