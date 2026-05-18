'use client';

import React, { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { NutritionistAppointment } from '@/hooks/useNutritionistAppointments';

interface TodayTimelineProps {
  appointments: NutritionistAppointment[];
}

type ViewMode = 'day' | 'week';

export function TodayTimeline({ appointments }: TodayTimelineProps) {
  const locale = useLocale();
  const [view, setView] = useState<ViewMode>('day');

  const rows = useMemo(() => {
    const now = Date.now();
    return [...appointments]
      .sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime()
      )
      .map(apt => {
        const start = new Date(apt.scheduled_at).getTime();
        const end = new Date(apt.scheduled_end_at).getTime();
        let phase: 'done' | 'current' | 'upcoming' = 'upcoming';
        if (end < now) phase = 'done';
        else if (start <= now && now < end) phase = 'current';
        return { apt, phase };
      });
  }, [appointments]);

  const totalMinutes = useMemo(
    () => appointments.reduce((sum, a) => sum + (a.duration || 0), 0),
    [appointments]
  );

  const nextFreeSlot = useMemo(() => {
    // Find the first gap of at least 30 min after the last appointment today,
    // or default to "tomorrow 09:00" if the day is full.
    if (rows.length === 0) {
      return locale === 'en' ? 'now' : 'maintenant';
    }
    const last = rows[rows.length - 1];
    const lastEnd = new Date(last.apt.scheduled_end_at);
    const todayEnd = new Date(lastEnd);
    todayEnd.setHours(19, 0, 0, 0);
    if (lastEnd.getTime() < todayEnd.getTime()) {
      const label = lastEnd.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return locale === 'en' ? `today ${label}` : `aujourd'hui ${label}`;
    }
    return locale === 'en' ? 'tomorrow 09:00' : 'demain 09:00';
  }, [rows, locale]);

  return (
    <article className='dp-panel'>
      <header className='dp-panel-head'>
        <div>
          <span className='dp-eyebrow'>
            {locale === 'en' ? 'Today' : "Aujourd'hui"} · {appointments.length}{' '}
            {appointments.length <= 1
              ? locale === 'en'
                ? 'appointment'
                : 'rendez-vous'
              : locale === 'en'
                ? 'appointments'
                : 'rendez-vous'}
          </span>
          <h3>
            {locale === 'en' ? 'Your ' : 'Votre '}
            <em>{locale === 'en' ? 'day' : 'journée'}</em>
          </h3>
        </div>
        <div className='dp-panel-head-actions'>
          <div className='dp-tabs'>
            <button
              type='button'
              className={view === 'day' ? 'is-active' : ''}
              onClick={() => setView('day')}
            >
              {locale === 'en' ? 'Day' : 'Jour'}
            </button>
            <button
              type='button'
              className={view === 'week' ? 'is-active' : ''}
              onClick={() => setView('week')}
            >
              {locale === 'en' ? 'Week' : 'Semaine'}
            </button>
          </div>
          <Link
            href={'/dashboard/nutritionist/agenda' as any}
            className='dp-link'
          >
            {locale === 'en' ? 'Agenda →' : 'Agenda →'}
          </Link>
        </div>
      </header>

      <div className='dp-timeline'>
        {rows.length === 0 && (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: 'var(--ns-ink-3)',
              fontSize: 14,
            }}
          >
            {locale === 'en'
              ? 'No appointments today. Time to focus on follow-ups.'
              : "Aucun rendez-vous aujourd'hui. Une journée pour le suivi."}
          </div>
        )}

        {rows.map(({ apt, phase }) => (
          <TimelineRow key={apt.id} apt={apt} phase={phase} locale={locale} />
        ))}
      </div>

      {rows.length > 0 && (
        <div className='dp-timeline-foot'>
          <span>
            <b>{formatDuration(totalMinutes, locale)}</b>{' '}
            {locale === 'en'
              ? 'of cabinet time · next free slot'
              : 'de cabinet · prochaine plage libre'}{' '}
            <b style={{ marginLeft: 6 }}>{nextFreeSlot}</b>
          </span>
          <Link
            href={'/dashboard/nutritionist/agenda' as any}
            className='dp-link'
          >
            {locale === 'en'
              ? 'Open full agenda →'
              : "Ouvrir l'agenda complet →"}
          </Link>
        </div>
      )}
    </article>
  );
}

interface TimelineRowProps {
  apt: NutritionistAppointment;
  phase: 'done' | 'current' | 'upcoming';
  locale: string;
}

function TimelineRow({ apt, phase, locale }: TimelineRowProps) {
  const time = new Date(apt.scheduled_at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const initial = apt.patient.first_name.charAt(0).toUpperCase();
  const fullName = `${apt.patient.first_name} ${apt.patient.last_name}`;
  const typeLabel =
    (locale === 'en'
      ? apt.consultation_type?.name_en
      : apt.consultation_type?.name_fr) || apt.consultation_type_code;

  const phaseClass =
    phase === 'done' ? 'is-done' : phase === 'current' ? 'is-current' : '';
  const cardClass = phase === 'current' ? 'is-now' : '';

  const durationLabel = `${apt.duration} min`;
  const phaseHint =
    phase === 'done'
      ? locale === 'en'
        ? 'done'
        : 'fait'
      : phase === 'current'
        ? locale === 'en'
          ? 'live'
          : 'en cours'
        : '';

  return (
    <div className={`dp-timeline-row ${phaseClass}`}>
      <div className='dp-timeline-time'>
        {time}
        <span>
          {durationLabel}
          {phaseHint ? ` · ${phaseHint}` : ''}
        </span>
      </div>
      <div className={`dp-timeline-card ${cardClass}`}>
        <span
          className='dp-tc-avatar'
          aria-hidden='true'
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ns-ink)',
            fontWeight: 700,
            fontSize: 14,
            background: 'var(--ns-peps-soft)',
          }}
        >
          {initial}
        </span>
        <div className='dp-tc-body'>
          <div className='dp-tc-name'>
            {fullName}
            {phase === 'current' && (
              <span className='dp-chip is-now'>
                {locale === 'en' ? 'live' : 'en direct'}
              </span>
            )}
            {phase === 'done' && (
              <span className='dp-chip is-back'>
                ✓ {locale === 'en' ? 'done' : 'fait'}
              </span>
            )}
          </div>
          <div className='dp-tc-meta'>
            <span className='dp-tc-mode'>● {modeLabel(apt.mode, locale)}</span>
            <span>{typeLabel}</span>
          </div>
        </div>
        <div className='dp-tc-actions'>
          {phase === 'current' ? (
            <Link
              href={`/dashboard/nutritionist/patients/${apt.user_id}` as any}
              className='dp-tc-join'
            >
              {locale === 'en' ? 'Open notes →' : 'Notes ouvertes →'}
            </Link>
          ) : (
            <Link
              href={`/dashboard/nutritionist/patients/${apt.user_id}` as any}
              className='dp-chip'
            >
              {locale === 'en' ? 'Open →' : 'Ouvrir →'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function modeLabel(mode: string, locale: string): string {
  const m = mode?.toLowerCase();
  if (m === 'visio' || m === 'video') return 'Visio';
  if (m === 'cabinet' || m === 'office')
    return locale === 'en' ? 'In-office' : 'Cabinet';
  if (m === 'phone' || m === 'telephone')
    return locale === 'en' ? 'Phone' : 'Téléphone';
  return mode || '—';
}

function formatDuration(minutes: number, locale: string): string {
  if (minutes <= 0) return locale === 'en' ? '0min' : '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

export default TodayTimeline;
