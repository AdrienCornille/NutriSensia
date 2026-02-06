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
  User,
  Check,
} from 'lucide-react';
import type { Content } from '@/types/content';
import { getCategoryConfig } from '@/types/content';

interface ContentModalProps {
  isOpen: boolean;
  content: Content | null;
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
  // Close on escape key
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

  const categoryConfig = getCategoryConfig(content.category);

  const getTypeIcon = () => {
    switch (content.type) {
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
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div
        className='bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col'
        onClick={e => e.stopPropagation()}
      >
        {/* Header image */}
        <div className='h-48 bg-gradient-to-br from-[#1B998B]/20 to-teal-100 flex items-center justify-center relative flex-shrink-0'>
          <span className='text-8xl opacity-50'>{getTypeIcon()}</span>
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
            {categoryConfig && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${categoryConfig.bgColor} ${categoryConfig.color}`}
              >
                {categoryConfig.label}
              </span>
            )}
            {content.isNew && (
              <span className='px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium'>
                Nouveau
              </span>
            )}
          </div>

          <h2 className='text-2xl font-bold text-gray-800 mb-4'>
            {content.title}
          </h2>

          <div className='flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100 flex-wrap'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-[#1B998B] rounded-full flex items-center justify-center text-white text-xs font-medium'>
                {content.author
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </div>
              <span>{content.author}</span>
            </div>
            <span>•</span>
            <span>{content.date}</span>
            <span>•</span>
            <span className='flex items-center gap-1'>
              {content.type === 'guide' ? (
                <>
                  <FileText className='w-4 h-4' />
                  {content.pages} pages
                </>
              ) : (
                <>
                  <Clock className='w-4 h-4' />
                  {content.readTime || content.duration}
                </>
              )}
            </span>
            {content.views && (
              <>
                <span>•</span>
                <span className='flex items-center gap-1'>
                  <Eye className='w-4 h-4' />
                  {content.views.toLocaleString()} lectures
                </span>
              </>
            )}
          </div>

          {/* Article content placeholder */}
          <div className='prose prose-emerald max-w-none'>
            <p className='text-gray-600 leading-relaxed text-lg'>
              {content.description}
            </p>

            <div className='my-8 p-6 bg-gray-50 rounded-xl'>
              <p className='text-gray-500 text-center italic'>
                [Contenu de l'article...]
              </p>
            </div>

            <h3 className='text-lg font-semibold text-gray-800 mt-6 mb-3'>
              Points clés à retenir
            </h3>
            <ul className='space-y-2'>
              <li className='flex items-start gap-2'>
                <Check className='w-5 h-5 text-[#1B998B] mt-0.5 flex-shrink-0' />
                <span className='text-gray-600'>
                  Premier point important de l'article
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <Check className='w-5 h-5 text-[#1B998B] mt-0.5 flex-shrink-0' />
                <span className='text-gray-600'>
                  Deuxième point important de l'article
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <Check className='w-5 h-5 text-[#1B998B] mt-0.5 flex-shrink-0' />
                <span className='text-gray-600'>
                  Troisième point important de l'article
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className='p-6 border-t border-gray-100 flex items-center justify-between flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2'>
              <Share2 className='w-4 h-4' />
              Partager
            </button>
            {content.downloadable && (
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
