'use client';

import React from 'react';
import { Sparkles, Clock, Eye } from 'lucide-react';
import {
  EducationalContent,
  CONTENT_TYPE_LABELS,
} from '@/types/educational-content';

const TYPE_EMOJIS: Record<string, string> = {
  article: '📝',
  video: '🎬',
  guide: '📖',
  podcast: '🎙',
  course: '🎓',
};

interface ContentFeaturedProps {
  content: EducationalContent;
  onClick: () => void;
}

export function ContentFeatured({ content, onClick }: ContentFeaturedProps) {
  const isNew =
    content.publishedAt &&
    Date.now() - new Date(content.publishedAt).getTime() <
      7 * 24 * 60 * 60 * 1000;

  const readingLabel = content.durationSeconds
    ? `${Math.round(content.durationSeconds / 60)} min`
    : content.readingTimeMinutes
      ? `${content.readingTimeMinutes} min`
      : null;

  return (
    <div className='px-8 py-6'>
      <div
        onClick={onClick}
        className='bg-gradient-to-r from-[#1B998B] to-teal-500 rounded-2xl p-8 text-white cursor-pointer hover:shadow-xl transition-shadow relative overflow-hidden'
      >
        {/* Background pattern */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2' />
          <div className='absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2' />
        </div>

        <div className='relative flex items-start justify-between'>
          <div className='flex-1 max-w-2xl'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1'>
                <Sparkles className='w-4 h-4' />À la une
              </span>
              {isNew && (
                <span className='px-3 py-1 bg-amber-400 text-amber-900 rounded-full text-sm font-medium'>
                  Nouveau
                </span>
              )}
            </div>
            <h2 className='text-2xl font-bold mb-3'>{content.title}</h2>
            {content.summary && (
              <p className='text-emerald-100 mb-4 line-clamp-2'>
                {content.summary}
              </p>
            )}
            <div className='flex items-center gap-4 text-sm text-emerald-100'>
              {readingLabel && (
                <>
                  <span className='flex items-center gap-1'>
                    <Clock className='w-4 h-4' />
                    {readingLabel}
                  </span>
                  <span>•</span>
                </>
              )}
              <span>{CONTENT_TYPE_LABELS[content.type] || content.type}</span>
              {content.viewCount > 0 && (
                <>
                  <span>•</span>
                  <span className='flex items-center gap-1'>
                    <Eye className='w-4 h-4' />
                    {content.viewCount.toLocaleString()} vues
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Decorative icon */}
          <div className='hidden md:flex items-center justify-center w-32 h-32 bg-white/10 rounded-2xl'>
            <span className='text-6xl'>
              {TYPE_EMOJIS[content.type] || '📄'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentFeatured;
