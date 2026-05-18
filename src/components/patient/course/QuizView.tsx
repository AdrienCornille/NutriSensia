'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useSubmitQuiz, type QuizSubmitResult } from '@/hooks/usePatientCourse';
import QuizResult from './QuizResult';

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'true_false';
  options?: { text: string; is_correct: boolean }[];
  correct_answer: boolean | null;
}

interface QuizViewProps {
  contentId: string;
  quizId: string;
  questions?: Question[];
  passingScore?: number;
  onBack: () => void;
  onComplete: () => void;
}

export default function QuizView({
  contentId,
  quizId,
  questions: propQuestions,
  passingScore: propPassingScore,
  onBack,
  onComplete,
}: QuizViewProps) {
  const [fetchedQuestions, setFetchedQuestions] = useState<Question[]>([]);
  const [fetchedPassingScore, setFetchedPassingScore] = useState(70);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(!propQuestions);

  const questions = propQuestions || fetchedQuestions;
  const passingScore = propPassingScore ?? fetchedPassingScore;

  useEffect(() => {
    if (propQuestions) return;
    setIsLoadingQuiz(true);
    fetch(`/api/protected/content/${contentId}/quizzes/${quizId}`, {
      credentials: 'include',
    })
      .then(r => r.json())
      .then(json => {
        const quiz = json.data;
        if (quiz) {
          setFetchedQuestions(quiz.questions || []);
          setFetchedPassingScore(quiz.passing_score || 70);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingQuiz(false));
  }, [contentId, quizId, propQuestions]);
  const [answers, setAnswers] = useState<Record<string, string[] | boolean>>(
    {}
  );
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const submitQuiz = useSubmitQuiz();

  const allAnswered = questions.every(q => {
    const a = answers[q.id];
    if (a === undefined || a === null) return false;
    if (Array.isArray(a)) return a.length > 0;
    return true;
  });

  const handleMcqToggle = useCallback((questionId: string, option: string) => {
    setAnswers(prev => {
      const current = (prev[questionId] as string[]) || [];
      const next = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: next };
    });
  }, []);

  const handleTrueFalse = useCallback((questionId: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    const formatted = questions.map(q => ({
      question_id: q.id,
      ...(q.question_type === 'mcq'
        ? { selected_options: ((answers[q.id] as string[]) || []).map(Number) }
        : { answer: answers[q.id] as boolean }),
    }));

    submitQuiz.mutate(
      { contentId, quizId, answers: formatted },
      {
        onSuccess: data => {
          setResult(data);
        },
      }
    );
  }, [submitQuiz, contentId, quizId, answers, questions]);

  const handleRetry = useCallback(() => {
    setAnswers({});
    setResult(null);
  }, []);

  if (isLoadingQuiz) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='h-6 w-6 animate-spin text-primary' />
      </div>
    );
  }

  // Show results
  if (result) {
    return (
      <QuizResult
        score={result.score}
        passed={result.passed}
        passingScore={passingScore}
        totalQuestions={result.total_questions}
        correctAnswers={result.correct_answers}
        results={result.results}
        questions={questions}
        onRetry={handleRetry}
        onBack={result.passed ? onComplete : onBack}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='mx-auto max-w-2xl'
    >
      {/* Header */}
      <div className='mb-6'>
        <button
          onClick={onBack}
          className='mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900'
        >
          <ArrowLeft className='h-4 w-4' />
          Retour au cours
        </button>
        <h1 className='text-2xl font-bold text-gray-900'>Quiz</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Score minimum : {passingScore}%
        </p>
      </div>

      {/* Questions */}
      <div className='space-y-6'>
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className='rounded-xl border border-gray-200 bg-white p-5'
          >
            <p className='mb-4 font-medium text-gray-900'>
              {idx + 1}. {q.question_text}
            </p>

            {q.question_type === 'true_false' ? (
              <div className='flex gap-3'>
                {[
                  { label: 'Vrai', value: true },
                  { label: 'Faux', value: false },
                ].map(({ label, value }) => (
                  <label
                    key={label}
                    className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                      answers[q.id] === value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type='radio'
                      name={`q-${q.id}`}
                      className='sr-only'
                      checked={answers[q.id] === value}
                      onChange={() => handleTrueFalse(q.id, value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            ) : (
              <div className='space-y-2'>
                {(q.options || []).map((option, optIdx) => {
                  const optionKey = String(optIdx);
                  const selected = ((answers[q.id] as string[]) || []).includes(
                    optionKey
                  );
                  return (
                    <label
                      key={optIdx}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 text-sm transition-colors ${
                        selected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type='checkbox'
                        className='sr-only'
                        checked={selected}
                        onChange={() => handleMcqToggle(q.id, optionKey)}
                      />
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${
                          selected
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {selected && (
                          <svg
                            className='h-3 w-3'
                            viewBox='0 0 12 12'
                            fill='none'
                          >
                            <path
                              d='M2 6l3 3 5-5'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        )}
                      </span>
                      {typeof option === 'string' ? option : option.text}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className='mt-8 flex justify-center'>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitQuiz.isPending}
          className='inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {submitQuiz.isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Send className='h-4 w-4' />
          )}
          Soumettre
        </button>
      </div>
    </motion.div>
  );
}
