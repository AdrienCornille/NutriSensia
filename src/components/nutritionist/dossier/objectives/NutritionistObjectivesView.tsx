'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, AlertCircle, Target } from 'lucide-react';
import {
  usePatientObjectives,
  useUpdateObjective,
} from '@/hooks/useNutritionistDossier';
import { ObjectiveCreateModal } from './ObjectiveCreateModal';
import { ObjectiveCard } from './ObjectiveCard';

interface NutritionistObjectivesViewProps {
  patientId: string;
}

const FILTERS = ['all', 'active', 'paused', 'completed', 'cancelled'] as const;
const FILTER_LABELS: Record<(typeof FILTERS)[number], string> = {
  all: 'Tous',
  active: 'Actifs',
  paused: 'En pause',
  completed: 'Terminés',
  cancelled: 'Annulés',
};

export function NutritionistObjectivesView({
  patientId,
}: NutritionistObjectivesViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<(typeof FILTERS)[number]>('all');

  const {
    data: objectives,
    isLoading,
    error,
  } = usePatientObjectives(patientId);
  const updateObjective = useUpdateObjective(patientId);

  const allObjectives = useMemo(() => objectives || [], [objectives]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allObjectives.length };
    for (const filter of FILTERS) {
      if (filter === 'all') continue;
      c[filter] = allObjectives.filter(o => o.status === filter).length;
    }
    return c;
  }, [allObjectives]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return allObjectives;
    return allObjectives.filter(o => o.status === statusFilter);
  }, [allObjectives, statusFilter]);

  const avgProgress = useMemo(() => {
    const active = allObjectives.filter(o => o.status === 'active');
    if (active.length === 0) return 0;
    return Math.round(
      active.reduce((sum, o) => sum + o.progress, 0) / active.length
    );
  }, [allObjectives]);

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
      <div className='fp-card text-center'>
        <AlertCircle
          className='w-8 h-8 mx-auto mb-3'
          style={{ color: 'var(--ns-coral)' }}
        />
        <p
          className='font-serif text-lg mb-1'
          style={{ color: 'var(--ns-ink)' }}
        >
          Erreur de chargement
        </p>
        <p className='text-sm' style={{ color: 'var(--ns-ink-3)' }}>
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* ─── Pane intro ─── */}
      <section className='fp-pane-intro'>
        <div>
          <h2 className='fp-pane-intro-title'>
            Objectifs <em>SMART</em>
          </h2>
          <div className='fp-pane-intro-meta'>
            <span>
              <b>{counts.active}</b> actif{counts.active > 1 ? 's' : ''}
            </span>
            {counts.completed > 0 && (
              <>
                <span className='dot' />
                <span>
                  <b>{counts.completed}</b> terminé
                  {counts.completed > 1 ? 's' : ''}
                </span>
              </>
            )}
            {counts.paused > 0 && (
              <>
                <span className='dot' />
                <span>
                  <b>{counts.paused}</b> en pause
                </span>
              </>
            )}
            <span className='dot' />
            <span>
              Progression moyenne · <b>{avgProgress}%</b>
            </span>
          </div>
        </div>
        <div className='fp-pane-intro-actions'>
          <button
            type='button'
            className='fp-btn fp-btn-peps'
            onClick={() => setShowCreateModal(true)}
          >
            + Nouvel objectif
          </button>
        </div>
      </section>

      {/* ─── Filters ─── */}
      {allObjectives.length > 0 && (
        <div className='fp-list-toolbar'>
          <div className='fp-list-toolbar-filters'>
            {FILTERS.map(f => (
              <button
                key={f}
                type='button'
                onClick={() => setStatusFilter(f)}
                className={statusFilter === f ? 'is-active' : ''}
              >
                {FILTER_LABELS[f]} · {counts[f]}
              </button>
            ))}
          </div>
          <span
            style={{
              fontFamily: 'var(--ns-font-serif)',
              fontStyle: 'italic',
              fontSize: 13,
              color: 'var(--ns-ink-3)',
            }}
          >
            Trié par priorité · 1 (haute) en premier
          </span>
        </div>
      )}

      {/* ─── List ─── */}
      {allObjectives.length === 0 ? (
        <div className='fp-card text-center' style={{ padding: '48px 32px' }}>
          <Target
            className='w-10 h-10 mx-auto mb-3'
            style={{ color: 'var(--ns-ink-4)' }}
          />
          <p
            className='font-serif text-lg mb-1'
            style={{ color: 'var(--ns-ink)' }}
          >
            Aucun objectif
          </p>
          <p className='text-sm' style={{ color: 'var(--ns-ink-3)' }}>
            Créez le premier objectif pour ce patient.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className='fp-cr-empty'>
          Aucun objectif {FILTER_LABELS[statusFilter].toLowerCase()}.
        </div>
      ) : (
        <div className='fp-obj-list'>
          {filtered.map(obj => (
            <ObjectiveCard
              key={obj.id}
              objective={obj}
              onUpdateStatus={(objectiveId, status) =>
                updateObjective.mutate({ objectiveId, status })
              }
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <ObjectiveCreateModal
          patientId={patientId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
