'use client';

import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import type { Appointment } from '@/types/agenda';
import {
  appointmentModeConfig,
  getCountdown,
  isVisioLinkActive,
  formatAppointmentDate,
} from '@/types/agenda';

interface NextAppointmentCardProps {
  appointment: Appointment;
  onViewDetails: (appointment: Appointment) => void;
  onJoinVisio: (visioLink: string) => void;
}

export function NextAppointmentCard({
  appointment,
  onViewDetails,
  onJoinVisio,
}: NextAppointmentCardProps) {
  const modeConfig = appointmentModeConfig[appointment.mode];
  const countdown = getCountdown(appointment.date, appointment.time);
  const canJoinVisio =
    appointment.mode === 'visio' &&
    appointment.visioLink &&
    isVisioLinkActive(appointment.date, appointment.time);

  return (
    <div className='bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white'>
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-emerald-100 text-sm font-medium'>
            Prochain rendez-vous
          </p>
          <h2 className='text-2xl font-bold mt-1'>
            {formatAppointmentDate(appointment.date)}
          </h2>
          <p className='text-emerald-100 mt-1'>
            {appointment.time} • {appointment.duration} min •{' '}
            {appointment.typeName}
          </p>
        </div>
        <div className='text-right space-y-2'>
          <span className='px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white'>
            {modeConfig.icon} {modeConfig.label}
          </span>
          {appointment.status === 'pending' ? (
            <span className='flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-400/90 text-white'>
              <Clock className='w-3.5 h-3.5' />
              En attente de confirmation
            </span>
          ) : appointment.status === 'confirmed' && (
            <span className='flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/25 text-white'>
              <CheckCircle className='w-3.5 h-3.5' />
              Confirmé
            </span>
          )}
        </div>
      </div>

      <div className='mt-6 flex items-center gap-3'>
        {canJoinVisio && (
          <button
            onClick={() => onJoinVisio(appointment.visioLink!)}
            className='px-4 py-2 bg-white text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-colors'
          >
            Rejoindre la visio
          </button>
        )}
        <button
          onClick={() => onViewDetails(appointment)}
          className='px-4 py-2 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors'
        >
          Voir les détails
        </button>
      </div>

      <div className='mt-4 pt-4 border-t border-white/20'>
        <p className='text-emerald-100 text-sm'>
          ⏰ {countdown} • Rappel envoyé par email
        </p>
      </div>
    </div>
  );
}

export default NextAppointmentCard;
