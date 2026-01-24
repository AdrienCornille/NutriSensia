'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PartyPopper } from 'lucide-react';
import type { CelebrationData } from '@/types/gamification';

interface CelebrationModalProps {
  celebration: CelebrationData | null;
  onClose: () => void;
}

// Confetti particle component
function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#1B998B', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const color = colors[index % colors.length];
  const size = Math.random() * 10 + 5;
  const initialX = Math.random() * 100;
  const duration = Math.random() * 2 + 2;
  const delay = Math.random() * 0.5;

  return (
    <motion.div
      initial={{
        x: `${initialX}vw`,
        y: -20,
        rotate: 0,
        opacity: 1,
      }}
      animate={{
        y: '100vh',
        rotate: Math.random() * 720 - 360,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        ease: 'linear',
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        zIndex: 60,
        pointerEvents: 'none',
      }}
    />
  );
}

// Confetti container
function Confetti({ count = 50 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </>
  );
}

export function CelebrationModal({ celebration, onClose }: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (celebration?.confetti) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [celebration]);

  if (!celebration) return null;

  return (
    <AnimatePresence>
      {celebration && (
        <>
          {/* Confetti */}
          {showConfetti && <Confetti count={60} />}

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Celebration icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center"
              >
                {celebration.badge ? (
                  <span className="text-5xl">{celebration.badge.icon}</span>
                ) : celebration.icon ? (
                  <span className="text-5xl">{celebration.icon}</span>
                ) : (
                  <PartyPopper className="w-12 h-12 text-amber-500" />
                )}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                {celebration.title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-6"
              >
                {celebration.message}
              </motion.p>

              {/* Badge details if applicable */}
              {celebration.badge && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-50 rounded-xl p-4 mb-6"
                >
                  <p className="text-sm font-medium text-gray-800">{celebration.badge.name}</p>
                  <p className="text-xs text-gray-500">{celebration.badge.description}</p>
                </motion.div>
              )}

              {/* Action button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={onClose}
                className="w-full py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors"
              >
                Super !
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CelebrationModal;
