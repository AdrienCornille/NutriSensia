'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Copy,
  Trash2,
  BookOpen,
  Loader2,
  AlertTriangle,
  GripVertical,
  FileText,
  Link as LinkIcon,
  ClipboardList,
  Edit3,
  Check,
  ChevronLeft,
  Columns3,
  MousePointerClick,
  Upload,
  ImageIcon,
  X,
} from 'lucide-react';
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
  useCourseChapters,
  useCreateChapter,
  useDeleteChapter,
  useReorderChapters,
  useDuplicateCourse,
  useChapterSections,
  useCreateSection,
  useDeleteSection,
  useReorderSections,
  useUpdateChapter,
  useCourseQuizzes,
  useCreateQuiz,
} from '@/hooks/useCourseBuilder';
import SectionEditor from './SectionEditor';
import { QuizEditor } from './QuizEditor';

// ─── Sortable Chapter Item (Column 1) ───

function SortableChapterItem({
  chapter,
  index,
  isSelected,
  hasQuiz,
  onSelect,
  onDelete,
}: {
  chapter: any;
  index: number;
  isSelected: boolean;
  hasQuiz: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const sectionCount = Array.isArray(chapter.sections)
    ? chapter.sections.length
    : 0;

  const subtitle = [
    `${sectionCount} section${sectionCount !== 1 ? 's' : ''}`,
    ...(hasQuiz ? ['1 quiz'] : []),
  ].join(' · ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={e => {
        e.stopPropagation();
        onSelect();
      }}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors ${
        isSelected
          ? 'bg-[#1B998B]/8 border-l-[3px] border-[#1B998B]'
          : 'hover:bg-gray-100 border-l-[3px] border-transparent'
      }`}
    >
      {/* Drag handle */}
      <button
        type='button'
        className='touch-none p-0.5 rounded-lg hover:bg-gray-100 text-gray-200 hover:text-gray-400 cursor-grab active:cursor-grabbing transition-colors flex-shrink-0'
        onClick={e => e.stopPropagation()}
        {...attributes}
        {...listeners}
        title='Glisser pour réorganiser'
      >
        <GripVertical className='w-4 h-4' />
      </button>

      {/* Chapter number badge */}
      <span className='w-6 h-6 rounded-full bg-[#1B998B]/10 text-[#1B998B] text-xs font-bold flex items-center justify-center flex-shrink-0'>
        {index + 1}
      </span>

      {/* Title & section count */}
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-gray-800 truncate'>
          {chapter.title}
        </p>
        <p className='text-xs text-gray-400 mt-0.5'>{subtitle}</p>
      </div>

      {/* Delete on hover */}
      <button
        onClick={onDelete}
        className='opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0'
        title='Supprimer le chapitre'
      >
        <Trash2 className='w-3.5 h-3.5' />
      </button>
    </div>
  );
}

// ─── Sortable Section Item (Column 2) ───

function SortableSectionItem({
  section,
  isSelected,
  onSelect,
  onDelete,
}: {
  section: any;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const icon =
    section.section_type === 'reference' ? (
      <LinkIcon className='w-4 h-4' />
    ) : (
      <FileText className='w-4 h-4' />
    );

  const badge =
    section.section_type === 'reference' ? (
      <span className='inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-lg bg-violet-50 text-violet-600'>
        Référence
      </span>
    ) : (
      <span className='inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-lg bg-[#1B998B]/10 text-[#1B998B]'>
        Contenu
      </span>
    );

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={e => {
        e.stopPropagation();
        onSelect();
      }}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors ${
        isSelected
          ? 'bg-[#1B998B]/8 border-l-[3px] border-[#1B998B]'
          : 'hover:bg-gray-100 border-l-[3px] border-transparent'
      }`}
    >
      {/* Drag handle */}
      <button
        type='button'
        className='touch-none p-0.5 rounded-lg hover:bg-gray-100 text-gray-200 hover:text-gray-400 cursor-grab active:cursor-grabbing transition-colors flex-shrink-0'
        onClick={e => e.stopPropagation()}
        {...attributes}
        {...listeners}
        title='Glisser pour réorganiser'
      >
        <GripVertical className='w-3.5 h-3.5' />
      </button>

      {/* Icon */}
      <div className='w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0'>
        {icon}
      </div>

      {/* Title + badge */}
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-gray-800 truncate'>
          {section.title}
        </p>
        <div className='mt-0.5'>{badge}</div>
      </div>

      {/* Delete on hover */}
      <button
        onClick={onDelete}
        className='opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0'
        title='Supprimer la section'
      >
        <Trash2 className='w-3.5 h-3.5' />
      </button>
    </div>
  );
}

// ─── Column 2: Chapter Detail (Sections & Quiz) ───

function ChapterDetailColumn({
  courseId,
  chapter,
  selectedSectionId,
  selectedQuizId,
  onSelectSection,
  onSelectQuiz,
  onDeleteSection,
}: {
  courseId: string;
  chapter: any;
  selectedSectionId: string | null;
  selectedQuizId: string | null;
  onSelectSection: (section: any) => void;
  onSelectQuiz: (quiz: any) => void;
  onDeleteSection: (sectionId: string) => void;
}) {
  const { data: sections, isLoading } = useChapterSections(
    courseId,
    chapter.id
  );
  const { data: allQuizzes } = useCourseQuizzes(courseId);
  const createSection = useCreateSection();
  const deleteSection = useDeleteSection();
  const reorderSections = useReorderSections();
  const updateChapter = useUpdateChapter();
  const createQuiz = useCreateQuiz();

  const [title, setTitle] = useState<string>(chapter.title || '');
  const [description, setDescription] = useState<string>(
    chapter.description || ''
  );
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [savedChapterField, setSavedChapterField] = useState<string | null>(
    null
  );
  const [savingChapterField, setSavingChapterField] = useState<string | null>(
    null
  );
  const savedChapterFieldTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastChapterFieldRef = useRef<string | null>(null);
  const titleRef = useRef(title);
  const descriptionRef = useRef(description);

  // Update refs on change
  useEffect(() => {
    titleRef.current = title;
  }, [title]);
  useEffect(() => {
    descriptionRef.current = description;
  }, [description]);

  // Reset state when chapter changes
  const prevChapterIdRef = useRef(chapter.id);
  if (prevChapterIdRef.current !== chapter.id) {
    prevChapterIdRef.current = chapter.id;
    setTitle(chapter.title || '');
    setDescription(chapter.description || '');
    setPendingSave(false);
    setSavedChapterField(null);
    setShowAddMenu(false);
  }

  // Debounced auto-save
  useEffect(() => {
    if (!pendingSave) return;
    const timer = setTimeout(() => {
      const data: Record<string, unknown> = {};
      if (
        titleRef.current.trim() &&
        titleRef.current.trim() !== (chapter.title || '')
      )
        data.title = titleRef.current.trim();
      if (descriptionRef.current.trim() !== (chapter.description || ''))
        data.description = descriptionRef.current.trim() || null;
      if (Object.keys(data).length > 0) {
        setSavingChapterField(lastChapterFieldRef.current);
        updateChapter.mutate(
          { courseId, chapterId: chapter.id, data },
          {
            onSuccess: () => {
              setSavingChapterField(null);
              setSavedChapterField(lastChapterFieldRef.current);
              if (savedChapterFieldTimerRef.current)
                clearTimeout(savedChapterFieldTimerRef.current);
              savedChapterFieldTimerRef.current = setTimeout(
                () => setSavedChapterField(null),
                2000
              );
            },
            onError: () => {
              setSavingChapterField(null);
              setSavedChapterField(null);
            },
          }
        );
      }
      setPendingSave(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    pendingSave,
    chapter.title,
    chapter.description,
    chapter.id,
    courseId,
    updateChapter,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !sections) return;
      const ids = sections.map((s: any) => s.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      const newIds = arrayMove(ids, oldIndex, newIndex);
      reorderSections.mutate({
        courseId,
        chapterId: chapter.id,
        sectionIds: newIds,
      });
    },
    [sections, courseId, chapter.id, reorderSections]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      lastChapterFieldRef.current = 'chapterTitle';
      setPendingSave(true);
    },
    []
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
      lastChapterFieldRef.current = 'chapterDescription';
      setPendingSave(true);
    },
    []
  );

  const handleAddSection = useCallback(
    (type: 'blocks' | 'reference') => {
      const sectionTitle =
        type === 'blocks' ? 'Nouvelle section' : 'Nouvelle reference';
      createSection.mutate({
        courseId,
        chapterId: chapter.id,
        data: { title: sectionTitle, section_type: type },
      });
      setShowAddMenu(false);
    },
    [courseId, chapter.id, createSection]
  );

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      deleteSection.mutate(
        { courseId, chapterId: chapter.id, sectionId },
        {
          onSuccess: () => {
            onDeleteSection(sectionId);
          },
        }
      );
    },
    [courseId, chapter.id, deleteSection, onDeleteSection]
  );

  const chapterQuiz =
    (allQuizzes || []).find((q: any) => q.chapter_id === chapter.id) || null;

  const sortedSections = sections || [];

  return (
    <div className='absolute inset-0 flex flex-col'>
      {/* Chapter metadata */}
      <div className='p-4 space-y-3'>
        <div className='flex items-center justify-between'>
          <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
            Chapitre
          </h4>
        </div>
        <div>
          <div className='flex items-center justify-between mb-1'>
            <label className='text-xs font-medium text-gray-600'>
              Titre du chapitre
            </label>
            {savingChapterField === 'chapterTitle' && (
              <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
            )}
            {savedChapterField === 'chapterTitle' && (
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
            className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-colors'
            placeholder='Ex: Les macronutriments'
          />
        </div>
        <div>
          <div className='flex items-center justify-between mb-1'>
            <label className='text-xs font-medium text-gray-600'>
              Description (optionnel)
            </label>
            {savingChapterField === 'chapterDescription' && (
              <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
            )}
            {savedChapterField === 'chapterDescription' && (
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
            className='w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white resize-y focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-colors'
            placeholder='Décrivez brièvement le contenu de ce chapitre...'
          />
        </div>
      </div>

      <div className='border-t border-gray-100' />

      {/* Sections list */}
      <div
        className='flex-1 overflow-y-auto p-4 space-y-3'
        onClick={() => {
          onSelectSection(null);
          onSelectQuiz(null);
        }}
      >
        <div className='flex items-center justify-between'>
          <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
            Sections
          </h4>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
          </div>
        ) : sortedSections.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-xl'>
            <FileText className='w-10 h-10 text-gray-200 mb-2' />
            <p className='text-sm font-medium text-gray-400'>Aucune section</p>
            <p className='text-xs text-gray-300 mt-1'>
              Ajoutez une section ci-dessous
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedSections.map((s: any) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-1'>
                {sortedSections.map((section: any) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    isSelected={selectedSectionId === section.id}
                    onSelect={() => onSelectSection(section)}
                    onDelete={e => {
                      e.stopPropagation();
                      handleDeleteSection(section.id);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add section button with dropdown */}
        <div className='relative'>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            disabled={createSection.isPending}
            className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50'
          >
            {createSection.isPending ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <Plus className='w-3.5 h-3.5' />
            )}
            Ajouter section
          </button>

          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1 overflow-hidden'
              >
                <button
                  onClick={() => handleAddSection('blocks')}
                  className='flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 transition-colors'
                >
                  <Edit3 className='w-4 h-4 text-[#1B998B]' />
                  <div className='text-left'>
                    <p className='text-sm font-medium text-gray-700'>
                      Contenu original
                    </p>
                    <p className='text-xs text-gray-400'>
                      Nouvelle section avec des blocs
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleAddSection('reference')}
                  className='flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 transition-colors'
                >
                  <LinkIcon className='w-4 h-4 text-violet-500' />
                  <div className='text-left'>
                    <p className='text-sm font-medium text-gray-700'>
                      Référence
                    </p>
                    <p className='text-xs text-gray-400'>
                      Lier un contenu existant
                    </p>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quiz section */}
        <div
          className='pt-3 border-t border-gray-100'
          onClick={e => e.stopPropagation()}
        >
          <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
            Quiz de chapitre
          </h4>
          {chapterQuiz ? (
            <div
              onClick={e => {
                e.stopPropagation();
                onSelectQuiz(chapterQuiz);
              }}
              className={`border rounded-lg p-3 bg-white shadow-sm flex items-center gap-3 cursor-pointer transition-colors ${
                selectedQuizId === chapterQuiz.id
                  ? 'bg-[#1B998B]/8 border-[#1B998B]'
                  : 'border-gray-200 hover:border-[#1B998B]/40'
              }`}
            >
              <div className='w-7 h-7 rounded-lg bg-[#1B998B]/10 flex items-center justify-center text-[#1B998B] flex-shrink-0'>
                <ClipboardList className='w-4 h-4' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-800 truncate'>
                  {chapterQuiz.title}
                </p>
                <p className='text-xs text-gray-400'>
                  {chapterQuiz.questions_count ?? 0} question
                  {(chapterQuiz.questions_count ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                createQuiz.mutate(
                  {
                    courseId,
                    data: {
                      chapter_id: chapter.id,
                      title: `Quiz - ${chapter.title || 'Chapitre'}`,
                    },
                  },
                  {
                    onSuccess: (data: any) => {
                      if (data) onSelectQuiz(data);
                    },
                  }
                );
              }}
              disabled={createQuiz.isPending}
              className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50'
            >
              {createQuiz.isPending ? (
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
              ) : (
                <Plus className='w-3.5 h-3.5' />
              )}
              Ajouter quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ───

function DeleteModal({
  title,
  message,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className='bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-6'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center justify-center w-11 h-11 bg-red-50 rounded-full mx-auto mb-4'>
          <AlertTriangle className='w-5 h-5 text-red-500' />
        </div>
        <h3 className='text-base font-semibold text-gray-800 text-center mb-2'>
          {title}
        </h3>
        <p className='text-sm text-gray-500 text-center mb-6'>{message}</p>
        <div className='flex gap-3'>
          <button
            onClick={onCancel}
            className='flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className='flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50'
          >
            Supprimer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Course Builder (Miller Columns) ───

interface CourseBuilderProps {
  courseId: string;
  courseTitle?: string;
  courseSummary?: string;
  courseThumbnailUrl?: string;
  onCourseTitleChange?: (title: string) => void;
  onCourseSummaryChange?: (summary: string) => void;
  onThumbnailUpload?: (file: File) => void;
  onThumbnailRemove?: () => void;
  isUploadingThumbnail?: boolean;
  onMetadataAutoSave?: () => void;
}

export function CourseBuilder({
  courseId,
  courseTitle = '',
  courseSummary = '',
  courseThumbnailUrl = '',
  onCourseTitleChange,
  onCourseSummaryChange,
  onThumbnailUpload,
  onThumbnailRemove,
  isUploadingThumbnail = false,
  onMetadataAutoSave,
}: CourseBuilderProps) {
  const { data: chapters, isLoading, isError } = useCourseChapters(courseId);
  const { data: allQuizzesTop } = useCourseQuizzes(courseId);
  const createChapter = useCreateChapter();
  const deleteChapter = useDeleteChapter();
  const reorderChapters = useReorderChapters();
  const duplicateCourse = useDuplicateCourse();

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null
  );
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);

  // Mobile view state
  const [mobileView, setMobileView] = useState<
    'chapters' | 'sections' | 'editor'
  >('chapters');

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const autoCreatedFirstChapterRef = useRef(false);
  const metaSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const metaSavedFieldTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const onMetadataAutoSaveRef = useRef(onMetadataAutoSave);
  useEffect(() => {
    onMetadataAutoSaveRef.current = onMetadataAutoSave;
  }, [onMetadataAutoSave]);
  const [metaSavedField, setMetaSavedField] = useState<string | null>(null);
  const [metaSavingField, setMetaSavingField] = useState<string | null>(null);
  const lastMetaFieldRef = useRef<string | null>(null);

  const triggerMetadataAutoSave = useCallback((fieldName?: string) => {
    if (fieldName) lastMetaFieldRef.current = fieldName;
    if (metaSaveTimerRef.current) clearTimeout(metaSaveTimerRef.current);
    metaSaveTimerRef.current = setTimeout(() => {
      if (!onMetadataAutoSaveRef.current) return;
      setMetaSavingField(lastMetaFieldRef.current);
      onMetadataAutoSaveRef.current();
      setTimeout(() => {
        setMetaSavingField(null);
        setMetaSavedField(lastMetaFieldRef.current);
        if (metaSavedFieldTimerRef.current)
          clearTimeout(metaSavedFieldTimerRef.current);
        metaSavedFieldTimerRef.current = setTimeout(
          () => setMetaSavedField(null),
          2000
        );
      }, 500);
    }, 2000);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (metaSaveTimerRef.current) clearTimeout(metaSaveTimerRef.current);
      if (metaSavedFieldTimerRef.current)
        clearTimeout(metaSavedFieldTimerRef.current);
    };
  }, []);

  // Auto-create first chapter if none exists
  useEffect(() => {
    if (
      !isLoading &&
      chapters &&
      chapters.length === 0 &&
      !autoCreatedFirstChapterRef.current &&
      !createChapter.isPending
    ) {
      autoCreatedFirstChapterRef.current = true;
      createChapter.mutate({ courseId, data: { title: 'Chapitre 1' } });
    }
  }, [isLoading, chapters, createChapter, courseId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleAddChapter = useCallback(() => {
    createChapter.mutate({
      courseId,
      data: { title: 'Nouveau chapitre' },
    });
  }, [courseId, createChapter]);

  const handleDuplicate = useCallback(() => {
    const title = window.prompt('Titre du cours dupliqué :');
    if (!title?.trim()) return;
    duplicateCourse.mutate({ courseId, newTitle: title.trim() });
  }, [courseId, duplicateCourse]);

  const handleDeleteChapter = useCallback(
    (chapterId: string) => {
      deleteChapter.mutate(
        { courseId, chapterId },
        {
          onSuccess: () => {
            setDeleteChapterId(null);
            if (selectedChapterId === chapterId) {
              setSelectedChapterId(null);
              setSelectedSection(null);
              setSelectedQuiz(null);
            }
          },
        }
      );
    },
    [courseId, deleteChapter, selectedChapterId]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !chapters) return;
      const ids = chapters.map((c: any) => c.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      const newIds = arrayMove(ids, oldIndex, newIndex);
      reorderChapters.mutate({ courseId, chapterIds: newIds });
    },
    [chapters, courseId, reorderChapters]
  );

  const handleSelectChapter = useCallback((chapterId: string) => {
    setSelectedChapterId(chapterId);
    setSelectedSection(null);
    setSelectedQuiz(null);
    setMobileView('sections');
  }, []);

  const handleSelectSection = useCallback((section: any) => {
    setSelectedSection(section);
    setSelectedQuiz(null);
    setMobileView('editor');
  }, []);

  const handleSelectQuiz = useCallback((quiz: any) => {
    setSelectedQuiz(quiz);
    setSelectedSection(null);
    setMobileView('editor');
  }, []);

  const handleDeleteSectionCallback = useCallback(
    (sectionId: string) => {
      if (selectedSection?.id === sectionId) {
        setSelectedSection(null);
      }
    },
    [selectedSection]
  );

  const handleMobileBackToChapters = useCallback(() => {
    setMobileView('chapters');
    setSelectedChapterId(null);
    setSelectedSection(null);
    setSelectedQuiz(null);
  }, []);

  const handleMobileBackToSections = useCallback(() => {
    setMobileView('sections');
    setSelectedSection(null);
    setSelectedQuiz(null);
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className='space-y-4 animate-pulse'>
        <div className='h-6 w-48 bg-gray-200 rounded' />
        <div className='flex gap-4'>
          <div className='w-1/4 space-y-2'>
            {[1, 2, 3].map(i => (
              <div key={i} className='h-14 bg-gray-100 rounded-lg' />
            ))}
          </div>
          <div className='w-1/4 bg-gray-50 rounded-lg' />
          <div className='w-1/2 bg-gray-50 rounded-lg' />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
        <AlertTriangle className='w-8 h-8 text-red-400 mb-2' />
        <p className='text-sm'>Erreur lors du chargement des chapitres.</p>
      </div>
    );
  }

  const sortedChapters = chapters || [];
  const selectedChapter = sortedChapters.find(
    (c: any) => c.id === selectedChapterId
  );

  // ─── Column 1: Chapters ───
  const column1 = (
    <div className='absolute inset-0 flex flex-col'>
      {/* Course metadata */}
      <div className='p-3 border-b border-gray-100 space-y-3'>
        <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
          Cours
        </h3>
        <div>
          <div className='flex items-center justify-between mb-1'>
            <label className='text-xs font-medium text-gray-600'>
              Titre du cours
            </label>
            {metaSavingField === 'courseTitle' && (
              <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
            )}
            {metaSavedField === 'courseTitle' && (
              <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                <Check className='w-3 h-3' />
                Enregistré
              </span>
            )}
          </div>
          <input
            type='text'
            value={courseTitle}
            onChange={e => {
              onCourseTitleChange?.(e.target.value);
              triggerMetadataAutoSave('courseTitle');
            }}
            className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-colors'
            placeholder='Ex: Nutrition de base'
          />
        </div>
        <div>
          <div className='flex items-center justify-between mb-1'>
            <label className='text-xs font-medium text-gray-600'>Résumé</label>
            {metaSavingField === 'courseSummary' && (
              <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
            )}
            {metaSavedField === 'courseSummary' && (
              <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                <Check className='w-3 h-3' />
                Enregistré
              </span>
            )}
          </div>
          <textarea
            value={courseSummary}
            onChange={e => {
              onCourseSummaryChange?.(e.target.value);
              triggerMetadataAutoSave('courseSummary');
            }}
            rows={2}
            className='w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white resize-y focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-colors'
            placeholder='Décrivez brièvement le cours...'
          />
        </div>
        <div>
          <div className='flex items-center justify-between mb-1'>
            <label className='text-xs font-medium text-gray-600'>
              Vignette
            </label>
            {metaSavingField === 'courseThumbnail' && (
              <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
            )}
            {metaSavedField === 'courseThumbnail' && (
              <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                <Check className='w-3 h-3' />
                Enregistré
              </span>
            )}
          </div>
          <div className='max-w-[330px]'>
            {courseThumbnailUrl ? (
              <div className='relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-100'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={courseThumbnailUrl}
                  alt='Vignette du cours'
                  className='w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors' />
                <button
                  type='button'
                  onClick={() => {
                    onThumbnailRemove?.();
                    triggerMetadataAutoSave('courseThumbnail');
                  }}
                  className='absolute top-1.5 right-1.5 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70'
                  title='Supprimer la vignette'
                >
                  <X className='w-3.5 h-3.5' />
                </button>
                <button
                  type='button'
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={isUploadingThumbnail}
                  className='absolute bottom-1.5 right-1.5 px-2 py-1 bg-black/50 rounded-lg text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 flex items-center gap-1'
                >
                  <Upload className='w-3 h-3' />
                  Changer
                </button>
              </div>
            ) : (
              <button
                type='button'
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isUploadingThumbnail}
                className='w-full aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-[#1B998B] hover:text-[#1B998B] transition-colors disabled:opacity-50 bg-gray-50'
              >
                {isUploadingThumbnail ? (
                  <Loader2 className='w-5 h-5 animate-spin' />
                ) : (
                  <ImageIcon className='w-5 h-5' />
                )}
                <span>
                  {isUploadingThumbnail ? 'Upload...' : 'Ajouter une vignette'}
                </span>
                <span className='text-[10px] text-gray-300'>
                  Format 16:9 recommandé
                </span>
              </button>
            )}
          </div>
          <input
            ref={thumbnailInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            className='hidden'
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                onThumbnailUpload?.(file);
                triggerMetadataAutoSave('courseThumbnail');
              }
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* Chapters header */}
      <div className='p-3 border-b border-gray-100'>
        <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
          Chapitres
        </h3>
      </div>

      {/* Chapter list */}
      <div
        className='flex-1 overflow-y-auto p-2'
        onClick={() => {
          setSelectedChapterId(null);
          setSelectedSection(null);
          setSelectedQuiz(null);
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedChapters.map((c: any) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-1'>
              {sortedChapters.map((chapter: any, index: number) => (
                <SortableChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                  isSelected={selectedChapterId === chapter.id}
                  hasQuiz={
                    !!(allQuizzesTop || []).find(
                      (q: any) => q.chapter_id === chapter.id
                    )
                  }
                  onSelect={() => handleSelectChapter(chapter.id)}
                  onDelete={e => {
                    e.stopPropagation();
                    setDeleteChapterId(chapter.id);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add chapter button */}
        <button
          onClick={e => {
            e.stopPropagation();
            handleAddChapter();
          }}
          disabled={createChapter.isPending}
          className='flex items-center gap-1.5 px-2.5 py-1.5 mt-2 text-xs font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50'
        >
          {createChapter.isPending ? (
            <Loader2 className='w-3.5 h-3.5 animate-spin' />
          ) : (
            <Plus className='w-3.5 h-3.5' />
          )}
          Ajouter chapitre
        </button>
      </div>

      {/* Bottom: Duplicate course */}
      <div className='border-t border-gray-100 p-3'>
        <button
          onClick={handleDuplicate}
          disabled={duplicateCourse.isPending}
          className='text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 w-full flex items-center gap-2 justify-center transition-colors disabled:opacity-50'
        >
          <Copy className='w-3.5 h-3.5' />
          Dupliquer le cours
        </button>
      </div>
    </div>
  );

  // ─── Column 2: Sections & Quiz (or empty state) ───
  const column2 = selectedChapter ? (
    <ChapterDetailColumn
      courseId={courseId}
      chapter={selectedChapter}
      selectedSectionId={selectedSection?.id || null}
      selectedQuizId={selectedQuiz?.id || null}
      onSelectSection={handleSelectSection}
      onSelectQuiz={handleSelectQuiz}
      onDeleteSection={handleDeleteSectionCallback}
    />
  ) : (
    <div className='flex flex-col items-center justify-center h-full px-8'>
      <MousePointerClick className='w-10 h-10 mb-3 text-gray-200' />
      <p className='text-sm font-medium text-gray-400'>
        Sélectionnez un chapitre
      </p>
      <p className='text-xs text-gray-300 mt-1 text-center'>
        Choisissez un chapitre dans la colonne de gauche pour voir ses sections
        et son quiz.
      </p>
    </div>
  );

  // ─── Column 3: Editor (or empty state) ───
  const column3 = selectedSection ? (
    <div className='absolute inset-0 overflow-y-auto p-4'>
      <SectionEditor
        courseId={courseId}
        chapterId={selectedChapter?.id || ''}
        section={selectedSection}
        onBack={() => {
          setSelectedSection(null);
          setMobileView('sections');
        }}
        showBackButton={false}
      />
    </div>
  ) : selectedQuiz ? (
    <div className='absolute inset-0 overflow-y-auto p-4'>
      <QuizEditor
        courseId={courseId}
        quiz={selectedQuiz}
        onBack={() => {
          setSelectedQuiz(null);
          setMobileView('sections');
        }}
        showBackButton={false}
      />
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-full px-8'>
      <Columns3 className='w-10 h-10 mb-3 text-gray-200' />
      <p className='text-sm font-medium text-gray-400'>
        Sélectionnez une section ou un quiz
      </p>
      <p className='text-xs text-gray-300 mt-1 text-center'>
        Choisissez un élément dans la colonne du milieu pour l&apos;éditer ici.
      </p>
    </div>
  );

  return (
    <>
      {/* ─── Desktop layout (md+): Miller columns ─── */}
      <div className='hidden md:flex h-full border-l border-r border-gray-100 overflow-hidden bg-white'>
        {/* Column 1 — Chapters */}
        <div
          className='border-r border-gray-100 relative min-w-0 bg-gray-50/80 overflow-hidden transition-[flex] duration-300 ease-in-out'
          style={{ flex: !selectedChapterId ? '1 0 0%' : '0 0 25%' }}
        >
          {column1}
        </div>

        {/* Column 2 — Sections & Quiz */}
        {selectedChapterId && (
          <motion.div
            key={`col2-${selectedChapterId}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='border-r border-gray-100 relative min-w-0 bg-white overflow-hidden transition-[flex] duration-300 ease-in-out'
            style={{
              flex: !(selectedSection || selectedQuiz) ? '1 0 0%' : '0 0 25%',
            }}
          >
            {column2}
          </motion.div>
        )}

        {/* Column 3 — Editor */}
        {(selectedSection || selectedQuiz) && (
          <motion.div
            key={`col3-${selectedSection?.id || selectedQuiz?.id}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='flex-1 relative min-w-0 bg-white overflow-hidden'
          >
            {column3}
          </motion.div>
        )}
      </div>

      {/* ─── Mobile layout (<md): one column at a time ─── */}
      <div className='md:hidden'>
        {mobileView === 'chapters' && (
          <div className='border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm min-h-[60vh]'>
            {column1}
          </div>
        )}

        {mobileView === 'sections' && (
          <div className='border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm min-h-[60vh]'>
            {/* Back button */}
            <div className='p-3 border-b border-gray-100'>
              <button
                onClick={handleMobileBackToChapters}
                className='flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B998B] transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
                Chapitres
              </button>
            </div>
            {column2}
          </div>
        )}

        {mobileView === 'editor' && (
          <div className='border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm min-h-[60vh]'>
            {/* Back button */}
            <div className='p-3 border-b border-gray-100'>
              <button
                onClick={handleMobileBackToSections}
                className='flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B998B] transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
                Sections
              </button>
            </div>
            <div className='p-4'>
              {selectedSection ? (
                <SectionEditor
                  courseId={courseId}
                  chapterId={selectedChapter?.id || ''}
                  section={selectedSection}
                  onBack={handleMobileBackToSections}
                  showBackButton={false}
                />
              ) : selectedQuiz ? (
                <QuizEditor
                  courseId={courseId}
                  quiz={selectedQuiz}
                  onBack={handleMobileBackToSections}
                  showBackButton={false}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Delete chapter confirmation modal */}
      <AnimatePresence>
        {deleteChapterId && (
          <DeleteModal
            title='Supprimer ce chapitre ?'
            message='Ce chapitre, ses sections et son quiz seront définitivement supprimés. Cette action est irréversible.'
            onConfirm={() => handleDeleteChapter(deleteChapterId)}
            onCancel={() => setDeleteChapterId(null)}
            isPending={deleteChapter.isPending}
          />
        )}
      </AnimatePresence>
    </>
  );
}
