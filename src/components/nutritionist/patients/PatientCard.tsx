'use client';

import React from 'react';
import type { PatientListItem } from '@/hooks/useNutritionistPatients';
import { formatConsultationReason } from '@/lib/utils';
import {
  deriveChip,
  deriveTrend,
  deriveSparklineHeights,
  deriveAlert,
  formatPatientDate,
  formatAppointmentLabel,
  getInitials,
  type DerivedChipKind,
} from './patient-display';

interface PatientCardProps {
  patient: PatientListItem;
  onNavigate: (id: string) => void;
  onSendMessage: (patient: PatientListItem) => void;
}

const chipVariant: Record<DerivedChipKind, string> = {
  nouveau: 'is-new',
  actif: 'is-active',
  paused: 'is-paused',
  relance: 'is-warn',
  plateau: 'is-warn',
  done: 'is-done',
};

const statusDotVariant: Record<DerivedChipKind, string> = {
  nouveau: 'is-new',
  actif: 'is-active',
  paused: 'is-paused',
  relance: 'is-warn',
  plateau: 'is-warn',
  done: 'is-active',
};

const alertToneClass: Record<'warn' | 'good' | 'info', string> = {
  warn: '',
  good: 'is-good',
  info: 'is-info',
};

const trendArrow: Record<'up' | 'down' | 'flat', string> = {
  up: '▲',
  down: '▼',
  flat: '—',
};

export function PatientCard({
  patient,
  onNavigate,
  onSendMessage,
}: PatientCardProps) {
  const chip = deriveChip(patient);
  const trend = deriveTrend(patient);
  const heights = deriveSparklineHeights(patient);
  const alert = deriveAlert(patient, chip);
  const hasWeight =
    patient.initial_weight != null && patient.current_weight != null;
  const objective = patient.consultation_reason
    ? formatConsultationReason(patient.consultation_reason)
    : patient.health_goals?.[0] || 'Suivi général';
  const initials = getInitials(patient.first_name, patient.last_name);

  const lastLabel = patient.last_appointment_at
    ? formatPatientDate(patient.last_appointment_at)
    : null;
  const nextLabel = formatAppointmentLabel(patient.next_appointment_at);

  return (
    <article
      className='pt-card'
      onClick={() => onNavigate(patient.id)}
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(patient.id);
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className='pt-card-head'>
        <span
          className='pt-avatar'
          style={
            patient.avatar_url
              ? { backgroundImage: `url(${patient.avatar_url})` }
              : undefined
          }
        >
          {!patient.avatar_url && initials}
          <span
            className={`pt-avatar-status ${statusDotVariant[chip.kind]}`}
            aria-hidden
          />
        </span>
        <div className='pt-card-id'>
          <div className='pt-card-name'>
            {patient.first_name} {patient.last_name}
          </div>
          <div className='pt-card-objective'>{objective}</div>
        </div>
        <span className={`pt-chip ${chipVariant[chip.kind]}`}>
          {chip.label}
        </span>
      </div>

      <div className='pt-card-trend'>
        <div className='pt-trend-info'>
          <span className='pt-trend-label'>
            {hasWeight ? 'Poids · suivi' : 'Suivi'}
          </span>
          <span className='pt-trend-value'>
            {trend.value}
            {trend.delta && (
              <em className={`is-${trend.direction}`}>
                {trendArrow[trend.direction]} {trend.delta}
              </em>
            )}
          </span>
        </div>
        <div
          className={`pt-sparkline ${hasWeight ? '' : 'is-empty'}`}
          aria-hidden
        >
          {heights.map((h, i) => (
            <span
              key={i}
              className={hasWeight && i === heights.length - 1 ? 'is-now' : ''}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <div className='pt-card-meta'>
        <div>
          <span className='pt-meta-k'>Dernière</span>
          <span className={`pt-meta-v ${!lastLabel ? 'is-muted' : ''}`}>
            {lastLabel || 'jamais'}
          </span>
        </div>
        <div>
          <span className='pt-meta-k'>Prochain RDV</span>
          <span className={`pt-meta-v ${!nextLabel ? 'is-muted' : ''}`}>
            {nextLabel || 'à programmer'}
          </span>
        </div>
      </div>

      {alert && (
        <div className={`pt-card-alert ${alertToneClass[alert.tone]}`}>
          {alert.text}
        </div>
      )}

      <div className='pt-card-actions'>
        <button
          type='button'
          className='pt-btn-ghost'
          onClick={e => {
            e.stopPropagation();
            onSendMessage(patient);
          }}
        >
          Message
        </button>
        <button
          type='button'
          className='pt-btn-dark'
          onClick={e => {
            e.stopPropagation();
            onNavigate(patient.id);
          }}
        >
          Ouvrir le dossier →
        </button>
      </div>
    </article>
  );
}
