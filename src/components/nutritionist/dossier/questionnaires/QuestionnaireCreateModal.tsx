'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Plus, Loader2, Trash2, Check, LayoutTemplate } from 'lucide-react';
import { useCreateQuestionnaire } from '@/hooks/useNutritionistDossier';
import { DSDropdown } from '@/components/ui/DSDropdown';
import { QuestionnaireTemplatePicker } from './QuestionnaireTemplatePicker';
import type {
  QuestionnaireTemplate,
  QuestionnaireQuestionType as TplQuestionType,
} from '@/types/questionnaire-templates';

const TYPE_TRIGGER_STYLE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  border: '1.5px solid var(--ns-ink-4)',
  borderRadius: 10,
  background: 'var(--ns-cream-50)',
  fontFamily: 'var(--ns-font-sans)',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--ns-ink)',
};

const Q_TYPE_TRIGGER_STYLE: React.CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  padding: '8px 14px',
  border: '1.5px solid var(--ns-ink-4)',
  borderRadius: 999,
  background: 'var(--ns-cream-50)',
  fontFamily: 'var(--ns-font-sans)',
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--ns-ink)',
};

const QUESTIONNAIRE_TYPE_OPTIONS = [
  { value: 'Suivi', label: 'Suivi' },
  { value: 'Feedback', label: 'Feedback' },
  { value: 'Anamnèse', label: 'Anamnèse' },
];

interface QuestionnaireCreateModalProps {
  patientId: string;
  onClose: () => void;
  /** Called after a successful send, just before onClose. The parent typically
   *  surfaces a toast — we pass the questionnaire title so the message can
   *  reference it. */
  onSent?: (title: string) => void;
  /** Called when the create mutation throws. The parent surfaces the failure
   *  via a toast since the modal is dismissed on success but kept open on
   *  error (so the user can fix and retry). */
  onError?: (message: string) => void;
}

type QuestionType = 'text' | 'scale' | 'choice' | 'boolean' | 'number';

interface QuestionDraft {
  question: string;
  type: QuestionType;
  options: string[];
  required: boolean;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Texte libre' },
  { value: 'scale', label: 'Échelle (1-10)' },
  { value: 'choice', label: 'Choix multiples' },
  { value: 'boolean', label: 'Oui / Non' },
  { value: 'number', label: 'Nombre' },
];

const TYPE_HINTS: Record<QuestionType, string> = {
  text: 'Le patient répondra librement par écrit.',
  scale: 'Le patient choisira une valeur entre 1 et 10.',
  choice: 'Le patient sélectionnera une option parmi celles définies.',
  boolean: 'Le patient répondra par Oui ou Non.',
  number: 'Le patient saisira une valeur numérique.',
};

function makeEmptyQuestion(): QuestionDraft {
  return { question: '', type: 'text', options: [], required: true };
}

// Maps a template question type to the legacy QuestionDraft type. Lossy by
// design: percent/bristol become scale, multi_choice flattens to choice, time
// falls back to free text. The richer types arrive when P2 ships the
// assignment/response model — until then, the modal only carries forward
// what `follow_up_questionnaires` can already store.
const TEMPLATE_TYPE_TO_DRAFT: Record<TplQuestionType, QuestionType> = {
  scale: 'scale',
  percent: 'scale',
  bristol: 'scale',
  single_choice: 'choice',
  multi_choice: 'choice',
  free_text: 'text',
  number: 'number',
  time: 'text',
};

const CATEGORY_TO_TYPE: Record<string, string> = {
  regular_followup: 'Suivi',
  around_consultation: 'Feedback',
  deep_dive: 'Suivi',
};

export function QuestionnaireCreateModal({
  patientId,
  onClose,
  onSent,
  onError,
}: QuestionnaireCreateModalProps) {
  const [view, setView] = useState<'form' | 'picker'>('form');
  const [title, setTitle] = useState('');
  const [questionnaireType, setQuestionnaireType] = useState('Suivi');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    makeEmptyQuestion(),
  ]);
  // When non-null, the modal sends the assignment against THIS template
  // version directly (no draft template created). Preserves display_rules,
  // option slugs and exclusivity flags. Cleared when the user picks
  // "Repartir d'un questionnaire vierge" or edits a question.
  const [pickedTemplateVersionId, setPickedTemplateVersionId] = useState<
    string | null
  >(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const createQuestionnaire = useCreateQuestionnaire(patientId);

  useEffect(() => {
    if (view === 'form') titleInputRef.current?.focus();
  }, [view]);

  function applyTemplate(template: QuestionnaireTemplate) {
    setTitle(template.title);
    setQuestionnaireType(CATEGORY_TO_TYPE[template.category] ?? 'Suivi');
    setDueDate('');
    const drafts: QuestionDraft[] = template.current_version.questions.map(
      tq => {
        const draftType = TEMPLATE_TYPE_TO_DRAFT[tq.type];
        const isChoice =
          tq.type === 'single_choice' || tq.type === 'multi_choice';
        return {
          question: tq.label,
          type: draftType,
          options: isChoice ? tq.options.map(o => o.label) : [],
          required: tq.is_required,
        };
      }
    );
    setQuestions(drafts.length > 0 ? drafts : [makeEmptyQuestion()]);
    // Remember the source version so submission targets it directly.
    setPickedTemplateVersionId(template.current_version.id);
    setView('form');
  }

  function resetToBlank() {
    setTitle('');
    setQuestionnaireType('Suivi');
    setDueDate('');
    setQuestions([makeEmptyQuestion()]);
    setPickedTemplateVersionId(null);
    setView('form');
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function addQuestion() {
    setQuestions(prev => [...prev, makeEmptyQuestion()]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  }

  function updateQuestion<K extends keyof QuestionDraft>(
    index: number,
    field: K,
    value: QuestionDraft[K]
  ) {
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== index) return q;
        const next = { ...q, [field]: value } as QuestionDraft;
        // Switching to "choice" guarantees at least two option slots so the
        // editor never renders below the minimum the patient form expects.
        if (field === 'type' && value === 'choice' && next.options.length < 2) {
          next.options = [
            ...next.options,
            ...Array(2 - next.options.length).fill(''),
          ];
        }
        return next;
      })
    );
  }

  function updateOption(qIndex: number, optIndex: number, value: string) {
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const nextOptions = q.options.map((o, oi) =>
          oi === optIndex ? value : o
        );
        return { ...q, options: nextOptions };
      })
    );
  }

  function addOption(qIndex: number) {
    setQuestions(prev =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, ''] } : q
      )
    );
  }

  function removeOption(qIndex: number, optIndex: number) {
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length <= 2) return q;
        return {
          ...q,
          options: q.options.filter((_, oi) => oi !== optIndex),
        };
      })
    );
  }

  const validQuestionCount = questions.filter(q => q.question.trim()).length;
  const choiceWithoutOptions = questions.some(
    q =>
      q.type === 'choice' &&
      q.question.trim() &&
      q.options.filter(Boolean).length < 2
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || validQuestionCount === 0 || choiceWithoutOptions) {
      return;
    }
    const validQuestions = questions.filter(q => q.question.trim());

    const trimmedTitle = title.trim();
    try {
      await createQuestionnaire.mutateAsync({
        title: trimmedTitle,
        questionnaire_type: questionnaireType,
        due_date: dueDate || undefined,
        // When a template was picked, the API uses that version directly
        // (preserves display_rules + option slugs). Otherwise it falls back
        // to creating a draft template from the questions payload.
        template_version_id: pickedTemplateVersionId || undefined,
        questions: validQuestions.map(q => ({
          question: q.question.trim(),
          type: q.type,
          options: q.type === 'choice' ? q.options.filter(Boolean) : undefined,
          required: q.required,
        })),
      });
      onSent?.(trimmedTitle);
      onClose();
    } catch (err) {
      // Stay in the modal on error so the user can fix and retry; surface
      // the failure via the parent toast.
      const msg =
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de l’envoi';
      onError?.(msg);
    }
  }

  const submitDisabled =
    !title.trim() ||
    validQuestionCount === 0 ||
    choiceWithoutOptions ||
    createQuestionnaire.isPending;

  let helperMessage = '';
  if (!title.trim()) helperMessage = 'Indiquez un titre pour commencer.';
  else if (validQuestionCount === 0)
    helperMessage = 'Ajoutez au moins une question.';
  else if (choiceWithoutOptions)
    helperMessage = 'Renseignez au moins 2 options pour les choix multiples.';

  return (
    <div
      className='fp-modal is-open'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='q-create-title'
    >
      <div className='fp-modal-card is-wide' onClick={e => e.stopPropagation()}>
        <div className='fp-modal-head'>
          <div>
            <h3 className='fp-modal-title' id='q-create-title'>
              {view === 'picker' ? (
                <>
                  Choisir un <em>template</em>
                </>
              ) : (
                <>
                  Nouveau <em>questionnaire</em>
                </>
              )}
            </h3>
            <p className='fp-modal-sub'>
              {view === 'picker'
                ? 'Pré-remplit le formulaire à partir d’un modèle. Tu pourras tout éditer ensuite.'
                : 'Sera envoyé au patient · réponses synchronisées en temps réel.'}
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

        {view === 'picker' && (
          <div className='fp-modal-body'>
            <QuestionnaireTemplatePicker
              onPick={applyTemplate}
              onCancel={resetToBlank}
            />
          </div>
        )}

        {view === 'form' && (
          <form onSubmit={handleSubmit}>
            <div className='fp-modal-body'>
              <button
                type='button'
                className='fp-tpl-cta'
                onClick={() => setView('picker')}
              >
                <LayoutTemplate className='w-3.5 h-3.5' />
                Utiliser un template
              </button>

              <div className='fp-modal-field-row'>
                <div className='fp-modal-field' style={{ marginBottom: 0 }}>
                  <label htmlFor='q-title'>Titre *</label>
                  <input
                    ref={titleInputRef}
                    id='q-title'
                    type='text'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder='ex: Suivi semaine 4'
                    required
                  />
                </div>
                <div className='fp-modal-field' style={{ marginBottom: 0 }}>
                  <label id='q-type-label'>Type</label>
                  <DSDropdown
                    value={questionnaireType}
                    options={QUESTIONNAIRE_TYPE_OPTIONS}
                    onChange={setQuestionnaireType}
                    inputStyle={TYPE_TRIGGER_STYLE}
                    ariaLabel='Type de questionnaire'
                  />
                </div>
              </div>

              <div className='fp-modal-field'>
                <label htmlFor='q-due-date'>Date limite (optionnel)</label>
                <input
                  id='q-due-date'
                  type='date'
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>

              <div className='fp-q-section'>
                <span className='fp-q-section-label'>
                  Questions
                  <span className='fp-q-section-count'>{questions.length}</span>
                </span>
              </div>

              <div className='fp-q-list'>
                {questions.map((q, index) => (
                  <div key={index} className='fp-qe-card'>
                    <span className='fp-q-num' aria-hidden='true'>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className='fp-q-body'>
                      <input
                        type='text'
                        className='fp-q-input'
                        value={q.question}
                        onChange={e =>
                          updateQuestion(index, 'question', e.target.value)
                        }
                        placeholder='Entrez votre question…'
                        aria-label={`Question ${index + 1}`}
                      />
                      <div className='fp-q-controls'>
                        <DSDropdown
                          value={q.type}
                          options={QUESTION_TYPES.map(t => ({
                            value: t.value,
                            label: t.label,
                          }))}
                          onChange={v =>
                            updateQuestion(index, 'type', v as QuestionType)
                          }
                          inputStyle={Q_TYPE_TRIGGER_STYLE}
                          wrapperStyle={{ marginTop: 0, width: 200 }}
                          ariaLabel={`Type de la question ${index + 1}`}
                        />
                        <button
                          type='button'
                          className={`fp-q-toggle${q.required ? ' is-on' : ''}`}
                          onClick={() =>
                            updateQuestion(index, 'required', !q.required)
                          }
                          aria-pressed={q.required}
                        >
                          <span className='fp-q-toggle-box' aria-hidden='true'>
                            {q.required && (
                              <Check
                                className='w-3 h-3'
                                strokeWidth={3}
                                style={{ color: 'var(--ns-peps)' }}
                              />
                            )}
                          </span>
                          Obligatoire
                        </button>
                      </div>
                      {q.type === 'choice' && (
                        <div className='fp-q-options-list'>
                          <span className='fp-q-options-label'>
                            Options proposées
                          </span>
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className='fp-q-option'>
                              <span
                                className='fp-q-option-dot'
                                aria-hidden='true'
                              >
                                {optIdx + 1}
                              </span>
                              <input
                                type='text'
                                className='fp-q-option-input'
                                value={opt}
                                onChange={e =>
                                  updateOption(index, optIdx, e.target.value)
                                }
                                placeholder={`Option ${optIdx + 1}`}
                                aria-label={`Option ${optIdx + 1} de la question ${index + 1}`}
                              />
                              <button
                                type='button'
                                className='fp-q-option-delete'
                                onClick={() => removeOption(index, optIdx)}
                                disabled={q.options.length <= 2}
                                aria-label={`Supprimer l'option ${optIdx + 1}`}
                              >
                                <Trash2 className='w-3 h-3' />
                              </button>
                            </div>
                          ))}
                          <button
                            type='button'
                            className='fp-q-option-add'
                            onClick={() => addOption(index)}
                          >
                            <Plus className='w-3 h-3' />
                            Ajouter une option
                          </button>
                        </div>
                      )}
                      <p className='fp-q-hint'>{TYPE_HINTS[q.type]}</p>
                    </div>
                    <button
                      type='button'
                      onClick={() => removeQuestion(index)}
                      disabled={questions.length <= 1}
                      className='fp-q-delete'
                      aria-label={`Supprimer la question ${index + 1}`}
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </button>
                  </div>
                ))}
              </div>

              <button type='button' onClick={addQuestion} className='fp-q-add'>
                <Plus className='w-3.5 h-3.5' />
                Ajouter une question
              </button>
            </div>

            <div className='fp-modal-foot'>
              <span
                style={{
                  fontFamily: 'var(--ns-font-serif)',
                  fontStyle: 'italic',
                  fontSize: 13,
                  color: helperMessage ? 'var(--ns-coral)' : 'var(--ns-ink-3)',
                }}
              >
                {helperMessage || '* champs obligatoires'}
              </span>
              <div className='fp-modal-foot-actions'>
                <button type='button' className='fp-btn' onClick={onClose}>
                  Annuler
                </button>
                <button
                  type='submit'
                  className='fp-btn fp-btn-peps'
                  disabled={submitDisabled}
                >
                  {createQuestionnaire.isPending && (
                    <Loader2 className='w-3 h-3 animate-spin' />
                  )}
                  Envoyer au patient
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
