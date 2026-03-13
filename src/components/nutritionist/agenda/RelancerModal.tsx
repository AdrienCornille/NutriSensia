'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import type { NutritionistAppointment } from '@/hooks/useNutritionistAppointments';

interface RelancerModalProps {
  isOpen: boolean;
  appointment: NutritionistAppointment | null;
  onClose: () => void;
  onConfirm: (messageContent: string) => void;
  isLoading: boolean;
  nutritionistName?: string;
}

export function RelancerModal({
  isOpen,
  appointment,
  onClose,
  onConfirm,
  isLoading,
  nutritionistName,
}: RelancerModalProps) {
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const patientFirstName = appointment?.patient.first_name || '';

  useEffect(() => {
    if (isOpen && appointment) {
      const greeting = patientFirstName
        ? `Bonjour ${patientFirstName},`
        : 'Bonjour,';
      const signature = nutritionistName
        ? `Bien cordialement,\n\n${nutritionistName}`
        : 'Bien cordialement';
      setMessageContent(
        `${greeting}\n\nNous avons bien noté que le nouvel horaire proposé ne vous convenait pas.\n\nN'hésitez pas à prendre un nouveau rendez-vous depuis votre espace patient, selon les créneaux disponibles. Nous restons à votre disposition.\n\n${signature}`
      );
      setError(null);
    }
  }, [isOpen, appointment, patientFirstName, nutritionistName]);

  if (!isOpen || !appointment) return null;

  const patientName =
    `${appointment.patient.first_name} ${appointment.patient.last_name}`.trim();

  const handleConfirm = () => {
    setError(null);
    if (messageContent.trim().length < 5) {
      setError('Le message doit contenir au moins 5 caractères');
      return;
    }
    onConfirm(messageContent.trim());
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Relancer le patient
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg text-gray-400'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-5'>
          <Send className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
          <div>
            <p className='text-sm font-medium text-blue-800'>
              Inviter {patientName} à reprendre rendez-vous
            </p>
            <p className='text-sm text-blue-600 mt-1'>
              Un message sera envoyé dans la messagerie et le patient recevra une notification.
            </p>
          </div>
        </div>

        <div className='mb-5'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Message au patient
          </label>
          <textarea
            value={messageContent}
            onChange={e => setMessageContent(e.target.value)}
            rows={8}
            maxLength={1000}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none text-sm'
          />
          <div className='flex justify-between mt-1'>
            <p className='text-xs text-gray-500'>
              Vous pouvez modifier ce message avant l&apos;envoi.
            </p>
            <p className='text-xs text-gray-400'>
              {messageContent.length}/1000
            </p>
          </div>
          {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
        </div>

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
            className='flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
          >
            {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
            {isLoading ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RelancerModal;
