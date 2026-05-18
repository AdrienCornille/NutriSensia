'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Lock,
  ChevronDown,
  ClipboardList,
  PlayCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Award,
  Star,
} from 'lucide-react';
import { usePatientCourseOverview } from '@/hooks/usePatientCourse';
import SectionView from './SectionView';
import QuizView from './QuizView';
import CourseBadge from './CourseBadge';

interface CoursePlayerLayoutProps {
  contentId: string;
  onBack: () => void;
}

export default function CoursePlayerLayout({
  contentId,
  onBack,
}: CoursePlayerLayoutProps) {
  const { data, isLoading } = usePatientCourseOverview(contentId);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
  // Mobile: show sidebar (toc) or content
  const [mobileShowContent, setMobileShowContent] = useState(false);

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

  // Build a flat ordered list of all section IDs for prev/next navigation
  const allSectionIds = useMemo(() => {
    if (!data?.chapters) return [];
    const ids: string[] = [];
    for (const chapter of data.chapters) {
      for (const section of chapter.sections || []) {
        ids.push(section.id);
      }
    }
    return ids;
  }, [data?.chapters]);

  // Find which chapter contains a given section
  const chapterForSection = useCallback(
    (sectionId: string): string | null => {
      if (!data?.chapters) return null;
      for (const chapter of data.chapters) {
        for (const section of chapter.sections || []) {
          if (section.id === sectionId) return chapter.id;
        }
      }
      return null;
    },
    [data?.chapters]
  );

  // Auto-select nextSectionId on first load and expand its chapter
  useEffect(() => {
    if (data?.nextSectionId && !selectedSectionId && !selectedQuizId) {
      // Don't auto-navigate, but expand the chapter containing the next section
      const chapterId = chapterForSection(data.nextSectionId);
      if (chapterId) {
        setExpandedChapters(prev => new Set(prev).add(chapterId));
      }
    }
  }, [
    data?.nextSectionId,
    selectedSectionId,
    selectedQuizId,
    chapterForSection,
  ]);

  const toggleChapter = useCallback((chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  }, []);

  const handleSelectSection = useCallback(
    (sectionId: string) => {
      setSelectedSectionId(sectionId);
      setSelectedQuizId(null);
      setMobileShowContent(true);
      // Expand the chapter containing this section
      const chapterId = chapterForSection(sectionId);
      if (chapterId) {
        setExpandedChapters(prev => new Set(prev).add(chapterId));
      }
    },
    [chapterForSection]
  );

  const handleSelectQuiz = useCallback((quizId: string) => {
    setSelectedQuizId(quizId);
    setSelectedSectionId(null);
    setMobileShowContent(true);
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedSectionId(null);
    setSelectedQuizId(null);
    setMobileShowContent(false);
  }, []);

  const handleNextSection = useCallback(
    (nextId: string) => {
      handleSelectSection(nextId);
    },
    [handleSelectSection]
  );

  const handlePrevSection = useCallback(
    (prevId: string) => {
      handleSelectSection(prevId);
    },
    [handleSelectSection]
  );

  const handleQuizComplete = useCallback(() => {
    handleDeselectAll();
  }, [handleDeselectAll]);

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

  const { course, chapters, quizzes, badge, completionPercent, nextSectionId } =
    data;
  const hasStarted = completionPercent > 0;
  const isShowingContent = selectedSectionId || selectedQuizId;

  return (
    <div className='flex h-full flex-col'>
      {/* Mobile back bar */}
      <div className='flex items-center gap-2 border-b border-gray-100 bg-white px-4 py-3 md:hidden'>
        {mobileShowContent && isShowingContent ? (
          <button
            onClick={handleDeselectAll}
            className='inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900'
          >
            <ArrowLeft className='h-4 w-4' />
            Table des matieres
          </button>
        ) : (
          <button
            onClick={onBack}
            className='inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900'
          >
            <ArrowLeft className='h-4 w-4' />
            Retour au contenu
          </button>
        )}
      </div>

      {/* Desktop 2-column layout */}
      <div className='relative flex-1 overflow-hidden'>
        <div className='absolute inset-0 flex'>
          {/* Left sidebar - Table of Contents */}
          <div
            className={`${
              mobileShowContent && isShowingContent ? 'hidden' : 'flex'
            } w-full flex-col md:flex md:w-1/4 md:min-w-[280px] md:max-w-[360px]`}
          >
            <div className='relative flex-1 overflow-hidden'>
              <div className='absolute inset-0 overflow-y-auto border-r border-gray-100 bg-gray-50/80'>
                <SidebarContent
                  course={course}
                  chapters={chapters}
                  quizzes={quizzes}
                  badge={badge}
                  completionPercent={completionPercent}
                  hasStarted={hasStarted}
                  nextSectionId={nextSectionId}
                  progressMap={progressMap}
                  expandedChapters={expandedChapters}
                  selectedSectionId={selectedSectionId}
                  selectedQuizId={selectedQuizId}
                  onToggleChapter={toggleChapter}
                  onSelectSection={handleSelectSection}
                  onSelectQuiz={handleSelectQuiz}
                  onBack={onBack}
                />
              </div>
            </div>
          </div>

          {/* Right content area */}
          <div
            className={`${
              !mobileShowContent && isShowingContent ? 'hidden' : ''
            } ${!isShowingContent && !mobileShowContent ? 'hidden md:flex' : 'flex'} w-full flex-col md:flex md:flex-1`}
          >
            <div className='relative flex-1 overflow-hidden'>
              <div className='absolute inset-0 overflow-y-auto bg-white'>
                <div className='p-6 md:p-8'>
                  <ContentArea
                    contentId={contentId}
                    course={course}
                    chapters={chapters}
                    completionPercent={completionPercent}
                    hasStarted={hasStarted}
                    nextSectionId={nextSectionId}
                    selectedSectionId={selectedSectionId}
                    selectedQuizId={selectedQuizId}
                    onSelectSection={handleSelectSection}
                    onDeselectAll={handleDeselectAll}
                    onNextSection={handleNextSection}
                    onPrevSection={handlePrevSection}
                    onQuizComplete={handleQuizComplete}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Content ───

interface SidebarContentProps {
  course: any;
  chapters: any[];
  quizzes: any[];
  badge: any | null;
  completionPercent: number;
  hasStarted: boolean;
  nextSectionId: string | null;
  progressMap: Map<string, boolean>;
  expandedChapters: Set<string>;
  selectedSectionId: string | null;
  selectedQuizId: string | null;
  onToggleChapter: (id: string) => void;
  onSelectSection: (id: string) => void;
  onSelectQuiz: (id: string) => void;
  onBack: () => void;
}

function SidebarContent({
  course,
  chapters,
  quizzes,
  badge,
  completionPercent,
  hasStarted,
  nextSectionId,
  progressMap,
  expandedChapters,
  selectedSectionId,
  selectedQuizId,
  onToggleChapter,
  onSelectSection,
  onSelectQuiz,
  onBack,
}: SidebarContentProps) {
  return (
    <div className='flex flex-col'>
      {/* Back button (desktop) */}
      <div className='hidden px-4 pt-4 md:block'>
        <button
          onClick={onBack}
          className='inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700'
        >
          <ArrowLeft className='h-3.5 w-3.5' />
          Retour
        </button>
      </div>

      {/* Course title + progress */}
      <div className='px-4 pb-3 pt-4'>
        <h2 className='text-sm font-semibold text-gray-900 line-clamp-2'>
          {course.title}
        </h2>
        <div className='mt-3'>
          <div className='flex items-center justify-between text-xs text-gray-500'>
            <span>Progression</span>
            <span className='font-semibold text-primary'>
              {Math.round(completionPercent)}%
            </span>
          </div>
          <div className='mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className='h-full rounded-full bg-primary'
            />
          </div>
        </div>
      </div>

      {/* CTA button */}
      {nextSectionId && !selectedSectionId && !selectedQuizId && (
        <div className='px-4 pb-3'>
          <button
            onClick={() => onSelectSection(nextSectionId)}
            className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90'
          >
            {hasStarted ? (
              <>
                <PlayCircle className='h-4 w-4' />
                Reprendre
              </>
            ) : (
              <>
                <ArrowRight className='h-4 w-4' />
                Commencer
              </>
            )}
          </button>
        </div>
      )}

      {/* Divider */}
      <div className='mx-4 border-t border-gray-200' />

      {/* Chapters */}
      <div className='flex-1 px-2 py-3'>
        <div className='space-y-1'>
          {(chapters || []).map((chapter: any) => {
            const sections = chapter.sections || [];
            const completedCount = sections.filter((s: any) =>
              progressMap.get(s.id)
            ).length;
            const totalCount = sections.length;
            const allDone = totalCount > 0 && completedCount === totalCount;
            const isExpanded = expandedChapters.has(chapter.id);

            return (
              <div key={chapter.id}>
                {/* Chapter header */}
                <button
                  onClick={() => onToggleChapter(chapter.id)}
                  className='flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-gray-100'
                >
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isExpanded
                        ? 'bg-primary/10 text-primary'
                        : allDone
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {allDone && !isExpanded ? (
                      <CheckCircle2 className='h-4 w-4' />
                    ) : (
                      chapter.chapter_number
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium text-gray-900 line-clamp-1'>
                      {chapter.title}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {completedCount}/{totalCount}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Sections inside chapter */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className='overflow-hidden'
                    >
                      <div className='ml-4 space-y-0.5 pb-1 pl-2'>
                        {sections.map((section: any) => {
                          const completed = progressMap.get(section.id);
                          const locked = section.is_locked;
                          const isSelected = selectedSectionId === section.id;

                          return (
                            <button
                              key={section.id}
                              onClick={() =>
                                !locked && onSelectSection(section.id)
                              }
                              disabled={locked}
                              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                                isSelected
                                  ? 'border-l-[3px] border-[#1B998B] bg-[#1B998B]/8 font-medium text-gray-900'
                                  : locked
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:bg-gray-100'
                              }`}
                            >
                              {locked ? (
                                <Lock className='h-4 w-4 flex-shrink-0 text-gray-300' />
                              ) : completed ? (
                                <CheckCircle2 className='h-4 w-4 flex-shrink-0 text-green-500' />
                              ) : (
                                <Circle className='h-4 w-4 flex-shrink-0 text-gray-300' />
                              )}
                              <span
                                className={`line-clamp-1 ${
                                  isSelected
                                    ? 'text-gray-900'
                                    : completed
                                      ? 'text-gray-700'
                                      : 'text-gray-600'
                                }`}
                              >
                                {section.title}
                              </span>
                            </button>
                          );
                        })}

                        {/* Chapter-level quizzes — if we have quiz data associated with this chapter */}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Final quiz */}
        {quizzes?.length > 0 && (
          <div className='mt-3 space-y-1 border-t border-gray-200 px-2 pt-3'>
            {quizzes.map((quiz: any) => {
              const isSelected = selectedQuizId === quiz.id;
              return (
                <button
                  key={quiz.id}
                  onClick={() => onSelectQuiz(quiz.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'border-l-[3px] border-[#1B998B] bg-[#1B998B]/8 font-medium text-gray-900'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
                    <ClipboardList className='h-4 w-4 text-primary' />
                  </div>
                  <span className='line-clamp-1 text-gray-900'>
                    {quiz.title || 'Quiz final'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Badge preview */}
        {badge && (
          <div className='mt-3 border-t border-gray-200 px-2 pt-3'>
            <div
              className={`flex items-center gap-3 rounded-lg p-3 ${
                completionPercent >= 100
                  ? 'bg-yellow-50'
                  : 'bg-gray-50 opacity-60 grayscale'
              }`}
            >
              <span
                className='text-2xl'
                role='img'
                aria-label={badge.badge_name}
              >
                {badge.badge_icon || '🏅'}
              </span>
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-semibold text-gray-900 line-clamp-1'>
                  {badge.badge_name}
                </p>
                <div className='flex items-center gap-1 text-xs text-gray-500'>
                  <Star className='h-3 w-3 text-yellow-500' />
                  <span>{badge.points_awarded} pts</span>
                </div>
              </div>
              {completionPercent >= 100 && (
                <Award className='h-4 w-4 flex-shrink-0 text-yellow-600' />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Content Area ───

interface ContentAreaProps {
  contentId: string;
  course: any;
  chapters: any[];
  completionPercent: number;
  hasStarted: boolean;
  nextSectionId: string | null;
  selectedSectionId: string | null;
  selectedQuizId: string | null;
  onSelectSection: (id: string) => void;
  onDeselectAll: () => void;
  onNextSection: (id: string) => void;
  onPrevSection: (id: string) => void;
  onQuizComplete: () => void;
}

function ContentArea({
  contentId,
  course,
  chapters,
  completionPercent,
  hasStarted,
  nextSectionId,
  selectedSectionId,
  selectedQuizId,
  onSelectSection,
  onDeselectAll,
  onNextSection,
  onPrevSection,
  onQuizComplete,
}: ContentAreaProps) {
  // Section view
  if (selectedSectionId) {
    return (
      <SectionView
        contentId={contentId}
        sectionId={selectedSectionId}
        onBack={onDeselectAll}
        onNext={onNextSection}
        onPrev={onPrevSection}
      />
    );
  }

  // Quiz view
  if (selectedQuizId) {
    return (
      <QuizView
        contentId={contentId}
        quizId={selectedQuizId}
        onBack={onDeselectAll}
        onComplete={onQuizComplete}
      />
    );
  }

  // Welcome / overview state
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='mx-auto max-w-2xl py-8'
    >
      <div className='text-center'>
        <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10'>
          <PlayCircle className='h-8 w-8 text-primary' />
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>{course.title}</h1>
        {course.summary && (
          <p className='mx-auto mt-3 max-w-lg text-gray-600'>
            {course.summary}
          </p>
        )}

        {/* Progress */}
        <div className='mx-auto mt-6 max-w-xs'>
          <div className='mb-2 flex items-center justify-between text-sm'>
            <span className='text-gray-500'>Progression</span>
            <span className='font-semibold text-primary'>
              {Math.round(completionPercent)}%
            </span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className='h-full rounded-full bg-primary'
            />
          </div>
        </div>

        {/* Stats */}
        <div className='mt-6 flex items-center justify-center gap-6 text-sm text-gray-500'>
          <span>
            {chapters?.length || 0} chapitre
            {(chapters?.length || 0) > 1 ? 's' : ''}
          </span>
          <span className='h-1 w-1 rounded-full bg-gray-300' />
          <span>
            {chapters?.reduce(
              (acc: number, ch: any) => acc + (ch.sections?.length || 0),
              0
            ) || 0}{' '}
            sections
          </span>
        </div>

        {/* CTA */}
        {nextSectionId && (
          <button
            onClick={() => onSelectSection(nextSectionId)}
            className='mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-medium text-white transition-colors hover:opacity-90'
          >
            {hasStarted ? (
              <>
                <PlayCircle className='h-5 w-5' />
                Reprendre ou j&apos;en etais
              </>
            ) : (
              <>
                <ArrowRight className='h-5 w-5' />
                Commencer le cours
              </>
            )}
          </button>
        )}

        {completionPercent >= 100 && (
          <div className='mt-8 inline-flex items-center gap-2 rounded-xl bg-green-50 px-6 py-3 font-medium text-green-700'>
            <CheckCircle2 className='h-5 w-5' />
            Cours termine !
          </div>
        )}
      </div>
    </motion.div>
  );
}
