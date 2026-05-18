'use client';

import { motion } from 'framer-motion';
import { Award, Star } from 'lucide-react';

interface CourseBadgeProps {
  badge: {
    badge_name: string;
    badge_icon: string;
    points_awarded: number;
  };
  earned: boolean;
}

export default function CourseBadge({ badge, earned }: CourseBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-colors ${
        earned
          ? 'border-yellow-400 bg-yellow-50 shadow-[0_0_24px_rgba(250,204,21,0.25)]'
          : 'border-gray-200 bg-gray-50 opacity-60 grayscale'
      }`}
    >
      <span className='text-5xl' role='img' aria-label={badge.badge_name}>
        {badge.badge_icon || '🏅'}
      </span>

      <p className='text-lg font-semibold text-gray-900'>{badge.badge_name}</p>

      <div className='flex items-center gap-1 text-sm text-gray-600'>
        <Star className='h-4 w-4 text-yellow-500' />
        <span>{badge.points_awarded} points</span>
      </div>

      {earned ? (
        <span className='inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800'>
          <Award className='h-4 w-4' />
          Obtenu !
        </span>
      ) : (
        <span className='inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-500'>
          À débloquer
        </span>
      )}
    </motion.div>
  );
}
