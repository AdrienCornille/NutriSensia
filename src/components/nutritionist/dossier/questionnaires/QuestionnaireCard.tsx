'use client';

import React, { useState } from 'react';
import { Trash2, Loader2, Eye } from 'lucide-react';
import type { QuestionnaireDetail } from '@/types/nutritionist-dossier';
import { QuestionnaireAnswersModal } from './QuestionnaireAnswersModal';

interface QuestionnaireCardProps {
  questionnaire: QuestionnaireDetail;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

type DisplayStatus = 'pending' | 'overdue' | 'completed';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function computeDisplayStatus(
  q: QuestionnaireDetail,
  now = Date.now()
): DisplayStatus {
  if (q.status === 'completed') return 'completed';
  if (q.due_date && new Date(q.due_date).getTime() < now) return 'overdue';
  return 'pending';
}

const STATUS_LABEL: Record<DisplayStatus, string> = {
  pending: 'En attente',
  overdue: 'En retard',
  completed: 'Complété',
};

export function QuestionnaireCard({
  questionnaire: q,
  onDelete,
  isDeleting,
}: QuestionnaireCardProps) {
  const [isAnswersOpen, setIsAnswersOpen] = useState(false);

  const displayStatus = computeDisplayStatus(q);
  const cardClass =
    displayStatus === 'pending'
      ? 'fp-q-card is-pending'
      : displayStatus === 'overdue'
        ? 'fp-q-card is-overdue'
        : 'fp-q-card';

  const questionCount = Array.isArray(q.questions) ? q.questions.length : 0;
  const answerCount = Array.isArray(q.answers) ? q.answers.length : 0;
  const canDelete = q.status === 'pending';
  const canViewAnswers = displayStatus === 'completed' && answerCount > 0;

  return (
    <>
      <article className={cardClass}>
        <div className='fp-q-head'>
          <div className='fp-q-head-left'>
            <h3 className='fp-q-title'>{q.title}</h3>
            <div className='fp-q-meta'>
              <span>
                Type · <b>{q.questionnaire_type}</b>
              </span>
              <span className='dot' />
              <span>
                {questionCount} question{questionCount > 1 ? 's' : ''}
              </span>
              {answerCount > 0 && (
                <>
                  <span className='dot' />
                  <span>
                    {answerCount} réponse{answerCount > 1 ? 's' : ''}
                  </span>
                </>
              )}
              <span className='dot' />
              <span>Créé le {formatDate(q.created_at)}</span>
              {q.due_date && displayStatus !== 'completed' && (
                <>
                  <span className='dot' />
                  <span>
                    Échéance ·{' '}
                    <b
                      style={{
                        color:
                          displayStatus === 'overdue'
                            ? 'var(--ns-coral)'
                            : undefined,
                      }}
                    >
                      {formatDate(q.due_date)}
                    </b>
                  </span>
                </>
              )}
              {q.completed_at && (
                <>
                  <span className='dot' />
                  <span>
                    Complété le <b>{formatDate(q.completed_at)}</b>
                  </span>
                </>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {canViewAnswers && (
              <button
                type='button'
                className='fp-btn fp-btn-sm'
                onClick={() => setIsAnswersOpen(true)}
                aria-label='Voir les réponses du patient'
              >
                <Eye className='w-3.5 h-3.5' aria-hidden='true' />
                Voir les réponses
              </button>
            )}
            <span className={`fp-q-status is-${displayStatus}`}>
              {STATUS_LABEL[displayStatus]}
            </span>
            {canDelete && (
              <button
                type='button'
                className='fp-btn fp-btn-icon'
                style={{ width: 32, height: 32 }}
                onClick={() => onDelete(q.id)}
                disabled={isDeleting}
                aria-label='Supprimer'
              >
                {isDeleting ? (
                  <Loader2 className='w-3 h-3 animate-spin' />
                ) : (
                  <Trash2
                    className='w-3 h-3'
                    style={{ color: 'var(--ns-coral)' }}
                  />
                )}
              </button>
            )}
          </div>
        </div>
      </article>

      {isAnswersOpen && (
        <QuestionnaireAnswersModal
          questionnaire={q}
          onClose={() => setIsAnswersOpen(false)}
        />
      )}
    </>
  );
}
