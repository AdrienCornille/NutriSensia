'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  useNutritionistAppointments,
  useRespondToAppointment,
  useNutritionistUpdateAppointment,
  useNutritionistCancelAppointment,
  type NutritionistAppointment,
  type NutritionistAppointmentFilter,
} from '@/hooks/useNutritionistAppointments';
import { PendingRequestCard } from '@/components/nutritionist/agenda/PendingRequestCard';
import { DeclineReasonModal } from '@/components/nutritionist/agenda/DeclineReasonModal';
import { ProposeNewTimeModal } from '@/components/nutritionist/agenda/ProposeNewTimeModal';

// ==================== TYPES ====================

type Tab = 'pending' | 'upcoming' | 'past' | 'cancelled';

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
};

function isDeclinedByNutritionist(appointment: NutritionistAppointment): boolean {
  return (
    appointment.status === 'cancelled_by_nutritionist' &&
    !!appointment.status_reason?.startsWith('declined:')
  );
}

function getCancelledStatusReason(appointment: NutritionistAppointment): string | null {
  if (!appointment.status_reason) return null;
  if (appointment.status_reason === 'counter_proposal') return null;
  if (appointment.status_reason.startsWith('declined:')) {
    return appointment.status_reason.slice(9);
  }
  return appointment.status_reason;
}

function getAppointmentStatusLabel(appointment: NutritionistAppointment): string {
  if (appointment.status === 'pending' && appointment.status_reason === 'counter_proposal') {
    return "Proposition d'un nouvel horaire";
  }
  if (appointment.status === 'cancelled_by_nutritionist') {
    return isDeclinedByNutritionist(appointment)
      ? 'Refusé par vous'
      : 'Annulé par vous';
  }
  return statusConfigMap[appointment.status]?.label || 'En attente';
}

function getAppointmentStatusColors(appointment: NutritionistAppointment) {
  if (appointment.status === 'pending' && appointment.status_reason === 'counter_proposal') {
    return { bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
  }
  return statusConfigMap[appointment.status] || statusConfigMap.pending;
}

// ==================== APPOINTMENT ITEM ====================

function NutritionistAppointmentItem({
  appointment,
  onClick,
}: {
  appointment: NutritionistAppointment;
  onClick: (appointment: NutritionistAppointment) => void;
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

  return (
    <div
      onClick={() => onClick(appointment)}
      className='bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-pointer'
    >
      <div className='flex items-center gap-4'>
        {/* Date block */}
        <div className='w-14 h-14 bg-emerald-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0'>
          <span className='text-xs text-emerald-600 font-medium capitalize'>
            {month}
          </span>
          <span className='text-xl font-bold text-gray-800'>{day}</span>
        </div>

        {/* Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <p className='font-medium text-gray-800 truncate'>{patientName}</p>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bgColor} ${statusColors.textColor}`}
            >
              {statusLabel}
            </span>
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

        <span className='text-gray-400'>→</span>
      </div>
    </div>
  );
}

// ==================== CANCELLED ITEM ====================

function NutritionistCancelledItem({
  appointment,
  onClick,
}: {
  appointment: NutritionistAppointment;
  onClick: (appointment: NutritionistAppointment) => void;
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
  const cancelledByLabel =
    appointment.status === 'cancelled_by_patient'
      ? 'Annulé par le patient'
      : appointment.status === 'cancelled_by_nutritionist'
        ? isDeclinedByNutritionist(appointment)
          ? 'Refusé par vous'
          : 'Annulé par vous'
        : 'Annulé';

  return (
    <div
      onClick={() => onClick(appointment)}
      className='p-4 hover:bg-gray-50 transition-colors cursor-pointer'
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          <div className='w-14 h-14 bg-red-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0'>
            <span className='text-xs text-red-400 font-medium capitalize'>
              {month}
            </span>
            <span className='text-xl font-bold text-red-500'>{day}</span>
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
          <span className='px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'>
            {cancelledByLabel}
          </span>
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
}: {
  isOpen: boolean;
  appointment: NutritionistAppointment | null;
  onClose: () => void;
  onModify: (appointment: NutritionistAppointment) => void;
  onCancel: (appointment: NutritionistAppointment) => void;
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

        {appointment.status === 'cancelled_by_patient' && appointment.status_reason && (
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
          {!canModify && !canCancel && (
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Map tab to API filter
  const filterMap: Record<Tab, NutritionistAppointmentFilter> = {
    pending: 'pending',
    upcoming: 'upcoming',
    past: 'past',
    cancelled: 'cancelled',
  };

  const { data, isLoading, error } = useNutritionistAppointments(
    filterMap[activeTab]
  );
  const respondMutation = useRespondToAppointment();
  const updateMutation = useNutritionistUpdateAppointment();
  const cancelMutation = useNutritionistCancelAppointment();

  const appointments = data?.appointments || [];
  const pendingCount = data?.pending_count || 0;
  const upcomingCount = data?.upcoming_count || 0;
  const pastCount = data?.past_count || 0;
  const cancelledCount = data?.cancelled_count || 0;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'pending', label: 'En attente', count: pendingCount },
    { id: 'upcoming', label: 'À venir', count: upcomingCount },
    { id: 'past', label: 'Passés', count: pastCount },
    { id: 'cancelled', label: 'Annulés/Refusés', count: cancelledCount },
  ];

  // ==================== HANDLERS ====================

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAccept = async (appointment: NutritionistAppointment) => {
    try {
      await respondMutation.mutateAsync({
        id: appointment.id,
        data: { action: 'accept' },
      });
      showSuccess('Rendez-vous confirmé avec succès');
    } catch {
      // Error handled by mutation
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
      showSuccess('Demande refusée');
    } catch {
      // Error handled by mutation
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
      showSuccess('Nouvel horaire proposé au patient');
    } catch {
      // Error handled by mutation
    }
  };

  const handleModifyConfirm = async (
    proposedAt: string,
    message?: string
  ) => {
    if (!modifyingAppointment) return;
    try {
      await updateMutation.mutateAsync({
        id: modifyingAppointment.id,
        data: { scheduled_at: proposedAt, message },
      });
      setModifyingAppointment(null);
      setSelectedAppointment(null);
      showSuccess('Rendez-vous modifié - en attente de validation du patient');
    } catch {
      // Error handled by mutation
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
      showSuccess('Rendez-vous annulé');
    } catch {
      // Error handled by mutation
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

  // Mutation error to display
  const mutationError =
    respondMutation.error || updateMutation.error || cancelMutation.error;
  const isMutationLoading =
    respondMutation.isPending || updateMutation.isPending || cancelMutation.isPending;

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

      {/* Success toast */}
      {successMessage && (
        <div className='mx-8 mt-4'>
          <div className='flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg'>
            <Check className='w-5 h-5 text-emerald-600' />
            <span className='text-sm font-medium text-emerald-700'>
              {successMessage}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {mutationError && (
        <div className='mx-8 mt-4'>
          <div className='flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <AlertCircle className='w-5 h-5 text-red-500' />
            <span className='text-sm text-red-700'>
              {mutationError.message}
            </span>
          </div>
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
              {tab.count > 0 && (
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
              )}
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

      {/* Cancel Confirmation Modal */}
      <CancelConfirmModal
        isOpen={!!cancellingAppointment}
        appointment={cancellingAppointment}
        onClose={() => setCancellingAppointment(null)}
        onConfirm={handleCancelConfirm}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}
