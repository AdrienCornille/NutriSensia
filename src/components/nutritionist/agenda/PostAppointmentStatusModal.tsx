'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  UserX,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import type { NutritionistAppointment } from '@/hooks/useNutritionistAppointments';
import type { PostAppointmentStatusData } from '@/lib/api-schemas';

type StatusAction = 'completed' | 'no_show';

interface PostAppointmentStatusModalProps {
  isOpen: boolean;
  appointment: NutritionistAppointment | null;
  onClose: () => void;
  onConfirm: (data: PostAppointmentStatusData) => void;
  isLoading: boolean;
  nutritionistName?: string;
}

export function PostAppointmentStatusModal({
  isOpen,
  appointment,
  onClose,
  onConfirm,
  isLoading,
  nutritionistName,
}: PostAppointmentStatusModalProps) {
  const [selectedAction, setSelectedAction] = useState<StatusAction | null>(
    null
  );
  const [notes, setNotes] = useState('');
  const [sendMessage, setSendMessage] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const scheduledAt = new Date(appointment.scheduled_at);
  const patientName =
    `${appointment.patient.first_name} ${appointment.patient.last_name}`.trim();
  const patientFirstName = appointment.patient.first_name;
  const typeName = appointment.consultation_type?.name_fr || 'Consultation';
  const time = scheduledAt.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = scheduledAt.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const buildDefaultMessage = () => {
    const greeting = patientFirstName
      ? `Bonjour ${patientFirstName},`
      : 'Bonjour,';
    const signature = nutritionistName
      ? `Bien cordialement,\n\n${nutritionistName}`
      : 'Bien cordialement';
    return `${greeting}\n\nNous avons constaté votre absence lors de votre consultation prévue le ${dateStr}.\n\nNous tenons à vous informer que, conformément à nos conditions générales, les consultations manquées sans annulation préalable (au moins 24 heures à l'avance) ne peuvent malheureusement pas faire l'objet d'un remboursement.\n\nSi vous souhaitez reprogrammer un rendez-vous, n'hésitez pas à nous contacter. Nous restons à votre disposition.\n\n${signature}`;
  };

  const handleReset = () => {
    setSelectedAction(null);
    setNotes('');
    setSendMessage(false);
    setMessageContent('');
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleConfirm = () => {
    setError(null);

    if (!selectedAction) {
      setError('Veuillez sélectionner un statut');
      return;
    }

    if (selectedAction === 'no_show' && sendMessage && !messageContent.trim()) {
      setError('Le message ne peut pas être vide');
      return;
    }

    if (selectedAction === 'completed') {
      onConfirm({ action: 'completed', notes: notes || undefined });
    } else if (selectedAction === 'no_show') {
      onConfirm({
        action: 'no_show',
        notes: notes || undefined,
        send_message: sendMessage,
        message_content: sendMessage ? messageContent : undefined,
      });
    }
  };

  const actions: {
    id: StatusAction;
    label: string;
    description: string;
    icon: React.ReactNode;
    bgColor: string;
    borderColor: string;
    textColor: string;
    selectedBg: string;
  }[] = [
    {
      id: 'completed',
      label: 'Effectué',
      description: 'Le rendez-vous a eu lieu normalement',
      icon: <Check className='w-5 h-5' />,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      selectedBg: 'bg-emerald-100',
    },
    {
      id: 'no_show',
      label: 'Absence du patient',
      description: "Le patient ne s'est pas présenté",
      icon: <UserX className='w-5 h-5' />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      selectedBg: 'bg-red-100',
    },
  ];

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Marquer le statut du rendez-vous
          </h3>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-100 rounded-lg text-gray-400'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Appointment summary */}
        <div className='p-4 bg-gray-50 rounded-lg mb-6 space-y-1.5'>
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
              {dateStr}
            </span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Heure</span>
            <span className='font-medium text-gray-800'>{time}</span>
          </div>
        </div>

        {/* Action selection */}
        <div className='space-y-3 mb-6'>
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => {
                setSelectedAction(action.id);
                setError(null);
                if (action.id === 'completed') {
                  setNotes('Consultation effectuée. RAS.');
                } else if (action.id === 'no_show') {
                  setNotes('Patient absent sans annulation préalable.');
                }
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                selectedAction === action.id
                  ? `${action.selectedBg} ${action.borderColor}`
                  : `${action.bgColor} border-transparent hover:${action.borderColor}`
              }`}
            >
              <div className={action.textColor}>{action.icon}</div>
              <div>
                <p className={`font-medium ${action.textColor}`}>
                  {action.label}
                </p>
                <p className='text-sm text-gray-500'>{action.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Completed: optional notes */}
        {selectedAction === 'completed' && (
          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Notes internes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder='Ajoutez des notes sur le rendez-vous...'
              rows={3}
              maxLength={500}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent resize-none text-sm'
            />
            <div className='flex justify-between mt-1'>
              <p className='text-xs text-gray-500'>Visibles uniquement par vous.</p>
              <p className='text-xs text-gray-400'>{notes.length}/500</p>
            </div>
          </div>
        )}

        {/* No-show: optional notes + send message toggle */}
        {selectedAction === 'no_show' && (
          <div className='mb-6 space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Notes internes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes sur l'absence..."
                rows={2}
                maxLength={500}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none text-sm'
              />
              <div className='flex justify-between mt-1'>
                <p className='text-xs text-gray-500'>Visibles uniquement par vous.</p>
                <p className='text-xs text-gray-400'>{notes.length}/500</p>
              </div>
            </div>

            {/* Send message toggle */}
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <button
                type='button'
                onClick={() => {
                  const newValue = !sendMessage;
                  setSendMessage(newValue);
                  if (newValue && !messageContent) {
                    setMessageContent(buildDefaultMessage());
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  sendMessage ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    sendMessage ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className='flex items-center gap-2'>
                <MessageSquare className='w-4 h-4 text-gray-500' />
                <span className='text-sm text-gray-700'>
                  Envoyer un message au patient
                </span>
              </div>
            </div>

            {sendMessage && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Message au patient
                </label>
                <textarea
                  value={messageContent}
                  onChange={e => setMessageContent(e.target.value)}
                  placeholder='Bonjour, nous avons constaté votre absence...'
                  rows={6}
                  maxLength={1000}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none text-sm'
                />
                <p className='text-xs text-gray-400 mt-1'>
                  {messageContent.length}/1000
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  Vous pouvez modifier ce message avant l&apos;envoi.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-700'>{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className='flex gap-3'>
          <button
            onClick={handleClose}
            className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedAction || isLoading}
            className={`flex-1 py-3 font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              selectedAction === 'completed'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : selectedAction === 'no_show'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-400 text-white'
            }`}
          >
            {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
            {isLoading ? 'En cours...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostAppointmentStatusModal;
