'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section "Ce qui va vraiment changer pour vous"
 *
 * Design selon le Style Guide NutriSensia (Culina Health) :
 * - Titre H2 en Marcellus (serif), 48px, #3f6655, centré
 * - Sous-titre centré
 * - 3 cartes avec illustration, titre et description
 * - Cartes avec border 1px #3f6655, border-radius 10px
 * - Box-shadow signature : 8px 8px 0 #d7e1ce
 * - Hover : translateY(-2px) translateX(-2px) + border 2px
 */

interface BenefitCard {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const benefits: BenefitCard[] = [
  {
    id: 1,
    title: "Des solutions qui s'intègrent à votre vie",
    description:
      'Grâce à une approche centrée sur vos besoins réels, vous découvrez des solutions faciles à intégrer à votre routine. Sans sacrifices inutiles.',
    icon: (
      <svg
        viewBox='0 0 80 80'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-16 h-16'
      >
        {/* Calendrier/routine */}
        <rect
          x='12'
          y='16'
          width='56'
          height='52'
          rx='6'
          fill='#F0F9F8'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <rect x='12' y='16' width='56' height='14' rx='6' fill='#1B998B' />
        <circle cx='26' cy='23' r='2' fill='#fff' />
        <circle cx='54' cy='23' r='2' fill='#fff' />
        <rect x='20' y='38' width='12' height='10' rx='2' fill='#E5DED6' />
        <rect x='34' y='38' width='12' height='10' rx='2' fill='#E76F51' />
        <rect x='48' y='38' width='12' height='10' rx='2' fill='#E5DED6' />
        <rect x='20' y='52' width='12' height='10' rx='2' fill='#E5DED6' />
        <rect x='34' y='52' width='12' height='10' rx='2' fill='#E5DED6' />
        <path
          d='M38 43 L42 47 L50 39'
          stroke='#fff'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Le plaisir au cœur de l'accompagnement",
    description:
      'Fini les compromis entre ce que vous aimez manger et ce qui est bon pour vous. Un équilibre qui rime avec plaisir et résultats durables.',
    icon: (
      <svg
        viewBox='0 0 80 80'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-16 h-16'
      >
        {/* Coeur avec assiette */}
        <circle
          cx='40'
          cy='40'
          r='28'
          fill='#F0F9F8'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <path
          d='M40 54 C28 46 24 38 28 32 C32 26 40 30 40 30 C40 30 48 26 52 32 C56 38 52 46 40 54Z'
          fill='#E76F51'
        />
        <ellipse
          cx='40'
          cy='58'
          rx='18'
          ry='6'
          fill='none'
          stroke='#E5DED6'
          strokeWidth='2'
          strokeDasharray='4 2'
        />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Des outils pour avancer en douceur',
    description:
      "Plateforme accessible 24/7, plans personnalisés, messagerie sécurisée... Tout ce qu'il faut pour rester motivée et atteindre vos objectifs.",
    icon: (
      <svg
        viewBox='0 0 80 80'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-16 h-16'
      >
        {/* Smartphone/plateforme */}
        <rect
          x='22'
          y='10'
          width='36'
          height='60'
          rx='6'
          fill='#F0F9F8'
          stroke='#1B998B'
          strokeWidth='2'
        />
        <rect x='26' y='18' width='28' height='40' rx='2' fill='#fff' />
        <circle cx='40' cy='64' r='3' fill='#1B998B' />
        {/* Lignes de contenu */}
        <rect x='30' y='24' width='20' height='3' rx='1' fill='#E5DED6' />
        <rect x='30' y='30' width='16' height='3' rx='1' fill='#E5DED6' />
        <rect x='30' y='38' width='20' height='8' rx='2' fill='#1B998B' />
        <rect x='30' y='50' width='14' height='3' rx='1' fill='#E5DED6' />
        {/* Checkmark */}
        <path
          d='M34 42 L37 45 L46 36'
          stroke='#fff'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
  },
];

export function AccordionBenefitsSection() {
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
      id='benefits'
      ref={ref}
      style={{
        padding: '96px 0',
        backgroundColor: '#FBF9F7' /* Crème Méditerranée */,
      }}
    >
      {/* Container principal - max-width 1200px */}
      <div className='container mx-auto max-w-[1200px] px-6'>
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
              color: '#1B998B' /* Turquoise Méditerranée */,
              fontSize: '48px',
              lineHeight: '57.6px',
              textAlign: 'center',
              marginBottom: '24px',
              fontWeight: 700,
            }}
          >
            Une approche qui respecte votre vie
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: '#41556b',
              fontSize: '18px',
              lineHeight: '28px',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            Pas de régime strict, pas de culpabilité. Juste des conseils
            personnalisés qui s'adaptent à votre rythme, vos goûts et votre
            quotidien.
          </p>
        </motion.div>

        {/* ============================================ */}
        {/* CARDS GRID - 3 colonnes                      */}
        {/* ============================================ */}
        <div
          className={cn('grid', 'grid-cols-1 md:grid-cols-3')}
          style={{ gap: '32px' }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              style={{
                backgroundColor: '#b6ccae26',
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: '8px 8px 0 #E5DED6' /* Beige sand shadow */,
                ...getHiddenStyle(40),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
              }
              transition={getTransition(0.2 + index * 0.15)}
            >
              {/* Icon Container */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 24px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {benefit.icon}
              </div>

              {/* Card Title */}
              <h3
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  color: '#1B998B' /* Turquoise Méditerranée */,
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: '27px',
                  textAlign: 'center',
                  marginBottom: '16px',
                }}
              >
                {benefit.title}
              </h3>

              {/* Card Description */}
              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  color: '#41556b',
                  fontSize: '16px',
                  lineHeight: '24px',
                  textAlign: 'center',
                }}
              >
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
