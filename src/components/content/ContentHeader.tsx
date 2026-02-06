'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';

interface ContentHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  recentSearches?: string[];
  onRecentSearchClick?: (term: string) => void;
}

export function ContentHeader({
  searchQuery,
  onSearchChange,
  recentSearches = [],
  onRecentSearchClick,
}: ContentHeaderProps) {
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowRecentSearches(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='bg-white px-8 py-6 border-b border-gray-100'>
      <div className='flex items-start justify-between mb-2'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Contenu exclusif</h1>
          <p className='text-gray-500 mt-1'>
            Ressources réservées aux patients NutriSensia
          </p>
        </div>

        {/* Search */}
        <div ref={searchRef} className='relative'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              placeholder='Rechercher un contenu...'
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              onFocus={() => setShowRecentSearches(true)}
              className='w-72 pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-all'
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full'
              >
                <X className='w-4 h-4 text-gray-400' />
              </button>
            )}
          </div>

          {/* Recent searches dropdown */}
          {showRecentSearches && recentSearches.length > 0 && !searchQuery && (
            <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50'>
              <div className='px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide'>
                Recherches récentes
              </div>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onRecentSearchClick?.(term);
                    setShowRecentSearches(false);
                  }}
                  className='w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700'
                >
                  <Clock className='w-4 h-4 text-gray-400' />
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentHeader;
