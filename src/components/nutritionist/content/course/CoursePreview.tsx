'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  BookOpen,
  Loader2,
  FileText,
  ClipboardList,
  Circle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Eye,
} from 'lucide-react';
import {
  useCourseChapters,
  useChapterSections,
  useSectionBlocks,
  useCourseQuizzes,
  useQuizQuestions,
} from '@/hooks/useCourseBuilder';

// ─── Types ───

interface CoursePreviewProps {
  courseId: string;
  onClose: () => void;
}

// ─── Main component ───

export default function CoursePreview({
  courseId,
  onClose,
}: CoursePreviewProps) {
  const { data: chapters, isLoading } = useCourseChapters(courseId);
  const { data: allQuizzes } = useCourseQuizzes(courseId);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [selectedSectionChapterId, setSelectedSectionChapterId] = useState<
    string | null
  >(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
  const [mobileShowContent, setMobileShowContent] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const sortedChapters = useMemo(
    () =>
      [...(chapters || [])].sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      ),
    [chapters]
  );

  // Build flat section list for prev/next
  const allSections = useMemo(() => {
    const list: { chapterId: string; sectionId: string; title: string }[] = [];
    for (const ch of sortedChapters) {
      const sections = [...(ch.sections || [])].sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );
      for (const s of sections) {
        list.push({ chapterId: ch.id, sectionId: s.id, title: s.title });
      }
    }
    return list;
  }, [sortedChapters]);

  const currentSectionIndex = selectedSectionId
    ? allSections.findIndex(s => s.sectionId === selectedSectionId)
    : -1;

  const toggleChapter = useCallback((chapterId: string) => {
    setExpandedChapters(prev =>
      prev.has(chapterId) ? new Set() : new Set([chapterId])
    );
  }, []);

  const handleSelectSection = useCallback(
    (chapterId: string, sectionId: string) => {
      setSelectedSectionId(sectionId);
      setSelectedSectionChapterId(chapterId);
      setSelectedQuizId(null);
      setMobileShowContent(true);
      setExpandedChapters(new Set([chapterId]));
    },
    []
  );

  const handleSelectQuiz = useCallback((quizId: string) => {
    setSelectedQuizId(quizId);
    setSelectedSectionId(null);
    setSelectedSectionChapterId(null);
    setMobileShowContent(true);
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedSectionId(null);
    setSelectedSectionChapterId(null);
    setSelectedQuizId(null);
    setMobileShowContent(false);
  }, []);

  const handlePrev = useCallback(() => {
    if (currentSectionIndex > 0) {
      const prev = allSections[currentSectionIndex - 1];
      handleSelectSection(prev.chapterId, prev.sectionId);
    }
  }, [currentSectionIndex, allSections, handleSelectSection]);

  const handleNext = useCallback(() => {
    if (currentSectionIndex < allSections.length - 1) {
      const next = allSections[currentSectionIndex + 1];
      handleSelectSection(next.chapterId, next.sectionId);
    }
  }, [currentSectionIndex, allSections, handleSelectSection]);

  // Auto-expand first chapter on initial load only
  const hasAutoExpanded = useMemo(() => ({ current: false }), []);
  useEffect(() => {
    if (sortedChapters.length > 0 && !hasAutoExpanded.current) {
      hasAutoExpanded.current = true;
      setExpandedChapters(new Set([sortedChapters[0].id]));
    }
  }, [sortedChapters, hasAutoExpanded]);

  const isShowingContent = selectedSectionId || selectedQuizId;

  return (
    <AnimatePresence>
      <motion.div
        key='preview-backdrop'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-50 bg-black/50'
        onClick={onClose}
      >
        <motion.div
          key='preview-panel'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className='mx-auto my-6 flex h-[calc(100vh-48px)] max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl'
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-100 px-6 py-3'>
            <div className='flex items-center gap-3'>
              <BookOpen className='h-5 w-5 text-[#1B998B]' />
              <h2 className='text-base font-semibold text-gray-900'>
                Aperçu du cours
              </h2>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700'>
                <Eye className='h-3 w-3' />
                Vue patient
              </span>
            </div>
            <button
              onClick={onClose}
              className='rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
              aria-label='Fermer'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          {/* 2-column layout */}
          <div className='relative flex-1 overflow-hidden'>
            <div className='absolute inset-0 flex'>
              {/* Left sidebar — TOC (25%) */}
              <div
                className={`${
                  mobileShowContent && isShowingContent ? 'hidden' : 'flex'
                } w-full flex-col md:flex md:w-1/4 md:min-w-[260px]`}
              >
                <div className='relative flex-1 overflow-hidden'>
                  <div className='absolute inset-0 overflow-y-auto border-r border-gray-100 bg-gray-50/80 px-2 py-3'>
                    <div className='space-y-1'>
                      {isLoading ? (
                        <div className='flex h-32 items-center justify-center'>
                          <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                        </div>
                      ) : sortedChapters.length === 0 ? (
                        <div className='py-8 text-center text-sm text-gray-400'>
                          Aucun chapitre
                        </div>
                      ) : (
                        sortedChapters.map((chapter: any, idx: number) => {
                          const sections = [...(chapter.sections || [])].sort(
                            (a: any, b: any) =>
                              (a.sort_order ?? 0) - (b.sort_order ?? 0)
                          );
                          const isExpanded = expandedChapters.has(chapter.id);
                          const chapterQuiz = (allQuizzes || []).find(
                            (q: any) => q.chapter_id === chapter.id
                          );

                          return (
                            <div key={chapter.id}>
                              {/* Chapter header */}
                              <button
                                onClick={() => toggleChapter(chapter.id)}
                                className='flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-gray-100'
                              >
                                <div
                                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    isExpanded
                                      ? 'bg-[#1B998B]/10 text-[#1B998B]'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {idx + 1}
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <p className='text-sm font-medium text-gray-800 line-clamp-1'>
                                    {chapter.title}
                                  </p>
                                  <p className='text-xs text-gray-400'>
                                    {sections.length} section
                                    {sections.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                                <ChevronDown
                                  className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>

                              {/* Sections */}
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
                                        const isSelected =
                                          selectedSectionId === section.id;
                                        return (
                                          <button
                                            key={section.id}
                                            onClick={() =>
                                              handleSelectSection(
                                                chapter.id,
                                                section.id
                                              )
                                            }
                                            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                                              isSelected
                                                ? 'border-l-[3px] border-[#1B998B] bg-[#1B998B]/8 font-medium text-gray-900'
                                                : 'border-l-[3px] border-transparent text-gray-600 hover:bg-gray-100'
                                            }`}
                                          >
                                            <Circle
                                              className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-[#1B998B]' : 'text-gray-300'}`}
                                            />
                                            <span className='line-clamp-1'>
                                              {section.title}
                                            </span>
                                          </button>
                                        );
                                      })}

                                      {/* Chapter quiz */}
                                      {chapterQuiz && (
                                        <button
                                          onClick={() =>
                                            handleSelectQuiz(chapterQuiz.id)
                                          }
                                          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                                            selectedQuizId === chapterQuiz.id
                                              ? 'border-l-[3px] border-[#1B998B] bg-[#1B998B]/8 font-medium text-gray-900'
                                              : 'border-l-[3px] border-transparent text-gray-600 hover:bg-gray-100'
                                          }`}
                                        >
                                          <ClipboardList
                                            className={`h-4 w-4 flex-shrink-0 ${selectedQuizId === chapterQuiz.id ? 'text-[#1B998B]' : 'text-amber-500'}`}
                                          />
                                          <span className='line-clamp-1'>
                                            {chapterQuiz.title || 'Quiz'}
                                          </span>
                                        </button>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })
                      )}

                      {/* Final quiz */}
                      {(allQuizzes || [])
                        .filter((q: any) => !q.chapter_id)
                        .map((quiz: any) => (
                          <button
                            key={quiz.id}
                            onClick={() => handleSelectQuiz(quiz.id)}
                            className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-left transition-colors ${
                              selectedQuizId === quiz.id
                                ? 'bg-[#1B998B]/8 font-medium text-gray-900'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600'>
                              <ClipboardList className='h-3.5 w-3.5' />
                            </div>
                            <span className='text-sm line-clamp-1'>
                              {quiz.title || 'Quiz final'}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right content area (75%) */}
              <div
                className={`${
                  !mobileShowContent && isShowingContent ? 'hidden' : ''
                } ${!isShowingContent && !mobileShowContent ? 'hidden md:flex' : 'flex'} w-full flex-col md:flex md:flex-1`}
              >
                <div className='relative flex-1 overflow-hidden'>
                  <div className='absolute inset-0 overflow-y-auto bg-white'>
                    <div className='p-6 md:p-8'>
                      {selectedSectionId && selectedSectionChapterId ? (
                        <PreviewSectionContent
                          courseId={courseId}
                          chapterId={selectedSectionChapterId}
                          sectionId={selectedSectionId}
                          sectionTitle={
                            allSections.find(
                              s => s.sectionId === selectedSectionId
                            )?.title || ''
                          }
                          hasPrev={currentSectionIndex > 0}
                          hasNext={currentSectionIndex < allSections.length - 1}
                          onPrev={handlePrev}
                          onNext={handleNext}
                          onBack={handleDeselectAll}
                          currentIndex={currentSectionIndex}
                          totalSections={allSections.length}
                        />
                      ) : selectedQuizId ? (
                        <PreviewQuizContent
                          courseId={courseId}
                          quizId={selectedQuizId}
                          onBack={handleDeselectAll}
                        />
                      ) : (
                        /* Empty / welcome state */
                        <div className='flex h-full flex-col items-center justify-center py-16 text-center'>
                          <BookOpen className='h-12 w-12 text-gray-200 mb-4' />
                          <h3 className='text-base font-medium text-gray-500'>
                            Sélectionnez une section
                          </h3>
                          <p className='mt-1 text-sm text-gray-400 max-w-sm'>
                            Cliquez sur une section dans le sommaire à gauche
                            pour prévisualiser son contenu tel que le patient le
                            verra.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Preview Section Content ───

function PreviewSectionContent({
  courseId,
  chapterId,
  sectionId,
  sectionTitle,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onBack,
  currentIndex,
  totalSections,
}: {
  courseId: string;
  chapterId: string;
  sectionId: string;
  sectionTitle: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
  currentIndex: number;
  totalSections: number;
}) {
  const { data: blocks, isLoading } = useSectionBlocks(
    courseId,
    chapterId,
    sectionId
  );

  const sorted = useMemo(
    () =>
      [...(blocks || [])].sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      ),
    [blocks]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={sectionId}
    >
      {/* Mobile back */}
      <button
        onClick={onBack}
        className='mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 md:hidden'
      >
        <ArrowLeft className='h-4 w-4' />
        Sommaire
      </button>

      {/* Position */}
      <p className='mb-2 text-xs text-gray-400'>
        Section {currentIndex + 1} sur {totalSections}
      </p>

      {/* Title */}
      <h1 className='mb-6 text-2xl font-bold text-gray-900'>{sectionTitle}</h1>

      {/* Blocks */}
      {isLoading ? (
        <div className='flex h-40 items-center justify-center'>
          <Loader2 className='h-6 w-6 animate-spin text-[#1B998B]' />
        </div>
      ) : sorted.length === 0 ? (
        <p className='py-8 text-center text-gray-400'>
          Cette section ne contient aucun contenu.
        </p>
      ) : (
        <div className='space-y-6'>
          {sorted.map((block: any) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      )}

      {/* Prev / Next */}
      <div className='mt-10 flex items-center justify-between border-t border-gray-100 pt-6'>
        {hasPrev ? (
          <button
            onClick={onPrev}
            className='inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
          >
            <ChevronLeft className='h-4 w-4' />
            Précédent
          </button>
        ) : (
          <span />
        )}
        {hasNext ? (
          <button
            onClick={onNext}
            className='inline-flex items-center gap-1 text-sm font-medium text-[#1B998B] hover:opacity-80 transition-colors'
          >
            Suivant
            <ChevronRight className='h-4 w-4' />
          </button>
        ) : (
          <span />
        )}
      </div>
    </motion.div>
  );
}

// ─── Preview Quiz Content ───

function PreviewQuizContent({
  courseId,
  quizId,
  onBack,
}: {
  courseId: string;
  quizId: string;
  onBack: () => void;
}) {
  const { data: questions, isLoading } = useQuizQuestions(courseId, quizId);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  // Reset when quiz changes
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
  }, [quizId]);

  const handleMcqAnswer = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => {
      const current = prev[questionId] || [];
      const updated = current.includes(optionIndex)
        ? current.filter((i: number) => i !== optionIndex)
        : [...current, optionIndex];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleTfAnswer = (questionId: string, value: boolean) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const getScore = () => {
    let correct = 0;
    (questions || []).forEach((q: any) => {
      if (q.question_type === 'mcq') {
        const selected = answers[q.id] || [];
        const correctIndices = (q.options || [])
          .map((o: any, i: number) => (o.is_correct ? i : -1))
          .filter((i: number) => i !== -1);
        const isCorrect =
          selected.length === correctIndices.length &&
          selected.every((i: number) => correctIndices.includes(i));
        if (isCorrect) correct++;
      } else {
        if (answers[q.id] === q.correct_answer) correct++;
      }
    });
    return (questions || []).length > 0
      ? Math.round((correct / (questions || []).length) * 100)
      : 0;
  };

  if (isLoading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-[#1B998B]' />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={quizId}
      className='space-y-6'
    >
      {/* Mobile back */}
      <button
        onClick={onBack}
        className='inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 md:hidden'
      >
        <ArrowLeft className='h-4 w-4' />
        Sommaire
      </button>

      <h1 className='text-2xl font-bold text-gray-900'>Quiz</h1>

      {(questions || []).map((q: any, qIndex: number) => (
        <div
          key={q.id}
          className='rounded-xl border border-gray-200 bg-white p-5'
        >
          <p className='text-sm font-medium text-gray-900 mb-3'>
            {qIndex + 1}. {q.question_text}
          </p>

          {q.question_type === 'mcq' ? (
            <div className='space-y-2'>
              {(q.options || []).map((opt: any, oIndex: number) => {
                const selected = (answers[q.id] || []).includes(oIndex);
                const isCorrect = opt.is_correct;
                const showResult = submitted;
                return (
                  <button
                    key={oIndex}
                    type='button'
                    onClick={() => handleMcqAnswer(q.id, oIndex)}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left text-sm transition-colors ${
                      showResult
                        ? isCorrect
                          ? 'border-green-300 bg-green-50'
                          : selected
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        : selected
                          ? 'border-[#1B998B] bg-[#1B998B]/5'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${
                        selected
                          ? 'bg-[#1B998B] border-[#1B998B]'
                          : 'border-gray-300'
                      }`}
                    >
                      {selected && (
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
                    <span className='flex-1'>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className='flex items-center gap-4'>
              {[true, false].map(value => {
                const selected = answers[q.id] === value;
                const isCorrect = q.correct_answer === value;
                const showResult = submitted;
                return (
                  <button
                    key={String(value)}
                    type='button'
                    onClick={() => handleTfAnswer(q.id, value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                      showResult
                        ? isCorrect
                          ? 'border-green-300 bg-green-50'
                          : selected
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        : selected
                          ? 'border-[#1B998B] bg-[#1B998B]/5'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span
                      className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                        selected ? 'border-[#1B998B]' : 'border-gray-300'
                      }`}
                    >
                      {selected && (
                        <span className='w-2.5 h-2.5 rounded-full bg-[#1B998B]' />
                      )}
                    </span>
                    {value ? 'Vrai' : 'Faux'}
                  </button>
                );
              })}
            </div>
          )}

          {submitted && q.explanation && (
            <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-xs font-medium text-blue-700 mb-1'>
                Explication
              </p>
              <p className='text-sm text-blue-600'>{q.explanation}</p>
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={(questions || []).length === 0}
          className='w-full py-3 bg-[#1B998B] text-white text-sm font-medium rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50'
        >
          Valider mes réponses
        </button>
      ) : (
        <div className='text-center p-4 bg-white border border-gray-200 rounded-xl'>
          <p className='text-2xl font-bold text-gray-900'>{getScore()}%</p>
          <p className='text-sm text-gray-500 mt-1'>Score obtenu</p>
          <button
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            className='mt-3 px-4 py-2 text-sm text-[#1B998B] border border-[#1B998B] rounded-lg hover:bg-[#1B998B]/5 transition-colors'
          >
            Recommencer
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Block renderer ───

function BlockRenderer({ block }: { block: any }) {
  switch (block.block_type) {
    case 'rich_text':
      return (
        <div
          className='prose prose-gray max-w-none'
          dangerouslySetInnerHTML={{ __html: block.body || '' }}
        />
      );
    case 'video': {
      const url = block.media_url || '';
      const embedUrl = toEmbedUrl(url);
      return (
        <div className='aspect-video overflow-hidden rounded-xl bg-black'>
          <iframe
            src={embedUrl}
            className='h-full w-full'
            allowFullScreen
            title='Vidéo'
          />
        </div>
      );
    }
    case 'image':
      return (
        <figure className='overflow-hidden rounded-xl'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.file_url || block.media_url}
            alt=''
            className='w-full object-cover'
          />
        </figure>
      );
    case 'pdf':
      return (
        <a
          href={block.file_url || block.media_url}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100'
        >
          <FileDown className='h-6 w-6 text-[#1B998B]' />
          <span className='font-medium text-gray-700'>
            {block.file_name || 'Télécharger le document PDF'}
          </span>
        </a>
      );
    default:
      return null;
  }
}

// ─── Helpers ───

function toEmbedUrl(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
  return url;
}
