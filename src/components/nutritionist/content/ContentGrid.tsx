'use client';

import React from 'react';
import {
  FileText,
  Video,
  BookOpen,
  Headphones,
  Eye,
  Bookmark,
  MoreVertical,
  Pencil,
  Trash2,
  Send,
  Archive,
  RotateCcw,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  EducationalContent,
  ContentType,
  CONTENT_TYPE_LABELS,
  CONTENT_STATUS_LABELS,
  CONTENT_CATEGORY_LABELS,
} from '@/types/educational-content';

interface ContentGridProps {
  contents: EducationalContent[];
  onEdit: (content: EducationalContent) => void;
  onDelete: (content: EducationalContent) => void;
  onPublish: (content: EducationalContent) => void;
  onArchive: (content: EducationalContent) => void;
  onUnpublish?: (content: EducationalContent) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

const TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  article: <FileText className='w-4 h-4' />,
  video: <Video className='w-4 h-4' />,
  guide: <BookOpen className='w-4 h-4' />,
  podcast: <Headphones className='w-4 h-4' />,
};

const TYPE_COLORS: Record<ContentType, string> = {
  article: 'bg-blue-50 text-blue-600',
  video: 'bg-purple-50 text-purple-600',
  guide: 'bg-orange-50 text-orange-600',
  podcast: 'bg-pink-50 text-pink-600',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-amber-50 text-amber-600',
  published: 'bg-green-50 text-green-600',
  archived: 'bg-yellow-50 text-yellow-600',
};

export function ContentGrid({
  contents,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  onUnpublish,
  selectedIds,
  onToggleSelect,
}: ContentGridProps) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  if (contents.length === 0) {
    return (
      <div className='text-center py-16'>
        <FileText className='w-12 h-12 text-gray-300 mx-auto mb-3' />
        <p className='text-gray-500 font-medium'>Aucun contenu</p>
        <p className='text-gray-400 text-sm mt-1'>
          Commencez par créer votre premier article ou guide.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
      {contents.map(content => {
        const isNew =
          content.publishedAt &&
          Date.now() - new Date(content.publishedAt).getTime() <
            7 * 24 * 60 * 60 * 1000;

        return (
          <div
            key={content.id}
            className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group ${
              selectedIds?.has(content.id)
                ? 'border-[#1B998B] ring-2 ring-[#1B998B]/20'
                : 'border-gray-200'
            }`}
            onClick={() => onEdit(content)}
          >
            {/* Thumbnail */}
            <div className='relative aspect-video bg-gray-100 overflow-hidden'>
              {content.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='flex items-center justify-center h-full'>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${TYPE_COLORS[content.type]}`}
                  >
                    {TYPE_ICONS[content.type]}
                  </div>
                </div>
              )}
              {/* Top badges */}
              <div className='absolute top-2 left-2 flex items-center gap-1.5'>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[content.status]}`}
                >
                  {CONTENT_STATUS_LABELS[content.status]}
                </span>
                {isNew && (
                  <span className='text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600'>
                    Nouveau
                  </span>
                )}
              </div>
              {/* Checkbox for bulk selection */}
              {onToggleSelect && (
                <div className='absolute top-2 right-2'>
                  <input
                    type='checkbox'
                    checked={selectedIds?.has(content.id) || false}
                    onChange={e => {
                      e.stopPropagation();
                      onToggleSelect(content.id);
                    }}
                    onClick={e => e.stopPropagation()}
                    className='w-4 h-4 rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B] opacity-0 group-hover:opacity-100 transition-opacity'
                  />
                </div>
              )}
            </div>

            {/* Card body */}
            <div className='p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs ${TYPE_COLORS[content.type]}`}
                >
                  {TYPE_ICONS[content.type]}
                </span>
                <span className='text-xs text-gray-500'>
                  {CONTENT_CATEGORY_LABELS[content.category]}
                </span>
              </div>
              <h3 className='font-medium text-gray-900 text-sm line-clamp-2 mb-2'>
                {content.title}
              </h3>
              {content.summary && (
                <p className='text-xs text-gray-500 line-clamp-2 mb-3'>
                  {content.summary}
                </p>
              )}
              {/* Footer */}
              <div className='flex items-center justify-between text-xs text-gray-400'>
                <div className='flex items-center gap-3'>
                  <span className='flex items-center gap-1'>
                    <Eye className='w-3.5 h-3.5' />
                    {content.viewCount}
                  </span>
                  <span className='flex items-center gap-1'>
                    <Bookmark className='w-3.5 h-3.5' />
                    {content.saveCount}
                  </span>
                  {content.readingTimeMinutes && (
                    <span className='flex items-center gap-1'>
                      <Clock className='w-3.5 h-3.5' />
                      {content.readingTimeMinutes} min
                    </span>
                  )}
                </div>
                {/* Actions */}
                <div className='relative' onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === content.id ? null : content.id
                      )
                    }
                    className='p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <MoreVertical className='w-4 h-4' />
                  </button>
                  {openMenuId === content.id && (
                    <>
                      <div
                        className='fixed inset-0 z-10'
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className='absolute right-0 bottom-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48'>
                        <button
                          onClick={() => {
                            onEdit(content);
                            setOpenMenuId(null);
                          }}
                          className='flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                        >
                          <Pencil className='w-4 h-4' />
                          Modifier
                        </button>
                        {(content.status === 'draft' ||
                          content.status === 'scheduled') && (
                          <button
                            onClick={() => {
                              onPublish(content);
                              setOpenMenuId(null);
                            }}
                            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50'
                          >
                            <Send className='w-4 h-4' />
                            Publier
                          </button>
                        )}
                        {content.status === 'published' && onUnpublish && (
                          <button
                            onClick={() => {
                              onUnpublish(content);
                              setOpenMenuId(null);
                            }}
                            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-orange-600 hover:bg-orange-50'
                          >
                            <RotateCcw className='w-4 h-4' />
                            Dépublier
                          </button>
                        )}
                        {content.status === 'published' && (
                          <button
                            onClick={() => {
                              onArchive(content);
                              setOpenMenuId(null);
                            }}
                            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50'
                          >
                            <Archive className='w-4 h-4' />
                            Archiver
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onDelete(content);
                            setOpenMenuId(null);
                          }}
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
        );
      })}
    </div>
  );
}
