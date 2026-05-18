'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Link2, FileText, Loader2, Check } from 'lucide-react';
import {
  useSectionBlocks,
  useCreateBlock,
  useUpdateBlock,
  useUpdateSection,
} from '@/hooks/useCourseBuilder';
import RichTextEditor from '../shared/RichTextEditor';

interface SectionEditorProps {
  courseId: string;
  chapterId: string;
  section: any;
  onBack: () => void;
  showBackButton?: boolean;
}

export default function SectionEditor({
  courseId,
  chapterId,
  section,
  onBack,
  showBackButton = true,
}: SectionEditorProps) {
  const { data: blocks = [], isLoading } = useSectionBlocks(
    courseId,
    chapterId,
    section.id
  );
  const createBlock = useCreateBlock();
  const updateBlock = useUpdateBlock();
  const updateSection = useUpdateSection();

  const [title, setTitle] = useState(section.title || '');
  const [blockCreated, setBlockCreated] = useState(false);
  const [savedSectionField, setSavedSectionField] = useState<string | null>(
    null
  );
  const [savingSectionField, setSavingSectionField] = useState<string | null>(
    null
  );
  const savedSectionFieldTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSectionFieldRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Track the latest body content locally
  const latestBodyRef = useRef<string>('');

  const isBlocks = section.section_type === 'blocks';
  const isReference = section.section_type === 'reference';

  // For 'blocks' sections: use a single rich_text block as the content
  const richTextBlock = blocks.find((b: any) => b.block_type === 'rich_text');
  const bodyContent = richTextBlock?.body || '';

  // Init latestBody from server data
  useEffect(() => {
    if (richTextBlock?.body) {
      latestBodyRef.current = richTextBlock.body;
    }
  }, [richTextBlock?.body]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (savedSectionFieldTimerRef.current)
        clearTimeout(savedSectionFieldTimerRef.current);
    };
  }, []);

  // Auto-create a single rich_text block if none exists
  useEffect(() => {
    if (
      isBlocks &&
      !isLoading &&
      blocks.length === 0 &&
      !blockCreated &&
      !createBlock.isPending
    ) {
      setBlockCreated(true);
      createBlock.mutate({
        courseId,
        chapterId,
        sectionId: section.id,
        data: { block_type: 'rich_text' },
      });
    }
  }, [
    isBlocks,
    isLoading,
    blocks.length,
    blockCreated,
    createBlock,
    courseId,
    chapterId,
    section.id,
  ]);

  const triggerAutoSave = useCallback(
    (fieldName?: string) => {
      if (fieldName) lastSectionFieldRef.current = fieldName;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        let pendingOps = 0;
        let completedOps = 0;
        setSavingSectionField(lastSectionFieldRef.current);
        const checkDone = () => {
          completedOps++;
          if (completedOps >= pendingOps) {
            setSavingSectionField(null);
            setSavedSectionField(lastSectionFieldRef.current);
            if (savedSectionFieldTimerRef.current)
              clearTimeout(savedSectionFieldTimerRef.current);
            savedSectionFieldTimerRef.current = setTimeout(
              () => setSavedSectionField(null),
              2000
            );
          }
        };

        if (title !== (section.title || '')) {
          pendingOps++;
          updateSection.mutate(
            { courseId, chapterId, sectionId: section.id, data: { title } },
            {
              onSuccess: checkDone,
              onError: () => {
                setSavingSectionField(null);
                setSavedSectionField(null);
              },
            }
          );
        }
        if (
          richTextBlock &&
          latestBodyRef.current !== (richTextBlock.body || '')
        ) {
          pendingOps++;
          updateBlock.mutate(
            {
              courseId,
              chapterId,
              sectionId: section.id,
              blockId: richTextBlock.id,
              data: { body: latestBodyRef.current },
            },
            {
              onSuccess: checkDone,
              onError: () => {
                setSavingSectionField(null);
                setSavedSectionField(null);
              },
            }
          );
        }
        if (pendingOps === 0) setSavingSectionField(null);
      }, 2000);
    },
    [
      title,
      section.title,
      section.id,
      richTextBlock,
      courseId,
      chapterId,
      updateSection,
      updateBlock,
    ]
  );

  // Called on every keystroke in the editor
  const handleBodyUpdate = useCallback(
    (html: string) => {
      latestBodyRef.current = html;
      triggerAutoSave('sectionContent');
    },
    [triggerAutoSave]
  );

  // Called on blur
  const handleBodyBlur = useCallback(
    (html: string) => {
      latestBodyRef.current = html;
      triggerAutoSave('sectionContent');
    },
    [triggerAutoSave]
  );

  // Track title changes
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      triggerAutoSave('sectionTitle');
    },
    [triggerAutoSave]
  );

  return (
    <div>
      {/* Back button + actions */}
      <div className='flex items-center justify-between mb-4'>
        {showBackButton ? (
          <button
            type='button'
            onClick={onBack}
            className='flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            Retour au chapitre
          </button>
        ) : (
          <div />
        )}

        <div />
      </div>

      {/* Section title */}
      <div className='mb-6'>
        <div>
          <div className='flex items-center justify-between mb-1'>
            <label className='text-sm font-medium text-gray-700'>
              Titre de la section
            </label>
            {savingSectionField === 'sectionTitle' && (
              <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
            )}
            {savedSectionField === 'sectionTitle' && (
              <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                <Check className='h-3 w-3' />
                Enregistré
              </span>
            )}
          </div>
          <input
            type='text'
            className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-colors'
            value={title}
            onChange={handleTitleChange}
            placeholder='Ex: Les protéines'
          />
        </div>
      </div>

      {/* ─── Content section (single editor) ─── */}
      {isBlocks && (
        <>
          {isLoading || (!richTextBlock && !blockCreated) ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-5 w-5 animate-spin text-gray-400' />
            </div>
          ) : richTextBlock ? (
            /* Edit mode — single Tiptap editor */
            <div>
              <div className='flex items-center justify-between mb-1'>
                <label className='text-sm font-medium text-gray-700'>
                  Contenu de la section
                </label>
                {savingSectionField === 'sectionContent' && (
                  <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
                )}
                {savedSectionField === 'sectionContent' && (
                  <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                    <Check className='h-3 w-3' />
                    Enregistré
                  </span>
                )}
              </div>
              <RichTextEditor
                content={bodyContent}
                onChange={handleBodyUpdate}
                onSave={handleBodyBlur}
                placeholder='Rédigez le contenu de la section...'
                minHeight='400px'
              />
            </div>
          ) : null}
        </>
      )}

      {/* Reference section */}
      {isReference && (
        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          {section.referenced_content ? (
            <div className='flex items-start gap-4'>
              {section.referenced_content.thumbnail_url ? (
                <div className='h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-100'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={section.referenced_content.thumbnail_url}
                    alt=''
                    className='h-full w-full object-cover'
                  />
                </div>
              ) : (
                <div className='flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-md bg-gray-100'>
                  <FileText className='h-6 w-6 text-gray-300' />
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <h4 className='text-sm font-medium text-gray-900 truncate'>
                  {section.referenced_content.title}
                </h4>
                <p className='mt-0.5 text-xs text-gray-500 capitalize'>
                  {section.referenced_content.content_type || 'Contenu'}
                </p>
              </div>
            </div>
          ) : (
            <div className='text-center py-4'>
              <Link2 className='mx-auto h-8 w-8 text-gray-300 mb-2' />
              <p className='text-sm text-gray-400'>Aucun contenu référencé</p>
            </div>
          )}

          <button
            type='button'
            className='mt-4 w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors'
          >
            Changer le contenu
          </button>
        </div>
      )}
    </div>
  );
}
