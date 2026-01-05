/**
 * Illustrations SVG spécifiques aux rôles pour l'onboarding
 * Créées avec des animations Framer Motion intégrées
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface IllustrationProps {
  className?: string;
  animate?: boolean;
}

/**
 * Animation de base pour les éléments SVG
 */
const svgAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    },
  },
};

const pathAnimation = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
};

const floatingAnimation = {
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Illustration de bienvenue - Nutritionniste
 */
export const NutritionistWelcomeIllustration: React.FC<IllustrationProps> = ({
  className = 'w-64 h-64',
  animate = true,
}) => (
  <motion.svg
    className={className}
    viewBox='0 0 400 400'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    variants={animate ? svgAnimation : {}}
    initial={animate ? 'initial' : false}
    animate={animate ? 'animate' : false}
  >
    {/* Background circle */}
    <motion.circle
      cx='200'
      cy='200'
      r='180'
      fill='url(#nutritionist-gradient)'
      variants={animate ? pathAnimation : {}}
    />

    {/* Nutritionist figure */}
    <motion.g variants={animate ? floatingAnimation : {}}>
      {/* Head */}
      <circle
        cx='200'
        cy='140'
        r='30'
        fill='#FEF3C7'
        stroke='#F59E0B'
        strokeWidth='2'
      />

      {/* Body */}
      <rect
        x='170'
        y='170'
        width='60'
        height='80'
        rx='10'
        fill='#10B981'
        stroke='#059669'
        strokeWidth='2'
      />

      {/* Stethoscope */}
      <motion.path
        d='M180 180 Q190 190 200 180 Q210 190 220 180'
        stroke='#374151'
        strokeWidth='3'
        fill='none'
        variants={animate ? pathAnimation : {}}
      />
      <circle cx='200' cy='200' r='8' fill='#6B7280' />

      {/* Arms */}
      <rect
        x='140'
        y='180'
        width='25'
        height='40'
        rx='12'
        fill='#FEF3C7'
        stroke='#F59E0B'
        strokeWidth='1'
      />
      <rect
        x='235'
        y='180'
        width='25'
        height='40'
        rx='12'
        fill='#FEF3C7'
        stroke='#F59E0B'
        strokeWidth='1'
      />

      {/* Clipboard in hand */}
      <rect
        x='245'
        y='175'
        width='20'
        height='25'
        rx='2'
        fill='#FFFFFF'
        stroke='#374151'
        strokeWidth='1'
      />
      <line
        x1='250'
        y1='180'
        x2='260'
        y2='180'
        stroke='#374151'
        strokeWidth='1'
      />
      <line
        x1='250'
        y1='185'
        x2='260'
        y2='185'
        stroke='#374151'
        strokeWidth='1'
      />
      <line
        x1='250'
        y1='190'
        x2='260'
        y2='190'
        stroke='#374151'
        strokeWidth='1'
      />
    </motion.g>

    {/* Floating elements */}
    <motion.g
      variants={animate ? floatingAnimation : {}}
      style={{ originX: '50%', originY: '50%' }}
    >
      {/* Apple */}
      <circle cx='120' cy='120' r='15' fill='#EF4444' />
      <path
        d='M120 105 Q125 100 130 105'
        stroke='#10B981'
        strokeWidth='2'
        fill='none'
      />

      {/* Carrot */}
      <path d='M300 120 L310 140 L290 140 Z' fill='#F97316' />
      <path
        d='M300 115 Q295 110 290 115'
        stroke='#10B981'
        strokeWidth='2'
        fill='none'
      />

      {/* Heart rate line */}
      <motion.path
        d='M80 300 L100 300 L110 280 L120 320 L130 280 L140 300 L160 300'
        stroke='#EF4444'
        strokeWidth='3'
        fill='none'
        variants={animate ? pathAnimation : {}}
      />
    </motion.g>

    {/* Gradient definitions */}
    <defs>
      <linearGradient
        id='nutritionist-gradient'
        x1='0%'
        y1='0%'
        x2='100%'
        y2='100%'
      >
        <stop offset='0%' stopColor='#ECFDF5' />
        <stop offset='100%' stopColor='#D1FAE5' />
      </linearGradient>
    </defs>
  </motion.svg>
);

/**
 * Illustration de bienvenue - Patient
 */
export const PatientWelcomeIllustration: React.FC<IllustrationProps> = ({
  className = 'w-64 h-64',
  animate = true,
}) => (
  <motion.svg
    className={className}
    viewBox='0 0 400 400'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    variants={animate ? svgAnimation : {}}
    initial={animate ? 'initial' : false}
    animate={animate ? 'animate' : false}
  >
    {/* Background circle */}
    <motion.circle
      cx='200'
      cy='200'
      r='180'
      fill='url(#patient-gradient)'
      variants={animate ? pathAnimation : {}}
    />

    {/* Patient figure */}
    <motion.g variants={animate ? floatingAnimation : {}}>
      {/* Head */}
      <circle
        cx='200'
        cy='140'
        r='30'
        fill='#FEF3C7'
        stroke='#F59E0B'
        strokeWidth='2'
      />

      {/* Body */}
      <rect
        x='170'
        y='170'
        width='60'
        height='80'
        rx='10'
        fill='#3B82F6'
        stroke='#1D4ED8'
        strokeWidth='2'
      />

      {/* Arms */}
      <rect
        x='140'
        y='180'
        width='25'
        height='40'
        rx='12'
        fill='#FEF3C7'
        stroke='#F59E0B'
        strokeWidth='1'
      />
      <rect
        x='235'
        y='180'
        width='25'
        height='40'
        rx='12'
        fill='#FEF3C7'
        stroke='#F59E0B'
        strokeWidth='1'
      />

      {/* Smartphone in hand */}
      <rect
        x='245'
        y='175'
        width='15'
        height='25'
        rx='3'
        fill='#1F2937'
        stroke='#374151'
        strokeWidth='1'
      />
      <rect x='247' y='178' width='11' height='19' rx='1' fill='#60A5FA' />
    </motion.g>

    {/* Floating wellness elements */}
    <motion.g
      variants={animate ? floatingAnimation : {}}
      style={{ originX: '50%', originY: '50%' }}
    >
      {/* Heart */}
      <motion.path
        d='M120 120 C120 110, 135 110, 135 120 C135 110, 150 110, 150 120 C150 130, 135 145, 135 145 C135 145, 120 130, 120 120 Z'
        fill='#EF4444'
        variants={
          animate
            ? {
                animate: {
                  scale: [1, 1.1, 1],
                  transition: { duration: 1, repeat: Infinity },
                },
              }
            : {}
        }
      />

      {/* Water drop */}
      <path
        d='M300 120 C300 110, 310 100, 320 110 C320 130, 300 140, 300 120 Z'
        fill='#06B6D4'
      />

      {/* Target/goal */}
      <circle
        cx='320'
        cy='280'
        r='20'
        fill='none'
        stroke='#10B981'
        strokeWidth='3'
      />
      <circle
        cx='320'
        cy='280'
        r='10'
        fill='none'
        stroke='#10B981'
        strokeWidth='2'
      />
      <circle cx='320' cy='280' r='3' fill='#10B981' />

      {/* Activity waves */}
      <motion.path
        d='M80 280 Q90 270 100 280 Q110 290 120 280 Q130 270 140 280'
        stroke='#8B5CF6'
        strokeWidth='3'
        fill='none'
        variants={animate ? pathAnimation : {}}
      />
    </motion.g>

    {/* Gradient definitions */}
    <defs>
      <linearGradient id='patient-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#EFF6FF' />
        <stop offset='100%' stopColor='#DBEAFE' />
      </linearGradient>
    </defs>
  </motion.svg>
);

/**
 * Illustration de progression
 */
export const ProgressIllustration: React.FC<
  IllustrationProps & { progress: number }
> = ({ className = 'w-48 h-48', animate = true, progress = 0 }) => (
  <motion.svg
    className={className}
    viewBox='0 0 200 200'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    variants={animate ? svgAnimation : {}}
    initial={animate ? 'initial' : false}
    animate={animate ? 'animate' : false}
  >
    {/* Background circle */}
    <circle
      cx='100'
      cy='100'
      r='80'
      fill='#F3F4F6'
      stroke='#E5E7EB'
      strokeWidth='4'
    />

    {/* Progress circle */}
    <motion.circle
      cx='100'
      cy='100'
      r='80'
      fill='none'
      stroke='url(#progress-gradient)'
      strokeWidth='8'
      strokeLinecap='round'
      strokeDasharray={`${2 * Math.PI * 80}`}
      strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
      transform='rotate(-90 100 100)'
      variants={
        animate
          ? {
              animate: {
                strokeDashoffset: `${2 * Math.PI * 80 * (1 - progress / 100)}`,
                transition: { duration: 1, ease: 'easeInOut' },
              },
            }
          : {}
      }
    />

    {/* Center content */}
    <motion.text
      x='100'
      y='105'
      textAnchor='middle'
      fontSize='32'
      fontWeight='bold'
      fill='#374151'
      variants={
        animate
          ? {
              animate: {
                scale: [0.8, 1.1, 1],
                transition: { duration: 0.6, delay: 0.3 },
              },
            }
          : {}
      }
    >
      {Math.round(progress)}%
    </motion.text>

    {/* Gradient definitions */}
    <defs>
      <linearGradient id='progress-gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
        <stop offset='0%' stopColor='#10B981' />
        <stop offset='100%' stopColor='#3B82F6' />
      </linearGradient>
    </defs>
  </motion.svg>
);

/**
 * Illustration de succès/célébration
 */
export const SuccessIllustration: React.FC<IllustrationProps> = ({
  className = 'w-64 h-64',
  animate = true,
}) => (
  <motion.svg
    className={className}
    viewBox='0 0 400 400'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    variants={animate ? svgAnimation : {}}
    initial={animate ? 'initial' : false}
    animate={animate ? 'animate' : false}
  >
    {/* Celebration background */}
    <motion.circle
      cx='200'
      cy='200'
      r='180'
      fill='url(#success-gradient)'
      variants={animate ? pathAnimation : {}}
    />

    {/* Checkmark */}
    <motion.circle
      cx='200'
      cy='200'
      r='60'
      fill='#10B981'
      variants={
        animate
          ? {
              animate: {
                scale: [0, 1.2, 1],
                transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
              },
            }
          : {}
      }
    />

    <motion.path
      d='M170 200 L190 220 L230 180'
      stroke='#FFFFFF'
      strokeWidth='8'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
      variants={
        animate
          ? {
              ...pathAnimation,
              animate: {
                ...pathAnimation.animate,
                transition: { ...pathAnimation.animate.transition, delay: 0.3 },
              },
            }
          : {}
      }
    />

    {/* Confetti particles */}
    {[...Array(12)].map((_, i) => {
      const angle = (i * 30 * Math.PI) / 180;
      const radius = 120;
      const x = 200 + Math.cos(angle) * radius;
      const y = 200 + Math.sin(angle) * radius;

      return (
        <motion.rect
          key={i}
          x={x - 4}
          y={y - 4}
          width='8'
          height='8'
          rx='2'
          fill={i % 3 === 0 ? '#F59E0B' : i % 3 === 1 ? '#EF4444' : '#3B82F6'}
          variants={
            animate
              ? {
                  animate: {
                    scale: [0, 1, 0.8],
                    rotate: [0, 360],
                    y: [y - 4, y - 20, y - 4],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: 'easeInOut',
                    },
                  },
                }
              : {}
          }
        />
      );
    })}

    {/* Gradient definitions */}
    <defs>
      <linearGradient id='success-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#ECFDF5' />
        <stop offset='100%' stopColor='#D1FAE5' />
      </linearGradient>
    </defs>
  </motion.svg>
);

/**
 * Illustration d'étape spécifique - Informations personnelles
 */
export const PersonalInfoIllustration: React.FC<IllustrationProps> = ({
  className = 'w-48 h-48',
  animate = true,
}) => (
  <motion.svg
    className={className}
    viewBox='0 0 200 200'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    variants={animate ? svgAnimation : {}}
    initial={animate ? 'initial' : false}
    animate={animate ? 'animate' : false}
  >
    {/* Form background */}
    <motion.rect
      x='40'
      y='40'
      width='120'
      height='120'
      rx='12'
      fill='#FFFFFF'
      stroke='#E5E7EB'
      strokeWidth='2'
      variants={animate ? pathAnimation : {}}
    />

    {/* Profile icon */}
    <motion.circle
      cx='100'
      cy='80'
      r='15'
      fill='#F3F4F6'
      stroke='#9CA3AF'
      strokeWidth='2'
      variants={animate ? floatingAnimation : {}}
    />
    <path
      d='M90 85 Q100 75 110 85 Q105 95 100 95 Q95 95 90 85'
      fill='#9CA3AF'
    />

    {/* Form lines */}
    <motion.line
      x1='60'
      y1='110'
      x2='140'
      y2='110'
      stroke='#D1D5DB'
      strokeWidth='2'
      variants={animate ? pathAnimation : {}}
    />
    <motion.line
      x1='60'
      y1='125'
      x2='120'
      y2='125'
      stroke='#D1D5DB'
      strokeWidth='2'
      variants={animate ? pathAnimation : {}}
    />
    <motion.line
      x1='60'
      y1='140'
      x2='130'
      y2='140'
      stroke='#D1D5DB'
      strokeWidth='2'
      variants={animate ? pathAnimation : {}}
    />
  </motion.svg>
);

/**
 * Illustration d'étape spécifique - Objectifs de santé
 */
export const HealthGoalsIllustration: React.FC<IllustrationProps> = ({
  className = 'w-48 h-48',
  animate = true,
}) => (
  <motion.svg
    className={className}
    viewBox='0 0 200 200'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    variants={animate ? svgAnimation : {}}
    initial={animate ? 'initial' : false}
    animate={animate ? 'animate' : false}
  >
    {/* Target circles */}
    <motion.circle
      cx='100'
      cy='100'
      r='60'
      fill='none'
      stroke='#10B981'
      strokeWidth='4'
      variants={animate ? pathAnimation : {}}
    />
    <motion.circle
      cx='100'
      cy='100'
      r='40'
      fill='none'
      stroke='#10B981'
      strokeWidth='3'
      variants={animate ? pathAnimation : {}}
    />
    <motion.circle
      cx='100'
      cy='100'
      r='20'
      fill='none'
      stroke='#10B981'
      strokeWidth='2'
      variants={animate ? pathAnimation : {}}
    />
    <motion.circle
      cx='100'
      cy='100'
      r='8'
      fill='#10B981'
      variants={animate ? floatingAnimation : {}}
    />

    {/* Arrow */}
    <motion.path
      d='M60 60 L95 95'
      stroke='#F59E0B'
      strokeWidth='4'
      strokeLinecap='round'
      variants={animate ? pathAnimation : {}}
    />
    <motion.path
      d='M85 85 L95 95 L85 105'
      stroke='#F59E0B'
      strokeWidth='4'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
      variants={animate ? pathAnimation : {}}
    />
  </motion.svg>
);
