'use client';

import React from 'react';
import {
  ContentCategory,
  CONTENT_CATEGORY_LABELS,
} from '@/types/educational-content';
import { PatientCustomCategory } from '@/hooks/usePatientContent';

const PREDEFINED_CATEGORIES: ContentCategory[] = [
  'nutrition_basics',
  'healthy_recipes',
  'weight_management',
  'sports_nutrition',
  'digestive_health',
  'mental_wellbeing',
  'food_allergies',
  'supplements',
  'meal_planning',
  'lifestyle',
];

interface ContentCategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  customCategories?: PatientCustomCategory[];
}

export function ContentCategoryFilter({
  activeCategory,
  onCategoryChange,
  customCategories = [],
}: ContentCategoryFilterProps) {
  const pillClass = (isActive: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#1B998B] text-white shadow-sm'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <div className='bg-white px-8 py-4 border-b border-gray-100'>
      <h3 className='font-semibold text-gray-800 mb-3'>Explorer par thème</h3>
      <div className='flex flex-wrap gap-2'>
        <button
          onClick={() => onCategoryChange('all')}
          className={pillClass(activeCategory === 'all')}
        >
          Tous les thèmes
        </button>

        {PREDEFINED_CATEGORIES.map(catId => (
          <button
            key={catId}
            onClick={() => onCategoryChange(catId)}
            className={pillClass(activeCategory === catId)}
          >
            {CONTENT_CATEGORY_LABELS[catId]}
          </button>
        ))}

        {customCategories.map(cat => (
          <button
            key={`custom-${cat.id}`}
            onClick={() => onCategoryChange(`custom:${cat.id}`)}
            className={pillClass(activeCategory === `custom:${cat.id}`)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ContentCategoryFilter;
