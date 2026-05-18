'use client';

import React from 'react';

interface CategoryItem {
  slug: string;
  label: string;
  emoji: string;
}

interface FoodsCategoryFilterProps {
  activeCategory: string;
  categories: CategoryItem[];
  onCategoryChange: (category: string) => void;
}

export function FoodsCategoryFilter({
  activeCategory,
  categories,
  onCategoryChange,
}: FoodsCategoryFilterProps) {
  const allCategories = [
    { slug: 'all', label: 'Tout', emoji: '🍽️' },
    ...categories,
  ];

  return (
    <div className='bg-white px-4 py-4 border-b border-gray-100'>
      <div className='flex flex-wrap items-center gap-2'>
        {allCategories.map(cat => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => onCategoryChange(cat.slug)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FoodsCategoryFilter;
