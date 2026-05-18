'use client';

import React from 'react';
import type { PatientListStats } from '@/hooks/useNutritionistPatients';

interface PatientsRibbonProps {
  stats: PatientListStats;
  watchCount: number;
  newThisMonth: number;
}

export function PatientsRibbon({
  stats,
  watchCount,
  newThisMonth,
}: PatientsRibbonProps) {
  const activeLabel = stats.active === 1 ? 'patient·e' : 'patient·e·s';

  return (
    <section className='pt-ribbon'>
      <div>
        <h1>
          {stats.active > 0 ? stats.active : 'Aucun'} {activeLabel}{' '}
          <em>en cours</em>
          {watchCount > 0 ? (
            <>
              , <span className='hl'>{formatWatchPhrase(watchCount)}</span>.
            </>
          ) : (
            <>
              , <em>tout est calme</em>.
            </>
          )}
        </h1>
        <RibbonSubline newThisMonth={newThisMonth} pending={stats.pending} />
      </div>
      <div className='pt-ribbon-meta'>
        <div className='pt-meta-cell'>
          <b>
            {stats.pending} <em>nv.</em>
          </b>
          <span>En attente</span>
        </div>
        <div className={`pt-meta-cell ${watchCount > 0 ? 'is-alert' : ''}`}>
          <b>{watchCount}</b>
          <span>À surveiller</span>
        </div>
      </div>
      <span className='pt-ribbon-sticker'>SUIVI ✦</span>
    </section>
  );
}

function formatWatchPhrase(n: number): string {
  return n === 1 ? '1 à surveiller' : `${n} à surveiller`;
}

function RibbonSubline({
  newThisMonth,
  pending,
}: {
  newThisMonth: number;
  pending: number;
}) {
  if (newThisMonth === 0 && pending === 0) {
    return (
      <p>
        Liste à jour — <em>pas de nouvelle assignation cette semaine</em>.
      </p>
    );
  }
  return (
    <p>
      {newThisMonth > 0 && (
        <>
          <b>{newThisMonth}</b> nouvelle{newThisMonth > 1 ? 's' : ''} arrivée
          {newThisMonth > 1 ? 's' : ''} ce mois-ci
        </>
      )}
      {newThisMonth > 0 && pending > 0 && ' · '}
      {pending > 0 && (
        <>
          <b>{pending}</b> dossier{pending > 1 ? 's' : ''} en attente
          d&apos;assignation
        </>
      )}
      .
    </p>
  );
}
