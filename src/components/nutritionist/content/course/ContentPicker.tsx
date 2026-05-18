'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  FileText,
  Video,
  BookOpen,
  Headphones,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  thumbnail_url?: string | null;
  created_at: string;
}

interface ContentPickerProps {
  courseId: string;
  onSelect: (contentId: string) => void;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  article: 'Article',
  video: 'Vidéo',
  guide: 'Guide',
  podcast: 'Podcast',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <FileText className='w-4 h-4' />,
  video: <Video className='w-4 h-4' />,
  guide: <BookOpen className='w-4 h-4' />,
  podcast: <Headphones className='w-4 h-4' />,
};

const TYPE_COLORS: Record<string, string> = {
  article: 'bg-blue-50 text-blue-700',
  video: 'bg-purple-50 text-purple-700',
  guide: 'bg-amber-50 text-amber-700',
  podcast: 'bg-pink-50 text-pink-700',
};

export function ContentPicker({
  courseId,
  onSelect,
  onClose,
}: ContentPickerProps) {
  const [search, setSearch] = useState('');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch contents
  const fetchContents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ status: 'published' });
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }
      const res = await fetch(
        `/api/protected/nutritionist/content?${params.toString()}`,
        { credentials: 'include' }
      );
      const json = await res.json();
      if (res.ok && json.data) {
        // Filter out courses — can't reference a course inside a course
        const filtered = (json.data.contents || json.data || []).filter(
          (c: ContentItem) => c.type !== 'course'
        );
        setContents(filtered);
      } else {
        setContents([]);
      }
    } catch {
      setContents([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AnimatePresence>
      <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className='bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden'
        >
          {/* Header */}
          <div className='flex items-center justify-between px-5 py-4 border-b border-gray-200'>
            <h3 className='text-base font-semibold text-gray-900'>
              S&eacute;lectionner un contenu
            </h3>
            <button
              onClick={onClose}
              className='p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Search */}
          <div className='px-5 py-3 border-b border-gray-100'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Rechercher par titre...'
                className='w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
                autoFocus
              />
            </div>
          </div>

          {/* Content list */}
          <div className='flex-1 overflow-y-auto'>
            {isLoading ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
              </div>
            ) : contents.length === 0 ? (
              <div className='text-center py-12'>
                <FileText className='w-10 h-10 text-gray-300 mx-auto mb-2' />
                <p className='text-sm text-gray-500'>
                  Aucun contenu publi&eacute; trouv&eacute;
                </p>
                {search && (
                  <p className='text-xs text-gray-400 mt-1'>
                    Essayez avec d&apos;autres termes de recherche
                  </p>
                )}
              </div>
            ) : (
              <div className='py-2'>
                {contents.map(content => (
                  <button
                    key={content.id}
                    onClick={() => {
                      onSelect(content.id);
                      onClose();
                    }}
                    className='flex items-center gap-3 w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors'
                  >
                    {/* Thumbnail */}
                    <div className='w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center'>
                      {content.thumbnail_url ? (
                        <img
                          src={content.thumbnail_url}
                          alt=''
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <span className='text-gray-400'>
                          {TYPE_ICONS[content.type] || (
                            <ImageIcon className='w-5 h-5' />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {content.title}
                      </p>
                      <div className='flex items-center gap-2 mt-0.5'>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                            TYPE_COLORS[content.type] ||
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {TYPE_LABELS[content.type] || content.type}
                        </span>
                        <span className='text-xs text-gray-400'>
                          {formatDate(content.created_at)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
