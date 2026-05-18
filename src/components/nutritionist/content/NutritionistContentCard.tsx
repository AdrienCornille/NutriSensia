'use client';

import React from 'react';
import {
  FileText,
  Video,
  BookOpen,
  Headphones,
  GraduationCap,
  Eye,
  Bookmark,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  Send,
  Archive,
  RotateCcw,
  Calendar,
  Play,
} from 'lucide-react';
import {
  EducationalContent,
  ContentType,
  CONTENT_TYPE_LABELS,
  CONTENT_STATUS_LABELS,
  CONTENT_CATEGORY_LABELS,
} from '@/types/educational-content';

interface NutritionistContentCardProps {
  content: EducationalContent;
  onEdit: (content: EducationalContent) => void;
  onPublish: (content: EducationalContent) => void;
  onArchive: (content: EducationalContent) => void;
  onUnpublish: (content: EducationalContent) => void;
  onSchedule: (content: EducationalContent) => void;
  onDelete: (content: EducationalContent) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const TYPE_EMOJIS: Record<ContentType, string> = {
  article: '📝',
  video: '🎬',
  guide: '📖',
  podcast: '🎙',
  course: '🎓',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-amber-50 text-amber-600',
  published: 'bg-green-50 text-green-600',
  archived: 'bg-yellow-50 text-yellow-600',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  nutrition_basics: { bg: 'bg-blue-50', text: 'text-blue-700' },
  healthy_recipes: { bg: 'bg-amber-50', text: 'text-amber-700' },
  weight_management: { bg: 'bg-purple-50', text: 'text-purple-700' },
  sports_nutrition: { bg: 'bg-green-50', text: 'text-green-700' },
  digestive_health: { bg: 'bg-red-50', text: 'text-red-700' },
  mental_wellbeing: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  food_allergies: { bg: 'bg-orange-50', text: 'text-orange-700' },
  supplements: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  meal_planning: { bg: 'bg-teal-50', text: 'text-teal-700' },
  lifestyle: { bg: 'bg-pink-50', text: 'text-pink-700' },
  other: { bg: 'bg-gray-50', text: 'text-gray-700' },
};

export function NutritionistContentCard({
  content,
  onEdit,
  onPublish,
  onArchive,
  onUnpublish,
  onSchedule,
  onDelete,
  isSelected,
  onToggleSelect,
}: NutritionistContentCardProps) {
  const [openMenu, setOpenMenu] = React.useState(false);

  const isNew =
    content.publishedAt &&
    Date.now() - new Date(content.publishedAt).getTime() <
      7 * 24 * 60 * 60 * 1000;

  const categoryColor =
    CATEGORY_COLORS[content.category] || CATEGORY_COLORS.other;

  const handleMenuAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu(false);
    action();
  };

  return (
    <div
      onClick={() => onEdit(content)}
      className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col ${
        isSelected
          ? 'border-[#1B998B] ring-2 ring-[#1B998B]/20'
          : 'border-gray-200'
      }`}
    >
      {/* Thumbnail */}
      <div className='h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative'>
        <span className='text-6xl opacity-50'>{TYPE_EMOJIS[content.type]}</span>

        {content.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.thumbnailUrl}
            alt={content.title}
            className='absolute inset-0 w-full h-full object-cover'
          />
        )}

        {/* Type badge */}
        <div className='absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1'>
          <span>{TYPE_EMOJIS[content.type]}</span>
          <span>{CONTENT_TYPE_LABELS[content.type]}</span>
        </div>

        {/* Status badge */}
        <div className='absolute top-3 right-3 flex items-center gap-1.5'>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[content.status]}`}
          >
            {CONTENT_STATUS_LABELS[content.status]}
          </span>
        </div>

        {/* New badge */}
        {isNew && (
          <div className='absolute bottom-3 left-3 px-2 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-medium'>
            Nouveau
          </div>
        )}

        {/* Scheduled date */}
        {content.status === 'scheduled' && content.scheduledPublishAt && (
          <div className='absolute bottom-3 right-3 px-2 py-1 bg-amber-100/90 backdrop-blur-sm text-amber-700 rounded-full text-xs font-medium flex items-center gap-1'>
            <Calendar className='w-3 h-3' />
            {new Date(content.scheduledPublishAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}

        {/* Play button for videos */}
        {content.type === 'video' && (
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
            <div className='w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform'>
              <Play className='w-6 h-6 text-[#1B998B] ml-1' />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-4 flex flex-col flex-1'>
        {/* Category pill */}
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
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor.bg} ${categoryColor.text}`}
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

        {/* Footer */}
        <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            {(content.readingTimeMinutes || content.durationSeconds) && (
              <span className='flex items-center gap-1'>
                <Clock className='w-4 h-4' />
                {content.durationSeconds
                  ? `${Math.round(content.durationSeconds / 60)} min`
                  : `${content.readingTimeMinutes} min`}
              </span>
            )}
            <span className='flex items-center gap-1'>
              <Eye className='w-4 h-4' />
              {content.viewCount}
            </span>
            <span className='flex items-center gap-1'>
              <Bookmark className='w-4 h-4' />
              {content.saveCount}
            </span>
          </div>

          <div className='flex items-center gap-1'>
            {/* Checkbox for bulk selection */}
            {onToggleSelect && (
              <div onClick={e => e.stopPropagation()}>
                <input
                  type='checkbox'
                  checked={isSelected || false}
                  onChange={e => {
                    e.stopPropagation();
                    onToggleSelect(content.id);
                  }}
                  className={`w-4 h-4 rounded border-gray-300 accent-[#1B998B] text-[#1B998B] focus:ring-[#1B998B] transition-opacity cursor-pointer ${
                    isSelected
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                />
              </div>
            )}

            {/* Actions menu */}
            <div className='relative' onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className='p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors'
              >
                <MoreVertical className='w-4 h-4' />
              </button>
              {openMenu && (
                <>
                  <div
                    className='fixed inset-0 z-10'
                    onClick={() => setOpenMenu(false)}
                  />
                  <div className='absolute right-0 bottom-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48'>
                    <button
                      onClick={handleMenuAction(() => onEdit(content))}
                      className='flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                    >
                      <Pencil className='w-4 h-4' />
                      Modifier
                    </button>
                    {(content.status === 'draft' ||
                      content.status === 'scheduled') && (
                      <>
                        <button
                          onClick={handleMenuAction(() => onPublish(content))}
                          className='flex items-center gap-2 w-full px-3 py-2 text-sm text-[#1B998B] hover:bg-[#1B998B]/5'
                        >
                          <Send className='w-4 h-4' />
                          Publier
                        </button>
                        <button
                          onClick={handleMenuAction(() => onSchedule(content))}
                          className='flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-700 hover:bg-amber-50'
                        >
                          <Calendar className='w-4 h-4' />
                          Planifier
                        </button>
                      </>
                    )}
                    {content.status === 'published' && (
                      <>
                        <button
                          onClick={handleMenuAction(() => onUnpublish(content))}
                          className='flex items-center gap-2 w-full px-3 py-2 text-sm text-orange-600 hover:bg-orange-50'
                        >
                          <RotateCcw className='w-4 h-4' />
                          Remettre en brouillon
                        </button>
                        <button
                          onClick={handleMenuAction(() => onArchive(content))}
                          className='flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-600 hover:bg-amber-50'
                        >
                          <Archive className='w-4 h-4' />
                          Archiver
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleMenuAction(() => onDelete(content))}
                      className='flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50'
                    >
                      <Trash2 className='w-4 h-4' />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
