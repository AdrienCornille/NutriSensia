'use client';

import React from 'react';
import { Clock, Video, Building2, Phone, FileText } from 'lucide-react';
import type { AppointmentSummary } from '@/hooks/useNutritionistConsultations';

interface AppointmentCardProps {
  appointment: AppointmentSummary;
  variant: 'upcoming' | 'past-without-cr';
  onCreateReport?: () => void;
}

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

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateBox(iso: string): { day: string; month: string } {
  const d = new Date(iso);
  return {
    day: String(d.getDate()),
    month: d
      .toLocaleDateString('fr-FR', { month: 'short' })
      .replace('.', '')
      .toUpperCase(),
  };
}

function dayOfWeek(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long' });
}

export function AppointmentCard({
  appointment,
  variant,
  onCreateReport,
}: AppointmentCardProps) {
  const { day, month } = formatDateBox(appointment.scheduled_at);
  const typeName = appointment.consultation_type?.name_fr || 'Consultation';
  const modeClass = MODE_CLASS[appointment.mode] ?? '';
  const modeLabel = MODE_LABELS[appointment.mode] ?? appointment.mode;
  const variantClass = variant === 'upcoming' ? 'is-upcoming' : 'is-past-nocr';
  const dateBoxStyle =
    variant === 'past-without-cr'
      ? { background: 'var(--ns-honey)' }
      : undefined;

  return (
    <div className={`fp-appt ${variantClass}`}>
      <div className='fp-appt-date' style={dateBoxStyle}>
        <b>{day}</b>
        <span>{month}</span>
      </div>

      <div className='fp-appt-body'>
        <div className='fp-appt-title'>
          {typeName}
          <span className={`fp-mode-icon ${modeClass}`}>
            <ModeIcon mode={appointment.mode} />
            {modeLabel}
          </span>
        </div>
        <div className='fp-appt-meta'>
          <span style={{ textTransform: 'capitalize' }}>
            {dayOfWeek(appointment.scheduled_at)}
          </span>
          <span className='dot' />
          <span>
            <Clock className='inline w-3 h-3 mr-1' />
            <b>{formatTime(appointment.scheduled_at)}</b>
          </span>
          {appointment.duration && (
            <>
              <span className='dot' />
              <span>{appointment.duration} min</span>
            </>
          )}
        </div>
        {appointment.patient_message && (
          <div className='fp-appt-msg'>« {appointment.patient_message} »</div>
        )}
      </div>

      {variant === 'upcoming' ? (
        <span className='fp-vchip' style={{ background: 'var(--ns-cream-50)' }}>
          À venir
        </span>
      ) : (
        <button
          type='button'
          className='fp-btn fp-btn-peps'
          onClick={onCreateReport}
        >
          <FileText className='w-3 h-3' />
          Rédiger
        </button>
      )}
    </div>
  );
}
