'use client';

import React from 'react';
import {
  Search,
  X,
  Camera,
  Grid3X3,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import type { ViewMode, SortOption } from '@/types/foods';
import { sortOptions } from '@/types/foods';

interface FoodsHeaderProps {
  searchQuery: string;
  viewMode?: ViewMode;
  sortOption?: SortOption;
  recentSearches: string[];
  totalFoods: number;
  onSearchChange: (query: string) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onSortChange?: (option: SortOption) => void;
  onOpenScanner: () => void;
  onRecentSearchClick: (term: string) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

export function FoodsHeader({
  searchQuery,
  viewMode,
  sortOption,
  recentSearches,
  totalFoods,
  onSearchChange,
  onViewModeChange,
  onSortChange,
  onOpenScanner,
  onRecentSearchClick,
  showFilters,
  onToggleFilters,
}: FoodsHeaderProps) {
  return (
    <div className='bg-white px-4 py-6 border-b border-gray-100'>
      {/* Title row */}
      <div className='flex items-start justify-between mb-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Base d'aliments</h1>
          <p className='text-gray-500 text-sm mt-1'>
            {totalFoods.toLocaleString('fr-FR')} aliments disponibles
          </p>
        </div>
        {/* View toggle */}
        {viewMode && onViewModeChange && (
          <div className='flex bg-gray-100 rounded-lg p-1'>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500'
              }`}
              title='Vue grille'
            >
              <Grid3X3 className='w-4 h-4' />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500'
              }`}
              title='Vue liste'
            >
              <List className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>

      {/* Search and Scanner */}
      <div className='flex gap-3'>
        {/* Search Input */}
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='text'
            placeholder='Rechercher un aliment, une marque...'
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className='w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 placeholder-gray-400'
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>

        {/* Scanner Button */}
        <button
          onClick={onOpenScanner}
          className='px-4 py-2.5 bg-[#1B998B] text-white rounded-xl hover:bg-[#158578] transition-colors flex items-center gap-2'
        >
          <Camera className='w-5 h-5' />
          <span className='text-sm font-medium'>Scanner</span>
        </button>

        {/* Filters toggle */}
        {onToggleFilters && (
          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border rounded-xl transition-colors ${
              showFilters
                ? 'bg-[#1B998B]/10 border-[#1B998B]/30 text-[#1B998B]'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className='w-4 h-4' />
            Filtres
          </button>
        )}

        {/* Sort dropdown (optional) */}
        {sortOption && onSortChange && (
          <CustomDropdown
            value={sortOption}
            options={sortOptions.map(o => ({ value: o.value, label: o.label }))}
            placeholder='Trier par...'
            onChange={v => onSortChange(v as SortOption)}
            className='w-52'
            allowReset={false}
          />
        )}
      </div>

      {/* Recent searches */}
      {!searchQuery && recentSearches.length > 0 && (
        <div className='flex items-center gap-2 mt-3'>
          <span className='text-xs text-gray-500'>Récents:</span>
          {recentSearches.map(term => (
            <button
              key={term}
              onClick={() => onRecentSearchClick(term)}
              className='px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors'
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FoodsHeader;
