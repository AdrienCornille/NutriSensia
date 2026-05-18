'use client';

import React from 'react';
import { Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useConsultationPreparation } from '@/hooks/useNutritionistConsultations';
import type {
  ConsultationDetail,
  PatientObjectiveDetail,
} from '@/types/nutritionist-dossier';
import { PrivateNotesBlock } from './PrivateNotesBlock';

interface ConsultationPreparationProps {
  patientId: string;
  onStartReport: () => void;
}

const CHANGE_TYPE_LABEL: Record<string, string> = {
  health: 'Santé',
  medication: 'Médicament',
  allergy: 'Allergie',
  lifestyle: 'Mode de vie',
  other: 'Autre',
};

function formatDateFR(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function objectiveRowClass(status: string): string {
  if (status === 'needs_attention') return 'is-warn';
  if (status === 'completed' || status === 'on_track') return 'is-done';
  return '';
}

export function ConsultationPreparation({
  patientId,
  onStartReport,
}: ConsultationPreparationProps) {
  const { data, isLoading, error } = useConsultationPreparation(patientId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2
          className='w-6 h-6 animate-spin'
          style={{ color: 'var(--ns-peps-deep)' }}
        />
        <span className='ml-2 text-sm' style={{ color: 'var(--ns-ink-3)' }}>
          Chargement de la préparation…
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className='fp-card text-center' style={{ padding: '48px 32px' }}>
        <p className='text-sm' style={{ color: 'var(--ns-ink-3)' }}>
          Impossible de charger les données de préparation.
        </p>
      </div>
    );
  }

  const { lastConsultation, objectives, changeReports } = data as {
    lastConsultation: ConsultationDetail | null;
    objectives: PatientObjectiveDetail[];
    changeReports: {
      id: string;
      change_type: string;
      title: string;
      description: string;
    }[];
  };

  const activeObjectives = objectives.filter(
    o => o.status !== 'completed' && o.status !== 'abandoned'
  );
  const pendingReports = changeReports || [];
  const avgProgress =
    activeObjectives.length > 0
      ? Math.round(
          activeObjectives.reduce((sum, o) => sum + o.progress, 0) /
            activeObjectives.length
        )
      : 0;

  return (
    <div className='space-y-4'>
      {/* ─── Critical alerts ─── */}
      {pendingReports.length > 0 && (
        <div className='fp-prep-block is-alert'>
          <div className='fp-prep-block-title'>
            <AlertTriangle className='w-4 h-4' />
            <span>
              <em>{pendingReports.length} signalement</em>
              {pendingReports.length > 1 ? 's' : ''} à aborder
            </span>
          </div>
          <div className='space-y-2'>
            {pendingReports.map(report => (
              <div
                key={report.id}
                className='fp-flag'
                style={{
                  borderColor: 'var(--ns-coral)',
                  background: 'rgba(255, 255, 255, 0.55)',
                  padding: '10px 14px',
                }}
              >
                <div>
                  <div className='fp-flag-head'>
                    <span
                      className='fp-flag-icon'
                      style={{
                        background: 'var(--ns-coral-soft)',
                        borderColor: 'var(--ns-coral)',
                      }}
                      aria-hidden='true'
                    >
                      ⚠
                    </span>
                    <div>
                      <div className='fp-flag-title'>{report.title}</div>
                      <div className='fp-flag-cat'>
                        {CHANGE_TYPE_LABEL[report.change_type] || 'Autre'}
                        {report.description && ` · ${report.description}`}
                      </div>
                    </div>
                  </div>
                </div>
                <span
                  className='fp-flag-status'
                  style={{
                    background: 'var(--ns-coral)',
                    color: 'var(--ns-cream-50)',
                    borderColor: 'var(--ns-coral)',
                  }}
                >
                  À traiter
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── KPI mini ─── */}
      <div className='fp-prep-kpis'>
        <div className='fp-prep-kpi'>
          <span className='lbl'>Consultations</span>
          <span className='val'>{lastConsultation ? '1+' : '0'}</span>
          <span className='sub'>au total</span>
        </div>
        <div className='fp-prep-kpi'>
          <span className='lbl'>Objectifs actifs</span>
          <span className='val'>{activeObjectives.length}</span>
          <span className='sub'>en cours</span>
        </div>
        <div
          className={`fp-prep-kpi ${pendingReports.length > 0 ? 'is-warn' : ''}`}
        >
          <span className='lbl'>Signalements</span>
          <span className='val'>{pendingReports.length}</span>
          <span className='sub'>à traiter</span>
        </div>
        <div className='fp-prep-kpi'>
          <span className='lbl'>Progression moy.</span>
          <span className='val'>
            {avgProgress}
            <em>%</em>
          </span>
          <span className='sub'>des objectifs</span>
        </div>
      </div>

      {/* ─── Grid: last consultation + active objectives ─── */}
      <div className='fp-prep-grid'>
        <div className='fp-prep-block'>
          <div className='fp-prep-block-title'>
            Dernière <em>consultation</em>
          </div>
          {lastConsultation ? (
            <div className='space-y-3'>
              <div className='fp-cons-card-meta' style={{ marginBottom: 6 }}>
                <span>
                  <b>{formatDateFR(lastConsultation.date)}</b>
                </span>
                {lastConsultation.duration_minutes && (
                  <>
                    <span className='dot' />
                    <span>{lastConsultation.duration_minutes} min</span>
                  </>
                )}
              </div>
              {lastConsultation.summary && (
                <p className='fp-cons-summary' style={{ marginTop: 0 }}>
                  {lastConsultation.summary}
                </p>
              )}
              {lastConsultation.next_steps && (
                <div className='fp-cons-next'>
                  <b>Prochaines étapes définies</b>
                  <p>{lastConsultation.next_steps}</p>
                </div>
              )}
              {lastConsultation.private_notes && (
                <PrivateNotesBlock label='Note interne'>
                  {lastConsultation.private_notes}
                </PrivateNotesBlock>
              )}
            </div>
          ) : (
            <p
              style={{
                fontFamily: 'var(--ns-font-serif)',
                fontStyle: 'italic',
                fontSize: 14,
                color: 'var(--ns-ink-3)',
                margin: 0,
              }}
            >
              Aucune consultation précédente.
            </p>
          )}
        </div>

        <div className='fp-prep-block'>
          <div className='fp-prep-block-title'>
            Objectifs <em>en cours</em>
          </div>
          {activeObjectives.length > 0 ? (
            <div className='fp-prep-obj'>
              {activeObjectives.map(obj => (
                <div
                  key={obj.id}
                  className={`fp-prep-obj-row ${objectiveRowClass(obj.status)}`}
                >
                  <div className='fp-prep-obj-row-head'>
                    <span>{obj.title}</span>
                    <b>{obj.progress}%</b>
                  </div>
                  <div className='fp-prep-obj-bar'>
                    <span
                      style={{ width: `${Math.min(obj.progress, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: 'var(--ns-font-serif)',
                fontStyle: 'italic',
                fontSize: 14,
                color: 'var(--ns-ink-3)',
                margin: 0,
              }}
            >
              Aucun objectif actif.
            </p>
          )}
        </div>
      </div>

      {/* ─── CTA ─── */}
      <div className='text-center pt-2'>
        <button
          type='button'
          onClick={onStartReport}
          className='fp-btn fp-btn-peps'
        >
          Commencer le compte-rendu
          <ArrowRight className='w-3.5 h-3.5' />
        </button>
      </div>
    </div>
  );
}
