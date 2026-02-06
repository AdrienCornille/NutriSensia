'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award } from 'lucide-react';
import type { Badge } from '@/types/gamification';
import { badgeRarityConfig } from '@/types/gamification';

interface BadgeUnlockToastProps {
  badge: Badge | null;
  onClose: () => void;
  onViewCollection?: () => void;
  autoHideDuration?: number;
}

export function BadgeUnlockToast({
  badge,
  onClose,
  onViewCollection,
  autoHideDuration = 5000,
}: BadgeUnlockToastProps) {
  useEffect(() => {
    if (badge && autoHideDuration > 0) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [badge, autoHideDuration, onClose]);

  if (!badge) return null;

  const rarityConfig = badgeRarityConfig[badge.rarity];

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -100, x: '-50%' }}
          className='fixed top-4 left-1/2 z-50 max-w-sm w-full mx-4'
        >
          <div
            className={`
              bg-white rounded-2xl shadow-2xl border-2 overflow-hidden
              ${rarityConfig.borderColor}
            `}
          >
            {/* Header gradient */}
            <div className='bg-gradient-to-r from-[#1B998B] to-emerald-400 px-4 py-2'>
              <div className='flex items-center gap-2 text-white'>
                <Award className='w-4 h-4' />
                <span className='text-sm font-medium'>
                  Nouveau badge débloqué !
                </span>
              </div>
            </div>

            {/* Content */}
            <div className='p-4'>
              <div className='flex items-center gap-4'>
                {/* Badge icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0
                    ${rarityConfig.bgColor}
                  `}
                >
                  <span className='text-3xl'>{badge.icon}</span>
                </motion.div>

                {/* Badge info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <h4 className='font-semibold text-gray-800 truncate'>
                      {badge.name}
                    </h4>
                    {badge.rarity !== 'common' && (
                      <span
                        className={`
                          px-2 py-0.5 rounded-full text-[10px] font-medium
                          ${rarityConfig.bgColor} ${rarityConfig.textColor}
                        `}
                      >
                        {rarityConfig.label}
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-gray-500 truncate'>
                    {badge.description}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className='p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* View collection button */}
              {onViewCollection && (
                <button
                  onClick={() => {
                    onViewCollection();
                    onClose();
                  }}
                  className='w-full mt-3 py-2 text-sm text-[#1B998B] font-medium hover:bg-emerald-50 rounded-lg transition-colors'
                >
                  Voir ma collection
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BadgeUnlockToast;
