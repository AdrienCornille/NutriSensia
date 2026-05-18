'use client';

import React from 'react';
import { Clock, Lock } from 'lucide-react';

interface EditWindowIndicatorProps {
  /** ISO date of consultation creation */
  createdAt: string;
  /** Whether this consultation is a draft (always editable, no 48h limit) */
  isDraft?: boolean;
  /** Edit window in hours (defaults to 48) */
  windowHours?: number;
}

const HOUR_MS = 60 * 60 * 1000;

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Banner shown under finalized consultation cards (and at the bottom of the
 * ConsultationForm) to make the 48h edit window explicit — the v2 UI hid this
 * constraint entirely.
 */
export function EditWindowIndicator({
  createdAt,
  isDraft = false,
  windowHours = 48,
}: EditWindowIndicatorProps) {
  if (isDraft) {
    return (
      <div className='fp-cons-card-edit-window'>
        <Clock className='w-3 h-3' />
        <span>
          <b>Brouillon</b> — éditable jusqu&apos;à finalisation. Une fois
          finalisé, fenêtre d&apos;édition de {windowHours}h.
        </span>
      </div>
    );
  }

  const created = new Date(createdAt);
  const expires = new Date(created.getTime() + windowHours * HOUR_MS);
  const now = Date.now();
  const isLocked = now >= expires.getTime();

  if (isLocked) {
    return (
      <div className='fp-cons-card-edit-window is-locked'>
        <Lock className='w-3 h-3' />
        <span>
          <b>Verrouillé</b> · fenêtre d&apos;édition de {windowHours}h expirée
          le {formatDateTime(expires)}.
        </span>
      </div>
    );
  }

  const hoursLeft = Math.max(
    1,
    Math.round((expires.getTime() - now) / HOUR_MS)
  );

  return (
    <div className='fp-cons-card-edit-window'>
      <Clock className='w-3 h-3' />
      <span>
        Modifiable encore <b>{hoursLeft}h</b> · expire le{' '}
        {formatDateTime(expires)}.
      </span>
    </div>
  );
}
