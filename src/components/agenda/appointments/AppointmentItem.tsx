'use client';

import React from 'react';
import type { Appointment } from '@/types/agenda';
import {
  appointmentModeConfig,
  appointmentStatusConfig,
  getStatusLabel,
  formatDateParts,
} from '@/types/agenda';

interface AppointmentItemProps {
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
}

export function AppointmentItem({
  appointment,
  onClick,
}: AppointmentItemProps) {
  const modeConfig = appointmentModeConfig[appointment.mode];
  const statusConfig = appointmentStatusConfig[appointment.status];
  const dateParts = formatDateParts(appointment.date);

  return (
    <div
      onClick={() => onClick(appointment)}
      className='p-4 hover:bg-gray-50 transition-colors cursor-pointer'
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='w-14 h-14 bg-emerald-50 rounded-xl flex flex-col items-center justify-center'>
            <span className='text-xs text-emerald-600 font-medium'>
              {dateParts.month}
            </span>
            <span className='text-xl font-bold text-gray-800'>
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
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${modeConfig.bgColor} ${modeConfig.textColor}`}
          >
            {modeConfig.icon} {modeConfig.label}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
          >
            {getStatusLabel(appointment.status, appointment.cancelledBy, appointment.isCounterProposal, appointment.isDeclinedByNutritionist)}
          </span>
          <span className='text-gray-400'>→</span>
        </div>
      </div>
    </div>
  );
}

export default AppointmentItem;
