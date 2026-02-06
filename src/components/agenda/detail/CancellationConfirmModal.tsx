'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Appointment } from '@/types/agenda';
import { formatDateParts, consultationTypeConfig } from '@/types/agenda';

// AGENDA-008: Politique d'annulation
const CANCELLATION_POLICY = {
  title: "Politique d'annulation",
  rules: [
    "Annulation gratuite jusqu'à 24h avant le rendez-vous",
    'Annulation moins de 24h avant : le créneau peut être facturé',
    "En cas d'urgence, contactez directement votre nutritionniste",
  ],
  note: "Votre nutritionniste sera notifié de l'annulation par email.",
};

interface CancellationConfirmModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (appointment: Appointment) => void;
}

export function CancellationConfirmModal({
  isOpen,
  appointment,
  onClose,
  onConfirm,
}: CancellationConfirmModalProps) {
  if (!isOpen || !appointment) return null;

  const dateParts = formatDateParts(appointment.date);
  const typeConfig = consultationTypeConfig[appointment.type];

  const handleConfirm = () => {
    onConfirm(appointment);
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-md w-full p-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
              <AlertTriangle className='w-5 h-5 text-red-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-800'>
              Annuler le rendez-vous ?
            </h3>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg text-gray-400'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Appointment summary */}
        <div className='bg-gray-50 rounded-xl p-4 mb-6'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 bg-white rounded-lg flex flex-col items-center justify-center border border-gray-200'>
              <span className='text-xs text-gray-500 font-medium'>
                {dateParts.month}
              </span>
              <span className='text-xl font-bold text-gray-800'>
                {dateParts.day}
              </span>
            </div>
            <div>
              <p className='font-medium text-gray-800'>{typeConfig.label}</p>
              <p className='text-sm text-gray-500'>
                {appointment.time} - {appointment.duration} min
              </p>
              <p className='text-sm text-gray-500'>
                Avec {appointment.nutritionist.name}
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation policy */}
        <div className='mb-6'>
          <h4 className='text-sm font-semibold text-gray-700 mb-3'>
            {CANCELLATION_POLICY.title}
          </h4>
          <ul className='space-y-2'>
            {CANCELLATION_POLICY.rules.map((rule, index) => (
              <li
                key={index}
                className='flex items-start gap-2 text-sm text-gray-600'
              >
                <span className='text-gray-400 mt-1'>•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <p className='mt-3 text-xs text-gray-500 italic'>
            {CANCELLATION_POLICY.note}
          </p>
        </div>

        {/* Actions */}
        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
          >
            Garder le RDV
          </button>
          <button
            onClick={handleConfirm}
            className='flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors'
          >
            Confirmer l'annulation
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancellationConfirmModal;
