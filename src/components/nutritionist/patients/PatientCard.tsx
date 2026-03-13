'use client';

import React from 'react';
import {
  Calendar,
  MessageSquare,
  AlertTriangle,
  UtensilsCrossed,
  ArrowRight,
  Clock,
  TrendingDown,
  FileEdit,
} from 'lucide-react';
import type { PatientListItem } from '@/hooks/useNutritionistPatients';
import { formatConsultationReason } from '@/lib/utils';

interface PatientCardProps {
  patient: PatientListItem;
  onNavigate: (id: string) => void;
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function PatientCard({
  patient,
  onNavigate,
  onSendMessage,
}: PatientCardProps) {
  const status = statusConfig[patient.status] || statusConfig.active;
  const initials = getInitials(patient.first_name, patient.last_name);

  return (
    <div
      onClick={() => onNavigate(patient.id)}
      className='w-full bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer'
    >
      {/* Header: Avatar + Nom + Statut */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          {patient.avatar_url ? (
            <img
              src={patient.avatar_url}
              alt={`${patient.first_name} ${patient.last_name}`}
              className='w-10 h-10 rounded-full object-cover'
            />
          ) : (
            <div className='w-10 h-10 bg-[#1B998B] rounded-full flex items-center justify-center text-white font-medium text-sm'>
              {initials}
            </div>
          )}
          <div>
            <p className='font-medium text-gray-800'>
              {patient.first_name} {patient.last_name}
            </p>
            <p className='text-xs text-gray-500'>{patient.email}</p>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}
        >
          {status.label}
        </span>
      </div>

      {/* Alert Badges */}
      {patient.alerts &&
        (patient.alerts.unread_messages > 0 ||
          patient.alerts.pending_changes > 0 ||
          patient.alerts.pending_modification_requests > 0 ||
          (patient.alerts.adherence_percent !== null &&
            patient.alerts.adherence_percent < 50) ||
          (patient.alerts.days_without_meal !== null &&
            patient.alerts.days_without_meal >= 3)) && (
          <div className='flex flex-wrap gap-1.5 mb-3'>
            {patient.alerts.pending_changes > 0 && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700'>
                <AlertTriangle className='w-3 h-3' />
                {patient.alerts.pending_changes} signalement
                {patient.alerts.pending_changes > 1 ? 's' : ''}
              </span>
            )}
            {patient.alerts.unread_messages > 0 && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>
                <MessageSquare className='w-3 h-3' />
                {patient.alerts.unread_messages} message
                {patient.alerts.unread_messages > 1 ? 's' : ''}
              </span>
            )}
            {patient.alerts.days_without_meal !== null &&
              patient.alerts.days_without_meal >= 3 && (
                <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700'>
                  <UtensilsCrossed className='w-3 h-3' />
                  Inactif {patient.alerts.days_without_meal} j
                </span>
              )}
            {patient.alerts.adherence_percent !== null &&
              patient.alerts.adherence_percent < 50 && (
                <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700'>
                  <TrendingDown className='w-3 h-3' />
                  Adhérence {patient.alerts.adherence_percent}%
                </span>
              )}
            {patient.alerts.pending_modification_requests > 0 && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700'>
                <FileEdit className='w-3 h-3' />
                {patient.alerts.pending_modification_requests} modif
                {patient.alerts.pending_modification_requests > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

      {/* Objectif */}
      {patient.consultation_reason && (
        <p className='text-sm text-gray-600 mb-3 line-clamp-1'>
          {formatConsultationReason(patient.consultation_reason)}
        </p>
      )}

      {/* Health Goals */}
      {patient.health_goals && patient.health_goals.length > 0 && (
        <div className='flex flex-wrap gap-1.5 mb-3'>
          {patient.health_goals.map((goal, i) => (
            <span
              key={i}
              className='px-2 py-0.5 bg-[#1B998B]/5 text-[#1B998B] rounded-full text-xs'
            >
              {goal}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className='grid grid-cols-4 gap-3 mb-4'>
        <div className='bg-gray-50 rounded-lg p-2 text-center'>
          <p className='text-xs text-gray-500'>Poids initial</p>
          <p className='text-sm font-semibold text-gray-800'>
            {patient.initial_weight ? `${patient.initial_weight} kg` : '—'}
          </p>
        </div>
        <div className='bg-gray-50 rounded-lg p-2 text-center'>
          <p className='text-xs text-gray-500'>Poids actuel</p>
          <p className='text-sm font-semibold text-gray-800'>
            {patient.current_weight ? `${patient.current_weight} kg` : '—'}
          </p>
        </div>
        <div className='bg-gray-50 rounded-lg p-2 text-center'>
          <p className='text-xs text-gray-500'>Consultations</p>
          <p className='text-sm font-semibold text-gray-800'>
            {patient.appointments_count}
          </p>
        </div>
        <div className='bg-gray-50 rounded-lg p-2 text-center'>
          <p className='text-xs text-gray-500'>Suivi depuis</p>
          <p className='text-sm font-semibold text-gray-800'>
            {patient.assigned_at
              ? new Date(patient.assigned_at).toLocaleDateString('fr-FR', {
                  month: 'short',
                  year: 'numeric',
                })
              : '—'}
          </p>
        </div>
      </div>

      {/* Footer: RDV + Actions */}
      <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
        <div className='flex items-center gap-1.5 text-xs text-gray-500'>
          <Calendar className='w-3.5 h-3.5' />
          <span>
            {patient.next_appointment_at
              ? `Prochain : ${formatDate(patient.next_appointment_at)}`
              : 'Aucun RDV prévu'}
          </span>
          {patient.assigned_at && (
            <>
              <span className='mx-1'>·</span>
              <Clock className='w-3.5 h-3.5' />
              <span>Depuis {formatDate(patient.assigned_at)}</span>
            </>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSendMessage(patient);
            }}
            className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
          >
            <MessageSquare className='w-3.5 h-3.5' />
            Message
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(patient.id);
            }}
            className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-[#1B998B] rounded-lg hover:bg-[#147569] transition-colors'
          >
            Dossier
            <ArrowRight className='w-3.5 h-3.5' />
          </button>
        </div>
      </div>
    </div>
  );
}
