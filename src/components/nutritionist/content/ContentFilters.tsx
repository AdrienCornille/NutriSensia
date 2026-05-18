'use client';

import React from 'react';
import { Search, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import {
  ContentType,
  ContentCategory,
  ContentStatus,
  CONTENT_TYPE_LABELS,
  CONTENT_CATEGORY_LABELS,
  CONTENT_STATUS_LABELS,
} from '@/types/educational-content';
import { CustomDropdown, DropdownOption } from '@/components/ui/CustomDropdown';

const typeOptions: DropdownOption[] = Object.entries(CONTENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

const categoryOptions: DropdownOption[] = Object.entries(
  CONTENT_CATEGORY_LABELS
).map(([value, label]) => ({ value, label }));

const statusOptions: DropdownOption[] = Object.entries(
  CONTENT_STATUS_LABELS
).map(([value, label]) => ({ value, label }));

export type ContentSortBy = 'updated_at' | 'title' | 'view_count';

const sortOptions: DropdownOption[] = [
  { value: 'updated_at', label: 'Date de modification' },
  { value: 'title', label: 'Titre' },
  { value: 'view_count', label: 'Popularité' },
];

export type ViewMode = 'list' | 'grid';

interface ContentFiltersProps {
  type: ContentType | '';
  category: ContentCategory | '';
  status: ContentStatus | '';
  search: string;
  sortBy?: ContentSortBy;
  viewMode?: ViewMode;
  onTypeChange: (type: ContentType | '') => void;
  onCategoryChange: (category: ContentCategory | '') => void;
  onStatusChange: (status: ContentStatus | '') => void;
  onSearchChange: (search: string) => void;
  onSortChange?: (sort: ContentSortBy) => void;
  onViewModeChange?: (mode: ViewMode) => void;
}

export function ContentFilters({
  type,
  category,
  status,
  search,
  sortBy = 'updated_at',
  viewMode = 'list',
  onTypeChange,
  onCategoryChange,
  onStatusChange,
  onSearchChange,
  onSortChange,
  onViewModeChange,
}: ContentFiltersProps) {
  return (
    <div className='space-y-3'>
      <div className='flex flex-col sm:flex-row gap-3'>
        {/* Search */}
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder='Rechercher par titre...'
            className='w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
          />
        </div>

        <CustomDropdown
          value={type}
          options={typeOptions}
          placeholder='Tous les types'
          onChange={v => onTypeChange(v as ContentType | '')}
        />

        <CustomDropdown
          value={category}
          options={categoryOptions}
          placeholder='Toutes les catégories'
          onChange={v => onCategoryChange(v as ContentCategory | '')}
        />

        <CustomDropdown
          value={status}
          options={statusOptions}
          placeholder='Tous les statuts'
          onChange={v => onStatusChange(v as ContentStatus | '')}
        />
      </div>

      {/* Sort + view mode */}
      <div className='flex items-center justify-between'>
        {/* Sort */}
        {onSortChange && (
          <div className='flex items-center gap-2'>
            <ArrowUpDown className='w-4 h-4 text-gray-400' />
            <CustomDropdown
              value={sortBy}
              options={sortOptions}
              placeholder='Trier par'
              onChange={v => onSortChange(v as ContentSortBy)}
              allowReset={false}
            />
          </div>
        )}
        {!onSortChange && <div />}

        {/* View mode toggle */}
        {onViewModeChange && (
          <div className='flex items-center border border-gray-200 rounded-lg overflow-hidden'>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#1B998B] text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title='Vue liste'
            >
              <List className='w-4 h-4' />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#1B998B] text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title='Vue grille'
            >
              <LayoutGrid className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
