'use client';

import React from 'react';
import { Bookmark, Play, Clock, FileText, Eye, Headphones } from 'lucide-react';
import {
  EducationalContent,
  CONTENT_TYPE_LABELS,
  CONTENT_CATEGORY_LABELS,
} from '@/types/educational-content';

interface ContentCardProps {
  content: EducationalContent;
  isSaved: boolean;
  onToggleSave: (contentId: string) => void;
  onClick: () => void;
}

const TYPE_EMOJIS: Record<string, string> = {
  article: '📝',
  video: '🎬',
  guide: '📖',
  podcast: '🎙',
  course: '🎓',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  nutrition_basics: { bg: 'bg-blue-100', text: 'text-blue-700' },
  healthy_recipes: { bg: 'bg-amber-100', text: 'text-amber-700' },
  weight_management: { bg: 'bg-purple-100', text: 'text-purple-700' },
  sports_nutrition: { bg: 'bg-green-100', text: 'text-green-700' },
  digestive_health: { bg: 'bg-red-100', text: 'text-red-700' },
  mental_wellbeing: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  food_allergies: { bg: 'bg-orange-100', text: 'text-orange-700' },
  supplements: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  meal_planning: { bg: 'bg-teal-100', text: 'text-teal-700' },
  lifestyle: { bg: 'bg-pink-100', text: 'text-pink-700' },
  other: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export function ContentCard({
  content,
  isSaved,
  onToggleSave,
  onClick,
}: ContentCardProps) {
  const emoji = TYPE_EMOJIS[content.type] || '📄';
  const catColor = CATEGORY_COLORS[content.category] || CATEGORY_COLORS.other;

  const isNew =
    content.publishedAt &&
    Date.now() - new Date(content.publishedAt).getTime() <
      7 * 24 * 60 * 60 * 1000;

  const readingLabel = content.durationSeconds
    ? `${Math.round(content.durationSeconds / 60)} min`
    : content.readingTimeMinutes
      ? `${content.readingTimeMinutes} min`
      : null;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(content.id);
  };

  return (
    <div
      onClick={onClick}
      className='bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col'
    >
      {/* Thumbnail */}
      <div className='h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative'>
        {content.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.thumbnailUrl}
            alt={content.title}
            className='absolute inset-0 w-full h-full object-cover'
          />
        ) : (
          <span className='text-6xl opacity-50'>{emoji}</span>
        )}

        {/* Type badge */}
        <div className='absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1'>
          <span>{emoji}</span>
          <span>{CONTENT_TYPE_LABELS[content.type]}</span>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveClick}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isSaved
              ? 'bg-[#1B998B] text-white'
              : 'bg-white/90 text-gray-400 hover:text-[#1B998B]'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* New badge */}
        {isNew && (
          <div className='absolute bottom-3 left-3 px-2 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-medium'>
            Nouveau
          </div>
        )}

        {/* Play button for videos */}
        {content.type === 'video' && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform'>
              <Play className='w-6 h-6 text-[#1B998B] ml-1' />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-4 flex flex-col flex-1'>
        {(content.customCategoryName || content.category) && (
          <div className='flex items-center gap-2 mb-2'>
            {content.customCategoryName ? (
              <span
                className='px-2 py-0.5 rounded-full text-xs font-medium'
                style={
                  content.customCategoryColor
                    ? {
                        backgroundColor: `${content.customCategoryColor}20`,
                        color: content.customCategoryColor,
                      }
                    : undefined
                }
              >
                {content.customCategoryName}
              </span>
            ) : (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColor.bg} ${catColor.text}`}
              >
                {CONTENT_CATEGORY_LABELS[content.category] || content.category}
              </span>
            )}
          </div>
        )}

        <h3 className='font-semibold text-gray-800 group-hover:text-[#1B998B] transition-colors line-clamp-2'>
          {content.title}
        </h3>

        <p className='text-sm text-gray-500 mt-2 line-clamp-2 flex-1'>
          {content.summary || '\u00A0'}
        </p>

        <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            {content.type === 'guide' && content.pageCount ? (
              <span className='flex items-center gap-1'>
                <FileText className='w-4 h-4' />
                {content.pageCount} pages
              </span>
            ) : readingLabel ? (
              <span className='flex items-center gap-1'>
                <Clock className='w-4 h-4' />
                {readingLabel}
              </span>
            ) : null}
            {content.viewCount > 0 && (
              <span className='flex items-center gap-1 ml-2'>
                <Eye className='w-4 h-4' />
                {content.viewCount.toLocaleString()}
              </span>
            )}
          </div>
          {content.publishedAt && (
            <span className='text-xs text-gray-400'>
              {new Date(content.publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentCard;
