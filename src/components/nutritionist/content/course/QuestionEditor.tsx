'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Plus, MessageSquare, Check, Loader2 } from 'lucide-react';
import { useUpdateQuestion } from '@/hooks/useCourseBuilder';

interface QuestionEditorProps {
  courseId: string;
  quizId: string;
  question: any;
}

export function QuestionEditor({
  courseId,
  quizId,
  question,
}: QuestionEditorProps) {
  const updateQuestion = useUpdateQuestion();

  const initializedRef = useRef(question.id);

  const [questionText, setQuestionText] = useState(
    question.question_text || ''
  );
  const [explanation, setExplanation] = useState(question.explanation || '');
  const [options, setOptions] = useState<
    { text: string; is_correct: boolean }[]
  >(question.options || []);
  const [correctAnswer, setCorrectAnswer] = useState<boolean>(
    question.correct_answer ?? true
  );
  const [pendingSave, setPendingSave] = useState(false);
  const [savedQuestionField, setSavedQuestionField] = useState<string | null>(
    null
  );
  const [savingQuestionField, setSavingQuestionField] = useState<string | null>(
    null
  );
  const savedQuestionFieldTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastQuestionFieldRef = useRef<string | null>(null);

  // Refs for debounced save access
  const questionTextRef = useRef(questionText);
  const explanationRef = useRef(explanation);
  const optionsRef = useRef(options);
  const correctAnswerRef = useRef(correctAnswer);

  useEffect(() => {
    questionTextRef.current = questionText;
  }, [questionText]);
  useEffect(() => {
    explanationRef.current = explanation;
  }, [explanation]);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  useEffect(() => {
    correctAnswerRef.current = correctAnswer;
  }, [correctAnswer]);

  // Only re-sync if the question ID actually changes (different question)
  if (initializedRef.current !== question.id) {
    initializedRef.current = question.id;
    setQuestionText(question.question_text || '');
    setExplanation(question.explanation || '');
    setOptions(question.options || []);
    setCorrectAnswer(question.correct_answer ?? true);
    setPendingSave(false);
    setSavedQuestionField(null);
  }

  // Debounced auto-save
  useEffect(() => {
    if (!pendingSave) return;
    const timer = setTimeout(() => {
      const data: Record<string, unknown> = {
        question_text: questionTextRef.current,
        explanation: explanationRef.current || null,
      };

      if (question.question_type === 'mcq') {
        data.options = optionsRef.current;
      } else {
        data.correct_answer = correctAnswerRef.current;
      }

      setSavingQuestionField(lastQuestionFieldRef.current);
      updateQuestion.mutate(
        { courseId, quizId, questionId: question.id, data },
        {
          onSuccess: () => {
            setSavingQuestionField(null);
            setSavedQuestionField(lastQuestionFieldRef.current);
            if (savedQuestionFieldTimerRef.current)
              clearTimeout(savedQuestionFieldTimerRef.current);
            savedQuestionFieldTimerRef.current = setTimeout(
              () => setSavedQuestionField(null),
              2000
            );
          },
          onError: () => {
            setSavingQuestionField(null);
            setSavedQuestionField(null);
          },
        }
      );
      setPendingSave(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    pendingSave,
    question.id,
    question.question_type,
    courseId,
    quizId,
    updateQuestion,
  ]);

  const markDirty = useCallback((fieldName?: string) => {
    if (fieldName) lastQuestionFieldRef.current = fieldName;
    setPendingSave(true);
  }, []);

  // ─── MCQ helpers ───

  const handleOptionTextChange = (index: number, text: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], text };
    setOptions(updated);
    markDirty('qOptions');
  };

  const handleOptionCorrectChange = (index: number, isCorrect: boolean) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index ? isCorrect : opt.is_correct,
    }));
    setOptions(updated);
    markDirty('qOptions');
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '', is_correct: false }]);
    markDirty('qOptions');
  };

  const handleDeleteOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    markDirty('qOptions');
  };

  // ─── True/False helpers ───

  const handleCorrectAnswerChange = (value: boolean) => {
    setCorrectAnswer(value);
    markDirty('qAnswer');
  };

  return (
    <div className='border border-gray-200 rounded-lg p-4 bg-white mb-4'>
      {/* Question type badge + save indicator */}
      <div className='flex items-center gap-2 mb-3'>
        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#1B998B]/10 text-[#1B998B]'>
          <MessageSquare className='w-3 h-3' />
          {question.question_type === 'mcq' ? 'QCM' : 'Vrai / Faux'}
        </span>
      </div>

      {/* Question text */}
      <div className='flex items-center justify-between mb-1'>
        <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
          Question
        </label>
        {savingQuestionField === 'qText' && (
          <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
        )}
        {savedQuestionField === 'qText' && (
          <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
            <Check className='w-3 h-3' />
            Enregistré
          </span>
        )}
      </div>
      <textarea
        value={questionText}
        onChange={e => {
          setQuestionText(e.target.value);
          markDirty('qText');
        }}
        rows={2}
        className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 mb-3'
        placeholder='Texte de la question...'
      />

      {/* MCQ options */}
      {question.question_type === 'mcq' && (
        <div className='space-y-2 mb-3'>
          <div className='flex items-center justify-between'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
              Options
            </p>
            {savingQuestionField === 'qOptions' && (
              <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
            )}
            {savedQuestionField === 'qOptions' && (
              <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                <Check className='w-3 h-3' />
                Enregistré
              </span>
            )}
          </div>
          {options.map((option, index) => (
            <div
              key={index}
              className='flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100'
            >
              <button
                type='button'
                role='checkbox'
                aria-checked={option.is_correct}
                onClick={() =>
                  handleOptionCorrectChange(index, !option.is_correct)
                }
                className='flex items-center gap-2 shrink-0 cursor-pointer'
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                    option.is_correct
                      ? 'bg-[#1B998B] border-[#1B998B]'
                      : 'bg-white border-gray-300 hover:border-[#1B998B]/50'
                  }`}
                >
                  {option.is_correct && (
                    <svg
                      className='w-3 h-3 text-white'
                      viewBox='0 0 12 12'
                      fill='none'
                    >
                      <path
                        d='M2 6l3 3 5-6'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-xs font-medium ${option.is_correct ? 'text-[#1B998B]' : 'text-gray-500'}`}
                >
                  Correcte
                </span>
              </button>
              <input
                type='text'
                value={option.text}
                onChange={e => handleOptionTextChange(index, e.target.value)}
                className='flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                placeholder={`Option ${index + 1}`}
              />
              <button
                onClick={() => handleDeleteOption(index)}
                className='p-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors'
                title="Supprimer l'option"
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddOption}
            className='flex items-center gap-1.5 text-sm text-[#1B998B] hover:text-[#158578] transition-colors mt-1'
          >
            <Plus className='w-4 h-4' />
            Ajouter une option
          </button>
        </div>
      )}

      {/* True/False */}
      {question.question_type === 'true_false' && (
        <div className='mb-3'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
              Bonne réponse
            </p>
            {savingQuestionField === 'qAnswer' && (
              <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
            )}
            {savedQuestionField === 'qAnswer' && (
              <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                <Check className='w-3 h-3' />
                Enregistré
              </span>
            )}
          </div>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              onClick={() => handleCorrectAnswerChange(true)}
              className='flex items-center gap-2 cursor-pointer'
            >
              <span
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all ${
                  correctAnswer === true
                    ? 'border-[#1B998B]'
                    : 'border-gray-300'
                }`}
              >
                {correctAnswer === true && (
                  <span className='w-2.5 h-2.5 rounded-full bg-[#1B998B]' />
                )}
              </span>
              <span className='text-sm text-gray-700'>Vrai</span>
            </button>
            <button
              type='button'
              onClick={() => handleCorrectAnswerChange(false)}
              className='flex items-center gap-2 cursor-pointer'
            >
              <span
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all ${
                  correctAnswer === false
                    ? 'border-[#1B998B]'
                    : 'border-gray-300'
                }`}
              >
                {correctAnswer === false && (
                  <span className='w-2.5 h-2.5 rounded-full bg-[#1B998B]' />
                )}
              </span>
              <span className='text-sm text-gray-700'>Faux</span>
            </button>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div>
        <div className='flex items-center justify-between mb-1'>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
            Explication (optionnel)
          </p>
          {savingQuestionField === 'qExplanation' && (
            <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
          )}
          {savedQuestionField === 'qExplanation' && (
            <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
              <Check className='w-3 h-3' />
              Enregistré
            </span>
          )}
        </div>
        <textarea
          value={explanation}
          onChange={e => {
            setExplanation(e.target.value);
            markDirty('qExplanation');
          }}
          rows={2}
          className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
          placeholder='Explication affichée après la réponse...'
        />
      </div>
    </div>
  );
}
