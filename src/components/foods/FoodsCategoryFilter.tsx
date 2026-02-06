'use client';

import React from 'react';
import type { FoodCategory } from '@/types/foods';
import { categoryConfig } from '@/types/foods';

interface FoodsCategoryFilterProps {
  activeCategory: FoodCategory;
  onCategoryChange: (category: FoodCategory) => void;
}

export function FoodsCategoryFilter({
  activeCategory,
  onCategoryChange,
}: FoodsCategoryFilterProps) {
  return (
    <div className='bg-white px-4 py-4 border-b border-gray-100'>
      <div className='flex flex-wrap items-center gap-2'>
        {categoryConfig.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span
                className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FoodsCategoryFilter;
