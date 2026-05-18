'use client';

import React, { useEffect } from 'react';
import {
  X,
  Bookmark,
  Share2,
  Download,
  Eye,
  Clock,
  FileText,
  Check,
} from 'lucide-react';
import {
  EducationalContent,
  CONTENT_TYPE_LABELS,
  CONTENT_CATEGORY_LABELS,
} from '@/types/educational-content';

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

const TYPE_EMOJIS: Record<string, string> = {
  article: '📝',
  guide: '📖',
  podcast: '🎙',
  course: '🎓',
};

interface ContentModalProps {
  isOpen: boolean;
  content: EducationalContent | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (contentId: string) => void;
}

export function ContentModal({
  isOpen,
  content,
  isSaved,
  onClose,
  onToggleSave,
}: ContentModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !content) return null;

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

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div
        className='bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col'
        onClick={e => e.stopPropagation()}
      >
        {/* Header image */}
        <div className='h-48 bg-gradient-to-br from-[#1B998B]/20 to-teal-100 flex items-center justify-center relative flex-shrink-0'>
          <span className='text-8xl opacity-50'>{emoji}</span>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors'
          >
            <X className='w-5 h-5 text-gray-600' />
          </button>
          <button
            onClick={() => onToggleSave(content.id)}
            className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isSaved
                ? 'bg-[#1B998B] text-white'
                : 'bg-white/90 text-gray-400 hover:text-[#1B998B]'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className='p-8 overflow-y-auto flex-1'>
          {/* Meta */}
          <div className='flex items-center gap-3 mb-4'>
            {content.customCategoryName ? (
              <span
                className='px-3 py-1 rounded-full text-sm font-medium'
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
                className={`px-3 py-1 rounded-full text-sm font-medium ${catColor.bg} ${catColor.text}`}
              >
                {CONTENT_CATEGORY_LABELS[content.category] || content.category}
              </span>
            )}
            {isNew && (
              <span className='px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium'>
                Nouveau
              </span>
            )}
          </div>

          <h2 className='text-2xl font-bold text-gray-800 mb-4'>
            {content.title}
          </h2>

          <div className='flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100 flex-wrap'>
            {content.publishedAt && (
              <>
                <span>
                  {new Date(content.publishedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
              </>
            )}
            <span>{CONTENT_TYPE_LABELS[content.type]}</span>
            {readingLabel && (
              <>
                <span>•</span>
                <span className='flex items-center gap-1'>
                  <Clock className='w-4 h-4' />
                  {readingLabel}
                </span>
              </>
            )}
            {content.type === 'guide' && content.pageCount && (
              <>
                <span>•</span>
                <span className='flex items-center gap-1'>
                  <FileText className='w-4 h-4' />
                  {content.pageCount} pages
                </span>
              </>
            )}
            {content.viewCount > 0 && (
              <>
                <span>•</span>
                <span className='flex items-center gap-1'>
                  <Eye className='w-4 h-4' />
                  {content.viewCount.toLocaleString()} lectures
                </span>
              </>
            )}
          </div>

          {/* Body */}
          <div className='prose prose-emerald max-w-none'>
            {content.summary && (
              <p className='text-gray-600 leading-relaxed text-lg'>
                {content.summary}
              </p>
            )}

            {content.body ? (
              <div
                className='mt-4'
                dangerouslySetInnerHTML={{ __html: content.body }}
              />
            ) : (
              <div className='my-8 p-6 bg-gray-50 rounded-xl'>
                <p className='text-gray-500 text-center italic'>
                  [Contenu complet non disponible]
                </p>
              </div>
            )}

            {content.keyPoints && content.keyPoints.length > 0 && (
              <>
                <h3 className='text-lg font-semibold text-gray-800 mt-6 mb-3'>
                  Points clés à retenir
                </h3>
                <ul className='space-y-2'>
                  {content.keyPoints.map((point, i) => (
                    <li key={i} className='flex items-start gap-2'>
                      <Check className='w-5 h-5 text-[#1B998B] mt-0.5 flex-shrink-0' />
                      <span className='text-gray-600'>{point}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='p-6 border-t border-gray-100 flex items-center justify-between flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2'>
              <Share2 className='w-4 h-4' />
              Partager
            </button>
            {content.type === 'guide' && (
              <button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2'>
                <Download className='w-4 h-4' />
                Télécharger PDF
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-[#1B998B] text-white font-medium rounded-lg hover:bg-[#1B998B]/90 transition-colors'
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentModal;
