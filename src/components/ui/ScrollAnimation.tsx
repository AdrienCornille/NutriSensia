'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  useScrollAnimation,
  animationVariants,
  createDelayedVariant,
} from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface ScrollAnimationProps {
  children: ReactNode;
  animation?:
    | 'fadeIn'
    | 'fadeSlideUp'
    | 'fadeSlideLeft'
    | 'fadeSlideRight'
    | 'scaleIn';
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Composant wrapper pour les animations au scroll
 * Utilise Framer Motion avec Intersection Observer
 */
export function ScrollAnimation({
  children,
  animation = 'fadeSlideUp',
  delay = 0,
  duration,
  className,
  threshold = 0.1,
  rootMargin = '-50px',
  triggerOnce = true,
}: ScrollAnimationProps) {
  const { elementRef, isInView } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce,
  });

  // Créer la variante avec délai personnalisé si nécessaire
  let variant = animationVariants[animation];
  if (delay > 0) {
    variant = createDelayedVariant(variant, delay);
  }

  // Modifier la durée si spécifiée
  if (duration) {
    variant = {
      ...variant,
      visible: {
        ...variant.visible,
        transition: {
          ...variant.visible.transition,
          duration,
        },
      },
    };
  }

  return (
    <motion.div
      ref={elementRef}
      variants={variant}
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Composant pour les animations stagger (éléments multiples avec délai)
 */
interface StaggerAnimationProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export function StaggerAnimation({
  children,
  staggerDelay = 0.1,
  className,
  threshold = 0.1,
  rootMargin = '-50px',
}: StaggerAnimationProps) {
  const { elementRef, isInView } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const containerVariant = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      ref={elementRef}
      variants={containerVariant}
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Composant pour les éléments individuels dans un stagger
 */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={animationVariants.staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Hook personnalisé pour les animations hover
 */
export function useHoverAnimation() {
  const hoverVariants = {
    hover: {
      y: -5,
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    tap: {
      scale: 0.98,
    },
  };

  const hoverVariantsStrong = {
    hover: {
      y: -8,
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    tap: {
      scale: 0.98,
    },
  };

  const scaleVariants = {
    hover: {
      scale: 1.02,
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    tap: {
      scale: 0.98,
    },
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return {
    hoverVariants,
    hoverVariantsStrong,
    scaleVariants,
    iconVariants,
  };
}

/**
 * Composant pour les cartes avec animation hover
 */
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverType?: 'lift' | 'liftStrong' | 'scale';
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  hoverType = 'lift',
  onClick,
}: AnimatedCardProps) {
  const { hoverVariants, hoverVariantsStrong, scaleVariants } =
    useHoverAnimation();

  let variants;
  switch (hoverType) {
    case 'liftStrong':
      variants = hoverVariantsStrong;
      break;
    case 'scale':
      variants = scaleVariants;
      break;
    default:
      variants = hoverVariants;
  }

  return (
    <motion.div
      variants={variants}
      whileHover='hover'
      whileTap='tap'
      className={cn('cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export default ScrollAnimation;
