'use client';

import React, { useState } from 'react';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import type { Badge, BadgeCategory } from '@/types/gamification';
import {
  badgeCategoryConfig,
  getUnlockedBadges,
  getLockedBadges,
  getBadgesByCategory,
  getUnlockedBadgesPercentage,
} from '@/types/gamification';
import { BadgeCard } from './BadgeCard';

interface BadgeCollectionProps {
  badges: Badge[];
  onBadgeClick?: (badge: Badge) => void;
  className?: string;
}

type FilterType = 'all' | 'unlocked' | 'locked' | BadgeCategory;

export function BadgeCollection({
  badges,
  onBadgeClick,
  className = '',
}: BadgeCollectionProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const unlockedCount = getUnlockedBadges(badges).length;
  const lockedCount = getLockedBadges(badges).length;
  const progressPercent = getUnlockedBadgesPercentage(badges);

  const filters: { id: FilterType; label: string; count?: number }[] = [
    { id: 'all', label: 'Tous', count: badges.length },
    { id: 'unlocked', label: 'Débloqués', count: unlockedCount },
    { id: 'locked', label: 'À débloquer', count: lockedCount },
  ];

  // Add category filters
  const categories = Object.keys(badgeCategoryConfig) as BadgeCategory[];
  categories.forEach(cat => {
    const count = getBadgesByCategory(badges, cat).length;
    if (count > 0) {
      filters.push({
        id: cat,
        label: badgeCategoryConfig[cat].label,
        count,
      });
    }
  });

  const filteredBadges = React.useMemo(() => {
    switch (activeFilter) {
      case 'all':
        return badges;
      case 'unlocked':
        return getUnlockedBadges(badges);
      case 'locked':
        return getLockedBadges(badges);
      default:
        return getBadgesByCategory(badges, activeFilter);
    }
  }, [badges, activeFilter]);

  // Sort: unlocked first, then by progress
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    if (a.unlockedAt && !b.unlockedAt) return -1;
    if (!a.unlockedAt && b.unlockedAt) return 1;
    if (!a.unlockedAt && !b.unlockedAt) {
      return (b.progress || 0) - (a.progress || 0);
    }
    return 0;
  });

  return (
    <div className={className}>
      {/* Header with Progress */}
      <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md'>
            <Award className='w-7 h-7 text-white' />
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-gray-800'>
              Ma collection de badges
            </h3>
            <p className='text-sm text-gray-500'>
              {unlockedCount} sur {badges.length} badges débloqués
            </p>
          </div>
          <div className='text-right'>
            <p className='text-2xl font-bold text-[#1B998B]'>
              {progressPercent}%
            </p>
            <p className='text-xs text-gray-500'>complété</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='h-3 bg-gray-100 rounded-full overflow-hidden'>
          <div
            className='h-full bg-gradient-to-r from-[#1B998B] to-emerald-400 rounded-full transition-all duration-500'
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stats */}
        <div className='flex items-center gap-6 mt-4 text-sm'>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='w-4 h-4 text-emerald-500' />
            <span className='text-gray-600'>{unlockedCount} débloqués</span>
          </div>
          <div className='flex items-center gap-2'>
            <Lock className='w-4 h-4 text-gray-400' />
            <span className='text-gray-600'>{lockedCount} à débloquer</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='flex gap-2 overflow-x-auto pb-2 mb-6'>
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${
                activeFilter === filter.id
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {filter.label}
            {filter.count !== undefined && (
              <span
                className={`ml-1.5 ${activeFilter === filter.id ? 'text-emerald-100' : 'text-gray-400'}`}
              >
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      {sortedBadges.length === 0 ? (
        <div className='text-center py-12 bg-white rounded-xl border border-gray-200'>
          <Lock className='w-12 h-12 text-gray-300 mx-auto mb-3' />
          <p className='text-gray-500'>Aucun badge dans cette catégorie</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {sortedBadges.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              size='medium'
              onClick={() => onBadgeClick?.(badge)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BadgeCollection;
