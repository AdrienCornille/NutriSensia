'use client';

import React from 'react';
import { CancelledAppointmentItem } from './CancelledAppointmentItem';
import type { Appointment } from '@/types/agenda';

interface CancelledAppointmentsListProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  patientGender?: string | null;
  title?: string;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function CancelledAppointmentsList({
  appointments,
  onAppointmentClick,
  patientGender,
  title = 'Annulés / Absences',
  emptyMessage = 'Aucun rendez-vous annulé ou absence',
  emptyDescription = 'Les rendez-vous annulés et absences apparaîtront ici',
}: CancelledAppointmentsListProps) {
  return (
    <div className='bg-white rounded-xl border border-gray-200'>
      <div className='p-4 border-b border-gray-100'>
        <h2 className='font-semibold text-gray-800'>{title}</h2>
      </div>

      {appointments.length === 0 ? (
        <div className='p-12 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-3xl'>✓</span>
          </div>
          <p className='text-gray-500'>{emptyMessage}</p>
          <p className='text-sm text-gray-400 mt-2'>
            {emptyDescription}
          </p>
        </div>
      ) : (
        <div className='divide-y divide-gray-100'>
          {appointments.map(appointment => (
            <CancelledAppointmentItem
              key={appointment.id}
              appointment={appointment}
              onClick={onAppointmentClick}
              patientGender={patientGender}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CancelledAppointmentsList;
