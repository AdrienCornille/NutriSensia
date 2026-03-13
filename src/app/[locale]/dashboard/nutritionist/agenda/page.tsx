'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  Check,
  Video,
  Building2,
  X,
  CalendarClock,
  Ban,
  Edit3,
  AlertTriangle,
  UserX,
  FileText,
  Send,
} from 'lucide-react';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';
import {
  useNutritionistAppointments,
  useRespondToAppointment,
  useNutritionistUpdateAppointment,
  useNutritionistCancelAppointment,
  useMarkPostAppointmentStatus,
  useRelancerAppointment,
  type NutritionistAppointment,
  type NutritionistAppointmentFilter,
} from '@/hooks/useNutritionistAppointments';
import { PendingRequestCard } from '@/components/nutritionist/agenda/PendingRequestCard';
import { DeclineReasonModal } from '@/components/nutritionist/agenda/DeclineReasonModal';
import { ProposeNewTimeModal } from '@/components/nutritionist/agenda/ProposeNewTimeModal';
import { CounterProposalWarningModal } from '@/components/nutritionist/agenda/CounterProposalWarningModal';
import { PostAppointmentStatusModal } from '@/components/nutritionist/agenda/PostAppointmentStatusModal';
import { RelancerModal } from '@/components/nutritionist/agenda/RelancerModal';
import type { PostAppointmentStatusData } from '@/lib/api-schemas';
import { useAuth } from '@/contexts/AuthContext';

// ==================== TYPES ====================

type Tab = 'pending' | 'upcoming' | 'past' | 'cancelled' | 'no_show';

// ==================== HELPERS ====================

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

function canModifyNutritionistAppointment(scheduledAt: string): boolean {
  const date = new Date(scheduledAt);
  const now = new Date();
  return (date.getTime() - now.getTime()) / (1000 * 60 * 60) >= 24;
}

// ==================== STATUS CONFIG ====================

const statusConfigMap: Record<
  string,
  { label: string; bgColor: string; textColor: string }
> = {
  confirmed: {
    label: 'Confirmé',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  pending: {
    label: 'En attente',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  completed: {
    label: 'Effectué',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
  },
  cancelled_by_patient: {
    label: 'Annulé par le patient',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
  cancelled_by_nutritionist: {
    label: 'Annulé par vous',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
  no_show: {
    label: 'Absent(e)',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
};

function isDeclinedByNutritionist(appointment: NutritionistAppointment): boolean {
  return (
    appointment.status === 'cancelled_by_nutritionist' &&
    !!appointment.status_reason?.startsWith('declined:')
  );
}

function isDeclinedCounterProposal(appointment: NutritionistAppointment): boolean {
  return (
    appointment.status === 'cancelled_by_patient' &&
    !!appointment.status_reason?.startsWith('counter_proposal_declined:')
  );
}

function getDeclinedReason(appointment: NutritionistAppointment): string {
  if (!appointment.status_reason) return '';
  const prefix = 'counter_proposal_declined:';
  if (appointment.status_reason.startsWith(prefix)) {
    return appointment.status_reason.slice(prefix.length);
  }
  return appointment.status_reason;
}

function getCancelledStatusReason(appointment: NutritionistAppointment): string | null {
  if (!appointment.status_reason) return null;
  if (appointment.status_reason === 'counter_proposal') return null;
  if (appointment.status_reason.startsWith('declined:')) {
    return appointment.status_reason.slice(9);
  }
  if (appointment.status_reason.startsWith('counter_proposal_declined:')) {
    return appointment.status_reason.slice('counter_proposal_declined:'.length);
  }
  return appointment.status_reason;
}

function isUnmarkedPastAppointment(appointment: NutritionistAppointment): boolean {
  if (appointment.status !== 'confirmed') return false;
  const endAt = new Date(appointment.scheduled_end_at || appointment.scheduled_at);
  return endAt < new Date();
}

function getAppointmentStatusLabel(appointment: NutritionistAppointment): string {
  if (appointment.status === 'pending' && appointment.status_reason === 'counter_proposal') {
    return "Proposition d'un nouvel horaire";
  }
  if (appointment.status === 'pending' && appointment.status_reason === 'patient_counter_proposal') {
    return 'Contre-proposition du patient';
  }
  if (appointment.status === 'cancelled_by_nutritionist') {
    return isDeclinedByNutritionist(appointment)
      ? 'Refusé par vous'
      : 'Annulé par vous';
  }
  if (appointment.status === 'no_show') {
    return appointment.patient.gender === 'female' ? 'Absente' : 'Absent';
  }
  return statusConfigMap[appointment.status]?.label || 'En attente';
}

function getAppointmentStatusColors(appointment: NutritionistAppointment) {
  if (appointment.status === 'pending' && (appointment.status_reason === 'counter_proposal' || appointment.status_reason === 'patient_counter_proposal')) {
    return { bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
  }
  return statusConfigMap[appointment.status] || statusConfigMap.pending;
}

// ==================== APPOINTMENT ITEM ====================

function NutritionistAppointmentItem({
  appointment,
  onClick,
  onMarkStatus,
}: {
  appointment: NutritionistAppointment;
  onClick: (appointment: NutritionistAppointment) => void;
  onMarkStatus?: (appointment: NutritionistAppointment) => void;
}) {
  const scheduledAt = new Date(appointment.scheduled_at);
  const month = scheduledAt
    .toLocaleDateString('fr-FR', { month: 'short' })
    .replace('.', '');
  const day = scheduledAt.getDate();
  const time = scheduledAt.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`.trim();
  const typeName = appointment.consultation_type?.name_fr || 'Consultation';
  const duration =
    appointment.consultation_type?.default_duration || appointment.duration;

  const statusLabel = getAppointmentStatusLabel(appointment);
  const statusColors = getAppointmentStatusColors(appointment);
  const needsMarking = isUnmarkedPastAppointment(appointment);

  return (
    <div
      onClick={() => onClick(appointment)}
      className={`rounded-xl border p-4 hover:shadow-sm transition-shadow cursor-pointer ${
        needsMarking
          ? 'bg-amber-50 border-amber-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-center gap-4'>
        {/* Date block */}
        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
          needsMarking ? 'bg-amber-100' : 'bg-emerald-100'
        }`}>
          <span className={`text-xs font-medium capitalize ${
            needsMarking ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {month}
          </span>
          <span className='text-xl font-bold text-gray-800'>{day}</span>
        </div>

        {/* Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <p className='font-medium text-gray-800 truncate'>{patientName}</p>
            {needsMarking ? (
              <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700'>
                À marquer
              </span>
            ) : (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bgColor} ${statusColors.textColor}`}
              >
                {statusLabel}
              </span>
            )}
          </div>
          <p className='text-sm text-gray-500 mt-0.5'>
            {typeName} • {time} • {duration} min
          </p>
          <div className='flex items-center gap-2 mt-1'>
            {appointment.mode === 'visio' ? (
              <span className='inline-flex items-center gap-1 text-xs text-purple-600'>
                <Video className='w-3 h-3' />
                Visio
              </span>
            ) : (
              <span className='inline-flex items-center gap-1 text-xs text-blue-600'>
                <Building2 className='w-3 h-3' />
                Cabinet
              </span>
            )}
          </div>
        </div>

        {needsMarking && onMarkStatus ? (
          <button
            onClick={e => {
              e.stopPropagation();
              onMarkStatus(appointment);
            }}
            className='px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors flex-shrink-0'
          >
            Marquer
          </button>
        ) : (
          <span className='text-gray-400'>→</span>
        )}
      </div>
    </div>
  );
}

// ==================== CANCELLED ITEM ====================

function NutritionistCancelledItem({
  appointment,
  onClick,
  onRelancer,
}: {
  appointment: NutritionistAppointment;
  onClick: (appointment: NutritionistAppointment) => void;
  onRelancer?: (appointment: NutritionistAppointment) => void;
}) {
  const scheduledAt = new Date(appointment.scheduled_at);
  const month = scheduledAt
    .toLocaleDateString('fr-FR', { month: 'short' })
    .replace('.', '');
  const day = scheduledAt.getDate();
  const time = scheduledAt.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`.trim();
  const typeName = appointment.consultation_type?.name_fr || 'Consultation';
  const duration =
    appointment.consultation_type?.default_duration || appointment.duration;

  // Déterminer qui a annulé/refusé
  const isNoShow = appointment.status === 'no_show';
  const cancelledByLabel = isNoShow
    ? (appointment.patient.gender === 'female' ? 'Absente' : 'Absent')
    : appointment.status === 'cancelled_by_patient'
      ? 'Annulé par le patient'
      : appointment.status === 'cancelled_by_nutritionist'
        ? isDeclinedByNutritionist(appointment)
          ? 'Refusé par vous'
          : 'Annulé par vous'
        : 'Annulé';

  const dateBoxBg = isNoShow ? 'bg-orange-50' : 'bg-red-50';
  const dateBoxTextLight = isNoShow ? 'text-orange-400' : 'text-red-400';
  const dateBoxTextBold = isNoShow ? 'text-orange-500' : 'text-red-500';
  const badgeBg = isNoShow ? 'bg-orange-100' : 'bg-red-100';
  const badgeText = isNoShow ? 'text-orange-700' : 'text-red-700';

  return (
    <div
      onClick={() => onClick(appointment)}
      className='p-4 hover:bg-gray-50 transition-colors cursor-pointer'
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          <div className={`w-14 h-14 ${dateBoxBg} rounded-xl flex flex-col items-center justify-center flex-shrink-0`}>
            <span className={`text-xs ${dateBoxTextLight} font-medium capitalize`}>
              {month}
            </span>
            <span className={`text-xl font-bold ${dateBoxTextBold}`}>{day}</span>
          </div>
          <div>
            <p className='font-medium text-gray-800'>{patientName}</p>
            <div className='flex items-center gap-2 mt-1'>
              <span className='text-sm text-gray-500'>{typeName}</span>
              <span className='text-gray-300'>•</span>
              <span className='text-sm text-gray-500'>{time}</span>
              <span className='text-gray-300'>•</span>
              <span className='text-sm text-gray-500'>{duration} min</span>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {appointment.mode === 'visio' ? (
            <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700'>
              <Video className='w-3 h-3' />
              Visio
            </span>
          ) : (
            <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>
              <Building2 className='w-3 h-3' />
              Cabinet
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeBg} ${badgeText}`}>
            {cancelledByLabel}
          </span>
          {isDeclinedCounterProposal(appointment) && onRelancer && (
            <button
              onClick={e => {
                e.stopPropagation();
                onRelancer(appointment);
              }}
              className='px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1'
            >
              <Send className='w-3 h-3' />
              Relancer
            </button>
          )}
          <span className='text-gray-400'>&rarr;</span>
        </div>
      </div>
    </div>
  );
}

// ==================== DETAIL MODAL ====================

function AppointmentDetailModalNutritionist({
  isOpen,
  appointment,
  onClose,
  onModify,
  onCancel,
  onMarkStatus,
}: {
  isOpen: boolean;
  appointment: NutritionistAppointment | null;
  onClose: () => void;
  onModify: (appointment: NutritionistAppointment) => void;
  onCancel: (appointment: NutritionistAppointment) => void;
  onMarkStatus?: (appointment: NutritionistAppointment) => void;
}) {
  if (!isOpen || !appointment) return null;

  const scheduledAt = new Date(appointment.scheduled_at);
  const month = scheduledAt
    .toLocaleDateString('fr-FR', { month: 'short' })
    .replace('.', '');
  const day = scheduledAt.getDate();
  const time = formatTime(appointment.scheduled_at);
  const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`.trim();
  const typeName = appointment.consultation_type?.name_fr || 'Consultation';
  const duration =
    appointment.consultation_type?.default_duration || appointment.duration;
  const price = appointment.consultation_type?.default_price || appointment.price;

  const statusLabel = getAppointmentStatusLabel(appointment);
  const statusColors = getAppointmentStatusColors(appointment);

  const canModify =
    ['confirmed', 'pending'].includes(appointment.status) &&
    canModifyNutritionistAppointment(appointment.scheduled_at);

  const canCancel = ['confirmed', 'pending'].includes(appointment.status);

  const isCounterProposal =
    appointment.status === 'pending' && appointment.status_reason === 'counter_proposal';
  const isPatientCounterProposal =
    appointment.status === 'pending' && appointment.status_reason === 'patient_counter_proposal';

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-lg w-full p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Détails du rendez-vous
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg text-gray-400'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Date display */}
        <div className='flex items-center gap-4 mb-6'>
          <div className='w-16 h-16 bg-emerald-100 rounded-xl flex flex-col items-center justify-center'>
            <span className='text-xs text-emerald-600 font-medium capitalize'>
              {month}
            </span>
            <span className='text-2xl font-bold text-gray-800'>{day}</span>
          </div>
          <div>
            <p className='font-semibold text-gray-800'>{typeName}</p>
            <p className='text-gray-500'>
              {time} • {duration} min
            </p>
          </div>
        </div>

        {/* Details */}
        <div className='space-y-3 mb-6'>
          <div className='flex justify-between p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm text-gray-500'>Statut</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.bgColor} ${statusColors.textColor}`}
            >
              {statusLabel}
            </span>
          </div>
          <div className='flex justify-between p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm text-gray-500'>Patient</span>
            <span className='text-sm font-medium text-gray-800'>
              {patientName}
            </span>
          </div>
          <div className='flex justify-between p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm text-gray-500'>Mode</span>
            <span className='text-sm font-medium text-gray-800'>
              {appointment.mode === 'visio' ? '📹 Visio' : '🏢 Cabinet'}
            </span>
          </div>
          <div className='flex justify-between p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm text-gray-500'>Prix</span>
            <span className='text-sm font-medium text-gray-800'>
              {price} {appointment.currency || 'CHF'}
            </span>
          </div>
          {appointment.patient_message && (
            <div className='p-3 bg-gray-50 rounded-lg'>
              <span className='text-sm text-gray-500 block mb-1'>
                Message du patient
              </span>
              <span className='text-sm text-gray-800'>
                {appointment.patient_message}
              </span>
            </div>
          )}
          {appointment.nutritionist_notes_internal && (
            <div className='p-3 bg-blue-50 rounded-lg border border-blue-100'>
              <span className='text-sm text-blue-700 font-medium block mb-1'>
                Vos notes
              </span>
              <span className='text-sm text-blue-800'>
                {appointment.nutritionist_notes_internal}
              </span>
            </div>
          )}
        </div>

        {/* Counter-proposal info */}
        {isCounterProposal && (
          <div className='mb-6'>
            <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='flex items-start gap-3'>
                <CalendarClock className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-blue-800'>
                    Vous avez proposé un nouvel horaire
                  </p>
                  <p className='text-sm text-blue-600 mt-1'>
                    En attente de la réponse du patient
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient counter-proposal info */}
        {isPatientCounterProposal && (
          <div className='mb-6'>
            <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='flex items-start gap-3'>
                <CalendarClock className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-blue-800'>
                    Le patient a proposé un nouvel horaire
                  </p>
                  <p className='text-sm text-blue-600 mt-1'>
                    Vous pouvez accepter, refuser ou proposer un autre créneau
                  </p>
                  {appointment.patient_message && (
                    <p className='text-sm text-blue-600 mt-2 italic'>
                      &laquo; {appointment.patient_message} &raquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation reason */}
        {appointment.status === 'cancelled_by_nutritionist' && getCancelledStatusReason(appointment) && (
          <div className='mb-6'>
            <div className='p-4 bg-red-50 rounded-lg border border-red-200'>
              <div className='flex items-start gap-3'>
                <Ban className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-red-800'>
                    {isDeclinedByNutritionist(appointment)
                      ? 'Refusé par vous'
                      : 'Annulé par vous'}
                  </p>
                  <p className='text-sm text-red-600 mt-1'>
                    &laquo; {getCancelledStatusReason(appointment)} &raquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {appointment.status === 'cancelled_by_patient' && isDeclinedCounterProposal(appointment) && (
          <div className='mb-6'>
            <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='flex items-start gap-3'>
                <CalendarClock className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-blue-800'>
                    Contre-proposition refusée par le patient
                  </p>
                  <p className='text-sm text-blue-600 mt-1'>
                    &laquo; {getDeclinedReason(appointment)} &raquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {appointment.status === 'cancelled_by_patient' && appointment.status_reason && !isDeclinedCounterProposal(appointment) && (
          <div className='mb-6'>
            <div className='p-4 bg-red-50 rounded-lg border border-red-200'>
              <div className='flex items-start gap-3'>
                <Ban className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-red-800'>
                    Annulé par le patient
                  </p>
                  <p className='text-sm text-red-600 mt-1'>
                    &laquo; {appointment.status_reason} &raquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No-show banner */}
        {appointment.status === 'no_show' && (
          <div className='mb-6'>
            <div className='p-4 bg-orange-50 rounded-lg border border-orange-200'>
              <div className='flex items-start gap-3'>
                <UserX className='w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-orange-800'>
                    Absence du patient
                  </p>
                  {appointment.status_reason && (
                    <p className='text-sm text-orange-600 mt-1'>
                      &laquo; {appointment.status_reason} &raquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mark status button for unmarked past appointments */}
        {isUnmarkedPastAppointment(appointment) && onMarkStatus && (
          <div className='mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200'>
            <p className='text-sm text-amber-800 font-medium mb-3'>
              Ce rendez-vous est terminé et n&apos;a pas encore été marqué.
            </p>
            <button
              onClick={() => onMarkStatus(appointment)}
              className='w-full py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2'
            >
              <Check className='w-4 h-4' />
              Marquer le statut
            </button>
          </div>
        )}

        {/* Actions */}
        <div className='space-y-3'>
          {(canModify || canCancel) && (
            <div className='flex gap-3'>
              {canModify && (
                <button
                  onClick={() => onModify(appointment)}
                  className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2'
                >
                  <Edit3 className='w-4 h-4' />
                  Modifier
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => onCancel(appointment)}
                  className='flex-1 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2'
                >
                  <Ban className='w-4 h-4' />
                  Annuler
                </button>
              )}
            </div>
          )}
          {!canModify && canCancel && (
            <p className='text-xs text-center text-gray-500'>
              Les modifications ne sont plus possibles moins de 24h avant le
              rendez-vous
            </p>
          )}
          {!canModify && !canCancel && !isUnmarkedPastAppointment(appointment) && (
            <button
              onClick={onClose}
              className='w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== CANCEL CONFIRMATION MODAL ====================

function CancelConfirmModal({
  isOpen,
  appointment,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  appointment: NutritionistAppointment | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`.trim();
  const typeName = appointment.consultation_type?.name_fr || 'Consultation';

  const handleConfirm = () => {
    setError(null);
    if (reason.trim().length < 5) {
      setError("Veuillez indiquer une raison d'annulation (minimum 5 caractères)");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-md w-full p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Annuler le rendez-vous
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
              Vous allez annuler ce rendez-vous
            </p>
            <p className='text-sm text-red-600 mt-1'>
              Le patient sera notifié de cette annulation.
            </p>
          </div>
        </div>

        {/* Late cancellation warning (< 24h) */}
        {(() => {
          const hoursUntil = (new Date(appointment.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60);
          return hoursUntil > 0 && hoursUntil < 24 ? (
            <div className='flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-5'>
              <AlertTriangle className='w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5' />
              <div>
                <p className='text-sm font-medium text-amber-800'>
                  Annulation tardive (moins de 24h)
                </p>
                <p className='text-sm text-amber-600 mt-1'>
                  Le patient pourrait être déjà en route ou avoir organisé sa journée en conséquence.
                </p>
              </div>
            </div>
          ) : null;
        })()}

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
            Raison de l&apos;annulation *
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Expliquez brièvement la raison de l'annulation..."
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
            Retour
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className='flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50'
          >
            {isLoading ? 'Annulation...' : "Confirmer l'annulation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function NutritionistAgendaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const nutritionistName = [
    user?.user_metadata?.first_name,
    user?.user_metadata?.last_name,
  ].filter(Boolean).join(' ') || '';

  // State for consultation redirect prompt after marking "Effectué"
  const [completedAppointment, setCompletedAppointment] =
    useState<NutritionistAppointment | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [decliningAppointment, setDecliningAppointment] =
    useState<NutritionistAppointment | null>(null);
  const [proposingAppointment, setProposingAppointment] =
    useState<NutritionistAppointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<NutritionistAppointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] =
    useState<NutritionistAppointment | null>(null);
  const [modifyingAppointment, setModifyingAppointment] =
    useState<NutritionistAppointment | null>(null);
  const [pendingModification, setPendingModification] = useState<{
    proposedAt: string;
    message?: string;
  } | null>(null);
  const [markingAppointment, setMarkingAppointment] =
    useState<NutritionistAppointment | null>(null);
  const [relancerAppointment, setRelancerAppointment] =
    useState<NutritionistAppointment | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message?: string;
  }>({ visible: false, type: 'success', title: '' });

  // Map tab to API filter
  const filterMap: Record<Tab, NutritionistAppointmentFilter> = {
    pending: 'pending',
    upcoming: 'upcoming',
    past: 'past',
    cancelled: 'cancelled',
    no_show: 'no_show',
  };

  const { data, isLoading, error } = useNutritionistAppointments(
    filterMap[activeTab]
  );
  const respondMutation = useRespondToAppointment();
  const updateMutation = useNutritionistUpdateAppointment();
  const cancelMutation = useNutritionistCancelAppointment();
  const markStatusMutation = useMarkPostAppointmentStatus();
  const relancerMutation = useRelancerAppointment();

  const appointments = data?.appointments || [];
  const pendingCount = data?.pending_count || 0;
  const upcomingCount = data?.upcoming_count || 0;
  const pastCount = data?.past_count || 0;
  const cancelledCount = data?.cancelled_count || 0;
  const noShowCount = data?.no_show_count || 0;
  const unmarkedCount = data?.unmarked_count || 0;

  const tabs: { id: Tab; label: string; count: number; alertCount?: number }[] = [
    { id: 'pending', label: 'En attente', count: pendingCount },
    { id: 'upcoming', label: 'À venir', count: upcomingCount },
    { id: 'past', label: 'Passés', count: pastCount, alertCount: unmarkedCount },
    { id: 'cancelled', label: 'Annulés', count: cancelledCount },
    { id: 'no_show', label: 'Absences', count: noShowCount },
  ];

  // ==================== HANDLERS ====================

  const hideToast = useCallback(
    () => setToast(t => ({ ...t, visible: false })),
    []
  );

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      setToast({ visible: true, type, title, message });
    },
    []
  );

  const handleAccept = async (appointment: NutritionistAppointment) => {
    try {
      await respondMutation.mutateAsync({
        id: appointment.id,
        data: { action: 'accept' },
      });
      showToast('success', 'Rendez-vous confirmé');
    } catch (err) {
      showToast('error', 'Erreur', err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleDeclineConfirm = async (reason: string) => {
    if (!decliningAppointment) return;
    try {
      await respondMutation.mutateAsync({
        id: decliningAppointment.id,
        data: { action: 'decline', reason },
      });
      setDecliningAppointment(null);
      showToast('success', 'Demande refusée');
    } catch (err) {
      showToast('error', 'Erreur', err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleProposeConfirm = async (
    proposedAt: string,
    message?: string
  ) => {
    if (!proposingAppointment) return;
    try {
      await respondMutation.mutateAsync({
        id: proposingAppointment.id,
        data: { action: 'propose_new_time', proposed_at: proposedAt, message },
      });
      setProposingAppointment(null);
      showToast('success', 'Nouvel horaire proposé au patient');
    } catch (err) {
      showToast('error', 'Erreur', err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleModifyConfirm = (
    proposedAt: string,
    message?: string
  ) => {
    if (!modifyingAppointment) return;
    // Stocker les données et afficher le warning de contre-proposition
    setPendingModification({ proposedAt, message });
  };

  const handleModifyFinalConfirm = async () => {
    if (!modifyingAppointment || !pendingModification) return;
    try {
      await updateMutation.mutateAsync({
        id: modifyingAppointment.id,
        data: { scheduled_at: pendingModification.proposedAt, message: pendingModification.message },
      });
      setPendingModification(null);
      setModifyingAppointment(null);
      setSelectedAppointment(null);
      showToast('success', 'Rendez-vous modifié', 'En attente de validation du patient');
    } catch (err) {
      setPendingModification(null);
      showToast('error', 'Erreur', err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!cancellingAppointment) return;
    try {
      await cancelMutation.mutateAsync({
        id: cancellingAppointment.id,
        reason,
      });
      setCancellingAppointment(null);
      setSelectedAppointment(null);
      showToast('success', 'Rendez-vous annulé');
    } catch (err) {
      showToast('error', 'Erreur', err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleAppointmentClick = (appointment: NutritionistAppointment) => {
    setSelectedAppointment(appointment);
  };

  const handleModifyFromDetail = (appointment: NutritionistAppointment) => {
    setSelectedAppointment(null);
    setModifyingAppointment(appointment);
  };

  const handleCancelFromDetail = (appointment: NutritionistAppointment) => {
    setSelectedAppointment(null);
    setCancellingAppointment(appointment);
  };

  const handleMarkStatusFromDetail = (appointment: NutritionistAppointment) => {
    setSelectedAppointment(null);
    setMarkingAppointment(appointment);
  };

  const handleMarkStatusConfirm = async (statusData: PostAppointmentStatusData) => {
    if (!markingAppointment) return;
    try {
      await markStatusMutation.mutateAsync({
        id: markingAppointment.id,
        data: statusData,
      });
      const markedAppointment = markingAppointment;
      setMarkingAppointment(null);

      if (statusData.action === 'completed') {
        // Show redirect prompt for consultation creation
        setCompletedAppointment(markedAppointment);
      } else {
        showToast('success', 'Absence du patient enregistrée');
      }
    } catch (err) {
      showToast('error', 'Erreur', err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleGoToConsultation = () => {
    if (!completedAppointment) return;
    const patientId = completedAppointment.user_id;
    router.push(
      `/dashboard/nutritionist/patients/${patientId}?tab=consultations&fromAppointment=${completedAppointment.id}`
    );
    setCompletedAppointment(null);
  };

  const handleSkipConsultation = () => {
    setCompletedAppointment(null);
    showToast('success', 'Rendez-vous marqué comme effectué');
  };

  const handleRelancerConfirm = async (messageContent: string) => {
    if (!relancerAppointment) return;
    try {
      await relancerMutation.mutateAsync({
        id: relancerAppointment.id,
        message_content: messageContent,
      });
      setRelancerAppointment(null);
      showToast('success', 'Message envoyé', 'Le patient a été invité à reprendre rendez-vous');
    } catch (err) {
      showToast('error', 'Erreur', err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const isMutationLoading =
    respondMutation.isPending || updateMutation.isPending || cancelMutation.isPending || markStatusMutation.isPending || relancerMutation.isPending;

  // ==================== RENDER ====================

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 px-8 py-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>Agenda</h1>
            <p className='text-gray-500 mt-1'>
              Gérez vos demandes de rendez-vous
            </p>
          </div>
          {pendingCount > 0 && (
            <div className='flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg'>
              <span className='w-2 h-2 bg-amber-400 rounded-full animate-pulse' />
              <span className='text-sm font-medium text-amber-700'>
                {pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Unmarked past appointments banner */}
      {unmarkedCount > 0 && activeTab !== 'past' && (
        <div className='mx-8 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <AlertTriangle className='w-5 h-5 text-amber-600 flex-shrink-0' />
            <div>
              <p className='text-sm font-medium text-amber-800'>
                {unmarkedCount} rendez-vous passé{unmarkedCount > 1 ? 's' : ''} à marquer
              </p>
              <p className='text-xs text-amber-600'>
                Marquez le statut (effectué ou absence) de vos rendez-vous passés
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('past')}
            className='px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors flex-shrink-0'
          >
            Voir
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className='px-8 mt-6'>
        <div className='flex gap-1 bg-gray-100 p-1 rounded-lg w-fit'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.alertCount && tab.alertCount > 0 ? (
                <span className='px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700'>
                  {tab.alertCount}
                </span>
              ) : tab.count > 0 ? (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id && tab.id === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : activeTab === tab.id
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className='px-8 py-6'>
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-8 h-8 animate-spin text-[#1B998B]' />
            <span className='ml-3 text-gray-500'>Chargement...</span>
          </div>
        ) : error ? (
          <div className='flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-xl'>
            <AlertCircle className='w-6 h-6 text-red-500' />
            <div>
              <p className='font-medium text-red-800'>
                Erreur de chargement
              </p>
              <p className='text-sm text-red-600'>{error.message}</p>
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
            {activeTab === 'pending' ? (
              <>
                <Calendar className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                <p className='text-gray-500 font-medium'>
                  Aucune demande en attente
                </p>
                <p className='text-sm text-gray-400 mt-1'>
                  Les nouvelles demandes de rendez-vous apparaîtront ici
                </p>
              </>
            ) : activeTab === 'upcoming' ? (
              <>
                <Clock className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                <p className='text-gray-500 font-medium'>
                  Aucun rendez-vous à venir
                </p>
              </>
            ) : activeTab === 'cancelled' ? (
              <>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Check className='w-8 h-8 text-gray-400' />
                </div>
                <p className='text-gray-500 font-medium'>
                  Aucun rendez-vous annulé ou refusé
                </p>
                <p className='text-sm text-gray-400 mt-2'>
                  Les rendez-vous annulés ou refusés apparaîtront ici
                </p>
              </>
            ) : activeTab === 'no_show' ? (
              <>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Check className='w-8 h-8 text-gray-400' />
                </div>
                <p className='text-gray-500 font-medium'>
                  Aucune absence enregistrée
                </p>
                <p className='text-sm text-gray-400 mt-2'>
                  Les absences de patients apparaîtront ici
                </p>
              </>
            ) : (
              <>
                <Calendar className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                <p className='text-gray-500 font-medium'>
                  Aucun rendez-vous passé
                </p>
              </>
            )}
          </div>
        ) : activeTab === 'pending' ? (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {appointments.map(apt => (
              <PendingRequestCard
                key={apt.id}
                appointment={apt}
                onAccept={handleAccept}
                onDecline={setDecliningAppointment}
                onProposeNewTime={setProposingAppointment}
                isLoading={isMutationLoading}
              />
            ))}
          </div>
        ) : activeTab === 'cancelled' ? (
          <div className='bg-white rounded-xl border border-gray-200'>
            <div className='p-4 border-b border-gray-100'>
              <h2 className='font-semibold text-gray-800'>
                Rendez-vous annulés et refusés
              </h2>
            </div>
            <div className='divide-y divide-gray-100'>
              {appointments.map(apt => (
                <NutritionistCancelledItem
                  key={apt.id}
                  appointment={apt}
                  onClick={handleAppointmentClick}
                  onRelancer={setRelancerAppointment}
                />
              ))}
            </div>
          </div>
        ) : activeTab === 'no_show' ? (
          <div className='bg-white rounded-xl border border-gray-200'>
            <div className='p-4 border-b border-gray-100'>
              <h2 className='font-semibold text-gray-800'>
                Absences de patients
              </h2>
            </div>
            <div className='divide-y divide-gray-100'>
              {appointments.map(apt => (
                <NutritionistCancelledItem
                  key={apt.id}
                  appointment={apt}
                  onClick={handleAppointmentClick}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className='space-y-3'>
            {appointments.map(apt => (
              <NutritionistAppointmentItem
                key={apt.id}
                appointment={apt}
                onClick={handleAppointmentClick}
                onMarkStatus={activeTab === 'past' ? setMarkingAppointment : undefined}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AppointmentDetailModalNutritionist
        isOpen={!!selectedAppointment}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onModify={handleModifyFromDetail}
        onCancel={handleCancelFromDetail}
        onMarkStatus={handleMarkStatusFromDetail}
      />

      {/* Decline Modal (for pending requests) */}
      <DeclineReasonModal
        isOpen={!!decliningAppointment}
        appointment={decliningAppointment}
        onClose={() => setDecliningAppointment(null)}
        onConfirm={handleDeclineConfirm}
        isLoading={respondMutation.isPending}
      />

      {/* Propose New Time Modal (for pending requests) */}
      <ProposeNewTimeModal
        isOpen={!!proposingAppointment}
        appointment={proposingAppointment}
        onClose={() => setProposingAppointment(null)}
        onConfirm={handleProposeConfirm}
        isLoading={respondMutation.isPending}
      />

      {/* Modify Modal (for confirmed/upcoming appointments) */}
      <ProposeNewTimeModal
        isOpen={!!modifyingAppointment}
        appointment={modifyingAppointment}
        onClose={() => setModifyingAppointment(null)}
        onConfirm={handleModifyConfirm}
        isLoading={updateMutation.isPending}
        title='Modifier le rendez-vous'
        confirmLabel='Confirmer la modification'
      />

      {/* Counter-proposal warning modal (shown after modify date selection) */}
      <CounterProposalWarningModal
        isOpen={!!pendingModification}
        patientName={
          modifyingAppointment
            ? `${modifyingAppointment.patient.first_name} ${modifyingAppointment.patient.last_name}`.trim()
            : ''
        }
        onClose={() => setPendingModification(null)}
        onConfirm={handleModifyFinalConfirm}
        isLoading={updateMutation.isPending}
      />

      {/* Cancel Confirmation Modal */}
      <CancelConfirmModal
        isOpen={!!cancellingAppointment}
        appointment={cancellingAppointment}
        onClose={() => setCancellingAppointment(null)}
        onConfirm={handleCancelConfirm}
        isLoading={cancelMutation.isPending}
      />

      {/* Post-Appointment Status Modal (AGENDA-N-011) */}
      <PostAppointmentStatusModal
        isOpen={!!markingAppointment}
        appointment={markingAppointment}
        onClose={() => setMarkingAppointment(null)}
        onConfirm={handleMarkStatusConfirm}
        isLoading={markStatusMutation.isPending}
        nutritionistName={nutritionistName}
      />

      {/* Relancer Modal (declined counter-proposals) */}
      <RelancerModal
        isOpen={!!relancerAppointment}
        appointment={relancerAppointment}
        onClose={() => setRelancerAppointment(null)}
        onConfirm={handleRelancerConfirm}
        isLoading={relancerMutation.isPending}
        nutritionistName={nutritionistName}
      />

      {/* Consultation Redirect Prompt */}
      {completedAppointment && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full p-6'>
            <div className='text-center mb-6'>
              <div className='w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Check className='w-7 h-7 text-emerald-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                Rendez-vous marqué comme effectué
              </h3>
              <p className='text-sm text-gray-500'>
                Souhaitez-vous rédiger le compte-rendu de consultation pour{' '}
                <span className='font-medium text-gray-700'>
                  {completedAppointment.patient.first_name} {completedAppointment.patient.last_name}
                </span>{' '}
                ?
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={handleSkipConsultation}
                className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
              >
                Plus tard
              </button>
              <button
                onClick={handleGoToConsultation}
                className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#147569] transition-colors flex items-center justify-center gap-2'
              >
                <FileText className='w-4 h-4' />
                Rédiger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        isVisible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
}
