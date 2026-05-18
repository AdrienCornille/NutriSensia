'use client';

import React, { useState } from 'react';
import {
  Loader2,
  AlertCircle,
  Video,
  Building2,
  Phone,
  PenLine,
  AlertTriangle,
} from 'lucide-react';
import { usePatientConsultations } from '@/hooks/useNutritionistConsultations';
import type { AppointmentSummary } from '@/hooks/useNutritionistConsultations';
import type { ConsultationDetail } from '@/types/nutritionist-dossier';
import { AppointmentCard } from './AppointmentCard';
import { PrivateNotesBlock } from './PrivateNotesBlock';
import { EditWindowIndicator } from './EditWindowIndicator';

interface ConsultationsListProps {
  patientId: string;
  onEdit: (consultation: ConsultationDetail) => void;
  onCreateFromAppointment: (appointment: AppointmentSummary) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const MODE_LABELS: Record<string, string> = {
  visio: 'Visio',
  cabinet: 'Cabinet',
  phone: 'Téléphone',
};

const MODE_CLASS: Record<string, string> = {
  visio: 'is-visio',
  cabinet: 'is-cabinet',
  phone: 'is-phone',
};

function ModeIcon({ mode }: { mode: string }) {
  if (mode === 'visio') return <Video className='w-3 h-3' />;
  if (mode === 'cabinet') return <Building2 className='w-3 h-3' />;
  if (mode === 'phone') return <Phone className='w-3 h-3' />;
  return null;
}

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
// CONSULTATION TIMELINE CARD (existing report)
// ============================================================================

function ConsultationTimelineCard({
  consultation,
  index,
  onEdit,
}: {
  consultation: ConsultationDetail;
  index: number;
  onEdit: () => void;
}) {
  const isDraft = consultation.status === 'draft';
  const within48h =
    Date.now() - new Date(consultation.created_at).getTime() <
    48 * 60 * 60 * 1000;
  const canEdit = isDraft || within48h;
  const modeClass = MODE_CLASS[consultation.mode] ?? '';
  const modeLabel = MODE_LABELS[consultation.mode] ?? consultation.mode;

  return (
    <div className={`fp-cons-item ${isDraft ? 'is-draft' : ''}`}>
      <span className='fp-cons-item-num'>{index + 1}</span>

      <article className={`fp-cons-card ${isDraft ? 'is-draft' : ''}`}>
        <div className='fp-cons-card-head'>
          <div>
            <h3 className='fp-cons-card-title'>
              {consultation.consultation_type || 'Consultation'}
              {isDraft && <span className='fp-vchip is-draft'>Brouillon</span>}
            </h3>
            <div className='fp-cons-card-meta'>
              <span>
                <b>{formatDateFR(consultation.date)}</b>
              </span>
              {consultation.duration_minutes && (
                <>
                  <span className='dot' />
                  <span>{formatDuration(consultation.duration_minutes)}</span>
                </>
              )}
              {consultation.mode && (
                <>
                  <span className='dot' />
                  <span className={`fp-mode-icon ${modeClass}`}>
                    <ModeIcon mode={consultation.mode} />
                    {modeLabel}
                  </span>
                </>
              )}
            </div>
          </div>
          {canEdit && (
            <button
              type='button'
              className={`fp-btn ${isDraft ? 'fp-btn-dark' : ''}`}
              onClick={onEdit}
            >
              {isDraft ? 'Finaliser' : 'Modifier'}
            </button>
          )}
        </div>

        {consultation.summary && (
          <p className='fp-cons-summary'>{consultation.summary}</p>
        )}

        {consultation.key_points && consultation.key_points.length > 0 && (
          <ul className='fp-cons-points'>
            {consultation.key_points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        )}

        {consultation.next_steps && (
          <div className='fp-cons-next'>
            <b>Prochaines étapes</b>
            <p>{consultation.next_steps}</p>
          </div>
        )}

        {consultation.private_notes && (
          <PrivateNotesBlock>{consultation.private_notes}</PrivateNotesBlock>
        )}

        <EditWindowIndicator
          createdAt={consultation.created_at}
          isDraft={isDraft}
        />
      </article>
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
        <Loader2
          className='w-6 h-6 animate-spin'
          style={{ color: 'var(--ns-peps-deep)' }}
        />
        <span className='ml-2 text-sm' style={{ color: 'var(--ns-ink-3)' }}>
          Chargement…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-16'>
        <AlertCircle
          className='w-5 h-5 mr-2'
          style={{ color: 'var(--ns-coral)' }}
        />
        <span className='text-sm' style={{ color: 'var(--ns-coral)' }}>
          Erreur lors du chargement
        </span>
      </div>
    );
  }

  const allConsultations = data?.consultations || [];
  const upcomingAppointments = data?.upcoming_appointments || [];
  const pastWithoutReport = data?.past_without_report || [];

  const draftCount = allConsultations.filter(c => c.status === 'draft').length;
  const finalCount = allConsultations.length - draftCount;

  const consultations =
    statusFilter === 'all'
      ? allConsultations
      : allConsultations.filter(c => c.status === statusFilter);

  const hasAnything =
    allConsultations.length > 0 ||
    upcomingAppointments.length > 0 ||
    pastWithoutReport.length > 0;

  // Format next RDV display for the pane intro
  const nextRdv = upcomingAppointments[0];
  const nextRdvLabel = nextRdv
    ? new Date(nextRdv.scheduled_at).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className='space-y-4'>
      {/* ─── Pane intro ─── */}
      <section className='fp-pane-intro'>
        <div>
          <h2 className='fp-pane-intro-title'>
            Consultations <em>&amp; comptes-rendus</em>
          </h2>
          <div className='fp-pane-intro-meta'>
            <span>
              <b>{allConsultations.length}</b> consultation
              {allConsultations.length > 1 ? 's' : ''}
            </span>
            {draftCount > 0 && (
              <>
                <span className='dot' />
                <span style={{ color: 'var(--ns-honey)' }}>
                  <b style={{ color: 'var(--ns-honey)' }}>
                    {draftCount} brouillon{draftCount > 1 ? 's' : ''}
                  </b>{' '}
                  en attente
                </span>
              </>
            )}
            {nextRdvLabel && (
              <>
                <span className='dot' />
                <span>
                  Prochain RDV · <b>{nextRdvLabel}</b>
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Drafts alert ─── */}
      {draftCount > 0 && (
        <div className='fp-cons-drafts-alert'>
          <PenLine
            className='w-5 h-5 shrink-0'
            style={{ color: 'var(--ns-ink)' }}
          />
          <span>
            <b>
              {draftCount} brouillon{draftCount > 1 ? 's' : ''} en attente de
              finalisation
            </b>{' '}
            — les brouillons ne sont pas visibles par le patient.
          </span>
          <button
            type='button'
            className='fp-btn fp-btn-dark'
            onClick={() => setStatusFilter('draft')}
          >
            Voir les brouillons
          </button>
        </div>
      )}

      {/* ─── Empty state ─── */}
      {!hasAnything && (
        <div className='fp-card text-center' style={{ padding: '48px 32px' }}>
          <p
            className='font-serif text-xl mb-1'
            style={{ color: 'var(--ns-ink)' }}
          >
            Aucune consultation ni rendez-vous
          </p>
          <p className='text-sm' style={{ color: 'var(--ns-ink-3)' }}>
            Les comptes-rendus sont créés à partir des rendez-vous passés.
            Planifiez un rendez-vous depuis l&apos;agenda pour commencer.
          </p>
        </div>
      )}

      {/* ─── Upcoming appointments ─── */}
      {upcomingAppointments.length > 0 && (
        <>
          <div className='fp-cons-section-head'>
            <span>Rendez-vous à venir</span>
            <span className='cnt'>{upcomingAppointments.length}</span>
          </div>
          <div className='space-y-2'>
            {upcomingAppointments.map(apt => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                variant='upcoming'
              />
            ))}
          </div>
        </>
      )}

      {/* ─── Past appointments without report ─── */}
      {pastWithoutReport.length > 0 && (
        <>
          <div className='fp-cons-section-head is-warn'>
            <AlertTriangle
              className='w-3 h-3'
              style={{ color: 'var(--ns-coral)' }}
            />
            <span style={{ color: 'var(--ns-coral)' }}>
              Rendez-vous passés sans compte-rendu
            </span>
            <span
              className='cnt'
              style={{
                background: 'var(--ns-coral-soft)',
                color: 'var(--ns-coral)',
              }}
            >
              {pastWithoutReport.length}
            </span>
            <span className='spacer' />
            <span
              style={{
                fontFamily: 'var(--ns-font-serif)',
                fontStyle: 'italic',
                fontSize: 12,
                color: 'var(--ns-ink-3)',
                textTransform: 'none',
                letterSpacing: 0,
                fontWeight: 400,
              }}
            >
              Notification envoyée 24h après le RDV.
            </span>
          </div>
          <div className='space-y-2'>
            {pastWithoutReport.map(apt => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                variant='past-without-cr'
                onCreateReport={() => onCreateFromAppointment(apt)}
              />
            ))}
          </div>
        </>
      )}

      {/* ─── Existing consultation reports ─── */}
      {allConsultations.length > 0 && (
        <>
          <div className='fp-cons-section-head'>
            <span>Comptes-rendus</span>
            <span className='cnt'>{allConsultations.length}</span>
            <span className='spacer' />
            <div className='fp-list-toolbar-filters'>
              {(
                [
                  { key: 'all', label: 'Tous', count: allConsultations.length },
                  { key: 'draft', label: 'Brouillons', count: draftCount },
                  { key: 'final', label: 'Finalisés', count: finalCount },
                ] as const
              ).map(({ key, label, count }) => (
                <button
                  key={key}
                  type='button'
                  onClick={() => setStatusFilter(key)}
                  className={statusFilter === key ? 'is-active' : ''}
                >
                  {label} · {count}
                </button>
              ))}
            </div>
          </div>

          {consultations.length === 0 ? (
            <div className='fp-cr-empty'>
              {statusFilter === 'draft'
                ? 'Aucun brouillon en cours.'
                : 'Aucun compte-rendu finalisé.'}
            </div>
          ) : (
            <div className='fp-cons-timeline'>
              {consultations.map((consultation, index) => (
                <ConsultationTimelineCard
                  key={consultation.id}
                  consultation={consultation}
                  index={index}
                  onEdit={() => onEdit(consultation)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
