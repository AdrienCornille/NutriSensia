'use client';

import React, { useState } from 'react';
import { X, Plus, Loader2, Trash2 } from 'lucide-react';
import { useCreateQuestionnaire } from '@/hooks/useNutritionistDossier';

interface QuestionnaireCreateModalProps {
  patientId: string;
  onClose: () => void;
}

interface QuestionDraft {
  question: string;
  type: 'text' | 'scale' | 'choice' | 'boolean' | 'number';
  options: string[];
  required: boolean;
}

const questionTypes = [
  { value: 'text', label: 'Texte libre' },
  { value: 'scale', label: 'Échelle (1-10)' },
  { value: 'choice', label: 'Choix multiples' },
  { value: 'boolean', label: 'Oui/Non' },
  { value: 'number', label: 'Nombre' },
];

export function QuestionnaireCreateModal({
  patientId,
  onClose,
}: QuestionnaireCreateModalProps) {
  const [title, setTitle] = useState('');
  const [questionnaireType, setQuestionnaireType] = useState('Suivi');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { question: '', type: 'text', options: [], required: true },
  ]);

  const createQuestionnaire = useCreateQuestionnaire(patientId);

  function addQuestion() {
    setQuestions([
      ...questions,
      { question: '', type: 'text', options: [], required: true },
    ]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(
    index: number,
    field: keyof QuestionDraft,
    value: unknown
  ) {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validQuestions = questions.filter(q => q.question.trim());
    if (!title.trim() || validQuestions.length === 0) return;

    try {
      await createQuestionnaire.mutateAsync({
        title: title.trim(),
        questionnaire_type: questionnaireType,
        due_date: dueDate || undefined,
        questions: validQuestions.map(q => ({
          question: q.question.trim(),
          type: q.type,
          options: q.type === 'choice' ? q.options.filter(Boolean) : undefined,
          required: q.required,
        })),
      });
      onClose();
    } catch {
      // handled by React Query
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Nouveau questionnaire
          </h3>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-gray-700 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Titre *
              </label>
              <input
                type='text'
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='ex: Suivi semaine 4'
                className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Type
              </label>
              <select
                value={questionnaireType}
                onChange={e => setQuestionnaireType(e.target.value)}
                className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
              >
                <option value='Suivi'>Suivi</option>
                <option value='Feedback'>Feedback</option>
                <option value='Anamnèse'>Anamnèse</option>
              </select>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Date limite
            </label>
            <input
              type='date'
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
            />
          </div>

          {/* Questions */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Questions
            </label>
            <div className='space-y-3'>
              {questions.map((q, index) => (
                <div
                  key={index}
                  className='border border-gray-200 rounded-lg p-3 space-y-2'
                >
                  <div className='flex items-start gap-2'>
                    <span className='text-xs font-medium text-gray-400 mt-2'>
                      {index + 1}.
                    </span>
                    <div className='flex-1 space-y-2'>
                      <input
                        type='text'
                        value={q.question}
                        onChange={e =>
                          updateQuestion(index, 'question', e.target.value)
                        }
                        placeholder='Entrez votre question...'
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
                      />
                      <div className='flex gap-2'>
                        <select
                          value={q.type}
                          onChange={e =>
                            updateQuestion(index, 'type', e.target.value)
                          }
                          className='px-2 py-1 text-xs border border-gray-200 rounded-lg'
                        >
                          {questionTypes.map(t => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <label className='flex items-center gap-1 text-xs text-gray-500'>
                          <input
                            type='checkbox'
                            checked={q.required}
                            onChange={e =>
                              updateQuestion(
                                index,
                                'required',
                                e.target.checked
                              )
                            }
                            className='rounded'
                          />
                          Obligatoire
                        </label>
                      </div>
                      {q.type === 'choice' && (
                        <input
                          type='text'
                          value={q.options.join(', ')}
                          onChange={e =>
                            updateQuestion(
                              index,
                              'options',
                              e.target.value.split(',').map(s => s.trim())
                            )
                          }
                          placeholder='Options séparées par des virgules'
                          className='w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg'
                        />
                      )}
                    </div>
                    <button
                      type='button'
                      onClick={() => removeQuestion(index)}
                      className='p-1 text-gray-400 hover:text-red-500'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type='button'
              onClick={addQuestion}
              className='mt-2 inline-flex items-center gap-1 text-sm text-[#1B998B] hover:text-[#147569] font-medium'
            >
              <Plus className='w-4 h-4' />
              Ajouter une question
            </button>
          </div>

          <div className='flex justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Annuler
            </button>
            <button
              type='submit'
              disabled={
                !title.trim() ||
                questions.every(q => !q.question.trim()) ||
                createQuestionnaire.isPending
              }
              className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
            >
              {createQuestionnaire.isPending && (
                <Loader2 className='w-4 h-4 animate-spin' />
              )}
              Envoyer au patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
