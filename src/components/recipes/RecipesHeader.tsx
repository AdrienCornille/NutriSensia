'use client';

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface RecipesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleFilters: () => void;
  activeFiltersCount: number;
}

export function RecipesHeader({
  searchQuery,
  onSearchChange,
  onToggleFilters,
  activeFiltersCount,
}: RecipesHeaderProps) {
  return (
    <div className="bg-white px-4 py-6 border-b border-gray-100">
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Recettes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Découvrez des recettes saines et équilibrées
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher une recette..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 placeholder-gray-400"
          />
        </div>

        {/* Filter Button */}
        <button
          onClick={onToggleFilters}
          className={`relative px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors ${
            activeFiltersCount > 0
              ? 'bg-[#1B998B] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-sm font-medium">Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#1B998B] text-xs font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default RecipesHeader;
