'use client';

import React, { useState } from 'react';
import {
  Loader2,
  AlertCircle,
  Video,
  Building2,
  Phone,
  Clock,
  CalendarClock,
  FileText,
  PenLine,
} from 'lucide-react';
import { usePatientConsultations } from '@/hooks/useNutritionistConsultations';
import type { AppointmentSummary } from '@/hooks/useNutritionistConsultations';
import type { ConsultationDetail } from '@/types/nutritionist-dossier';

interface ConsultationsListProps {
  patientId: string;
  onEdit: (consultation: ConsultationDetail) => void;
  onCreateFromAppointment: (appointment: AppointmentSummary) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatTimeFR(isoStr: string) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateBox(isoStr: string) {
  const d = new Date(isoStr);
  const day = d.getDate();
  const month = d
    .toLocaleDateString('fr-FR', { month: 'short' })
    .replace('.', '');
  return { day: String(day), month: month.toUpperCase() };
}

function ModeIcon({ mode }: { mode: string }) {
  switch (mode) {
    case 'visio':
      return <Video className='w-3.5 h-3.5' />;
    case 'cabinet':
      return <Building2 className='w-3.5 h-3.5' />;
    case 'phone':
      return <Phone className='w-3.5 h-3.5' />;
    default:
      return null;
  }
}

const modeLabels: Record<string, string> = {
  visio: 'Visio',
  cabinet: 'Cabinet',
  phone: 'Téléphone',
};

const modeBadgeConfig: Record<string, { bgColor: string; textColor: string }> = {
  cabinet: { bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  visio: { bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  phone: { bgColor: 'bg-green-100', textColor: 'text-green-700' },
};

function formatDateFR(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDuration(minutes: number | null) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}` : `${h}h`;
}

// ============================================================================
// APPOINTMENT CARD (upcoming or past without report)
// ============================================================================

function AppointmentCard({
  appointment,
  variant,
  onCreateReport,
}: {
  appointment: AppointmentSummary;
  variant: 'upcoming' | 'past';
  onCreateReport?: () => void;
}) {
  const { day, month } = formatDateBox(appointment.scheduled_at);
  const typeName = appointment.consultation_type?.name_fr || 'Consultation';

  return (
    <div
      className={`bg-white rounded-xl border p-5 ${
        variant === 'upcoming'
          ? 'border-[#1B998B]/30 bg-[#1B998B]/[0.02]'
          : 'border-amber-200 bg-amber-50/30'
      }`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          {/* Date box */}
          <div
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${
              variant === 'upcoming' ? 'bg-[#1B998B]/10' : 'bg-amber-100'
            }`}
          >
            <span
              className={`text-xs font-medium leading-none ${
                variant === 'upcoming' ? 'text-[#1B998B]' : 'text-amber-600'
              }`}
            >
              {month}
            </span>
            <span className='text-xl font-bold text-gray-800 leading-tight'>
              {day}
            </span>
          </div>
          <div>
            <p className='font-medium text-gray-800'>{typeName}</p>
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <Clock className='w-3.5 h-3.5' />
              <span>{formatTimeFR(appointment.scheduled_at)}</span>
              {appointment.duration && (
                <>
                  <span>·</span>
                  <span>{appointment.duration} min</span>
                </>
              )}
              <span>·</span>
              <span className='flex items-center gap-1'>
                <ModeIcon mode={appointment.mode} />
                {modeLabels[appointment.mode] || appointment.mode}
              </span>
            </div>
          </div>
        </div>

        {variant === 'upcoming' && (
          <span className='px-2.5 py-1 rounded-full text-xs font-medium bg-[#1B998B]/10 text-[#1B998B]'>
            À venir
          </span>
        )}

        {variant === 'past' && onCreateReport && (
          <button
            onClick={onCreateReport}
            className='flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors'
          >
            <FileText className='w-3.5 h-3.5' />
            Créer le compte-rendu
          </button>
        )}
      </div>

      {appointment.patient_message && (
        <p className='text-sm text-gray-500 mt-3 pl-[72px] italic'>
          « {appointment.patient_message} »
        </p>
      )}
    </div>
  );
}

// ============================================================================
// CONSULTATION CARD (existing report)
// ============================================================================

function ConsultationCard({
  consultation,
  index,
  isLast,
  onEdit,
}: {
  consultation: ConsultationDetail;
  index: number;
  isLast: boolean;
  onEdit: () => void;
}) {
  const isDraft = consultation.status === 'draft';
  const canEdit =
    isDraft ||
    new Date().getTime() - new Date(consultation.created_at).getTime() <
      48 * 60 * 60 * 1000;
  const mode = modeBadgeConfig[consultation.mode] || modeBadgeConfig.cabinet;

  return (
    <div className='relative'>
      {/* Timeline connector */}
      {!isLast && (
        <div className='absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200' />
      )}

      <div className='flex gap-4'>
        {/* Timeline dot */}
        <div className='relative z-10'>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDraft ? 'bg-orange-100' : 'bg-[#1B998B]/10'
            }`}
          >
            <span
              className={`font-bold ${
                isDraft ? 'text-orange-500' : 'text-[#1B998B]'
              }`}
            >
              {index + 1}
            </span>
          </div>
        </div>

        {/* Content */}
        <div
          className={`flex-1 rounded-xl p-5 ${
            isDraft
              ? 'bg-orange-50/50 border border-dashed border-orange-300'
              : 'bg-gray-50'
          }`}
        >
          {/* Header */}
          <div className='flex items-start justify-between mb-4'>
            <div>
              <div className='flex items-center gap-2'>
                <h3 className='font-semibold text-gray-800'>
                  {consultation.consultation_type || 'Consultation'}
                </h3>
                {isDraft && (
                  <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200'>
                    <PenLine className='w-3 h-3' />
                    Brouillon
                  </span>
                )}
              </div>
              <div className='flex items-center gap-2 mt-1'>
                <span className='text-sm text-gray-500'>
                  {formatDateFR(consultation.date)}
                </span>
                {consultation.duration_minutes && (
                  <>
                    <span className='text-gray-300'>·</span>
                    <span className='text-sm text-gray-500'>
                      {formatDuration(consultation.duration_minutes)}
                    </span>
                  </>
                )}
                {consultation.mode && (
                  <>
                    <span className='text-gray-300'>·</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${mode.bgColor} ${mode.textColor}`}
                    >
                      <ModeIcon mode={consultation.mode} />
                      {modeLabels[consultation.mode] || consultation.mode}
                    </span>
                  </>
                )}
              </div>
            </div>
            {canEdit && (
              <button
                onClick={onEdit}
                className={`text-sm font-medium transition-colors shrink-0 ${
                  isDraft
                    ? 'px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200'
                    : 'text-[#1B998B] hover:text-[#147569]'
                }`}
              >
                {isDraft ? 'Finaliser' : 'Modifier'}
              </button>
            )}
          </div>

          {/* Summary */}
          {consultation.summary && (
            <p className='text-sm text-gray-600 mb-4'>
              {consultation.summary}
            </p>
          )}

          {/* Key points */}
          {consultation.key_points && consultation.key_points.length > 0 && (
            <div className='mb-4'>
              <p className='text-sm font-medium text-gray-700 mb-2'>
                Points clés
              </p>
              <ul className='space-y-1'>
                {consultation.key_points.map((point, i) => (
                  <li
                    key={i}
                    className='flex items-start gap-2 text-sm text-gray-600'
                  >
                    <span className='text-[#1B998B] mt-0.5'>✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next steps */}
          {consultation.next_steps && (
            <div className='p-3 bg-white rounded-lg border border-gray-200 mb-4'>
              <p className='text-sm font-medium text-gray-700'>
                Prochaines étapes
              </p>
              <p className='text-sm text-gray-600 mt-1 whitespace-pre-line'>
                {consultation.next_steps}
              </p>
            </div>
          )}

          {/* Private notes (nutritionist only) */}
          {consultation.private_notes && (
            <div className='bg-red-50 rounded-lg p-3 border border-red-100'>
              <p className='text-xs font-semibold text-red-400 uppercase mb-1'>
                🔒 Notes privées (non visibles par le patient)
              </p>
              <p className='text-sm text-red-800 italic'>
                {consultation.private_notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SECTION HEADER
// ============================================================================

function SectionHeader({
  icon: Icon,
  title,
  count,
  className,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  className?: string;
}) {
  if (count === 0) return null;
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Icon className='w-4 h-4' />
      <span className='text-sm font-semibold text-gray-700'>
        {title}
      </span>
      <span className='text-xs text-gray-400'>({count})</span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type StatusFilter = 'all' | 'draft' | 'final';

export function ConsultationsList({
  patientId,
  onEdit,
  onCreateFromAppointment,
}: ConsultationsListProps) {
  const { data, isLoading, error } = usePatientConsultations(patientId);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        <span className='ml-2 text-sm text-gray-500'>Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-16 text-red-500'>
        <AlertCircle className='w-5 h-5 mr-2' />
        <span className='text-sm'>Erreur lors du chargement</span>
      </div>
    );
  }

  const allConsultations = data?.consultations || [];
  const upcomingAppointments = data?.upcoming_appointments || [];
  const pastWithoutReport = data?.past_without_report || [];

  const draftCount = allConsultations.filter(c => c.status === 'draft').length;

  // Apply filter
  const consultations =
    statusFilter === 'all'
      ? allConsultations
      : allConsultations.filter(c => c.status === statusFilter);

  const hasAnything =
    allConsultations.length > 0 ||
    upcomingAppointments.length > 0 ||
    pastWithoutReport.length > 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Consultations & Rendez-vous
        </h2>
      </div>

      {/* Draft alert */}
      {draftCount > 0 && (
        <div className='flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3'>
          <PenLine className='w-5 h-5 text-orange-500 shrink-0' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-orange-800'>
              {draftCount} brouillon{draftCount > 1 ? 's' : ''} en attente de
              finalisation
            </p>
            <p className='text-xs text-orange-600'>
              Les brouillons ne sont pas visibles par le patient. Pensez
              à les finaliser.
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('draft')}
            className='px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors shrink-0'
          >
            Voir les brouillons
          </button>
        </div>
      )}

      {/* Empty state */}
      {!hasAnything && (
        <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-3xl'>📋</span>
          </div>
          <p className='text-gray-800 font-medium mb-1'>
            Aucune consultation ni rendez-vous
          </p>
          <p className='text-gray-500 text-sm'>
            Les comptes-rendus sont créés à partir des rendez-vous passés.
            Planifiez un rendez-vous depuis l&apos;agenda pour commencer.
          </p>
        </div>
      )}

      {/* Upcoming appointments */}
      {upcomingAppointments.length > 0 && (
        <div className='space-y-3'>
          <SectionHeader
            icon={CalendarClock}
            title='Rendez-vous à venir'
            count={upcomingAppointments.length}
          />
          {upcomingAppointments.map(apt => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              variant='upcoming'
            />
          ))}
        </div>
      )}

      {/* Past appointments without report */}
      {pastWithoutReport.length > 0 && (
        <div className='space-y-3'>
          <SectionHeader
            icon={AlertCircle}
            title='Rendez-vous passés sans compte-rendu'
            count={pastWithoutReport.length}
            className='text-amber-600'
          />
          {pastWithoutReport.map(apt => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              variant='past'
              onCreateReport={() => onCreateFromAppointment(apt)}
            />
          ))}
        </div>
      )}

      {/* Existing consultation reports */}
      {allConsultations.length > 0 && (
        <div className='space-y-3'>
          {/* Section header with filter */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <FileText className='w-4 h-4' />
              <span className='text-sm font-semibold text-gray-700'>
                Comptes-rendus
              </span>
              <span className='text-xs text-gray-400'>
                ({consultations.length}
                {statusFilter !== 'all'
                  ? ` / ${allConsultations.length}`
                  : ''}
                )
              </span>
            </div>
            <div className='flex gap-1 bg-gray-100 p-0.5 rounded-lg'>
              {(
                [
                  { key: 'all', label: 'Tous' },
                  { key: 'draft', label: 'Brouillons' },
                  { key: 'final', label: 'Finalisés' },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === key
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                  {key === 'draft' && draftCount > 0 && (
                    <span className='ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold'>
                      {draftCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered results */}
          {consultations.length === 0 ? (
            <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
              <p className='text-sm text-gray-500'>
                {statusFilter === 'draft'
                  ? 'Aucun brouillon en cours.'
                  : 'Aucun compte-rendu finalisé.'}
              </p>
            </div>
          ) : (
            <div className='space-y-6'>
              {consultations.map((consultation, index) => (
                <ConsultationCard
                  key={consultation.id}
                  consultation={consultation}
                  index={index}
                  isLast={index === consultations.length - 1}
                  onEdit={() => onEdit(consultation)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
