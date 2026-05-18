'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type {
  QuestionnaireAnswer,
  QuestionnaireDetail,
  QuestionnaireQuestion,
} from '@/types/nutritionist-dossier';

interface QuestionnaireAnswersModalProps {
  questionnaire: QuestionnaireDetail;
  onClose: () => void;
}

function ScaleBar({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <div className='fp-q-answer-bar'>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < value ? 'is-on' : ''} />
      ))}
    </div>
  );
}

function renderAnswer(
  question: QuestionnaireQuestion | null,
  answer: QuestionnaireAnswer
) {
  if (question?.type === 'scale' && typeof answer.answer === 'number') {
    return (
      <div>
        <div className='fp-q-answer-a is-scale'>
          {answer.answer}
          <em>/ 10</em>
        </div>
        <ScaleBar value={answer.answer} />
      </div>
    );
  }
  if (typeof answer.answer === 'boolean') {
    return <div className='fp-q-answer-a'>{answer.answer ? 'Oui' : 'Non'}</div>;
  }
  const text = String(answer.answer ?? '').trim();
  return (
    <div className='fp-q-answer-a'>
      {text.length > 0 ? text : <em style={{ color: 'var(--ns-ink-3)' }}>—</em>}
    </div>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function QuestionnaireAnswersModal({
  questionnaire: q,
  onClose,
}: QuestionnaireAnswersModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const answers = q.answers ?? [];
  const answerCount = answers.length;
  const questionCount = q.questions?.length ?? 0;

  return (
    <div
      className='fp-modal is-open'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='q-answers-title'
    >
      <div className='fp-modal-card is-wide' onClick={e => e.stopPropagation()}>
        <div className='fp-modal-head'>
          <div>
            <h3 className='fp-modal-title' id='q-answers-title'>
              Réponses · <em>{q.title}</em>
            </h3>
            <p className='fp-modal-sub'>
              {q.completed_at
                ? `Complété le ${formatDate(q.completed_at)} · `
                : ''}
              {answerCount} réponse{answerCount > 1 ? 's' : ''} sur{' '}
              {questionCount} question{questionCount > 1 ? 's' : ''}
            </p>
          </div>
          <button
            type='button'
            className='fp-modal-close'
            onClick={onClose}
            aria-label='Fermer'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        </div>

        <div className='fp-modal-body'>
          {answerCount === 0 ? (
            <p
              style={{
                fontFamily: 'var(--ns-font-sans)',
                fontSize: 13,
                color: 'var(--ns-ink-3)',
                margin: 0,
              }}
            >
              Aucune réponse enregistrée pour ce questionnaire.
            </p>
          ) : (
            <div className='fp-q-answers-modal-list'>
              {answers.map((a, i) => {
                const question =
                  q.questions?.find(qq => qq.id === a.question_id) ??
                  q.questions?.[i] ??
                  null;
                return (
                  <div key={a.question_id || i} className='fp-q-answer'>
                    <div className='fp-q-answer-q'>
                      {question?.question || `Question ${i + 1}`}
                    </div>
                    {renderAnswer(question, a)}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className='fp-modal-foot'>
          <span style={{ flex: 1 }} />
          <button type='button' className='fp-btn' onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
