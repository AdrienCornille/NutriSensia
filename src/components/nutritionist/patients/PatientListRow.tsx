'use client';

import React from 'react';
import { MessageSquare, AlertTriangle, UtensilsCrossed, TrendingDown, FileEdit } from 'lucide-react';
import type { PatientListItem } from '@/hooks/useNutritionistPatients';
import { formatConsultationReason } from '@/lib/utils';

interface PatientListRowProps {
  patient: PatientListItem;
  onClick: (patient: PatientListItem) => void;
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
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function PatientListRow({ patient, onClick }: PatientListRowProps) {
  const status = statusConfig[patient.status] || statusConfig.active;
  const initials = getInitials(patient.first_name, patient.last_name);

  return (
    <tr
      onClick={() => onClick(patient)}
      className='hover:bg-gray-50 cursor-pointer transition-colors'
    >
      {/* Patient */}
      <td className='px-4 py-3'>
        <div className='flex items-center gap-3'>
          {patient.avatar_url ? (
            <img
              src={patient.avatar_url}
              alt={`${patient.first_name} ${patient.last_name}`}
              className='w-8 h-8 rounded-full object-cover'
            />
          ) : (
            <div className='w-8 h-8 bg-[#1B998B] rounded-full flex items-center justify-center text-white font-medium text-xs'>
              {initials}
            </div>
          )}
          <div>
            <p className='text-sm font-medium text-gray-800'>
              {patient.first_name} {patient.last_name}
            </p>
            <p className='text-xs text-gray-500'>{patient.email}</p>
          </div>
        </div>
      </td>

      {/* Objectif */}
      <td className='px-4 py-3'>
        <p className='text-sm text-gray-600 max-w-[200px] truncate'>
          {patient.consultation_reason ? formatConsultationReason(patient.consultation_reason) : '—'}
        </p>
      </td>

      {/* Statut */}
      <td className='px-4 py-3'>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}
        >
          {status.label}
        </span>
      </td>

      {/* Dernier RDV */}
      <td className='px-4 py-3 text-sm text-gray-600'>
        {formatDate(patient.last_appointment_at)}
      </td>

      {/* Prochain RDV */}
      <td className='px-4 py-3 text-sm text-gray-600'>
        {formatDate(patient.next_appointment_at)}
      </td>

      {/* Consultations */}
      <td className='px-4 py-3 text-sm text-gray-600 text-center'>
        {patient.appointments_count}
      </td>

      {/* Alertes */}
      <td className='px-4 py-3'>
        <div className='flex items-center gap-1.5'>
          {patient.alerts?.pending_changes ? (
            <span
              title={`${patient.alerts.pending_changes} signalement(s)`}
              className='w-5 h-5 bg-red-100 rounded-full flex items-center justify-center'
            >
              <AlertTriangle className='w-3 h-3 text-red-600' />
            </span>
          ) : null}
          {patient.alerts?.unread_messages ? (
            <span
              title={`${patient.alerts.unread_messages} message(s) non lu(s)`}
              className='w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center'
            >
              <MessageSquare className='w-3 h-3 text-blue-600' />
            </span>
          ) : null}
          {patient.alerts?.days_without_meal !== null &&
          patient.alerts?.days_without_meal !== undefined &&
          patient.alerts.days_without_meal >= 3 ? (
            <span
              title={`Inactif depuis ${patient.alerts.days_without_meal} jours`}
              className='w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center'
            >
              <UtensilsCrossed className='w-3 h-3 text-amber-600' />
            </span>
          ) : null}
          {patient.alerts?.adherence_percent !== null &&
          patient.alerts?.adherence_percent !== undefined &&
          patient.alerts.adherence_percent < 50 ? (
            <span
              title={`Adhérence ${patient.alerts.adherence_percent}% cette semaine`}
              className='w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center'
            >
              <TrendingDown className='w-3 h-3 text-orange-600' />
            </span>
          ) : null}
          {patient.alerts?.pending_modification_requests ? (
            <span
              title={`${patient.alerts.pending_modification_requests} demande(s) de modification`}
              className='w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center'
            >
              <FileEdit className='w-3 h-3 text-purple-600' />
            </span>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
