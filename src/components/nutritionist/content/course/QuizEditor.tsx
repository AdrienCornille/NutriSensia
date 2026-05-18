'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Trash2,
  Loader2,
  ListChecks,
  ToggleLeft,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useQuizQuestions,
  useCreateQuestion,
  useDeleteQuestion,
  useUpdateQuiz,
  useReorderQuestions,
} from '@/hooks/useCourseBuilder';
import { QuestionEditor } from './QuestionEditor';

// ─── Sortable Question Wrapper ───

function SortableQuestionItem({
  question,
  index,
  totalCount,
  courseId,
  quizId,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  question: any;
  index: number;
  totalCount: number;
  courseId: string;
  quizId: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Header bar with drag handle, number, reorder and delete */}
      <div className='flex items-center gap-2 mb-1'>
        <button
          type='button'
          className='touch-none p-0.5 rounded hover:bg-gray-200 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors'
          {...attributes}
          {...listeners}
          title='Glisser pour réorganiser'
        >
          <GripVertical className='h-4 w-4' />
        </button>
        <div className='w-6 h-6 rounded-full bg-[#1B998B] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0'>
          {index + 1}
        </div>
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className='p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors'
          title='Monter'
        >
          <ChevronUp className='w-4 h-4' />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === totalCount - 1}
          className='p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors'
          title='Descendre'
        >
          <ChevronDown className='w-4 h-4' />
        </button>
        <div className='flex-1' />
        <button
          onClick={onDelete}
          className='p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors'
          title='Supprimer la question'
        >
          <Trash2 className='w-4 h-4' />
        </button>
      </div>

      <QuestionEditor courseId={courseId} quizId={quizId} question={question} />
    </div>
  );
}

// ─── Quiz Editor ───

interface QuizEditorProps {
  courseId: string;
  quiz: any;
  onBack: () => void;
  showBackButton?: boolean;
}

export function QuizEditor({
  courseId,
  quiz,
  onBack,
  showBackButton = true,
}: QuizEditorProps) {
  const { data: questions, isLoading } = useQuizQuestions(courseId, quiz.id);
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const reorderQuestions = useReorderQuestions();
  const updateQuiz = useUpdateQuiz();

  const [title, setTitle] = useState(quiz.title || '');
  const [description, setDescription] = useState(quiz.description || '');
  const [passingScore, setPassingScore] = useState<number>(
    quiz.passing_score ?? 70
  );
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState(false);
  const [savedQuizField, setSavedQuizField] = useState<string | null>(null);
  const [savingQuizField, setSavingQuizField] = useState<string | null>(null);
  const savedQuizFieldTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastQuizFieldRef = useRef<string | null>(null);
  const titleRef = useRef(title);
  const descriptionRef = useRef(description);
  const passingScoreRef = useRef(passingScore);

  // Update refs on change
  useEffect(() => {
    titleRef.current = title;
  }, [title]);
  useEffect(() => {
    descriptionRef.current = description;
  }, [description]);
  useEffect(() => {
    passingScoreRef.current = passingScore;
  }, [passingScore]);

  // Debounced auto-save for quiz metadata
  useEffect(() => {
    if (!pendingSave) return;
    const timer = setTimeout(() => {
      const data: Record<string, unknown> = {};
      const trimTitle = titleRef.current.trim();
      const trimDesc = descriptionRef.current.trim();
      const score = Math.min(100, Math.max(0, passingScoreRef.current));

      if (trimTitle && trimTitle !== (quiz.title || '')) data.title = trimTitle;
      if (trimDesc !== (quiz.description || ''))
        data.description = trimDesc || null;
      if (score !== (quiz.passing_score ?? 70)) data.passing_score = score;

      if (Object.keys(data).length > 0) {
        setSavingQuizField(lastQuizFieldRef.current);
        updateQuiz.mutate(
          { courseId, quizId: quiz.id, data },
          {
            onSuccess: () => {
              setSavingQuizField(null);
              setSavedQuizField(lastQuizFieldRef.current);
              if (savedQuizFieldTimerRef.current)
                clearTimeout(savedQuizFieldTimerRef.current);
              savedQuizFieldTimerRef.current = setTimeout(
                () => setSavedQuizField(null),
                2000
              );
            },
            onError: () => {
              setSavingQuizField(null);
              setSavedQuizField(null);
            },
          }
        );
      }
      setPendingSave(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    pendingSave,
    quiz.title,
    quiz.description,
    quiz.passing_score,
    quiz.id,
    courseId,
    updateQuiz,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !questions) return;
    const ids = questions.map((q: any) => q.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const newIds = arrayMove(ids, oldIndex, newIndex);
    reorderQuestions.mutate({ courseId, quizId: quiz.id, questionIds: newIds });
  }

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      lastQuizFieldRef.current = 'quizTitle';
      setPendingSave(true);
    },
    []
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
      lastQuizFieldRef.current = 'quizDescription';
      setPendingSave(true);
    },
    []
  );

  const handlePassingScoreChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassingScore(Number(e.target.value));
      lastQuizFieldRef.current = 'quizScore';
      setPendingSave(true);
    },
    []
  );

  const handleAddQuestion = (type: 'mcq' | 'true_false') => {
    const defaultData =
      type === 'mcq'
        ? {
            question_type: 'mcq',
            question_text: 'Nouvelle question',
            options: [
              { text: 'Option A', is_correct: true },
              { text: 'Option B', is_correct: false },
            ],
          }
        : {
            question_type: 'true_false',
            question_text: 'Nouvelle question',
            correct_answer: true,
          };

    createQuestion.mutate({
      courseId,
      quizId: quiz.id,
      data: defaultData,
    });
    setShowAddMenu(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setDeleteQuestionId(questionId);
  };

  const confirmDeleteQuestion = () => {
    if (deleteQuestionId) {
      deleteQuestion.mutate({
        courseId,
        quizId: quiz.id,
        questionId: deleteQuestionId,
      });
      setDeleteQuestionId(null);
    }
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!questions) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const currentQuestion = questions[index];
    const targetQuestion = questions[targetIndex];

    updateQuiz.mutate({
      courseId,
      quizId: quiz.id,
      data: {
        reorder_questions: [
          { id: currentQuestion.id, sort_order: targetQuestion.sort_order },
          { id: targetQuestion.id, sort_order: currentQuestion.sort_order },
        ],
      },
    });
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {showBackButton && (
            <button
              onClick={onBack}
              className='p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors'
              title='Retour'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
          )}
          <h2 className='text-lg font-semibold text-gray-900'>
            Éditeur de quiz
          </h2>
        </div>

        <div />
      </div>

      {/* ─── Quiz editor content ─── */}
      <>
        {/* Quiz metadata */}
        <div className='bg-white border border-gray-200 rounded-xl p-5 space-y-4'>
          <div>
            <div className='flex items-center justify-between mb-1'>
              <label className='text-sm font-medium text-gray-700'>
                Titre du quiz
              </label>
              {savingQuizField === 'quizTitle' && (
                <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
              )}
              {savedQuizField === 'quizTitle' && (
                <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                  <Check className='w-3 h-3' />
                  Enregistré
                </span>
              )}
            </div>
            <input
              type='text'
              value={title}
              onChange={handleTitleChange}
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
              placeholder='Ex: Quiz de fin de chapitre'
            />
          </div>

          <div>
            <div className='flex items-center justify-between mb-1'>
              <label className='text-sm font-medium text-gray-700'>
                Description
              </label>
              {savingQuizField === 'quizDescription' && (
                <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
              )}
              {savedQuizField === 'quizDescription' && (
                <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                  <Check className='w-3 h-3' />
                  Enregistré
                </span>
              )}
            </div>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              rows={2}
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
              placeholder='Description optionnelle du quiz...'
            />
          </div>

          <div>
            <div className='flex items-center justify-between mb-1'>
              <label className='text-sm font-medium text-gray-700'>
                Score de réussite (%)
              </label>
              {savingQuizField === 'quizScore' && (
                <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
              )}
              {savedQuizField === 'quizScore' && (
                <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                  <Check className='w-3 h-3' />
                  Enregistré
                </span>
              )}
            </div>
            <input
              type='number'
              min={0}
              max={100}
              value={passingScore}
              onChange={handlePassingScoreChange}
              className='w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
            />
          </div>
        </div>

        {/* Questions */}
        <div>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-semibold text-gray-900'>Questions</h3>
          </div>

          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
            </div>
          ) : (questions || []).length === 0 ? (
            <div className='text-center py-8 border-2 border-dashed border-gray-200 rounded-xl'>
              <ListChecks className='w-10 h-10 text-gray-300 mx-auto mb-2' />
              <p className='text-sm text-gray-500'>Aucune question</p>
              <p className='text-xs text-gray-400 mt-1'>
                Ajoutez des questions pour construire votre quiz
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={(questions || []).map((q: any) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {(questions || []).map((q: any, index: number) => (
                  <SortableQuestionItem
                    key={q.id}
                    question={q}
                    index={index}
                    totalCount={(questions || []).length}
                    courseId={courseId}
                    quizId={quiz.id}
                    onMoveUp={() => handleMoveQuestion(index, 'up')}
                    onMoveDown={() => handleMoveQuestion(index, 'down')}
                    onDelete={() => handleDeleteQuestion(q.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {/* Add question */}
          <div className='relative mt-4'>
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              disabled={createQuestion.isPending}
              className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50'
            >
              {createQuestion.isPending ? (
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
              ) : (
                <Plus className='w-3.5 h-3.5' />
              )}
              Ajouter question
            </button>

            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1'
              >
                <button
                  onClick={() => handleAddQuestion('mcq')}
                  className='flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50'
                >
                  <ListChecks className='w-4 h-4 text-[#1B998B]' />
                  <div>
                    <p className='font-medium'>QCM</p>
                    <p className='text-xs text-gray-400'>
                      Question à choix multiples
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleAddQuestion('true_false')}
                  className='flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50'
                >
                  <ToggleLeft className='w-4 h-4 text-purple-600' />
                  <div>
                    <p className='font-medium'>Vrai / Faux</p>
                    <p className='text-xs text-gray-400'>
                      Question à deux choix
                    </p>
                  </div>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </>

      {/* Delete question confirmation modal */}
      <AnimatePresence>
        {deleteQuestionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'
            onClick={() => setDeleteQuestionId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className='bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4'>
                <AlertTriangle className='w-6 h-6 text-red-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 text-center mb-2'>
                Supprimer cette question ?
              </h3>
              <p className='text-sm text-gray-500 text-center mb-6'>
                Cette question et toutes ses options seront définitivement
                supprimées. Cette action est irréversible.
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setDeleteQuestionId(null)}
                  className='flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteQuestion}
                  className='flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors'
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
