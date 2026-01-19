'use client';

import React from 'react';
import type { ListFilter } from '@/types/meals-history';

interface ListFilterPillsProps {
  activeFilter: ListFilter;
  onFilterChange: (filter: ListFilter) => void;
}

const filters: { id: ListFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'breakfast', label: 'Petit-déjeuner' },
  { id: 'lunch', label: 'Déjeuner' },
  { id: 'dinner', label: 'Dîner' },
  { id: 'snack', label: 'Collation' },
];

export function ListFilterPills({
  activeFilter,
  onFilterChange,
}: ListFilterPillsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500">Filtrer :</span>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === filter.id
              ? 'bg-[#1B998B] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default ListFilterPills;
