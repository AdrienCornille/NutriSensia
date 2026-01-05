/**
 * Composants d'animation pour l'onboarding
 * Micro-animations et transitions avec Framer Motion
 */

'use client';

import React from 'react';
// Imports optimisés pour réduire la taille du bundle
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

/**
 * Variantes d'animation communes
 */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Composant de transition d'étape
 */
interface StepTransitionProps {
  children: React.ReactNode;
  stepKey: string;
  direction?: 'forward' | 'backward';
}

export const StepTransition: React.FC<StepTransitionProps> = ({
  children,
  stepKey,
  direction = 'forward',
}) => {
  const variants: Variants = {
    initial: {
      opacity: 0,
      x: direction === 'forward' ? 50 : -50,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      x: direction === 'forward' ? -50 : 50,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={stepKey}
        variants={variants}
        initial='initial'
        animate='animate'
        exit='exit'
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Indicateur de progression animé
 */
interface AnimatedProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#10B981',
  backgroundColor = '#E5E7EB',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className='relative'
      variants={scaleIn}
      initial='initial'
      animate='animate'
    >
      <svg width={size} height={size} className='transform -rotate-90'>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill='none'
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill='none'
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </svg>

      {/* Percentage text */}
      <motion.div
        className='absolute inset-0 flex items-center justify-center'
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <span className='text-2xl font-bold text-gray-700'>
          {Math.round(progress)}%
        </span>
      </motion.div>
    </motion.div>
  );
};

/**
 * Bouton animé avec effet de hover
 */
interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const baseClasses =
    'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary:
      'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <AnimatePresence mode='wait'>
        {loading ? (
          <motion.div
            key='loading'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='flex items-center space-x-2'
          >
            <motion.div
              className='w-4 h-4 border-2 border-white border-t-transparent rounded-full'
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span>Chargement...</span>
          </motion.div>
        ) : (
          <motion.div
            key='content'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

/**
 * Carte animée pour les étapes
 */
interface AnimatedStepCardProps {
  children: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AnimatedStepCard: React.FC<AnimatedStepCardProps> = ({
  children,
  isActive = false,
  isCompleted = false,
  onClick,
  className = '',
}) => {
  return (
    <motion.div
      className={`
        p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${
          isActive
            ? 'border-blue-500 bg-blue-50 shadow-lg'
            : isCompleted
              ? 'border-green-500 bg-green-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
        ${className}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.div
        variants={staggerContainer}
        initial='initial'
        animate='animate'
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

/**
 * Notification toast animée
 */
interface AnimatedToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose?: () => void;
}

export const AnimatedToast: React.FC<AnimatedToastProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
}) => {
  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`
            fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg
            ${typeClasses[type]}
          `}
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <div className='flex items-center space-x-3'>
            <span>{message}</span>
            {onClose && (
              <motion.button
                onClick={onClose}
                className='ml-2 text-white hover:text-gray-200'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Animation de célébration avec confettis
 */
export const CelebrationAnimation: React.FC<{ trigger: boolean }> = ({
  trigger,
}) => {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          className='fixed inset-0 pointer-events-none z-50'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Confetti particles */}
          {[...Array(30)].map((_, i) => {
            const colors = [
              '#F59E0B',
              '#EF4444',
              '#3B82F6',
              '#10B981',
              '#8B5CF6',
            ];
            const color = colors[i % colors.length];

            return (
              <motion.div
                key={i}
                className='absolute w-3 h-3 rounded-full'
                style={{ backgroundColor: color }}
                initial={{
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 100,
                  scale: [0, 1, 0],
                  rotate: 360 * 3,
                }}
                transition={{
                  duration: 3,
                  ease: 'easeOut',
                  delay: i * 0.05,
                }}
              />
            );
          })}

          {/* Success message */}
          <motion.div
            className='absolute inset-0 flex items-center justify-center'
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
          >
            <div className='bg-white rounded-2xl shadow-2xl p-8 text-center'>
              <motion.div
                className='text-6xl mb-4'
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: 2,
                }}
              >
                🎉
              </motion.div>
              <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                Félicitations !
              </h2>
              <p className='text-gray-600'>
                Votre onboarding est terminé avec succès
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
