'use client';

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { NutritionistAppointment } from '@/hooks/useNutritionistAppointments';

interface DeclineReasonModalProps {
  isOpen: boolean;
  appointment: NutritionistAppointment | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
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

export function DeclineReasonModal({
  isOpen,
  appointment,
  onClose,
  onConfirm,
  isLoading = false,
}: DeclineReasonModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`.trim();
  const typeName = appointment.consultation_type?.name_fr || 'Consultation';

  const handleConfirm = () => {
    setError(null);
    if (reason.trim().length < 5) {
      setError('Veuillez indiquer une raison (minimum 5 caractères)');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-md w-full p-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Refuser la demande
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg text-gray-400'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Warning */}
        <div className='flex items-start gap-3 p-4 bg-red-50 rounded-lg mb-5'>
          <AlertTriangle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
          <div>
            <p className='text-sm font-medium text-red-800'>
              Vous allez refuser cette demande de rendez-vous
            </p>
            <p className='text-sm text-red-600 mt-1'>
              Le patient sera notifié de votre refus.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className='p-4 bg-gray-50 rounded-lg mb-5 space-y-1.5'>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Patient</span>
            <span className='font-medium text-gray-800'>{patientName}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Type</span>
            <span className='font-medium text-gray-800'>{typeName}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Date</span>
            <span className='font-medium text-gray-800 capitalize'>
              {formatDate(appointment.scheduled_at)}
            </span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Heure</span>
            <span className='font-medium text-gray-800'>
              {formatTime(appointment.scheduled_at)}
            </span>
          </div>
        </div>

        {/* Reason */}
        <div className='mb-5'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Raison du refus *
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder='Expliquez brièvement la raison du refus...'
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none text-sm'
          />
          {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
        </div>

        {/* Actions */}
        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className='flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50'
          >
            {isLoading ? 'Refus en cours...' : 'Confirmer le refus'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeclineReasonModal;
