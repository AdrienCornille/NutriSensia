'use client';

import React, { useState, useCallback } from 'react';
import {
  Star,
  GripVertical,
  X,
  Plus,
  Search,
  Loader2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useFeaturedContents,
  useUpdateFeatured,
} from '@/hooks/useContentInteractions';
import { useNutritionistContents } from '@/hooks/useNutritionistContent';
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

interface FeaturedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeaturedModal({ isOpen, onClose }: FeaturedModalProps) {
  const { data: featured, isLoading } = useFeaturedContents();
  const updateFeatured = useUpdateFeatured();
  const [search, setSearch] = useState('');

  const { data: searchResults } = useNutritionistContents({
    status: 'published',
    search: search || undefined,
    limit: 10,
  });

  const featuredIds = (featured || []).map(c => c.id);

  const handleAdd = useCallback(
    (content: EducationalContent) => {
      if (featuredIds.length >= 3) return;
      updateFeatured.mutate([...featuredIds, content.id]);
      setSearch('');
    },
    [featuredIds, updateFeatured]
  );

  const handleRemove = useCallback(
    (contentId: string) => {
      updateFeatured.mutate(featuredIds.filter(id => id !== contentId));
    },
    [featuredIds, updateFeatured]
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newIds = [...featuredIds];
      const [moved] = newIds.splice(fromIndex, 1);
      newIds.splice(toIndex, 0, moved);
      updateFeatured.mutate(newIds);
    },
    [featuredIds, updateFeatured]
  );

  if (!isOpen) return null;

  const availableContents = (searchResults?.contents || []).filter(
    c => !featuredIds.includes(c.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className='bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-500'>
              <Star className='w-5 h-5' />
            </div>
            <div>
              <h3 className='text-base font-semibold text-gray-900'>
                Contenu mis en avant
              </h3>
              <p className='text-xs text-gray-500 mt-0.5'>
                {featuredIds.length}/3 sélectionnés
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5 text-gray-400' />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
            </div>
          ) : (
            <>
              {/* Selected featured contents */}
              <div className='mb-5'>
                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-3'>
                  Contenus sélectionnés
                </p>
                {(featured || []).length === 0 ? (
                  <div className='bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-200'>
                    <Star className='w-8 h-8 text-gray-300 mx-auto mb-2' />
                    <p className='text-sm text-gray-400'>
                      Aucun contenu mis en avant
                    </p>
                    <p className='text-xs text-gray-400 mt-1'>
                      Sélectionnez jusqu&apos;à 3 contenus publiés ci-dessous
                    </p>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {(featured || []).map((content, index) => (
                      <div
                        key={content.id}
                        className='flex items-center gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-100'
                      >
                        {/* Reorder buttons */}
                        <div className='flex flex-col gap-0.5'>
                          <button
                            onClick={() => {
                              if (index > 0) handleReorder(index, index - 1);
                            }}
                            disabled={index === 0}
                            className='p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                          >
                            <ChevronUp className='w-3.5 h-3.5' />
                          </button>
                          <button
                            onClick={() => {
                              if (index < featuredIds.length - 1)
                                handleReorder(index, index + 1);
                            }}
                            disabled={index === featuredIds.length - 1}
                            className='p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                          >
                            <ChevronDown className='w-3.5 h-3.5' />
                          </button>
                        </div>

                        {/* Position number */}
                        <span className='w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0'>
                          {index + 1}
                        </span>

                        {/* Type emoji */}
                        <span className='text-lg flex-shrink-0'>
                          {TYPE_EMOJIS[content.type] || '📄'}
                        </span>

                        {/* Content info */}
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-900 truncate'>
                            {content.title}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {CONTENT_TYPE_LABELS[content.type]}
                          </p>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemove(content.id)}
                          className='p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors flex-shrink-0'
                        >
                          <X className='w-4 h-4' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add content picker */}
              {featuredIds.length < 3 && (
                <div>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-3'>
                    Ajouter un contenu publié
                  </p>
                  <div className='border border-gray-200 rounded-xl overflow-hidden'>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                      <input
                        type='text'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder='Rechercher un contenu publié...'
                        className='w-full pl-9 pr-4 py-2.5 text-sm border-b border-gray-100 focus:outline-none focus:bg-gray-50 transition-colors'
                        autoFocus
                      />
                    </div>
                    <div className='max-h-48 overflow-y-auto'>
                      {availableContents.length === 0 ? (
                        <p className='px-3 py-6 text-sm text-gray-400 text-center'>
                          {search
                            ? 'Aucun contenu publié trouvé'
                            : 'Tapez pour rechercher un contenu'}
                        </p>
                      ) : (
                        availableContents.map(content => (
                          <button
                            key={content.id}
                            onClick={() => handleAdd(content)}
                            className='flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-[#1B998B]/5 text-left transition-colors'
                          >
                            <span className='text-base flex-shrink-0'>
                              {TYPE_EMOJIS[content.type] || '📄'}
                            </span>
                            <div className='flex-1 min-w-0'>
                              <p className='truncate font-medium'>
                                {content.title}
                              </p>
                              <p className='text-xs text-gray-400'>
                                {CONTENT_TYPE_LABELS[content.type]}
                              </p>
                            </div>
                            <Plus className='w-4 h-4 text-[#1B998B] flex-shrink-0' />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-gray-100 bg-gray-50/50'>
          <button
            onClick={onClose}
            className='w-full px-4 py-2.5 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors'
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
