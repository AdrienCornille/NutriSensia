'use client';

import React from 'react';
import { X, ArrowRight, MessageSquare } from 'lucide-react';
import type { PatientListItem } from '@/hooks/useNutritionistPatients';
import { formatConsultationReason } from '@/lib/utils';

interface PatientQuickViewProps {
  patient: PatientListItem | null;
  onClose: () => void;
  onViewDetail: (id: string) => void;
  onSendMessage: (patient: PatientListItem) => void;
}

const statusConfig: Record<
  string,
  { label: string; bgColor: string; textColor: string }
> = {
  active: {
    label: 'Actif',
    bgColor: 'bg-[#1B998B]/10',
    textColor: 'text-[#1B998B]',
  },
  pending: {
    label: 'Nouveau',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  inactive: {
    label: 'En pause',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
  },
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function PatientQuickView({
  patient,
  onClose,
  onViewDetail,
  onSendMessage,
}: PatientQuickViewProps) {
  if (!patient) return null;

  const status = statusConfig[patient.status] || statusConfig.active;
  const initials = getInitials(patient.first_name, patient.last_name);

  return (
    <>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/30 z-40' onClick={onClose} />

      {/* Panel */}
      <div className='fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-start justify-between mb-4'>
            <div className='flex items-center gap-3'>
              {patient.avatar_url ? (
                <img
                  src={patient.avatar_url}
                  alt={`${patient.first_name} ${patient.last_name}`}
                  className='w-12 h-12 rounded-full object-cover'
                />
              ) : (
                <div className='w-12 h-12 bg-[#1B998B] rounded-full flex items-center justify-center text-white font-semibold text-lg'>
                  {initials}
                </div>
              )}
              <div>
                <h2 className='text-lg font-semibold text-gray-800'>
                  {patient.first_name} {patient.last_name}
                </h2>
                <p className='text-sm text-gray-500'>{patient.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-1 hover:bg-gray-100 rounded-lg text-gray-400'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}
          >
            {status.label}
          </span>
        </div>

        {/* Info cards */}
        <div className='p-6 space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-gray-50 rounded-xl p-4'>
              <p className='text-xs text-gray-500 mb-1'>Objectif</p>
              <p className='text-sm font-medium text-gray-800'>
                {patient.consultation_reason ? formatConsultationReason(patient.consultation_reason) : '—'}
              </p>
            </div>
            <div className='bg-gray-50 rounded-xl p-4'>
              <p className='text-xs text-gray-500 mb-1'>Suivi depuis</p>
              <p className='text-sm font-medium text-gray-800'>
                {formatDate(patient.assigned_at)}
              </p>
            </div>
            <div className='bg-gray-50 rounded-xl p-4'>
              <p className='text-xs text-gray-500 mb-1'>Poids</p>
              <p className='text-sm font-medium text-gray-800'>
                {patient.current_weight
                  ? `${patient.current_weight} kg`
                  : patient.initial_weight
                    ? `${patient.initial_weight} kg (initial)`
                    : '—'}
              </p>
            </div>
            <div className='bg-gray-50 rounded-xl p-4'>
              <p className='text-xs text-gray-500 mb-1'>Consultations</p>
              <p className='text-sm font-medium text-gray-800'>
                {patient.appointments_count}
              </p>
            </div>
          </div>

          {/* Prochain RDV */}
          <div className='bg-gray-50 rounded-xl p-4'>
            <p className='text-xs text-gray-500 mb-1'>Prochain rendez-vous</p>
            <p className='text-sm font-medium text-gray-800'>
              {patient.next_appointment_at
                ? formatDate(patient.next_appointment_at)
                : 'Aucun RDV planifié'}
            </p>
          </div>

          {/* Health goals */}
          {patient.health_goals && patient.health_goals.length > 0 && (
            <div>
              <p className='text-xs text-gray-500 mb-2'>Objectifs santé</p>
              <div className='flex flex-wrap gap-1.5'>
                {patient.health_goals.map((goal, i) => (
                  <span
                    key={i}
                    className='px-2 py-0.5 bg-[#1B998B]/5 text-[#1B998B] rounded-full text-xs'
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='p-6 border-t border-gray-200 space-y-3'>
          <button
            onClick={() => onViewDetail(patient.id)}
            className='w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium'
          >
            Voir le dossier complet
            <ArrowRight className='w-4 h-4' />
          </button>
          <button
            onClick={() => onSendMessage(patient)}
            className='w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
          >
            <MessageSquare className='w-4 h-4' />
            Envoyer un message
          </button>
        </div>
      </div>
    </>
  );
}
