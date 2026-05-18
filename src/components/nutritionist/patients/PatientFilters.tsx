'use client';

import React, { useEffect, useRef } from 'react';
import { Search, LayoutGrid, List, ChevronDown, Download } from 'lucide-react';
import type {
  PatientStatusFilter,
  PatientSort,
  PatientListStats,
} from '@/hooks/useNutritionistPatients';

export type ExtendedStatusFilter = PatientStatusFilter | 'watch';

interface PatientFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ExtendedStatusFilter;
  onStatusChange: (status: ExtendedStatusFilter) => void;
  sort: PatientSort;
  onSortChange: (sort: PatientSort) => void;
  viewMode: 'cards' | 'list';
  onViewModeChange: (mode: 'cards' | 'list') => void;
  stats: PatientListStats;
  watchCount: number;
  onExport?: () => void;
}

const statusOptions: { value: ExtendedStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'pending', label: 'Nouveaux' },
  { value: 'inactive', label: 'En pause' },
  { value: 'watch', label: 'À surveiller' },
];

const sortOptions: { value: PatientSort; label: string }[] = [
  { value: 'date_desc', label: 'Plus récents' },
  { value: 'date_asc', label: 'Plus anciens' },
  { value: 'name_asc', label: 'Nom A–Z' },
  { value: 'name_desc', label: 'Nom Z–A' },
];

function getCount(
  value: ExtendedStatusFilter,
  stats: PatientListStats,
  watchCount: number
): number {
  switch (value) {
    case 'all':
      return stats.total;
    case 'active':
      return stats.active;
    case 'pending':
      return stats.pending;
    case 'inactive':
      return stats.inactive;
    case 'watch':
      return watchCount;
    default:
      return 0;
  }
}

export function PatientFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  stats,
  watchCount,
  onExport,
}: PatientFiltersProps) {
  const sortRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        sortRef.current.removeAttribute('open');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentSortLabel =
    sortOptions.find(o => o.value === sort)?.label ?? 'Tri';

  return (
    <div className='pt-toolbar'>
      <div className='pt-filters'>
        {statusOptions.map(opt => {
          const count = getCount(opt.value, stats, watchCount);
          const isActive = statusFilter === opt.value;
          const isWatch = opt.value === 'watch';
          return (
            <button
              key={opt.value}
              type='button'
              className={`pt-filter ${isActive ? 'is-active' : ''} ${isWatch ? 'is-watch' : ''}`}
              onClick={() => onStatusChange(opt.value)}
            >
              {opt.label}
              <span className='pt-count'>{count}</span>
            </button>
          );
        })}
      </div>

      <div className='pt-search'>
        <span className='pt-search-ico' aria-hidden>
          <Search size={14} />
        </span>
        <input
          type='text'
          placeholder='Nom, e-mail, objectif…'
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          aria-label='Rechercher un patient'
        />
      </div>

      <details className='pt-sort' ref={sortRef}>
        <summary>
          Tri · {currentSortLabel}
          <ChevronDown size={12} />
        </summary>
        <div className='pt-sort-menu' role='menu'>
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              type='button'
              role='menuitemradio'
              aria-checked={sort === opt.value}
              className={sort === opt.value ? 'is-active' : ''}
              onClick={() => {
                onSortChange(opt.value);
                sortRef.current?.removeAttribute('open');
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </details>

      <div className='pt-viewtoggle'>
        <button
          type='button'
          aria-label='Vue cartes'
          className={viewMode === 'cards' ? 'is-active' : ''}
          onClick={() => onViewModeChange('cards')}
        >
          <LayoutGrid size={14} />
        </button>
        <button
          type='button'
          aria-label='Vue liste'
          className={viewMode === 'list' ? 'is-active' : ''}
          onClick={() => onViewModeChange('list')}
        >
          <List size={14} />
        </button>
      </div>

      {onExport && (
        <button type='button' className='pt-export' onClick={onExport}>
          <Download size={12} />
          Exporter CSV
        </button>
      )}
    </div>
  );
}
