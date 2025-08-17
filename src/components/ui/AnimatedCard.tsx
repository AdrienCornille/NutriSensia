'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  whileHover?: boolean;
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  whileHover = true,
}: AnimatedCardProps) {
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        delay,
        ease: 'easeOut' as const,
      },
    },
    ...(whileHover && {
      hover: {
        y: -5,
        scale: 1.02,
        transition: {
          duration: 0.2,
          ease: 'easeInOut' as const,
        },
      },
    }),
  };

  return (
    <motion.div
      className={`card ${className}`}
      variants={cardVariants}
      initial='hidden'
      animate='visible'
      whileHover={whileHover ? 'hover' : undefined}
    >
      {children}
    </motion.div>
  );
}
