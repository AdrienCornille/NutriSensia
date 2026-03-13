'use client';

import React from 'react';
import { UserX, CalendarClock } from 'lucide-react';
import type { Appointment } from '@/types/agenda';
import { appointmentModeConfig, formatDateParts } from '@/types/agenda';

interface CancelledAppointmentItemProps {
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
  patientGender?: string | null;
}

function getDisplayConfig(appointment: Appointment, gender?: string | null) {
  if (appointment.status === 'no_show') {
    return {
      label: gender === 'female' ? 'Absente' : 'Absent',
      Icon: UserX,
      dateBg: 'bg-red-50',
      dateMonthColor: 'text-red-400',
      dateDayColor: 'text-red-500',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
    };
  }
  if (appointment.status === 'postponed') {
    return {
      label: 'Reporté',
      Icon: CalendarClock,
      dateBg: 'bg-blue-50',
      dateMonthColor: 'text-blue-400',
      dateDayColor: 'text-blue-500',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
    };
  }
  // Annulé par le patient
  if (appointment.cancelledBy === 'patient') {
    return {
      label: 'Annulé par vous',
      Icon: null,
      dateBg: 'bg-gray-50',
      dateMonthColor: 'text-gray-400',
      dateDayColor: 'text-gray-500',
      badgeBg: 'bg-gray-100',
      badgeText: 'text-gray-600',
    };
  }
  // Refusé par le nutritionniste (demande refusée)
  if (appointment.cancelledBy === 'nutritionist' && appointment.isDeclinedByNutritionist) {
    return {
      label: 'Refusé par le nutritionniste',
      Icon: null,
      dateBg: 'bg-amber-50',
      dateMonthColor: 'text-amber-400',
      dateDayColor: 'text-amber-500',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-700',
    };
  }
  // Annulé par le nutritionniste
  if (appointment.cancelledBy === 'nutritionist') {
    return {
      label: 'Annulé par le nutritionniste',
      Icon: null,
      dateBg: 'bg-red-50',
      dateMonthColor: 'text-red-400',
      dateDayColor: 'text-red-500',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
    };
  }
  return {
    label: 'Annulé',
    Icon: null,
    dateBg: 'bg-gray-50',
    dateMonthColor: 'text-gray-400',
    dateDayColor: 'text-gray-500',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-600',
  };
}

export function CancelledAppointmentItem({
  appointment,
  onClick,
  patientGender,
}: CancelledAppointmentItemProps) {
  const modeConfig = appointmentModeConfig[appointment.mode];
  const dateParts = formatDateParts(appointment.date);
  const config = getDisplayConfig(appointment, patientGender);

  return (
    <div
      onClick={() => onClick(appointment)}
      className='p-4 hover:bg-gray-50 transition-colors cursor-pointer'
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          <div className={`w-14 h-14 ${config.dateBg} rounded-xl flex flex-col items-center justify-center`}>
            <span className={`text-xs ${config.dateMonthColor} font-medium`}>
              {dateParts.month}
            </span>
            <span className={`text-xl font-bold ${config.dateDayColor}`}>
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
            {appointment.status === 'postponed' && appointment.postponedReason && (
              <p className='text-xs text-blue-500 mt-1 max-w-xs truncate'>
                Raison : {appointment.postponedReason}
              </p>
            )}
            {appointment.status === 'cancelled' && appointment.cancellationReason && (
              <p className='text-xs text-gray-500 mt-1 max-w-xs truncate'>
                {appointment.cancellationReason}
              </p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${modeConfig.bgColor} ${modeConfig.textColor}`}
          >
            {modeConfig.icon} {modeConfig.label}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${config.badgeBg} ${config.badgeText}`}>
            {config.Icon && <config.Icon className='w-3 h-3' />}
            {config.label}
          </span>
          <span className='text-gray-400'>→</span>
        </div>
      </div>
    </div>
  );
}

export default CancelledAppointmentItem;
