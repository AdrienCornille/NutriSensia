'use client';

import React, { useState, useCallback } from 'react';
import { Star, GripVertical, X, Plus, Search, Loader2 } from 'lucide-react';
import {
  useFeaturedContents,
  useUpdateFeatured,
} from '@/hooks/useContentInteractions';
import { useNutritionistContents } from '@/hooks/useNutritionistContent';
import { EducationalContent } from '@/types/educational-content';

export function FeaturedManager() {
  const { data: featured, isLoading } = useFeaturedContents();
  const updateFeatured = useUpdateFeatured();
  const [showPicker, setShowPicker] = useState(false);
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
      setShowPicker(false);
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

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-5'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
          <Star className='w-4 h-4 text-amber-500' />
          Contenus mis en avant ({featuredIds.length}/3)
        </h3>
        {featuredIds.length < 3 && (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className='flex items-center gap-1.5 text-xs text-[#1B998B] hover:underline'
          >
            <Plus className='w-3.5 h-3.5' />
            Ajouter
          </button>
        )}
      </div>

      {/* Featured list */}
      {(featured || []).length === 0 ? (
        <p className='text-sm text-gray-400 text-center py-4'>
          Aucun contenu mis en avant. Ajoutez jusqu&apos;à 3 contenus.
        </p>
      ) : (
        <div className='space-y-2'>
          {(featured || []).map((content, index) => (
            <div
              key={content.id}
              className='flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100'
            >
              <button
                className='text-gray-400 hover:text-gray-600 cursor-grab'
                title='Glisser pour réordonner'
                onClick={() => {
                  if (index > 0) handleReorder(index, index - 1);
                }}
              >
                <GripVertical className='w-4 h-4' />
              </button>
              <span className='w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium flex items-center justify-center'>
                {index + 1}
              </span>
              <span className='flex-1 text-sm text-gray-900 truncate'>
                {content.title}
              </span>
              <button
                onClick={() => handleRemove(content.id)}
                className='p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Picker dropdown */}
      {showPicker && (
        <div className='mt-3 border border-gray-200 rounded-lg overflow-hidden'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Rechercher un contenu publié...'
              className='w-full pl-9 pr-4 py-2.5 text-sm border-b border-gray-200 focus:outline-none'
              autoFocus
            />
          </div>
          <div className='max-h-48 overflow-y-auto'>
            {(searchResults?.contents || [])
              .filter(c => !featuredIds.includes(c.id))
              .map(content => (
                <button
                  key={content.id}
                  onClick={() => handleAdd(content)}
                  className='flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left'
                >
                  <Star className='w-4 h-4 text-gray-300' />
                  <span className='truncate'>{content.title}</span>
                </button>
              ))}
            {(searchResults?.contents || []).filter(
              c => !featuredIds.includes(c.id)
            ).length === 0 && (
              <p className='px-3 py-4 text-sm text-gray-400 text-center'>
                Aucun contenu publié trouvé
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
