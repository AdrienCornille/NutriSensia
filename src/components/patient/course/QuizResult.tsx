'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from 'lucide-react';

interface QuizResultProps {
  score: number;
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctAnswers: number;
  results: {
    question_id: string;
    correct: boolean;
    explanation: string | null;
  }[];
  questions: {
    id: string;
    question_text: string;
    correct_answer: string[] | boolean;
  }[];
  onRetry: () => void;
  onBack: () => void;
}

export default function QuizResult({
  score,
  passed,
  passingScore,
  totalQuestions,
  correctAnswers,
  results,
  questions,
  onRetry,
  onBack,
}: QuizResultProps) {
  const scoreColor = passed ? 'text-green-600' : 'text-red-500';
  const barColor = passed ? 'bg-green-500' : 'bg-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='mx-auto max-w-2xl space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'
    >
      {/* Score display */}
      <div className='text-center'>
        <motion.p
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          className={`text-6xl font-bold ${scoreColor}`}
        >
          {Math.round(score)}%
        </motion.p>
        <p className={`mt-2 text-xl font-semibold ${scoreColor}`}>
          {passed ? 'Réussi !' : 'Non réussi'}
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div className='mb-1 flex justify-between text-sm text-gray-500'>
          <span>
            {correctAnswers}/{totalQuestions} bonnes réponses
          </span>
          <span>Minimum : {passingScore}%</span>
        </div>
        <div className='h-3 w-full overflow-hidden rounded-full bg-gray-200'>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${barColor}`}
          />
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className='space-y-4'>
        <h3 className='font-semibold text-gray-900'>Détail des réponses</h3>
        {results.map((result, idx) => {
          const question = questions.find(q => q.id === result.question_id);
          return (
            <div
              key={result.question_id}
              className={`rounded-xl border p-4 ${
                result.correct
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className='flex items-start gap-3'>
                {result.correct ? (
                  <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600' />
                ) : (
                  <XCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-500' />
                )}
                <div className='min-w-0 flex-1'>
                  <p className='font-medium text-gray-900'>
                    {idx + 1}. {question?.question_text ?? 'Question'}
                  </p>
                  {result.explanation && (
                    <p className='mt-1 text-sm text-gray-600'>
                      {result.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className='flex items-center justify-center gap-4'>
        {!passed && (
          <button
            onClick={onRetry}
            className='inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50'
          >
            <RotateCcw className='h-4 w-4' />
            Réessayer
          </button>
        )}
        <button
          onClick={onBack}
          className='inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:opacity-90'
        >
          {passed ? 'Continuer' : 'Retour au cours'}
          <ArrowRight className='h-4 w-4' />
        </button>
      </div>
    </motion.div>
  );
}
