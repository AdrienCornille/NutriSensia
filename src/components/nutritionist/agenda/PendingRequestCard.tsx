'use client';

import React from 'react';
import { Clock, Video, Building2, MessageSquare, Check, X, CalendarClock } from 'lucide-react';
import type { NutritionistAppointment } from '@/hooks/useNutritionistAppointments';

interface PendingRequestCardProps {
  appointment: NutritionistAppointment;
  onAccept: (appointment: NutritionistAppointment) => void;
  onDecline: (appointment: NutritionistAppointment) => void;
  onProposeNewTime: (appointment: NutritionistAppointment) => void;
  isLoading?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(firstName: string, lastName: string): string {
  return (
    (firstName?.charAt(0) || '').toUpperCase() +
    (lastName?.charAt(0) || '').toUpperCase()
  );
}

export function PendingRequestCard({
  appointment,
  onAccept,
  onDecline,
  onProposeNewTime,
  isLoading = false,
}: PendingRequestCardProps) {
  const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`.trim();
  const initials = getInitials(
    appointment.patient.first_name,
    appointment.patient.last_name
  );
  const typeName = appointment.consultation_type?.name_fr || 'Consultation';
  const typeIcon = appointment.consultation_type?.icon;
  const duration = appointment.consultation_type?.default_duration || appointment.duration;
  const price = appointment.consultation_type?.default_price || appointment.price;

  return (
    <div className='bg-white rounded-xl border-l-4 border-l-amber-400 border border-gray-200 p-5 hover:shadow-md transition-shadow'>
      {/* Header: Patient info + Date */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-[#1B998B]/15 rounded-full flex items-center justify-center text-[#1B998B] font-semibold text-sm'>
            {initials}
          </div>
          <div>
            <p className='font-medium text-gray-800'>{patientName}</p>
            <p className='text-xs text-gray-500'>Nouvelle demande</p>
          </div>
        </div>
        <span className='px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full'>
          En attente
        </span>
      </div>

      {/* Appointment details */}
      <div className='space-y-2 mb-4'>
        <div className='flex items-center gap-2 text-sm text-gray-700'>
          {typeIcon && <span>{typeIcon}</span>}
          <span className='font-medium'>{typeName}</span>
          <span className='text-gray-400'>•</span>
          <span>{duration} min</span>
          <span className='text-gray-400'>•</span>
          <span className='font-medium text-[#1B998B]'>{price} CHF</span>
        </div>

        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <Clock className='w-4 h-4 text-gray-400' />
          <span className='capitalize'>{formatDate(appointment.scheduled_at)}</span>
          <span className='text-gray-400'>à</span>
          <span className='font-medium'>{formatTime(appointment.scheduled_at)}</span>
        </div>

        <div className='flex items-center gap-2'>
          {appointment.mode === 'visio' ? (
            <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full'>
              <Video className='w-3 h-3' />
              Visio
            </span>
          ) : (
            <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full'>
              <Building2 className='w-3 h-3' />
              Cabinet
            </span>
          )}
        </div>

        {appointment.patient_message && (
          <div className='flex items-start gap-2 mt-2 p-3 bg-gray-50 rounded-lg'>
            <MessageSquare className='w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5' />
            <p className='text-sm text-gray-600'>{appointment.patient_message}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className='flex gap-2'>
        <button
          onClick={() => onAccept(appointment)}
          disabled={isLoading}
          className='flex-1 py-2.5 bg-[#1B998B] text-white text-sm font-medium rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5'
        >
          <Check className='w-4 h-4' />
          Accepter
        </button>
        <button
          onClick={() => onDecline(appointment)}
          disabled={isLoading}
          className='flex-1 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5'
        >
          <X className='w-4 h-4' />
          Refuser
        </button>
        <button
          onClick={() => onProposeNewTime(appointment)}
          disabled={isLoading}
          className='flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5'
        >
          <CalendarClock className='w-4 h-4' />
          Autre horaire
        </button>
      </div>
    </div>
  );
}

export default PendingRequestCard;
