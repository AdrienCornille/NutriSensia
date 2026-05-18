'use client';

import React, { useCallback } from 'react';

// ==================== TYPES ====================

interface TagItem {
  id: string;
  slug: string;
  name_fr: string;
  color: string | null;
  icon: string | null;
}

interface TagGroup {
  slug: string;
  label: string;
  color: string;
  tags: TagItem[];
}

interface RecipeTagSelectorProps {
  availableGroups: TagGroup[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

// Phase 1 manual groups only
const PHASE1_MANUAL_SLUGS = new Set([
  'meal-type',
  'flavor',
  'everyday',
  'healthy-treats',
  'season',
  'cuisine',
  'occasion',
  'wellness',
]);

// ==================== COMPONENT ====================

export function RecipeTagSelector({
  availableGroups,
  selectedTagIds,
  onChange,
}: RecipeTagSelectorProps) {
  const filteredGroups = availableGroups.filter(g =>
    PHASE1_MANUAL_SLUGS.has(g.slug)
  );

  const toggleTag = useCallback(
    (tagId: string) => {
      const next = selectedTagIds.includes(tagId)
        ? selectedTagIds.filter(id => id !== tagId)
        : [...selectedTagIds, tagId];
      onChange(next);
    },
    [selectedTagIds, onChange]
  );

  if (filteredGroups.length === 0) return null;

  return (
    <div className='space-y-4 max-h-[420px] overflow-y-auto pr-1'>
      {filteredGroups.map(group => (
        <div key={group.slug}>
          {/* Group header */}
          <div className='flex items-center gap-1.5 mb-2'>
            <span
              className='w-2 h-2 rounded-full flex-shrink-0'
              style={{ backgroundColor: group.color }}
            />
            <span className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
              {group.label}
            </span>
          </div>

          {/* Tag chips */}
          <div className='flex flex-wrap gap-1.5'>
            {group.tags.map(tag => {
              const isSelected = selectedTagIds.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type='button'
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 text-xs rounded-full cursor-pointer transition-colors border ${
                    isSelected
                      ? 'font-medium'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${group.color}15`,
                          color: group.color,
                          borderColor: group.color,
                        }
                      : undefined
                  }
                >
                  {tag.icon ? `${tag.icon} ${tag.name_fr}` : tag.name_fr}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
