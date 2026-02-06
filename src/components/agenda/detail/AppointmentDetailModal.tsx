'use client';

import React, { useState } from 'react';
import { X, FolderOpen, CalendarPlus, CalendarClock, Check, AlertCircle, Ban } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Appointment } from '@/types/agenda';
import {
  appointmentModeConfig,
  appointmentStatusConfig,
  getStatusLabel,
  formatDateParts,
  canModifyAppointment,
  isVisioLinkActive,
} from '@/types/agenda';
import { usePatientRespondToCounterProposal } from '@/hooks/useNutritionistAppointments';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onJoinVisio: (visioLink: string) => void;
  onModify: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

export function AppointmentDetailModal({
  isOpen,
  appointment,
  onClose,
  onJoinVisio,
  onModify,
  onCancel,
}: AppointmentDetailModalProps) {
  const counterProposalMutation = usePatientRespondToCounterProposal();
  const [counterProposalSuccess, setCounterProposalSuccess] = useState<string | null>(null);

  const handleAcceptCounterProposal = async () => {
    if (!appointment) return;
    try {
      await counterProposalMutation.mutateAsync({
        id: appointment.id,
        data: { action: 'accept' },
      });
      setCounterProposalSuccess('Nouvel horaire accepté');
      setTimeout(() => {
        setCounterProposalSuccess(null);
        onClose();
      }, 1500);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeclineCounterProposal = async () => {
    if (!appointment) return;
    try {
      await counterProposalMutation.mutateAsync({
        id: appointment.id,
        data: { action: 'decline' },
      });
      setCounterProposalSuccess('Rendez-vous annulé');
      setTimeout(() => {
        setCounterProposalSuccess(null);
        onClose();
      }, 1500);
    } catch {
      // Error handled by mutation
    }
  };

  // Fonction pour télécharger le fichier .ics
  const handleAddToCalendar = async () => {
    if (!appointment) return;

    try {
      const response = await fetch(
        `/api/protected/appointments/${appointment.id}/ics`
      );
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      // Récupérer le fichier et le télécharger
      const blob = await response.blob();
      const filename =
        response.headers
          .get('Content-Disposition')
          ?.match(/filename="(.+)"/)?.[1] ||
        `nutrisensia-rdv-${appointment.id}.ics`;

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de l'ajout au calendrier:", error);
    }
  };

  if (!isOpen || !appointment) return null;

  const modeConfig = appointmentModeConfig[appointment.mode];
  const statusConfig = appointmentStatusConfig[appointment.status];
  const dateParts = formatDateParts(appointment.date);
  const canModify = canModifyAppointment(appointment.date, appointment.time);
  const canJoinVisio =
    appointment.mode === 'visio' &&
    appointment.visioLink &&
    appointment.status === 'confirmed' &&
    isVisioLinkActive(appointment.date, appointment.time);

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
            <span className='text-xs text-emerald-600 font-medium'>
              {dateParts.month}
            </span>
            <span className='text-2xl font-bold text-gray-800'>
              {dateParts.day}
            </span>
          </div>
          <div>
            <p className='font-semibold text-gray-800'>
              {appointment.typeName}
            </p>
            <p className='text-gray-500'>
              {appointment.time} • {appointment.duration} min
            </p>
          </div>
        </div>

        {/* Details */}
        <div className='space-y-3 mb-6'>
          <div className='flex justify-between p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm text-gray-500'>Statut</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
            >
              {getStatusLabel(appointment.status, appointment.cancelledBy, appointment.isCounterProposal, appointment.isDeclinedByNutritionist)}
            </span>
          </div>
          <div className='flex justify-between p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm text-gray-500'>Mode</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${modeConfig.bgColor} ${modeConfig.textColor}`}
            >
              {modeConfig.icon} {modeConfig.label}
            </span>
          </div>
          <div className='flex justify-between p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm text-gray-500'>Nutritionniste</span>
            <span className='text-sm font-medium text-gray-800'>
              {appointment.nutritionist.name}
            </span>
          </div>
          {appointment.mode === 'cabinet' &&
            appointment.nutritionist.cabinetAddress && (
              <div className='flex justify-between p-3 bg-gray-50 rounded-lg'>
                <span className='text-sm text-gray-500'>Adresse</span>
                <span className='text-sm font-medium text-gray-800 text-right'>
                  {appointment.nutritionist.cabinetAddress}
                </span>
              </div>
            )}
          {appointment.notes && (
            <div className='p-3 bg-gray-50 rounded-lg'>
              <span className='text-sm text-gray-500 block mb-1'>Notes</span>
              <span className='text-sm text-gray-800'>{appointment.notes}</span>
            </div>
          )}
          {appointment.summary && (
            <div className='p-3 bg-emerald-50 rounded-lg border border-emerald-100'>
              <span className='text-sm text-emerald-700 font-medium block mb-1'>
                Résumé
              </span>
              <span className='text-sm text-emerald-800'>
                {appointment.summary}
              </span>
            </div>
          )}
        </div>

        {/* Cancellation reason banner */}
        {appointment.status === 'cancelled' && appointment.cancelledBy === 'nutritionist' && appointment.cancellationReason && (
          <div className='mb-6'>
            <div className='p-4 bg-red-50 rounded-lg border border-red-200'>
              <div className='flex items-start gap-3'>
                <Ban className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-red-800'>
                    {appointment.isDeclinedByNutritionist
                      ? 'Refusé par votre nutritionniste'
                      : 'Annulé par votre nutritionniste'}
                  </p>
                  <p className='text-sm text-red-600 mt-1'>
                    &laquo; {appointment.cancellationReason} &raquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Counter-proposal banner */}
        {appointment.isCounterProposal && (
          <div className='mb-6 space-y-3'>
            <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='flex items-start gap-3'>
                <CalendarClock className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-blue-800'>
                    Votre nutritionniste a proposé un nouvel horaire
                  </p>
                  {appointment.counterProposalMessage && (
                    <p className='text-sm text-blue-600 mt-1'>
                      &laquo; {appointment.counterProposalMessage} &raquo;
                    </p>
                  )}
                </div>
              </div>
            </div>

            {counterProposalSuccess ? (
              <div className='flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg'>
                <Check className='w-4 h-4 text-emerald-600' />
                <span className='text-sm font-medium text-emerald-700'>
                  {counterProposalSuccess}
                </span>
              </div>
            ) : (
              <>
                {counterProposalMutation.error && (
                  <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
                    <AlertCircle className='w-4 h-4 text-red-500' />
                    <span className='text-sm text-red-700'>
                      {counterProposalMutation.error.message}
                    </span>
                  </div>
                )}
                <div className='flex gap-3'>
                  <button
                    onClick={handleAcceptCounterProposal}
                    disabled={counterProposalMutation.isPending}
                    className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors disabled:opacity-50'
                  >
                    Accepter
                  </button>
                  <button
                    onClick={handleDeclineCounterProposal}
                    disabled={counterProposalMutation.isPending}
                    className='flex-1 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50'
                  >
                    Refuser
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className='space-y-3'>
          {canJoinVisio && (
            <button
              onClick={() => onJoinVisio(appointment.visioLink!)}
              className='w-full py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors flex items-center justify-center gap-2'
            >
              <span>📹</span>
              Rejoindre la visio
            </button>
          )}
          {/* Bouton Ajouter au calendrier - toujours visible pour les RDV confirmés ou pending */}
          {(appointment.status === 'confirmed' ||
            appointment.status === 'pending') && (
            <button
              onClick={handleAddToCalendar}
              className='w-full py-3 bg-blue-50 text-blue-700 font-medium rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2'
            >
              <CalendarPlus className='w-4 h-4' />
              Ajouter au calendrier
            </button>
          )}
          {appointment.status === 'confirmed' && (
            <div className='flex gap-3'>
              <button
                onClick={() => onModify(appointment)}
                disabled={!canModify}
                className={`flex-1 py-3 font-medium rounded-xl transition-colors ${
                  canModify
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                Modifier
              </button>
              <button
                onClick={() => onCancel(appointment)}
                className='flex-1 py-3 font-medium rounded-xl transition-colors bg-red-50 text-red-600 hover:bg-red-100'
              >
                Annuler
              </button>
            </div>
          )}
          {!canModify && appointment.status === 'confirmed' && (
            <p className='text-xs text-center text-gray-500'>
              Les modifications ne sont plus possibles moins de 24h avant le
              rendez-vous
            </p>
          )}
          {appointment.status === 'completed' && (
            <div className='space-y-3'>
              <Link
                href={{
                  pathname: '/dashboard/patient/dossier',
                  query: { tab: 'consultations' },
                }}
                className='w-full py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors flex items-center justify-center gap-2'
              >
                <FolderOpen className='w-4 h-4' />
                Voir dans Mon dossier
              </Link>
              <button
                onClick={onClose}
                className='w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetailModal;
