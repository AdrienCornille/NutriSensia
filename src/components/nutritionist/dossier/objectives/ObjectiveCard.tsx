'use client';

import React from 'react';
import { CheckCircle, Pause, Play, X } from 'lucide-react';
import type { PatientObjectiveDetail } from '@/types/nutritionist-dossier';
import { ObjectiveSparkline } from './ObjectiveSparkline';

interface ObjectiveCardProps {
  objective: PatientObjectiveDetail;
  onUpdateStatus: (
    objectiveId: string,
    status: 'active' | 'paused' | 'completed' | 'cancelled'
  ) => void;
}

const STATUS_CLASS: Record<string, string> = {
  active: '',
  paused: 'is-paused',
  completed: 'is-done',
  cancelled: 'is-paused',
};

const STATUS_PILL_CLASS: Record<string, string> = {
  active: 'is-active',
  paused: 'is-paused',
  completed: 'is-done',
  cancelled: 'is-paused',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Actif',
  paused: 'En pause',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function priorityLabel(priority: number): string {
  if (priority <= 1) return 'priorité haute';
  if (priority === 2) return 'priorité élevée';
  if (priority === 3) return 'priorité moyenne';
  if (priority === 4) return 'priorité basse';
  return 'priorité très basse';
}

export function ObjectiveCard({
  objective,
  onUpdateStatus,
}: ObjectiveCardProps) {
  const cardClass = `fp-obj-card ${STATUS_CLASS[objective.status] ?? ''}`;
  const pillClass = STATUS_PILL_CLASS[objective.status] ?? 'is-active';
  const isActive = objective.status === 'active';
  const isPaused = objective.status === 'paused';
  const isDone = objective.status === 'completed';

  return (
    <article className={cardClass}>
      <div className='fp-obj-body'>
        <span className='fp-obj-cat'>
          {objective.category} · {priorityLabel(objective.priority)}
        </span>
        <h3 className='fp-obj-title'>
          {objective.title}
          {objective.target_value && (
            <>
              {' '}
              <em>
                — {objective.target_value}
                {objective.target_unit ? ` ${objective.target_unit}` : ''}
              </em>
            </>
          )}
        </h3>
        {objective.description && (
          <p
            style={{
              fontFamily: 'var(--ns-font-serif)',
              fontStyle: 'italic',
              fontSize: 13,
              color: 'var(--ns-ink-3)',
              lineHeight: 1.45,
              margin: '4px 0 6px',
            }}
          >
            {objective.description}
          </p>
        )}
        <div className='fp-obj-meta'>
          <span>
            Début · <b>{formatDate(objective.start_date)}</b>
          </span>
          {objective.deadline && (
            <>
              <span className='dot' />
              <span>
                Échéance · <b>{formatDate(objective.deadline)}</b>
              </span>
            </>
          )}
          {objective.current_value && (
            <>
              <span className='dot' />
              <span>
                Actuel · <b>{objective.current_value}</b>
              </span>
            </>
          )}
        </div>
      </div>

      <div className='fp-obj-evo'>
        <div className='fp-obj-evo-head'>
          <b>
            {objective.progress}
            <em>%</em>
          </b>
          {objective.progress_logs && objective.progress_logs.length > 1 && (
            <span className='delta'>
              {objective.progress_logs.length} relevé
              {objective.progress_logs.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <ObjectiveSparkline
          logs={objective.progress_logs}
          currentProgress={objective.progress}
        />
        <div className='fp-obj-progress'>
          <span>Progression</span>
          <div className='fp-obj-progress-bar'>
            <span style={{ width: `${Math.min(objective.progress, 100)}%` }} />
          </div>
          <b>{objective.progress}%</b>
        </div>
      </div>

      <div className='fp-obj-actions'>
        <span className={`fp-obj-status ${pillClass}`}>
          {STATUS_LABEL[objective.status] ?? objective.status}
        </span>
        {isActive && (
          <>
            <button
              type='button'
              className='fp-obj-icon-btn'
              onClick={() => onUpdateStatus(objective.id, 'completed')}
              aria-label='Marquer comme terminé'
              title='Marquer comme terminé'
            >
              <CheckCircle
                className='w-3.5 h-3.5'
                style={{ color: 'var(--ns-sage-600)' }}
              />
            </button>
            <button
              type='button'
              className='fp-obj-icon-btn'
              onClick={() => onUpdateStatus(objective.id, 'paused')}
              aria-label='Mettre en pause'
              title='Mettre en pause'
            >
              <Pause className='w-3.5 h-3.5' />
            </button>
          </>
        )}
        {isPaused && (
          <button
            type='button'
            className='fp-obj-icon-btn'
            onClick={() => onUpdateStatus(objective.id, 'active')}
            aria-label='Réactiver'
            title='Réactiver'
          >
            <Play
              className='w-3.5 h-3.5'
              style={{ color: 'var(--ns-sage-600)' }}
            />
          </button>
        )}
        {!isDone && objective.status !== 'cancelled' && (
          <button
            type='button'
            className='fp-obj-icon-btn'
            onClick={() => onUpdateStatus(objective.id, 'cancelled')}
            aria-label='Annuler'
            title='Annuler'
          >
            <X className='w-3.5 h-3.5' style={{ color: 'var(--ns-coral)' }} />
          </button>
        )}
      </div>
    </article>
  );
}
