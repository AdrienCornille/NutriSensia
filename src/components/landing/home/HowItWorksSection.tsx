'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section "Comment je vous accompagne" - Flow Horizontal
 *
 * Design selon le Style Guide NutriSensia (Culina Health) :
 * - Titre H2 en Marcellus (serif), 48px, #3f6655, centré
 * - Sous-titre centré
 * - 4 étapes en flow horizontal avec icônes et flèches
 * - Icônes SVG personnalisées
 * - Flèches de connexion entre les étapes
 * - Responsive : horizontal sur desktop, vertical sur mobile
 */

interface ProcessStep {
  id: number;
  title: string;
  icon: React.ReactNode;
}

const processSteps: ProcessStep[] = [
  {
    id: 1,
    title: 'On prend le temps\nde se connaître',
    icon: (
      <svg
        viewBox='0 0 200 200'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full'
      >
        {/* Deux personnes qui discutent */}
        <rect
          x='20'
          y='15'
          width='70'
          height='50'
          rx='4'
          fill='#F0F9F8'
          stroke='#E5DED6'
          strokeWidth='2'
        />
        <rect x='30' y='25' width='50' height='30' rx='2' fill='#ffffff' />
        <rect
          x='65'
          y='35'
          width='70'
          height='50'
          rx='4'
          fill='#F0F9F8'
          stroke='#E5DED6'
          strokeWidth='2'
        />
        <rect x='75' y='45' width='50' height='30' rx='2' fill='#ffffff' />
        <rect
          x='110'
          y='55'
          width='70'
          height='50'
          rx='4'
          fill='#F0F9F8'
          stroke='#E5DED6'
          strokeWidth='2'
        />
        <rect x='120' y='65' width='50' height='30' rx='2' fill='#ffffff' />
        {/* Card principale avec profil */}
        <rect
          x='40'
          y='100'
          width='120'
          height='85'
          rx='8'
          fill='#E5DED6'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <circle cx='80' cy='135' r='15' fill='#1B998B' />
        <path d='M 65 160 Q 80 150 95 160' fill='#1B998B' />
        {/* Étoile avec check */}
        <g transform='translate(115, 125)'>
          <path
            d='M 15 0 L 18 10 L 28 10 L 20 16 L 23 26 L 15 20 L 7 26 L 10 16 L 2 10 L 12 10 Z'
            fill='#E9C46A'
          />
          <path
            d='M 12 13 L 15 16 L 20 11'
            stroke='#ffffff'
            strokeWidth='2'
            fill='none'
            strokeLinecap='round'
          />
        </g>
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Nous créons VOTRE\nplan personnalisé',
    icon: (
      <svg
        viewBox='0 0 200 200'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full'
      >
        {/* Document */}
        <rect
          x='50'
          y='40'
          width='100'
          height='120'
          rx='8'
          fill='#F0F9F8'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <rect x='60' y='60' width='80' height='8' rx='2' fill='#E5DED6' />
        <rect x='60' y='80' width='60' height='6' rx='2' fill='#E5DED6' />
        <rect x='60' y='95' width='70' height='6' rx='2' fill='#E5DED6' />
        <rect x='60' y='110' width='50' height='6' rx='2' fill='#E5DED6' />
        {/* Loupe */}
        <circle
          cx='130'
          cy='110'
          r='25'
          fill='#E9C46A'
          stroke='#E76F51'
          strokeWidth='3'
        />
        <circle cx='130' cy='110' r='18' fill='#ffffff' />
        <line
          x1='148'
          y1='128'
          x2='165'
          y2='145'
          stroke='#E76F51'
          strokeWidth='5'
          strokeLinecap='round'
        />
        <path
          d='M 122 110 L 128 116 L 138 106'
          stroke='#1B998B'
          strokeWidth='3'
          fill='none'
          strokeLinecap='round'
        />
        {/* Badge check */}
        <circle cx='110' cy='45' r='12' fill='#E76F51' />
        <path
          d='M 105 45 L 108 48 L 115 41'
          stroke='#ffffff'
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
        />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'On ajuste au\nfur et à mesure',
    icon: (
      <svg
        viewBox='0 0 200 200'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full'
      >
        {/* Phone 1 */}
        <rect
          x='35'
          y='50'
          width='55'
          height='100'
          rx='8'
          fill='#F0F9F8'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <rect x='40' y='60' width='45' height='75' rx='4' fill='#ffffff' />
        <circle cx='62.5' cy='145' r='3' fill='#1B998B' />
        <circle cx='62.5' cy='85' r='12' fill='#E5DED6' />
        <path d='M 50 110 Q 62.5 100 75 110' fill='#E5DED6' />
        {/* Bulle 1 */}
        <rect x='20' y='20' width='40' height='25' rx='4' fill='#E9C46A' />
        <polygon points='50,35 55,40 50,45' fill='#E9C46A' />
        <line
          x1='27'
          y1='28'
          x2='47'
          y2='28'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <line
          x1='27'
          y1='35'
          x2='43'
          y2='35'
          stroke='#1B998B'
          strokeWidth='2'
        />
        {/* Phone 2 */}
        <rect
          x='110'
          y='50'
          width='55'
          height='100'
          rx='8'
          fill='#F0F9F8'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <rect x='115' y='60' width='45' height='75' rx='4' fill='#ffffff' />
        <circle cx='137.5' cy='145' r='3' fill='#1B998B' />
        <circle cx='137.5' cy='85' r='12' fill='#E5DED6' />
        <path d='M 125 110 Q 137.5 100 150 110' fill='#E5DED6' />
        {/* Bulle 2 */}
        <rect x='140' y='20' width='40' height='25' rx='4' fill='#E9C46A' />
        <polygon points='150,45 145,40 150,35' fill='#E9C46A' />
        <line
          x1='147'
          y1='28'
          x2='173'
          y2='28'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <line
          x1='147'
          y1='35'
          x2='167'
          y2='35'
          stroke='#1B998B'
          strokeWidth='2'
        />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Vous devenez\nautonome',
    icon: (
      <svg
        viewBox='0 0 200 200'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full'
      >
        {/* Calendrier */}
        <rect
          x='50'
          y='40'
          width='100'
          height='120'
          rx='8'
          fill='#F0F9F8'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <line
          x1='50'
          y1='55'
          x2='150'
          y2='55'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <circle
          cx='70'
          cy='48'
          r='4'
          fill='none'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <circle
          cx='100'
          cy='48'
          r='4'
          fill='none'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <circle
          cx='130'
          cy='48'
          r='4'
          fill='none'
          stroke='#1B998B'
          strokeWidth='2'
        />
        {/* Grille calendrier */}
        <g transform='translate(60, 70)'>
          <rect
            x='0'
            y='0'
            width='18'
            height='18'
            rx='3'
            fill='#ffffff'
            stroke='#E5DED6'
          />
          <rect
            x='22'
            y='0'
            width='18'
            height='18'
            rx='3'
            fill='#ffffff'
            stroke='#E5DED6'
          />
          <rect x='44' y='0' width='18' height='18' rx='3' fill='#E76F51' />
          <rect
            x='66'
            y='0'
            width='18'
            height='18'
            rx='3'
            fill='#ffffff'
            stroke='#E5DED6'
          />
          <rect
            x='0'
            y='22'
            width='18'
            height='18'
            rx='3'
            fill='#ffffff'
            stroke='#E5DED6'
          />
          <rect x='22' y='22' width='18' height='18' rx='3' fill='#1B998B' />
          <rect
            x='44'
            y='22'
            width='18'
            height='18'
            rx='3'
            fill='#ffffff'
            stroke='#E5DED6'
          />
          <rect
            x='66'
            y='22'
            width='18'
            height='18'
            rx='3'
            fill='#ffffff'
            stroke='#E5DED6'
          />
          <rect
            x='0'
            y='44'
            width='18'
            height='18'
            rx='3'
            fill='#ffffff'
            stroke='#E5DED6'
          />
          <rect
            x='22'
            y='44'
            width='18'
            height='18'
            rx='3'
            fill='#ffffff'
            stroke='#E5DED6'
          />
          <rect
            x='44'
            y='44'
            width='18'
            height='18'
            rx='3'
            fill='#ffffff'
            stroke='#E5DED6'
          />
          <rect x='66' y='44' width='18' height='18' rx='3' fill='#E9C46A' />
        </g>
        {/* Check marks */}
        <path
          d='M 106 79 L 109 82 L 115 76'
          stroke='#fff'
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
        />
        <path
          d='M 84 101 L 87 104 L 93 98'
          stroke='#fff'
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
        />
        <path
          d='M 128 123 L 131 126 L 137 120'
          stroke='#fff'
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
        />
      </svg>
    ),
  },
];

// Composant flèche
const ArrowIcon = () => (
  <svg
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6 text-white'
  >
    <path
      d='M5 12h14M12 5l7 7-7 7'
      stroke='currentColor'
      strokeWidth='2'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Style initial : cacher seulement si première visite
  const getHiddenStyle = (yOffset: number) => {
    if (!isFirstVisit) {
      return {};
    }
    return {
      opacity: 0,
      transform: `translateY(${yOffset}px)`,
    };
  };

  // Transition : animation seulement si première visite et en vue
  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  return (
    <section
      id='how-it-works'
      ref={ref}
      style={{
        padding: '96px 0',
        backgroundColor: '#1B998B' /* Turquoise Méditerranée */,
      }}
    >
      {/* Container principal - max-width 1370px */}
      <div className='container mx-auto max-w-[1370px] px-6 md:px-10 lg:px-14 xl:px-20'>
        {/* ============================================ */}
        {/* HEADER SECTION - Titre + Sous-titre centrés */}
        {/* ============================================ */}
        <motion.div
          className='text-center'
          style={{ marginBottom: '64px', ...getHiddenStyle(30) }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
        >
          {/* H2 Title - Marcellus serif */}
          <h2
            style={{
              fontFamily: "'Marcellus', serif",
              color: '#ffffff',
              fontSize: '48px',
              lineHeight: '57.6px',
              textAlign: 'center',
              marginBottom: '24px',
              fontWeight: 700,
            }}
          >
            Comment nous vous accompagnons
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '18px',
              lineHeight: '28px',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            Un parcours en 4 étapes, pensé pour des résultats durables.
          </p>
        </motion.div>

        {/* ============================================ */}
        {/* FLOW STEPS - Horizontal avec flèches        */}
        {/* ============================================ */}
        <div
          className={cn(
            'flex',
            'flex-col md:flex-row',
            'items-center md:items-start',
            'justify-center'
          )}
          style={{ gap: '16px' }}
        >
          {processSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Card */}
              <motion.div
                className='flex flex-col items-center'
                style={{ maxWidth: '240px', ...getHiddenStyle(40) }}
                animate={
                  showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
                }
                transition={getTransition(0.2 + index * 0.15)}
              >
                {/* Icon Container */}
                <div
                  style={{
                    width: '160px',
                    height: '160px',
                    marginBottom: '20px',
                  }}
                >
                  {step.icon}
                </div>

                {/* Step Text */}
                <p
                  style={{
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    color: '#ffffff',
                    fontSize: '18px',
                    fontWeight: 600,
                    lineHeight: '27px',
                    textAlign: 'center',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {step.title}
                </p>
              </motion.div>

              {/* Arrow (pas après la dernière étape) */}
              {index < processSteps.length - 1 && (
                <motion.div
                  className={cn(
                    'flex items-center justify-center',
                    'hidden md:flex',
                    'mt-16'
                  )}
                  style={{
                    minWidth: '32px',
                    ...(isFirstVisit
                      ? { opacity: 0, transform: 'scale(0.8)' }
                      : {}),
                  }}
                  animate={
                    showContent
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.8 }
                  }
                  transition={getTransition(0.4 + index * 0.15)}
                >
                  <ArrowIcon />
                </motion.div>
              )}

              {/* Arrow mobile (verticale) */}
              {index < processSteps.length - 1 && (
                <motion.div
                  className='flex md:hidden items-center justify-center my-4 rotate-90'
                  style={
                    isFirstVisit ? { opacity: 0, transform: 'scale(0.8)' } : {}
                  }
                  animate={
                    showContent
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.8 }
                  }
                  transition={getTransition(0.4 + index * 0.15)}
                >
                  <ArrowIcon />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ============================================ */}
        {/* CTA Button centré                           */}
        {/* ============================================ */}
        <motion.div
          style={{
            textAlign: 'center',
            marginTop: '64px',
            ...getHiddenStyle(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(1)}
        >
          <a
            href='/approche'
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '35px',
              lineHeight: '16px',
              color: '#147569' /* Turquoise foncé */,
              display: 'inline-block',
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              textAlign: 'center',
              padding: '14px 32px',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            Découvrir notre approche →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
