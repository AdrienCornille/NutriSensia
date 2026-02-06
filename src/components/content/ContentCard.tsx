'use client';

import React from 'react';
import { Bookmark, Play, Clock, FileText, Eye, Headphones } from 'lucide-react';
import type { Content } from '@/types/content';
import { getCategoryConfig, getTypeLabel } from '@/types/content';

interface ContentCardProps {
  content: Content;
  isSaved: boolean;
  onToggleSave: (contentId: string) => void;
  onClick: () => void;
}

export function ContentCard({
  content,
  isSaved,
  onToggleSave,
  onClick,
}: ContentCardProps) {
  const categoryConfig = getCategoryConfig(content.category);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(content.id);
  };

  const getTypeIcon = () => {
    switch (content.type) {
      case 'video':
        return '🎬';
      case 'article':
        return '📝';
      case 'guide':
        return '📖';
      case 'podcast':
        return '🎙';
      default:
        return '📄';
    }
  };

  return (
    <div
      onClick={onClick}
      className='bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group'
    >
      {/* Thumbnail */}
      <div className='h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative'>
        <span className='text-6xl opacity-50'>{getTypeIcon()}</span>

        {/* Type badge */}
        <div className='absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1'>
          <span>{getTypeIcon()}</span>
          <span>{getTypeLabel(content.type)}</span>
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
        {content.isNew && (
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
      <div className='p-4'>
        {categoryConfig && (
          <div className='flex items-center gap-2 mb-2'>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.color}`}
            >
              {categoryConfig.label}
            </span>
          </div>
        )}

        <h3 className='font-semibold text-gray-800 group-hover:text-[#1B998B] transition-colors line-clamp-2'>
          {content.title}
        </h3>

        <p className='text-sm text-gray-500 mt-2 line-clamp-2'>
          {content.description}
        </p>

        <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            {content.type === 'video' || content.type === 'podcast' ? (
              <span className='flex items-center gap-1'>
                <Clock className='w-4 h-4' />
                {content.duration}
              </span>
            ) : content.type === 'guide' ? (
              <span className='flex items-center gap-1'>
                <FileText className='w-4 h-4' />
                {content.pages} pages
              </span>
            ) : (
              <span className='flex items-center gap-1'>
                <Clock className='w-4 h-4' />
                {content.readTime}
              </span>
            )}
            {content.views && (
              <span className='flex items-center gap-1 ml-2'>
                <Eye className='w-4 h-4' />
                {content.views.toLocaleString()}
              </span>
            )}
            {content.listens && (
              <span className='flex items-center gap-1 ml-2'>
                <Headphones className='w-4 h-4' />
                {content.listens.toLocaleString()}
              </span>
            )}
          </div>
          <span className='text-xs text-gray-400'>{content.date}</span>
        </div>
      </div>
    </div>
  );
}

export default ContentCard;
