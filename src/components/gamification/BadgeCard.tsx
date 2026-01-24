'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import type { Badge } from '@/types/gamification';
import { badgeRarityConfig } from '@/types/gamification';

interface BadgeCardProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

export function BadgeCard({
  badge,
  size = 'medium',
  showProgress = true,
  onClick,
  className = '',
}: BadgeCardProps) {
  const isUnlocked = badge.unlockedAt !== null;
  const rarityConfig = badgeRarityConfig[badge.rarity];
  const progress = badge.progress || 0;
  const maxProgress = badge.maxProgress || 100;
  const progressPercent = Math.min((progress / maxProgress) * 100, 100);

  const sizeClasses = {
    small: {
      container: 'p-3',
      icon: 'w-10 h-10 text-2xl',
      title: 'text-xs',
      desc: 'text-[10px]',
    },
    medium: {
      container: 'p-4',
      icon: 'w-14 h-14 text-3xl',
      title: 'text-sm',
      desc: 'text-xs',
    },
    large: {
      container: 'p-6',
      icon: 'w-20 h-20 text-4xl',
      title: 'text-base',
      desc: 'text-sm',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-xl border-2 transition-all
        ${isUnlocked ? rarityConfig.bgColor : 'bg-gray-50'}
        ${isUnlocked ? rarityConfig.borderColor : 'border-gray-200'}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
        ${sizes.container}
        ${className}
      `}
    >
      {/* Badge Icon */}
      <div className="flex flex-col items-center text-center">
        <div
          className={`
            ${sizes.icon} rounded-full flex items-center justify-center mb-2
            ${isUnlocked ? '' : 'grayscale opacity-40'}
          `}
        >
          {isUnlocked ? (
            <span>{badge.icon}</span>
          ) : (
            <div className="relative">
              <span className="opacity-30">{badge.icon}</span>
              <Lock className="w-4 h-4 text-gray-400 absolute -bottom-1 -right-1" />
            </div>
          )}
        </div>

        {/* Badge Name */}
        <h4
          className={`
            font-semibold mb-1
            ${sizes.title}
            ${isUnlocked ? rarityConfig.textColor : 'text-gray-400'}
          `}
        >
          {badge.name}
        </h4>

        {/* Description */}
        <p className={`text-gray-500 ${sizes.desc} line-clamp-2`}>{badge.description}</p>

        {/* Progress Bar (for locked badges) */}
        {!isUnlocked && showProgress && badge.maxProgress && (
          <div className="w-full mt-3">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Progression</span>
              <span>
                {progress}/{maxProgress}
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B998B] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Unlock Date (for unlocked badges) */}
        {isUnlocked && badge.unlockedAt && (
          <p className="text-[10px] text-gray-400 mt-2">
            Débloqué le{' '}
            {badge.unlockedAt.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Rarity Badge */}
      {isUnlocked && badge.rarity !== 'common' && (
        <div
          className={`
            absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-medium
            ${rarityConfig.bgColor} ${rarityConfig.textColor} border ${rarityConfig.borderColor}
          `}
        >
          {rarityConfig.label}
        </div>
      )}
    </div>
  );
}

export default BadgeCard;
