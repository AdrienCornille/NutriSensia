'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileDown,
  Loader2,
} from 'lucide-react';
import {
  usePatientSection,
  useCompleteSection,
  useTrackSectionTime,
} from '@/hooks/usePatientCourse';

interface SectionViewProps {
  contentId: string;
  sectionId: string;
  onBack: () => void;
  onNext: (sectionId: string) => void;
  onPrev: (sectionId: string) => void;
}

export default function SectionView({
  contentId,
  sectionId,
  onBack,
  onNext,
  onPrev,
}: SectionViewProps) {
  const { data, isLoading } = usePatientSection(contentId, sectionId);
  const completeSection = useCompleteSection();
  const trackTime = useTrackSectionTime();
  const elapsedRef = useRef(0);

  // Time tracking: send every 30 seconds
  useEffect(() => {
    elapsedRef.current = 0;

    const tick = setInterval(() => {
      elapsedRef.current += 1;
    }, 1000);

    const send = setInterval(() => {
      if (elapsedRef.current > 0) {
        trackTime.mutate({
          contentId,
          sectionId,
          seconds: elapsedRef.current,
        });
        elapsedRef.current = 0;
      }
    }, 30_000);

    return () => {
      clearInterval(tick);
      clearInterval(send);
      // Send remaining time on unmount
      if (elapsedRef.current > 0) {
        trackTime.mutate({
          contentId,
          sectionId,
          seconds: elapsedRef.current,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, sectionId]);

  const handleComplete = useCallback(() => {
    completeSection.mutate({ contentId, sectionId });
  }, [completeSection, contentId, sectionId]);

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!data) {
    return (
      <div className='py-12 text-center text-gray-500'>
        Section introuvable.
      </div>
    );
  }

  const { section, blocks, navigation } = data;
  const isCompleted = section.is_completed;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='mx-auto max-w-3xl'
    >
      {/* Navigation header */}
      <div className='mb-6 flex items-center justify-between'>
        <button
          onClick={onBack}
          className='inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900'
        >
          <ArrowLeft className='h-4 w-4' />
          Retour au cours
        </button>
        <span className='text-sm text-gray-500'>
          {navigation.currentIndex + 1} sur {navigation.totalSections}
        </span>
      </div>

      {/* Section title */}
      <h1 className='mb-8 text-2xl font-bold text-gray-900'>{section.title}</h1>

      {/* Blocks */}
      <div className='space-y-6'>
        {blocks.map((block: any) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>

      {/* Complete button */}
      <div className='mt-10 flex justify-center'>
        {isCompleted ? (
          <div className='inline-flex items-center gap-2 rounded-xl bg-green-50 px-6 py-3 font-medium text-green-700'>
            <CheckCircle2 className='h-5 w-5' />
            Section terminée
          </div>
        ) : (
          <button
            onClick={handleComplete}
            disabled={completeSection.isPending}
            className='inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50'
          >
            {completeSection.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <CheckCircle2 className='h-4 w-4' />
            )}
            Marquer comme terminé
          </button>
        )}
      </div>

      {/* Prev / Next navigation */}
      <div className='mt-8 flex items-center justify-between border-t border-gray-200 pt-6'>
        {navigation.prevSectionId ? (
          <button
            onClick={() => onPrev(navigation.prevSectionId!)}
            className='inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900'
          >
            <ChevronLeft className='h-4 w-4' />
            Précédent
          </button>
        ) : (
          <span />
        )}
        {navigation.nextSectionId ? (
          <button
            onClick={() => onNext(navigation.nextSectionId!)}
            className='inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80'
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

// ─── Block renderer ───

function BlockRenderer({ block }: { block: any }) {
  switch (block.block_type) {
    case 'rich_text':
      return (
        <div
          className='prose prose-gray max-w-none'
          dangerouslySetInnerHTML={{ __html: block.content || '' }}
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
            title={block.alt_text || 'Vidéo'}
          />
        </div>
      );
    }

    case 'image':
      return (
        <figure className='overflow-hidden rounded-xl'>
          <img
            src={block.media_url}
            alt={block.alt_text || ''}
            className='w-full object-cover'
          />
          {block.alt_text && (
            <figcaption className='mt-2 text-center text-sm text-gray-500'>
              {block.alt_text}
            </figcaption>
          )}
        </figure>
      );

    case 'pdf':
      return (
        <a
          href={block.media_url}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100'
        >
          <FileDown className='h-6 w-6 text-primary' />
          <span className='font-medium text-gray-700'>
            {block.alt_text || 'Télécharger le document PDF'}
          </span>
        </a>
      );

    default:
      return null;
  }
}

function toEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;

  return url;
}
