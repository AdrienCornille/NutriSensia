'use client';

import React from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';
import type { PatientListItem } from '@/hooks/useNutritionistPatients';
import { formatConsultationReason } from '@/lib/utils';
import {
  deriveChip,
  deriveTrend,
  formatPatientDate,
  formatAppointmentLabel,
  getInitials,
  type DerivedChipKind,
} from './patient-display';

interface PatientListRowProps {
  patient: PatientListItem;
  onClick: (patient: PatientListItem) => void;
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

const trendArrow: Record<'up' | 'down' | 'flat', string> = {
  up: '▲',
  down: '▼',
  flat: '—',
};

export function PatientListRow({
  patient,
  onClick,
  onSendMessage,
}: PatientListRowProps) {
  const chip = deriveChip(patient);
  const trend = deriveTrend(patient);
  const objective = patient.consultation_reason
    ? formatConsultationReason(patient.consultation_reason)
    : patient.health_goals?.[0] || '—';
  const last = formatPatientDate(patient.last_appointment_at);
  const next = formatAppointmentLabel(patient.next_appointment_at);
  const initials = getInitials(patient.first_name, patient.last_name);

  return (
    <div
      className='pt-list-row'
      onClick={() => onClick(patient)}
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter') onClick(patient);
      }}
    >
      <div className='pt-list-cell-pat'>
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
        <div>
          <b>
            {patient.first_name} {patient.last_name}
          </b>
          <span>{patient.email}</span>
        </div>
      </div>

      <div className='pt-list-objective'>{objective}</div>

      <div>
        <span className={`pt-chip ${chipVariant[chip.kind]}`}>
          {chip.label}
        </span>
      </div>

      <div className='pt-list-trend'>
        {trend.value}
        {trend.delta && (
          <em className={`is-${trend.direction}`}>
            {trendArrow[trend.direction]} {trend.delta}
          </em>
        )}
      </div>

      <div
        className={`pt-list-cell-last pt-hide-md ${!last ? 'is-muted' : ''}`}
      >
        {last || 'jamais'}
      </div>

      <div className='pt-list-cell-cons'>{patient.appointments_count}</div>

      <div className={`pt-list-cell-next ${!next ? 'is-muted' : ''}`}>
        {next || 'à programmer'}
      </div>

      <div className='pt-list-actions'>
        <button
          type='button'
          className='pt-iconbtn-sm'
          aria-label='Envoyer un message'
          onClick={e => {
            e.stopPropagation();
            onSendMessage(patient);
          }}
        >
          <MessageSquare size={14} />
        </button>
        <button
          type='button'
          className='pt-iconbtn-sm'
          aria-label='Ouvrir le dossier'
          onClick={e => {
            e.stopPropagation();
            onClick(patient);
          }}
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
