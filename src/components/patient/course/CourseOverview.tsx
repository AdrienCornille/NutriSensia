'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, ArrowRight, Loader2, ClipboardList } from 'lucide-react';
import { usePatientCourseOverview } from '@/hooks/usePatientCourse';
import ChapterView from './ChapterView';
import CourseLockedMessage from './CourseLockedMessage';
import CourseBadge from './CourseBadge';

interface CourseOverviewProps {
  contentId: string;
  onNavigateToSection: (sectionId: string) => void;
  onNavigateToQuiz: (quizId: string) => void;
}

export default function CourseOverview({
  contentId,
  onNavigateToSection,
  onNavigateToQuiz,
}: CourseOverviewProps) {
  const { data, isLoading } = usePatientCourseOverview(contentId);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  // Build section progress map
  const progressMap = useMemo(() => {
    const map = new Map<string, boolean>();
    if (!data?.chapters) return map;
    for (const chapter of data.chapters) {
      for (const section of chapter.sections || []) {
        map.set(section.id, !!section.is_completed);
      }
    }
    return map;
  }, [data?.chapters]);

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!data) {
    return (
      <div className='py-12 text-center text-gray-500'>Cours introuvable.</div>
    );
  }

  // Locked state
  if (!data.canAccess && data.prerequisites?.length > 0) {
    const unmet = data.prerequisites.filter((p: any) => !p.is_met);
    return <CourseLockedMessage unmetPrerequisites={unmet} />;
  }

  const { course, chapters, quizzes, badge, completionPercent, nextSectionId } =
    data;
  const hasStarted = completionPercent > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='mx-auto max-w-3xl space-y-8'
    >
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>{course.title}</h1>
        {course.summary && (
          <p className='mt-2 text-gray-600'>{course.summary}</p>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className='mb-2 flex items-center justify-between text-sm'>
          <span className='font-medium text-gray-700'>Progression</span>
          <span className='font-semibold text-primary'>
            {Math.round(completionPercent)}%
          </span>
        </div>
        <div className='h-3 w-full overflow-hidden rounded-full bg-gray-200'>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className='h-full rounded-full bg-primary'
          />
        </div>
      </div>

      {/* CTA button */}
      {nextSectionId && (
        <button
          onClick={() => onNavigateToSection(nextSectionId)}
          className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:opacity-90'
        >
          {hasStarted ? (
            <>
              <PlayCircle className='h-5 w-5' />
              Reprendre où j&apos;en étais
            </>
          ) : (
            <>
              <ArrowRight className='h-5 w-5' />
              Commencer le cours
            </>
          )}
        </button>
      )}

      {/* Table of contents */}
      <div>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>
          Table des matières
        </h2>
        <div className='space-y-3'>
          {(chapters || []).map((chapter: any) => (
            <ChapterView
              key={chapter.id}
              chapter={chapter}
              progress={progressMap}
              onSectionClick={onNavigateToSection}
              expanded={expandedChapter === chapter.id}
              onToggle={() =>
                setExpandedChapter(prev =>
                  prev === chapter.id ? null : chapter.id
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Final quiz */}
      {quizzes?.length > 0 && (
        <div>
          <h2 className='mb-4 text-lg font-semibold text-gray-900'>
            Quiz final
          </h2>
          {quizzes.map((quiz: any) => (
            <button
              key={quiz.id}
              onClick={() => onNavigateToQuiz(quiz.id)}
              className='flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50'
            >
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
                <ClipboardList className='h-5 w-5 text-primary' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='font-medium text-gray-900'>
                  {quiz.title || 'Quiz'}
                </p>
                {quiz.description && (
                  <p className='text-sm text-gray-500'>{quiz.description}</p>
                )}
              </div>
              <ArrowRight className='h-5 w-5 flex-shrink-0 text-gray-400' />
            </button>
          ))}
        </div>
      )}

      {/* Badge preview */}
      {badge && (
        <div>
          <h2 className='mb-4 text-lg font-semibold text-gray-900'>
            Badge à obtenir
          </h2>
          <CourseBadge badge={badge} earned={completionPercent >= 100} />
        </div>
      )}
    </motion.div>
  );
}
