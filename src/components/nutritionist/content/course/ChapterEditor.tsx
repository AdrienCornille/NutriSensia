'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  FileText,
  Link as LinkIcon,
  ChevronDown,
  Loader2,
  AlertTriangle,
  ClipboardList,
  Edit3,
  Save,
  Check,
  GripVertical,
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

// ─── Sortable Section Item ───

function SortableSectionItem({
  section,
  index,
  totalCount,
  isConfirmingDelete,
  onMoveUp,
  onMoveDown,
  onClick,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  getSectionIcon,
  getSectionTypeBadge,
  reorderPending,
  deletePending,
}: {
  section: any;
  index: number;
  totalCount: number;
  isConfirmingDelete: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onClick: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  getSectionIcon: (type: string) => React.ReactNode;
  getSectionTypeBadge: (type: string) => React.ReactNode;
  reorderPending: boolean;
  deletePending: boolean;
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='border rounded-xl p-4 bg-white shadow-sm flex items-center gap-3 group'
    >
      {/* Drag handle */}
      <button
        type='button'
        className='touch-none p-0.5 rounded hover:bg-gray-200 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors'
        {...attributes}
        {...listeners}
        title='Glisser pour réorganiser'
      >
        <GripVertical className='w-4 h-4' />
      </button>

      {/* Reorder arrows */}
      <div className='flex flex-col gap-0.5'>
        <button
          onClick={onMoveUp}
          disabled={index === 0 || reorderPending}
          className='p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors'
          title='Monter'
        >
          <ArrowUp className='w-3 h-3' />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === totalCount - 1 || reorderPending}
          className='p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors'
          title='Descendre'
        >
          <ArrowDown className='w-3 h-3' />
        </button>
      </div>

      {/* Icon */}
      <div className='w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0'>
        {getSectionIcon(section.section_type)}
      </div>

      {/* Title + badge */}
      <div className='flex-1 min-w-0 cursor-pointer' onClick={onClick}>
        <p className='text-sm font-medium text-gray-900 truncate hover:text-primary transition-colors'>
          {section.title}
        </p>
        <div className='flex items-center gap-2 mt-0.5'>
          {getSectionTypeBadge(section.section_type)}
        </div>
      </div>

      {/* Delete */}
      {isConfirmingDelete ? (
        <div className='flex items-center gap-1.5'>
          <button
            onClick={onConfirmDelete}
            disabled={deletePending}
            className='px-2.5 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
          >
            Confirmer
          </button>
          <button
            onClick={onCancelDelete}
            className='px-2.5 py-1 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={onDelete}
          className='p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100'
          title='Supprimer la section'
        >
          <Trash2 className='w-4 h-4' />
        </button>
      )}
    </div>
  );
}

interface ChapterEditorProps {
  courseId: string;
  chapter: any;
  onCollapse: () => void;
  onSubEditorChange?: (active: boolean) => void;
}

export function ChapterEditor({
  courseId,
  chapter,
  onCollapse,
  onSubEditorChange,
}: ChapterEditorProps) {
  const {
    data: sections,
    isLoading,
    isError,
  } = useChapterSections(courseId, chapter.id);
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
  const [confirmDeleteSectionId, setConfirmDeleteSectionId] = useState<
    string | null
  >(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

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
      const newTitle = e.target.value;
      setTitle(newTitle);
      if (newTitle.trim() !== (chapter.title || '')) {
        setIsDirty(true);
        setSaveStatus('idle');
      }
    },
    [chapter.title]
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newDesc = e.target.value;
      setDescription(newDesc);
      if (newDesc.trim() !== (chapter.description || '')) {
        setIsDirty(true);
        setSaveStatus('idle');
      }
    },
    [chapter.description]
  );

  const handleSaveChapter = useCallback(() => {
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const titleChanged = trimmedTitle && trimmedTitle !== chapter.title;
    const descChanged = trimmedDesc !== (chapter.description || '');

    if (!titleChanged && !descChanged) {
      setIsDirty(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(s => (s === 'saved' ? 'idle' : s)), 2000);
      return;
    }

    setSaveStatus('saving');
    const data: Record<string, unknown> = {};
    if (titleChanged) data.title = trimmedTitle;
    if (descChanged) data.description = trimmedDesc || null;

    updateChapter.mutate(
      { courseId, chapterId: chapter.id, data },
      {
        onSuccess: () => {
          setIsDirty(false);
          setSaveStatus('saved');
          setTimeout(
            () => setSaveStatus(s => (s === 'saved' ? 'idle' : s)),
            2000
          );
        },
        onError: () => setSaveStatus('idle'),
      }
    );
  }, [
    title,
    description,
    chapter.title,
    chapter.description,
    chapter.id,
    courseId,
    updateChapter,
  ]);

  // Section actions
  const handleAddSection = useCallback(
    (type: 'blocks' | 'reference') => {
      const sectionTitle =
        type === 'blocks' ? 'Nouvelle section' : 'Nouvelle reference';
      createSection.mutate({
        courseId,
        chapterId: chapter.id,
        data: {
          title: sectionTitle,
          section_type: type,
        },
      });
      setShowAddMenu(false);
    },
    [courseId, chapter.id, createSection]
  );

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      deleteSection.mutate(
        { courseId, chapterId: chapter.id, sectionId },
        { onSuccess: () => setConfirmDeleteSectionId(null) }
      );
    },
    [courseId, chapter.id, deleteSection]
  );

  const handleMoveSection = useCallback(
    (index: number, direction: 'up' | 'down') => {
      if (!sections) return;
      const ids = sections.map((s: any) => s.id);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= ids.length) return;
      [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];
      reorderSections.mutate({
        courseId,
        chapterId: chapter.id,
        sectionIds: ids,
      });
    },
    [sections, courseId, chapter.id, reorderSections]
  );

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'reference':
        return <LinkIcon className='w-4 h-4' />;
      case 'blocks':
      default:
        return <FileText className='w-4 h-4' />;
    }
  };

  const getSectionTypeBadge = (sectionType: string) => {
    if (sectionType === 'reference') {
      return (
        <span className='inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-600'>
          Reference
        </span>
      );
    }
    return (
      <span className='inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary'>
        Contenu
      </span>
    );
  };

  // Quizzes linked to this chapter
  const chapterQuiz =
    (allQuizzes || []).find((q: any) => q.chapter_id === chapter.id) || null;

  // Loading
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-gray-500'>
        <AlertTriangle className='w-6 h-6 text-red-400 mb-2' />
        <p className='text-sm'>Erreur lors du chargement des sections.</p>
      </div>
    );
  }

  const sortedSections = sections || [];

  // If a section is selected, show SectionEditor
  if (selectedSection) {
    return (
      <SectionEditor
        courseId={courseId}
        chapterId={chapter.id}
        section={selectedSection}
        onBack={() => {
          setSelectedSection(null);
          onSubEditorChange?.(false);
        }}
      />
    );
  }

  // If quiz editor is shown (only when quiz exists)
  if (showQuizEditor && chapterQuiz) {
    return (
      <QuizEditor
        courseId={courseId}
        quiz={chapterQuiz}
        onBack={() => {
          setShowQuizEditor(false);
          onSubEditorChange?.(false);
        }}
      />
    );
  }

  return (
    <div className='space-y-4'>
      {/* Editable title & description */}
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Titre du chapitre
          </label>
          <input
            ref={titleRef}
            type='text'
            value={title}
            onChange={handleTitleChange}
            className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-colors'
            placeholder='Ex: Les macronutriments'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Description (optionnel)
          </label>
          <textarea
            ref={descRef}
            value={description}
            onChange={handleDescriptionChange}
            rows={2}
            className='w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white resize-y focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-colors'
            placeholder='Décrivez brièvement le contenu de ce chapitre...'
          />
        </div>
        <div className='flex items-center justify-end gap-2'>
          {saveStatus === 'saved' && (
            <span className='flex items-center gap-1.5 text-xs text-[#1B998B]'>
              <Check className='h-3.5 w-3.5' />
              Enregistré
            </span>
          )}
          <button
            type='button'
            onClick={handleSaveChapter}
            disabled={!isDirty || saveStatus === 'saving'}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              isDirty
                ? 'bg-[#1B998B] text-white hover:bg-[#158578]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saveStatus === 'saving' ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <Save className='h-3.5 w-3.5' />
            )}
            Enregistrer
          </button>
        </div>
      </div>

      {/* Sections list */}
      <div>
        <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
          Sections ({sortedSections.length})
        </h4>

        {sortedSections.length === 0 ? (
          <div className='text-center py-6 border-2 border-dashed border-gray-200 rounded-xl'>
            <FileText className='w-8 h-8 text-gray-300 mx-auto mb-2' />
            <p className='text-sm text-gray-500'>
              Aucune section dans ce chapitre.
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
              <div className='space-y-2'>
                {sortedSections.map((section: any, index: number) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    index={index}
                    totalCount={sortedSections.length}
                    isConfirmingDelete={confirmDeleteSectionId === section.id}
                    onMoveUp={() => handleMoveSection(index, 'up')}
                    onMoveDown={() => handleMoveSection(index, 'down')}
                    onClick={() => {
                      setSelectedSection(section);
                      onSubEditorChange?.(true);
                    }}
                    onDelete={() => setConfirmDeleteSectionId(section.id)}
                    onConfirmDelete={() => handleDeleteSection(section.id)}
                    onCancelDelete={() => setConfirmDeleteSectionId(null)}
                    getSectionIcon={getSectionIcon}
                    getSectionTypeBadge={getSectionTypeBadge}
                    reorderPending={reorderSections.isPending}
                    deletePending={deleteSection.isPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add section button with dropdown */}
      <div className='relative'>
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          disabled={createSection.isPending}
          className='flex items-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors justify-center'
        >
          {createSection.isPending ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Plus className='w-4 h-4' />
          )}
          Ajouter une section
        </button>

        <AnimatePresence>
          {showAddMenu && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 overflow-hidden'
            >
              <button
                onClick={() => handleAddSection('blocks')}
                className='flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
              >
                <Edit3 className='w-4 h-4 text-primary' />
                <div className='text-left'>
                  <p className='font-medium'>Contenu original</p>
                  <p className='text-xs text-gray-400'>
                    Creer une nouvelle section avec des blocs
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleAddSection('reference')}
                className='flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
              >
                <LinkIcon className='w-4 h-4 text-purple-600' />
                <div className='text-left'>
                  <p className='font-medium'>Reference a un contenu existant</p>
                  <p className='text-xs text-gray-400'>
                    Lier un article, video ou guide publie
                  </p>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quiz section */}
      <div className='pt-2 border-t border-gray-200'>
        <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
          Quizz de chapitre
        </h4>
        {chapterQuiz ? (
          <div
            onClick={() => {
              setShowQuizEditor(true);
              onSubEditorChange?.(true);
            }}
            className='border rounded-xl p-4 bg-white shadow-sm flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors'
          >
            <div className='w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0'>
              <ClipboardList className='w-4 h-4' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900'>
                {chapterQuiz.title}
              </p>
              <p className='text-xs text-gray-400'>
                {chapterQuiz.questions_count ?? 0} question
                {(chapterQuiz.questions_count ?? 0) !== 1 ? 's' : ''}
                {' - '}Score minimum : {chapterQuiz.passing_score ?? 70}%
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
                    title: `Quizz - ${chapter.title || 'Chapitre'}`,
                  },
                },
                {
                  onSuccess: () => {
                    setShowQuizEditor(true);
                    onSubEditorChange?.(true);
                  },
                }
              );
            }}
            disabled={createQuiz.isPending}
            className='flex items-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors justify-center disabled:opacity-50'
          >
            {createQuiz.isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <ClipboardList className='w-4 h-4' />
            )}
            Ajouter un quizz de chapitre
          </button>
        )}
      </div>
    </div>
  );
}
