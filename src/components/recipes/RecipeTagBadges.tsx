'use client';

import React from 'react';
import type { RecipeTagClient, RecipeAutoTag } from '@/types/recipes';
import { TAG_GROUP_MAP } from '@/lib/recipe-auto-tags';

export interface RecipeTagBadgesProps {
  tags: RecipeTagClient[];
  autoTags: RecipeAutoTag[];
  maxVisible?: number;
  size?: 'sm' | 'md';
  showAutoOnly?: boolean;
}

// Auto-tag group ordering: calories first, then time, then nutrition
const AUTO_GROUP_ORDER: Record<string, number> = {
  calories: 0,
  time: 1,
  nutrition: 2,
};

// Manual tag group ordering (after auto-tags)
const MANUAL_GROUP_ORDER: Record<string, number> = {
  'meal-type': 0,
  flavor: 1,
  everyday: 2,
  'healthy-treats': 3,
  season: 4,
  cuisine: 5,
  occasion: 6,
  wellness: 7,
  diet: 8,
  allergen: 9,
};

const SIZE_CLASSES = {
  sm: 'text-[10px] px-1.5 py-0.5 rounded-full',
  md: 'text-xs px-2 py-0.5 rounded-full',
} as const;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function badgeStyle(color: string): React.CSSProperties {
  const rgb = hexToRgb(color);
  if (!rgb) return {};
  return {
    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    color,
  };
}

export function RecipeTagBadges({
  tags,
  autoTags,
  maxVisible = 6,
  size = 'sm',
  showAutoOnly = false,
}: RecipeTagBadgesProps) {
  // Sort auto-tags by group order
  const sortedAutoTags = [...autoTags].sort((a, b) => {
    const orderA = AUTO_GROUP_ORDER[a.group] ?? 99;
    const orderB = AUTO_GROUP_ORDER[b.group] ?? 99;
    return orderA - orderB;
  });

  // Sort manual tags by group order
  const sortedManualTags = showAutoOnly
    ? []
    : [...tags].sort((a, b) => {
        const orderA = MANUAL_GROUP_ORDER[a.tagType] ?? 99;
        const orderB = MANUAL_GROUP_ORDER[b.tagType] ?? 99;
        return orderA - orderB;
      });

  const totalCount = sortedAutoTags.length + sortedManualTags.length;
  if (totalCount === 0) return null;

  const sizeClass = SIZE_CLASSES[size];

  // Build combined badge list up to maxVisible
  const badges: React.ReactNode[] = [];
  let remaining = maxVisible;

  // Auto-tag badges first
  for (const at of sortedAutoTags) {
    if (remaining <= 0) break;
    badges.push(
      <span
        key={`auto-${at.group}-${at.value}`}
        className={`${sizeClass} font-medium whitespace-nowrap`}
        style={badgeStyle(at.color)}
      >
        {at.label}
      </span>
    );
    remaining--;
  }

  // Manual tag badges
  for (const tag of sortedManualTags) {
    if (remaining <= 0) break;
    const groupConfig =
      TAG_GROUP_MAP[tag.tagType as keyof typeof TAG_GROUP_MAP];
    const color = tag.color || groupConfig?.color || '#6B7280';
    badges.push(
      <span
        key={`tag-${tag.id}`}
        className={`${sizeClass} font-medium whitespace-nowrap`}
        style={badgeStyle(color)}
      >
        {tag.label}
      </span>
    );
    remaining--;
  }

  const overflow = totalCount - badges.length;

  return (
    <div className='flex flex-wrap gap-1'>
      {badges}
      {overflow > 0 && (
        <span
          className={`${sizeClass} font-medium whitespace-nowrap text-gray-500 bg-gray-100`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

export default RecipeTagBadges;
