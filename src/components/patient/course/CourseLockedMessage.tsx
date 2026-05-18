'use client';

import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';

interface UnmetPrerequisite {
  course_id: string;
  course_title: string;
  require_completion: boolean;
  require_quiz_score: boolean;
  current_completion: number;
  current_quiz_score: number;
  min_quiz_score: number;
}

interface CourseLockedMessageProps {
  unmetPrerequisites: UnmetPrerequisite[];
}

export default function CourseLockedMessage({
  unmetPrerequisites,
}: CourseLockedMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm'
    >
      <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
        <Lock className='h-8 w-8 text-gray-400' />
      </div>

      <h2 className='mb-2 text-xl font-bold text-gray-900'>
        Ce cours nécessite des prérequis
      </h2>
      <p className='mb-6 text-sm text-gray-500'>
        Terminez les cours suivants pour débloquer l&apos;accès.
      </p>

      <ul className='space-y-3 text-left'>
        {unmetPrerequisites.map(prereq => (
          <li
            key={prereq.course_id}
            className='rounded-xl border border-gray-100 bg-gray-50 p-4'
          >
            <p className='mb-1 font-semibold text-gray-900'>
              {prereq.course_title}
            </p>

            <div className='space-y-1 text-sm text-gray-600'>
              {prereq.require_completion && (
                <p>
                  Complétion : {Math.round(prereq.current_completion)}%{' '}
                  <span className='text-gray-400'>(requis : 100%)</span>
                </p>
              )}
              {prereq.require_quiz_score && (
                <p>
                  Score quiz : {Math.round(prereq.current_quiz_score)}%{' '}
                  <span className='text-gray-400'>
                    (requis : {prereq.min_quiz_score}%)
                  </span>
                </p>
              )}
            </div>

            <a
              href={`#course-${prereq.course_id}`}
              className='mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'
            >
              Accéder au cours <ArrowRight className='h-3 w-3' />
            </a>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
