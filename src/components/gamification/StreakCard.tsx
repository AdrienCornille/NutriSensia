'use client';

import React from 'react';
import { Flame, Trophy } from 'lucide-react';
import type { StreakData } from '@/types/gamification';
import { checkStreakMilestone } from '@/types/gamification';

interface StreakCardProps {
  streak: StreakData;
  variant?: 'default' | 'compact' | 'large';
  showBestStreak?: boolean;
  className?: string;
}

export function StreakCard({
  streak,
  variant = 'default',
  showBestStreak = true,
  className = '',
}: StreakCardProps) {
  const isMilestone = checkStreakMilestone(streak.current);
  const isNewRecord = streak.current === streak.best && streak.current > 0;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className='w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center'>
          <Flame className='w-4 h-4 text-white' />
        </div>
        <span className='font-bold text-gray-800'>{streak.current}</span>
        <span className='text-sm text-gray-500'>jours</span>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div
        className={`bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 ${className}`}
      >
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>Votre streak</h3>
          {isNewRecord && (
            <span className='inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full'>
              <Trophy className='w-3 h-3' />
              Record !
            </span>
          )}
        </div>

        <div className='flex items-center gap-4 mb-4'>
          <div className='w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg'>
            <Flame className='w-8 h-8 text-white' />
          </div>
          <div>
            <p className='text-4xl font-bold text-gray-800'>{streak.current}</p>
            <p className='text-gray-500'>jours consécutifs</p>
          </div>
        </div>

        {showBestStreak && streak.best > streak.current && (
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <Trophy className='w-4 h-4 text-amber-500' />
            <span>Meilleur streak : {streak.best} jours</span>
          </div>
        )}

        {isMilestone && (
          <div className='mt-4 p-3 bg-orange-100 rounded-lg'>
            <p className='text-sm font-medium text-orange-700'>
              Bravo ! Vous avez atteint {isMilestone} jours de streak !
            </p>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className='w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm'>
        <Flame className='w-5 h-5 text-white' />
      </div>
      <div className='flex-1'>
        <p className='text-lg font-bold text-gray-800'>
          {streak.current} jours
        </p>
        <p className='text-xs text-gray-500'>Streak d'enregistrement</p>
      </div>
      {isNewRecord && (
        <span className='inline-flex items-center px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full'>
          Record !
        </span>
      )}
      {!isNewRecord && showBestStreak && streak.best > 0 && (
        <div className='text-right'>
          <span className='inline-flex items-center px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full'>
            Best: {streak.best}
          </span>
        </div>
      )}
    </div>
  );
}

export default StreakCard;
