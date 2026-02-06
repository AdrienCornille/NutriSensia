'use client';

import React from 'react';
import { PastAppointmentItem } from './PastAppointmentItem';
import type { Appointment } from '@/types/agenda';

interface PastAppointmentsListProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function PastAppointmentsList({
  appointments,
  onAppointmentClick,
}: PastAppointmentsListProps) {
  return (
    <div className='bg-white rounded-xl border border-gray-200'>
      <div className='p-4 border-b border-gray-100'>
        <h2 className='font-semibold text-gray-800'>Rendez-vous passés</h2>
      </div>

      {appointments.length === 0 ? (
        <div className='p-12 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-3xl'>📋</span>
          </div>
          <p className='text-gray-500'>Aucun rendez-vous passé</p>
        </div>
      ) : (
        <div className='divide-y divide-gray-100'>
          {appointments.map(appointment => (
            <PastAppointmentItem
              key={appointment.id}
              appointment={appointment}
              onClick={onAppointmentClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PastAppointmentsList;
