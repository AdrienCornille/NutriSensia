'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * WaveDivider - Séparateur de section avec vague SVG animée
 *
 * Composant réutilisable pour créer des transitions fluides et dynamiques
 * entre les sections avec une vague SVG responsive et animée.
 *
 * Props:
 * - variant: 'smooth' | 'wavy' | 'curved' - Style de la vague
 * - fromColor: Couleur de départ (haut)
 * - toColor: Couleur d'arrivée (bas)
 * - animate: Active/désactive l'animation subtile
 * - flip: Inverse la vague (utile pour alterner)
 * - height: Hauteur de la vague (défaut: 100px sur desktop, 60px mobile)
 */

interface WaveDividerProps {
  variant?: 'smooth' | 'wavy' | 'curved';
  fromColor?: string;
  toColor?: string;
  animate?: boolean;
  flip?: boolean;
  height?: {
    mobile?: number;
    desktop?: number;
  };
  className?: string;
}

export function WaveDivider({
  variant = 'smooth',
  fromColor = '#ffffff',
  toColor = '#E8F3EF',
  animate = true,
  flip = false,
  height = { mobile: 60, desktop: 100 },
  className,
}: WaveDividerProps) {
  // Différents paths SVG pour les variantes de vagues
  const wavePaths = {
    smooth: {
      d1: 'M0,50 Q250,20 500,50 T1000,50 T1500,50 T2000,50 L2000,100 L0,100 Z',
      d2: 'M0,50 Q250,80 500,50 T1000,50 T1500,50 T2000,50 L2000,100 L0,100 Z',
    },
    wavy: {
      d1: 'M0,40 Q125,10 250,40 T500,40 T750,40 T1000,40 T1250,40 T1500,40 T1750,40 T2000,40 L2000,100 L0,100 Z',
      d2: 'M0,40 Q125,70 250,40 T500,40 T750,40 T1000,40 T1250,40 T1500,40 T1750,40 T2000,40 L2000,100 L0,100 Z',
    },
    curved: {
      d1: 'M0,60 C200,20 400,20 600,60 C800,100 1000,100 1200,60 C1400,20 1600,20 1800,60 C1900,80 2000,80 2000,80 L2000,100 L0,100 Z',
      d2: 'M0,60 C200,100 400,100 600,60 C800,20 1000,20 1200,60 C1400,100 1600,100 1800,60 C1900,40 2000,40 2000,40 L2000,100 L0,100 Z',
    },
  };

  const selectedPaths = wavePaths[variant];

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        flip && 'rotate-180',
        className
      )}
      style={{
        height: `${height.mobile || 60}px`,
      }}
      aria-hidden='true'
    >
      {/* Dégradé de fond */}
      <div
        className='absolute inset-0'
        style={{
          background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
        }}
      />

      {/* SVG Wave - Couche principale */}
      <svg
        className='absolute bottom-0 left-0 w-full'
        viewBox='0 0 2000 100'
        preserveAspectRatio='none'
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        {/* Première vague - Couleur principale */}
        <motion.path
          d={selectedPaths.d1}
          fill={toColor}
          initial={{ d: selectedPaths.d1 }}
          animate={
            animate
              ? {
                  d: [selectedPaths.d1, selectedPaths.d2, selectedPaths.d1],
                }
              : {}
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>

      {/* SVG Wave - Couche secondaire avec opacité pour effet de profondeur */}
      {animate && (
        <svg
          className='absolute bottom-0 left-0 w-full opacity-40'
          viewBox='0 0 2000 100'
          preserveAspectRatio='none'
          style={{
            height: '100%',
            width: '100%',
          }}
        >
          <motion.path
            d={selectedPaths.d2}
            fill={toColor}
            initial={{ d: selectedPaths.d2 }}
            animate={{
              d: [selectedPaths.d2, selectedPaths.d1, selectedPaths.d2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </svg>
      )}

      {/* Responsive height adjustment */}
      <style jsx>{`
        @media (min-width: 768px) {
          div {
            height: ${height.desktop || 100}px;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Preset variants pour un usage rapide
 */
export const WaveDividerPresets = {
  // Transition blanc vers sage clair (pour section Why → Benefits)
  whiteToSage: (
    <WaveDivider
      variant='smooth'
      fromColor='#ffffff'
      toColor='#E8F3EF'
      animate={true}
    />
  ),

  // Transition sage vers blanc
  sageToWhite: (
    <WaveDivider
      variant='smooth'
      fromColor='#E8F3EF'
      toColor='#ffffff'
      animate={true}
    />
  ),

  // Transition avec vague plus prononcée
  wavyTransition: (
    <WaveDivider
      variant='wavy'
      fromColor='#ffffff'
      toColor='#E8F3EF'
      animate={true}
      height={{ mobile: 80, desktop: 120 }}
    />
  ),

  // Transition courbe élégante
  curvedTransition: (
    <WaveDivider
      variant='curved'
      fromColor='#ffffff'
      toColor='#E8F3EF'
      animate={true}
      height={{ mobile: 70, desktop: 110 }}
    />
  ),
};
