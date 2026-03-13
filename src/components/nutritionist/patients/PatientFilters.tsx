'use client';

import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import type {
  PatientStatusFilter,
  PatientSort,
} from '@/hooks/useNutritionistPatients';

interface PatientFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: PatientStatusFilter;
  onStatusChange: (status: PatientStatusFilter) => void;
  sort: PatientSort;
  onSortChange: (sort: PatientSort) => void;
  viewMode: 'cards' | 'list';
  onViewModeChange: (mode: 'cards' | 'list') => void;
}

const statusOptions: { value: PatientStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'pending', label: 'Nouveaux' },
  { value: 'inactive', label: 'En pause' },
];

const sortOptions: { value: PatientSort; label: string }[] = [
  { value: 'name_asc', label: 'Nom A-Z' },
  { value: 'name_desc', label: 'Nom Z-A' },
  { value: 'date_desc', label: 'Plus récents' },
  { value: 'date_asc', label: 'Plus anciens' },
];

export function PatientFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
}: PatientFiltersProps) {
  return (
    <div className='space-y-4'>
      {/* Recherche + Tri + Vue */}
      <div className='flex items-center gap-4'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Rechercher un patient par nom ou email...'
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent text-sm'
          />
        </div>

        <select
          value={sort}
          onChange={e => onSortChange(e.target.value as PatientSort)}
          className='px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent bg-white'
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className='flex bg-gray-100 p-1 rounded-lg'>
          <button
            onClick={() => onViewModeChange('cards')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'cards'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid className='w-4 h-4' />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Filtres par statut */}
      <div className='flex gap-2'>
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-[#1B998B]/10 text-[#1B998B]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
