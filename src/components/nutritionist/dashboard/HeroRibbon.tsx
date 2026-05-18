'use client';

import React, { useMemo } from 'react';
import { useLocale } from 'next-intl';
import type { NutritionistAppointment } from '@/hooks/useNutritionistAppointments';

interface HeroRibbonProps {
  firstName: string;
  todayAppointments: NutritionistAppointment[];
}

export function HeroRibbon({ firstName, todayAppointments }: HeroRibbonProps) {
  const locale = useLocale();

  const { count, line, currentApt, nextApt } = useMemo(() => {
    const now = Date.now();
    const sorted = [...todayAppointments].sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );

    let current: NutritionistAppointment | null = null;
    let next: NutritionistAppointment | null = null;

    for (const apt of sorted) {
      const start = new Date(apt.scheduled_at).getTime();
      const end = new Date(apt.scheduled_end_at).getTime();
      if (start <= now && now < end) {
        current = apt;
      } else if (start > now && !next) {
        next = apt;
      }
    }

    // Build line with up to 3 first-time names
    const firstTimers = sorted
      .filter(a => isFirstName(a))
      .slice(0, 3)
      .map(a => a.patient.first_name);

    const firstTimerCount = sorted.filter(a => isFirstName(a)).length;

    let line: React.ReactNode;
    if (sorted.length === 0) {
      line =
        locale === 'en' ? (
          <>
            Open day, no consultations on the agenda. <em>Time to breathe.</em>
          </>
        ) : (
          <>
            Journée libre, aucune consultation à l'agenda.{' '}
            <em>Le temps de respirer.</em>
          </>
        );
    } else {
      const namesEl =
        firstTimers.length > 0 ? (
          <>
            <b>{firstTimers.join(', ')}</b>
            {firstTimerCount > firstTimers.length
              ? locale === 'en'
                ? ` + ${firstTimerCount - firstTimers.length} more`
                : ` + ${firstTimerCount - firstTimers.length} autre(s)`
              : ''}
          </>
        ) : null;

      if (locale === 'en') {
        line = (
          <>
            {firstTimers.length > 0 ? (
              <>First-time consults today — {namesEl}. </>
            ) : null}
            Stay on tempo, document on the fly.{' '}
            <em>Take it one step at a time.</em>
          </>
        );
      } else {
        line = (
          <>
            {firstTimers.length > 0 ? (
              <>Premières consultations aujourd'hui — {namesEl}. </>
            ) : null}
            On garde le rythme et on documente au fil de l'eau.{' '}
            <em>Pas de précipitation.</em>
          </>
        );
      }
    }

    return {
      count: sorted.length,
      line,
      currentApt: current,
      nextApt: next,
    };
  }, [todayAppointments, locale]);

  const countLabel =
    locale === 'en'
      ? count === 0
        ? 'no appointments'
        : count === 1
          ? '1 appointment'
          : `${count} appointments`
      : count === 0
        ? 'aucun rendez-vous'
        : count === 1
          ? '1 rendez-vous'
          : `${count} rendez-vous`;

  const greetingPrefix = locale === 'en' ? 'Hi' : 'Bonjour';
  const middle = locale === 'en' ? 'today' : 'on a';

  return (
    <section className='dp-ribbon'>
      <div>
        <h1 className='dp-ribbon-greet'>
          {greetingPrefix} {firstName}, <em>{middle}</em>{' '}
          <span className='hl'>{countLabel}</span>.
        </h1>
        <p className='dp-ribbon-line'>{line}</p>
      </div>

      {(currentApt || nextApt) && (
        <div className='dp-ribbon-pulse'>
          {currentApt && (
            <div className='dp-pulse is-now'>
              <b>
                {currentApt.patient.first_name}{' '}
                <em>· {formatTime(currentApt.scheduled_at)}</em>
              </b>
              <span>
                {locale === 'en' ? 'Live · ' : 'En direct · '}
                {modeLabel(currentApt.mode, locale)}
              </span>
            </div>
          )}
          {nextApt && !currentApt && (
            <div className='dp-pulse is-now'>
              <b>{formatTime(nextApt.scheduled_at)}</b>
              <span>
                {locale === 'en' ? 'Next · ' : 'Suivant · '}
                {nextApt.patient.first_name}
              </span>
            </div>
          )}
          {nextApt && currentApt && (
            <div className='dp-pulse'>
              <b>{formatTime(nextApt.scheduled_at)}</b>
              <span>
                {locale === 'en' ? 'Next · ' : 'Suivant · '}
                {nextApt.patient.first_name}
              </span>
            </div>
          )}
        </div>
      )}

      <span className='dp-ribbon-sticker'>
        {locale === 'en' ? 'HERE WE GO…' : 'ON Y EST…'}
      </span>
    </section>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function modeLabel(mode: string, locale: string): string {
  const m = mode?.toLowerCase();
  if (m === 'visio' || m === 'video') return 'Visio';
  if (m === 'cabinet' || m === 'office')
    return locale === 'en' ? 'In-office' : 'Cabinet';
  if (m === 'phone' || m === 'telephone')
    return locale === 'en' ? 'Phone' : 'Téléphone';
  return mode || '';
}

function isFirstName(apt: NutritionistAppointment): boolean {
  // Heuristic: first consultation if code suggests bilan/intake
  const code = apt.consultation_type_code?.toLowerCase() || '';
  return (
    code.includes('bilan') || code.includes('first') || code.includes('initial')
  );
}

export default HeroRibbon;
