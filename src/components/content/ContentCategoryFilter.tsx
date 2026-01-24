'use client';

import React from 'react';
import type { ContentCategory } from '@/types/content';
import { categoriesConfig } from '@/types/content';

interface ContentCategoryFilterProps {
  activeCategory: ContentCategory;
  onCategoryChange: (category: ContentCategory) => void;
}

export function ContentCategoryFilter({
  activeCategory,
  onCategoryChange,
}: ContentCategoryFilterProps) {
  return (
    <div className="bg-white px-8 py-4 border-b border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-3">Explorer par thème</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-[#1B998B] text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous les thèmes
        </button>
        {categoriesConfig.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? `${cat.bgColor} ${cat.color} ring-2 ring-offset-1 ring-current`
                : `${cat.bgColor} ${cat.color} hover:opacity-80`
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ContentCategoryFilter;
