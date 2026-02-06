'use client';

import React from 'react';
import type { Appointment } from '@/types/agenda';
import { appointmentModeConfig, formatDateParts } from '@/types/agenda';

interface CancelledAppointmentItemProps {
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
}

export function CancelledAppointmentItem({
  appointment,
  onClick,
}: CancelledAppointmentItemProps) {
  const modeConfig = appointmentModeConfig[appointment.mode];
  const dateParts = formatDateParts(appointment.date);

  // Déterminer qui a annulé
  const cancelledByLabel =
    appointment.cancelledBy === 'patient'
      ? 'Annulé par vous'
      : appointment.cancelledBy === 'nutritionist'
        ? (appointment.isDeclinedByNutritionist
            ? 'Refusé par le nutritionniste'
            : 'Annulé par le nutritionniste')
        : 'Annulé';

  return (
    <div
      onClick={() => onClick(appointment)}
      className='p-4 hover:bg-gray-50 transition-colors cursor-pointer'
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          <div className='w-14 h-14 bg-red-50 rounded-xl flex flex-col items-center justify-center'>
            <span className='text-xs text-red-400 font-medium'>
              {dateParts.month}
            </span>
            <span className='text-xl font-bold text-red-500'>
              {dateParts.day}
            </span>
          </div>
          <div>
            <p className='font-medium text-gray-800'>{appointment.typeName}</p>
            <div className='flex items-center gap-2 mt-1'>
              <span className='text-sm text-gray-500'>{appointment.time}</span>
              <span className='text-gray-300'>•</span>
              <span className='text-sm text-gray-500'>
                {appointment.duration} min
              </span>
            </div>
            <p className='text-sm text-gray-500 mt-1'>
              Avec {appointment.nutritionist.name}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${modeConfig.bgColor} ${modeConfig.textColor}`}
          >
            {modeConfig.icon} {modeConfig.label}
          </span>
          <span className='px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'>
            {cancelledByLabel}
          </span>
          <span className='text-gray-400'>→</span>
        </div>
      </div>
    </div>
  );
}

export default CancelledAppointmentItem;
