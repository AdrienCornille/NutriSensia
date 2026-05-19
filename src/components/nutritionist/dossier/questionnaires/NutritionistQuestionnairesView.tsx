'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Loader2, AlertCircle, FileText } from 'lucide-react';
import {
  usePatientQuestionnaires,
  useDeleteQuestionnaire,
} from '@/hooks/useNutritionistDossier';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { QuestionnaireCreateModal } from './QuestionnaireCreateModal';
import { QuestionnaireCard } from './QuestionnaireCard';
import type { QuestionnaireDetail } from '@/types/nutritionist-dossier';

interface NutritionistQuestionnairesViewProps {
  patientId: string;
}

const FILTERS = ['all', 'pending', 'overdue', 'completed'] as const;
const FILTER_LABELS: Record<(typeof FILTERS)[number], string> = {
  all: 'Tous',
  pending: 'En attente',
  overdue: 'En retard',
  completed: 'Complétés',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function NutritionistQuestionnairesView({
  patientId,
}: NutritionistQuestionnairesViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [pendingDelete, setPendingDelete] = useState<Pick<
    QuestionnaireDetail,
    'id' | 'title'
  > | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message?: string;
  }>({ visible: false, type: 'success', title: '' });

  const hideToast = useCallback(
    () => setToast(t => ({ ...t, visible: false })),
    []
  );
  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      setToast({ visible: true, type, title, message });
    },
    []
  );

  const {
    data: questionnaires,
    isLoading,
    error,
  } = usePatientQuestionnaires(patientId);
  const deleteQuestionnaire = useDeleteQuestionnaire(patientId);

  const allQuestionnaires = useMemo(
    () => questionnaires || [],
    [questionnaires]
  );
  const now = Date.now();

  const counts = useMemo(() => {
    const completed = allQuestionnaires.filter(
      q => q.status === 'completed'
    ).length;
    const overdue = allQuestionnaires.filter(
      q =>
        q.status === 'pending' &&
        q.due_date &&
        new Date(q.due_date).getTime() < now
    ).length;
    const pending = allQuestionnaires.filter(
      q => q.status === 'pending'
    ).length;
    return {
      all: allQuestionnaires.length,
      pending,
      overdue,
      completed,
    };
  }, [allQuestionnaires, now]);

  const filtered = useMemo(() => {
    if (filter === 'all') return allQuestionnaires;
    if (filter === 'completed') {
      return allQuestionnaires.filter(q => q.status === 'completed');
    }
    if (filter === 'overdue') {
      return allQuestionnaires.filter(
        q =>
          q.status === 'pending' &&
          q.due_date &&
          new Date(q.due_date).getTime() < now
      );
    }
    // 'pending'
    return allQuestionnaires.filter(q => q.status === 'pending');
  }, [allQuestionnaires, filter, now]);

  const lastSent = allQuestionnaires.reduce<string | null>((acc, q) => {
    if (!acc) return q.created_at;
    return q.created_at > acc ? q.created_at : acc;
  }, null);

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
            Questionnaires <em>de suivi</em>
          </h2>
          <div className='fp-pane-intro-meta'>
            <span>
              <b>{counts.all}</b> total
            </span>
            {counts.pending > 0 && (
              <>
                <span className='dot' />
                <span>
                  <b>{counts.pending}</b> en attente
                </span>
              </>
            )}
            {counts.overdue > 0 && (
              <>
                <span className='dot' />
                <span style={{ color: 'var(--ns-coral)' }}>
                  <b style={{ color: 'var(--ns-coral)' }}>
                    {counts.overdue} en retard
                  </b>
                </span>
              </>
            )}
            <span className='dot' />
            <span>
              <b>{counts.completed}</b> complété
              {counts.completed > 1 ? 's' : ''}
            </span>
            {lastSent && (
              <>
                <span className='dot' />
                <span>
                  Dernier envoi · <b>{formatDate(lastSent)}</b>
                </span>
              </>
            )}
          </div>
        </div>
        <div className='fp-pane-intro-actions'>
          <button
            type='button'
            className='fp-btn fp-btn-peps'
            onClick={() => setShowCreateModal(true)}
          >
            + Nouveau questionnaire
          </button>
        </div>
      </section>

      {/* ─── Filters ─── */}
      {allQuestionnaires.length > 0 && (
        <div className='fp-list-toolbar'>
          <div className='fp-list-toolbar-filters'>
            {FILTERS.map(f => (
              <button
                key={f}
                type='button'
                onClick={() => setFilter(f)}
                className={filter === f ? 'is-active' : ''}
              >
                {FILTER_LABELS[f]} · {counts[f]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── List ─── */}
      {allQuestionnaires.length === 0 ? (
        <div className='fp-card text-center' style={{ padding: '48px 32px' }}>
          <FileText
            className='w-10 h-10 mx-auto mb-3'
            style={{ color: 'var(--ns-ink-4)' }}
          />
          <p
            className='font-serif text-lg mb-1'
            style={{ color: 'var(--ns-ink)' }}
          >
            Aucun questionnaire
          </p>
          <p className='text-sm' style={{ color: 'var(--ns-ink-3)' }}>
            Envoyez un questionnaire de suivi au patient.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className='fp-cr-empty'>
          Aucun questionnaire {FILTER_LABELS[filter].toLowerCase()}.
        </div>
      ) : (
        <div className='fp-q-list'>
          {filtered.map(q => (
            <QuestionnaireCard
              key={q.id}
              questionnaire={q}
              onDelete={id => setPendingDelete({ id, title: q.title })}
              isDeleting={
                deleteQuestionnaire.isPending &&
                (deleteQuestionnaire.variables as string | undefined) === q.id
              }
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <QuestionnaireCreateModal
          patientId={patientId}
          onClose={() => setShowCreateModal(false)}
          onSent={title =>
            showToast(
              'success',
              'Questionnaire envoyé',
              `« ${title} » a bien été transmis au patient.`
            )
          }
          onError={msg => showToast('error', 'Échec de l’envoi', msg)}
        />
      )}

      <ConfirmModal
        isOpen={pendingDelete !== null}
        tone='danger'
        title='Supprimer ce questionnaire ?'
        message={
          pendingDelete ? (
            <>
              « <b style={{ color: 'var(--ns-ink)' }}>{pendingDelete.title}</b>{' '}
              » sera retiré du dossier du patient. Cette action est définitive.
            </>
          ) : undefined
        }
        confirmLabel='Supprimer'
        cancelLabel='Annuler'
        isLoading={deleteQuestionnaire.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const { id, title } = pendingDelete;
          try {
            await deleteQuestionnaire.mutateAsync(id);
            setPendingDelete(null);
            showToast(
              'success',
              'Questionnaire supprimé',
              `« ${title} » a été retiré du dossier.`
            );
          } catch (err) {
            const msg =
              err instanceof Error
                ? err.message
                : 'Une erreur est survenue lors de la suppression';
            showToast('error', 'Échec de la suppression', msg);
          }
        }}
      />

      <Toast
        isVisible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
}
