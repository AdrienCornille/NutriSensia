'use client';

import React from 'react';
import { AppointmentItem } from './AppointmentItem';
import type { Appointment } from '@/types/agenda';

interface AppointmentsListProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onBookAppointment?: () => void;
}

export function AppointmentsList({
  appointments,
  onAppointmentClick,
  onBookAppointment,
}: AppointmentsListProps) {
  return (
    <div className='bg-white rounded-xl border border-gray-200'>
      <div className='p-4 border-b border-gray-100'>
        <h2 className='font-semibold text-gray-800'>
          Tous les rendez-vous à venir
        </h2>
      </div>

      {appointments.length === 0 ? (
        <div className='p-12 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-3xl'>📅</span>
          </div>
          <p className='text-gray-500'>Aucun rendez-vous à venir</p>
          {onBookAppointment && (
            <button
              onClick={onBookAppointment}
              className='mt-4 px-4 py-2 bg-[#1B998B] text-white font-medium rounded-lg hover:bg-[#158578] transition-colors'
            >
              Prendre rendez-vous
            </button>
          )}
        </div>
      ) : (
        <div className='divide-y divide-gray-100'>
          {appointments.map(appointment => (
            <AppointmentItem
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

export default AppointmentsList;
