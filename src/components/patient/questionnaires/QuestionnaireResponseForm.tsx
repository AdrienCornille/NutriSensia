'use client';

/**
 * Patient response form (P2.C.2).
 *
 * - Renders only the visible questions (display rules evaluated dynamically).
 * - Auto-save per question: each change updates local state immediately,
 *   then schedules a debounced PUT 800ms later. A separate timer per
 *   question prevents one slow-typed answer from delaying another.
 * - Submit: hard-block via 422 from the server if any visible required
 *   question is unanswered. The server is authoritative; the client also
 *   computes the same predicate to disable the button proactively.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { ArrowLeft, Check, Loader2, AlertTriangle, Lock } from 'lucide-react';
import {
  useSavePatientAnswer,
  useSubmitPatientQuestionnaire,
} from '@/hooks/usePatientQuestionnaires';
import {
  visibleQuestions,
  missingRequiredAnswers,
} from '@/lib/questionnaire-display-rules';
import type {
  PatientQuestionnaireDetail,
  PatientAnswer,
  SaveAnswerPayload,
} from '@/types/patient-questionnaires';
import { QuestionInput } from './QuestionInputs';

interface QuestionnaireResponseFormProps {
  detail: PatientQuestionnaireDetail;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DELAY_MS = 800;
const SAVED_INDICATOR_TTL_MS = 1500;

export function QuestionnaireResponseForm({
  detail,
}: QuestionnaireResponseFormProps) {
  const router = useRouter();
  const isSubmitted = detail.status === 'submitted';

  // Local answers state — keyed by question_id.
  const [answersByQ, setAnswersByQ] = useState<Map<string, PatientAnswer>>(
    () => {
      const m = new Map<string, PatientAnswer>();
      for (const a of detail.answers) m.set(a.question_id, a);
      return m;
    }
  );
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [missingIds, setMissingIds] = useState<Set<string>>(new Set());

  const saveAnswer = useSavePatientAnswer(detail.id);
  const submit = useSubmitPatientQuestionnaire(detail.id);

  // Per-question debounce timers — survive across renders.
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timers on unmount so a pending save doesn't fire on an
  // unmounted component.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers.values()) clearTimeout(t);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const visibleList = useMemo(
    () => visibleQuestions(detail.questions, answersByQ),
    [detail.questions, answersByQ]
  );

  const missingRequired = useMemo(
    () =>
      missingRequiredAnswers(detail.questions, Array.from(answersByQ.values())),
    [detail.questions, answersByQ]
  );

  function buildNextAnswer(
    questionId: string,
    payload: SaveAnswerPayload
  ): PatientAnswer {
    const prev = answersByQ.get(questionId);
    const base: PatientAnswer = prev ?? {
      question_id: questionId,
      value_numeric: null,
      value_text: null,
      value_time: null,
      value_option_id: null,
      selected_option_ids: [],
    };
    return {
      ...base,
      ...(payload.value_numeric !== undefined
        ? { value_numeric: payload.value_numeric }
        : {}),
      ...(payload.value_text !== undefined
        ? { value_text: payload.value_text }
        : {}),
      ...(payload.value_time !== undefined
        ? { value_time: payload.value_time }
        : {}),
      ...(payload.value_option_id !== undefined
        ? { value_option_id: payload.value_option_id }
        : {}),
      ...(payload.selected_option_ids !== undefined
        ? { selected_option_ids: payload.selected_option_ids ?? [] }
        : {}),
    };
  }

  function handleChange(questionId: string, payload: SaveAnswerPayload) {
    if (isSubmitted) return;

    // Optimistic local update first.
    setAnswersByQ(prev => {
      const next = new Map(prev);
      next.set(questionId, buildNextAnswer(questionId, payload));
      return next;
    });

    // Clear missing-flag if user is fixing a flagged question.
    if (missingIds.has(questionId)) {
      setMissingIds(prev => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    }

    // Debounce the actual server call per question.
    const existing = timersRef.current.get(questionId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      timersRef.current.delete(questionId);
      setSaveState('saving');
      saveAnswer.mutate(
        { questionId, payload },
        {
          onSuccess: () => {
            setSaveState('saved');
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
            savedTimerRef.current = setTimeout(() => {
              setSaveState('idle');
            }, SAVED_INDICATOR_TTL_MS);
          },
          onError: () => setSaveState('error'),
        }
      );
    }, AUTOSAVE_DELAY_MS);
    timersRef.current.set(questionId, timer);
  }

  function handleSubmit() {
    if (isSubmitted) return;
    setSubmitError(null);
    setMissingIds(new Set());

    submit.mutate(undefined, {
      onSuccess: () => {
        router.push('/dashboard/patient/questionnaires');
      },
      onError: (err: Error & { payload?: unknown }) => {
        const payload = err.payload as
          | { missing_required?: { question_id: string; label: string }[] }
          | undefined;
        if (payload?.missing_required) {
          setMissingIds(
            new Set(payload.missing_required.map(m => m.question_id))
          );
          // Scroll to the first missing question.
          const first = payload.missing_required[0]?.question_id;
          if (first) {
            const el = document.getElementById(`q-${first}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        setSubmitError(err.message);
      },
    });
  }

  const canSubmit =
    !isSubmitted && missingRequired.length === 0 && !submit.isPending;
  const totalVisible = visibleList.length;
  const totalAnswered = visibleList.filter(q =>
    isAnsweredLocally(q.id, answersByQ)
  ).length;
  const progressPct =
    totalVisible > 0 ? Math.round((totalAnswered / totalVisible) * 100) : 0;

  return (
    <div className='max-w-3xl mx-auto p-6 lg:p-8'>
      {/* Header */}
      <button
        type='button'
        onClick={() => router.push('/dashboard/patient/questionnaires')}
        className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4'
      >
        <ArrowLeft className='w-4 h-4' />
        Retour aux questionnaires
      </button>

      <header className='mb-6'>
        <h1 className='text-2xl font-semibold text-gray-800 mb-1'>
          {detail.title}
        </h1>
        {detail.description && (
          <p className='text-sm text-gray-500'>{detail.description}</p>
        )}
      </header>

      {/* Sensitive intro — consent reminder before the questions */}
      {detail.is_sensitive && !isSubmitted && (
        <div className='mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3'>
          <Lock className='w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5' />
          <div className='text-sm text-amber-900'>
            <p className='font-semibold mb-1'>Données sensibles</p>
            <p>
              Vos réponses sont confidentielles, chiffrées et consultables
              uniquement par votre nutritionniste. Elles ne servent qu'à
              améliorer votre accompagnement.
            </p>
          </div>
        </div>
      )}

      {/* Progress + save indicator */}
      {!isSubmitted && (
        <div className='mb-6'>
          <div className='flex items-center justify-between text-xs text-gray-500 mb-1.5'>
            <span>
              {totalAnswered}/{totalVisible} questions répondues
            </span>
            <SaveIndicator state={saveState} />
          </div>
          <div className='h-1.5 rounded-full bg-gray-100 overflow-hidden'>
            <div
              className='h-full bg-emerald-500 transition-all'
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {isSubmitted && (
        <div className='mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm flex items-center gap-2'>
          <Check className='w-5 h-5' />
          Questionnaire soumis le{' '}
          <strong>
            {detail.submitted_at
              ? new Date(detail.submitted_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '—'}
          </strong>
        </div>
      )}

      {/* Questions */}
      <div className='space-y-6'>
        {visibleList.map((q, index) => {
          const isMissing = missingIds.has(q.id);
          return (
            <article
              key={q.id}
              id={`q-${q.id}`}
              className={`p-5 rounded-2xl border bg-white transition-colors ${
                isMissing ? 'border-red-300 bg-red-50/40' : 'border-gray-200'
              }`}
            >
              <header className='mb-4'>
                <div className='flex items-baseline gap-2 mb-1'>
                  <span className='text-xs font-semibold text-gray-400'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className='font-semibold text-gray-800'>
                    {q.label}
                    {q.is_required && (
                      <span className='ml-1 text-red-500' aria-label='requis'>
                        *
                      </span>
                    )}
                  </h3>
                </div>
                {q.help_text && (
                  <p className='text-sm text-gray-500 ml-6 italic'>
                    {q.help_text}
                  </p>
                )}
              </header>
              <div className='ml-6'>
                <QuestionInput
                  question={q}
                  answer={answersByQ.get(q.id)}
                  onChange={payload => handleChange(q.id, payload)}
                  disabled={isSubmitted}
                  id={`q-input-${q.id}`}
                />
              </div>
              {isMissing && (
                <p className='ml-6 mt-2 text-sm text-red-700 inline-flex items-center gap-1'>
                  <AlertTriangle className='w-3.5 h-3.5' />
                  Cette question est obligatoire
                </p>
              )}
            </article>
          );
        })}
      </div>

      {/* Submit */}
      {!isSubmitted && (
        <div className='mt-8 sticky bottom-4 z-10'>
          <div className='p-4 rounded-xl bg-white border border-gray-200 shadow-lg flex items-center justify-between gap-4'>
            <div className='text-sm text-gray-500'>
              {missingRequired.length > 0 ? (
                <span className='text-amber-700'>
                  {missingRequired.length} question
                  {missingRequired.length > 1 ? 's' : ''} obligatoire
                  {missingRequired.length > 1 ? 's' : ''} restante
                  {missingRequired.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span>Prêt à soumettre</span>
              )}
            </div>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={!canSubmit}
              className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-colors bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed'
            >
              {submit.isPending && <Loader2 className='w-4 h-4 animate-spin' />}
              Soumettre
            </button>
          </div>
          {submitError && missingIds.size === 0 && (
            <p className='mt-2 text-sm text-red-700'>{submitError}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function isAnsweredLocally(
  questionId: string,
  answersByQ: Map<string, PatientAnswer>
): boolean {
  const a = answersByQ.get(questionId);
  if (!a) return false;
  if (a.value_numeric !== null && a.value_numeric !== undefined) return true;
  if (a.value_text && a.value_text.length > 0) return true;
  if (a.value_time && a.value_time.length > 0) return true;
  if (a.value_option_id) return true;
  if (a.selected_option_ids && a.selected_option_ids.length > 0) return true;
  return false;
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'saving') {
    return (
      <span className='inline-flex items-center gap-1 text-gray-400'>
        <Loader2 className='w-3 h-3 animate-spin' />
        Sauvegarde…
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span className='inline-flex items-center gap-1 text-emerald-600'>
        <Check className='w-3 h-3' />
        Enregistré
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className='inline-flex items-center gap-1 text-red-600'>
        <AlertTriangle className='w-3 h-3' />
        Sauvegarde échouée
      </span>
    );
  }
  return <span className='text-gray-300'>Sauvegarde auto</span>;
}
