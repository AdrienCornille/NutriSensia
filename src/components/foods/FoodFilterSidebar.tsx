'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FoodCategoryGroup } from '@/hooks/usePatientFoods';

interface FoodFilterSidebarProps {
  activeCategory: string;
  categories: FoodCategoryGroup[];
  onCategoryChange: (slug: string) => void;
}

export function FoodFilterSidebar({
  activeCategory,
  categories,
  onCategoryChange,
}: FoodFilterSidebarProps) {
  // Track which parent categories are expanded
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Auto-expand the parent that contains the active category
    const s = new Set<string>();
    for (const cat of categories) {
      if (
        cat.slug === activeCategory ||
        cat.children.some(c => c.slug === activeCategory)
      ) {
        s.add(cat.slug);
      }
    }
    return s;
  });

  const toggleExpand = (slug: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleParentClick = (slug: string, hasChildren: boolean) => {
    onCategoryChange(slug);
    if (hasChildren) {
      // Auto-expand when selecting a parent
      setExpanded(prev => new Set(prev).add(slug));
    }
  };

  return (
    <div className='space-y-1'>
      <h2 className='text-sm font-semibold text-gray-800 mb-3'>Catégories</h2>

      {/* All */}
      <button
        onClick={() => onCategoryChange('all')}
        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
          activeCategory === 'all'
            ? 'bg-[#1B998B] text-white font-medium'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Tous les aliments
      </button>

      {/* Parent categories */}
      {categories.map(cat => {
        const isExpanded = expanded.has(cat.slug);
        const hasChildren = cat.children.length > 0;
        const isActive = activeCategory === cat.slug;
        const hasActiveChild = cat.children.some(
          c => c.slug === activeCategory
        );

        return (
          <div key={cat.slug}>
            {/* Parent row */}
            <div className='flex items-center'>
              <button
                onClick={() => handleParentClick(cat.slug, hasChildren)}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  isActive
                    ? 'bg-[#1B998B] text-white font-medium'
                    : hasActiveChild
                      ? 'text-[#1B998B] font-medium bg-[#1B998B]/5'
                      : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{cat.emoji}</span>
                <span className='flex-1'>{cat.label}</span>
              </button>

              {hasChildren && (
                <button
                  onClick={() => toggleExpand(cat.slug)}
                  className='p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors'
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
              <div className='ml-4 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2'>
                {cat.children.map(child => {
                  const isChildActive = activeCategory === child.slug;
                  return (
                    <button
                      key={child.slug}
                      onClick={() => onCategoryChange(child.slug)}
                      className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm text-left transition-colors ${
                        isChildActive
                          ? 'bg-[#1B998B]/10 text-[#1B998B] font-medium'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      <span className='first-letter:uppercase'>
                        {child.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
