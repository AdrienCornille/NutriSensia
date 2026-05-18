'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Une approche qui respecte votre vie — DS v2.
 * Three hard-bordered cream cards with offset ink shadow and lift-on-hover.
 * SVG icons recolored to sage / peps / ink palette. Eyebrow + display title
 * with italic accent and lime highlight.
 */

interface BenefitCard {
  id: number;
  number: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const SAGE = '#6b8a55';
const SAGE_DARK = '#2d3a26';
const SAGE_LIGHT = '#e6efd9';
const PEPS = '#c4f048';
const INK = '#14160f';
const CREAM = '#faf6ea';
const CORAL = '#ff6b4a';

const benefits: BenefitCard[] = [
  {
    id: 1,
    number: '01',
    tag: 'Réaliste',
    title: 'Ça doit tenir un mardi soir, pas qu’un dimanche',
    description:
      'Un accompagnement pensé pour vos vraies semaines — celles avec les imprévus, les enfants qui boudent les courgettes, et le repas avalé à 22 h.',
    icon: (
      <svg
        viewBox='0 0 80 80'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{ width: '100%', height: '100%' }}
      >
        <rect
          x='12'
          y='16'
          width='56'
          height='52'
          rx='6'
          fill={CREAM}
          stroke={INK}
          strokeWidth='1.5'
        />
        <rect x='12' y='16' width='56' height='14' rx='6' fill={INK} />
        <circle cx='26' cy='23' r='2' fill={PEPS} />
        <circle cx='54' cy='23' r='2' fill={PEPS} />
        <rect
          x='20'
          y='38'
          width='12'
          height='10'
          rx='2'
          fill={SAGE_LIGHT}
          stroke={INK}
          strokeWidth='1.2'
        />
        <rect
          x='34'
          y='38'
          width='12'
          height='10'
          rx='2'
          fill={PEPS}
          stroke={INK}
          strokeWidth='1.2'
        />
        <rect
          x='48'
          y='38'
          width='12'
          height='10'
          rx='2'
          fill={SAGE_LIGHT}
          stroke={INK}
          strokeWidth='1.2'
        />
        <rect
          x='20'
          y='52'
          width='12'
          height='10'
          rx='2'
          fill={SAGE_LIGHT}
          stroke={INK}
          strokeWidth='1.2'
        />
        <rect
          x='34'
          y='52'
          width='12'
          height='10'
          rx='2'
          fill={SAGE_LIGHT}
          stroke={INK}
          strokeWidth='1.2'
        />
        <path
          d='M37 43 L41 47 L49 39'
          stroke={INK}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
  },
  {
    id: 2,
    number: '02',
    tag: 'Savoureux',
    title: 'Le plaisir, pas en bonus — au cœur',
    description:
      'Manger doit rester un moment qu’on attend, pas qu’on subit. On garde la gourmandise, on retire la culpabilité.',
    icon: (
      <svg
        viewBox='0 0 80 80'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{ width: '100%', height: '100%' }}
      >
        <circle
          cx='40'
          cy='40'
          r='28'
          fill={SAGE_LIGHT}
          stroke={INK}
          strokeWidth='1.5'
        />
        <path
          d='M40 54 C28 46 24 38 28 32 C32 26 40 30 40 30 C40 30 48 26 52 32 C56 38 52 46 40 54Z'
          fill={CORAL}
          stroke={INK}
          strokeWidth='1.5'
        />
        <ellipse
          cx='40'
          cy='59'
          rx='18'
          ry='5'
          fill='none'
          stroke={INK}
          strokeWidth='1.5'
          strokeDasharray='4 3'
        />
      </svg>
    ),
  },
  {
    id: 3,
    number: '03',
    tag: 'Soutenu',
    title: 'Une plateforme, pas un poste de surveillance',
    description:
      'Plan, messagerie, suivi. Disponibles à toute heure quand vous en avez besoin. Silencieux quand vous voulez la paix.',
    icon: (
      <svg
        viewBox='0 0 80 80'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{ width: '100%', height: '100%' }}
      >
        <rect
          x='22'
          y='10'
          width='36'
          height='60'
          rx='6'
          fill={CREAM}
          stroke={INK}
          strokeWidth='1.5'
        />
        <rect
          x='26'
          y='18'
          width='28'
          height='40'
          rx='2'
          fill='#ffffff'
          stroke={INK}
          strokeWidth='1'
        />
        <circle cx='40' cy='64' r='3' fill={INK} />
        <rect
          x='30'
          y='24'
          width='20'
          height='3'
          rx='1'
          fill={INK}
          opacity='0.4'
        />
        <rect
          x='30'
          y='30'
          width='16'
          height='3'
          rx='1'
          fill={INK}
          opacity='0.4'
        />
        <rect
          x='30'
          y='38'
          width='20'
          height='8'
          rx='2'
          fill={PEPS}
          stroke={INK}
          strokeWidth='1.2'
        />
        <rect
          x='30'
          y='50'
          width='14'
          height='3'
          rx='1'
          fill={INK}
          opacity='0.4'
        />
        <path
          d='M34 42 L37 45 L46 36'
          stroke={INK}
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

  const showContent = !isFirstVisit || isInView;
  const getHidden = (yOffset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${yOffset}px)` };
  const getTransition = (delay: number) =>
    isFirstVisit && isInView
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  return (
    <section
      id='benefits'
      ref={ref}
      style={{
        background: 'var(--ns-cream-200)',
        paddingTop: 96,
        paddingBottom: 96,
        borderTop: 'var(--ns-bw) solid var(--ns-ink)',
        borderBottom: 'var(--ns-bw) solid var(--ns-ink)',
      }}
    >
      <div className='ns2-container'>
        {/* Header */}
        <motion.div
          style={{ marginBottom: 64, ...getHidden(20) }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          <h2
            className='ns2-display'
            style={{
              fontSize: 'clamp(32px, 4.4vw, 56px)',
              color: 'var(--ns-ink)',
            }}
          >
            Une approche qui respecte{' '}
            <span className='ns2-hl'>votre vie, pas l&apos;inverse</span>.
          </h2>
          <p className='ns2-body-lg' style={{ marginTop: 20, maxWidth: 700 }}>
            Vos goûts, votre rythme, votre frigo réel. On part de là — pas
            d&apos;un plan théorique conçu pour quelqu&apos;un d&apos;autre.
          </p>
        </motion.div>

        {/* Cards */}
        <div className='benefits-grid'>
          {benefits.map((b, index) => (
            <motion.article
              key={b.id}
              className='ns2-card'
              style={{
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                ...getHidden(40),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
              }
              transition={getTransition(0.15 + index * 0.12)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span className='ns2-tag ns2-tag-sage'>{b.tag}</span>
                <span
                  className='ns2-display'
                  style={{
                    fontStyle: 'italic',
                    fontSize: 36,
                    color: 'var(--ns-ink-3)',
                    lineHeight: 1,
                  }}
                >
                  {b.number}
                </span>
              </div>

              <div
                style={{
                  width: 88,
                  height: 88,
                  background: 'var(--ns-cream-100)',
                  border: 'var(--ns-bw) solid var(--ns-ink)',
                  borderRadius: 'var(--ns-r-md)',
                  padding: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {b.icon}
              </div>

              <h3
                className='ns2-display'
                style={{
                  fontSize: 24,
                  color: 'var(--ns-ink)',
                  lineHeight: 1.05,
                }}
              >
                {b.title}
              </h3>

              <p className='ns2-body' style={{ marginTop: 'auto' }}>
                {b.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .benefits-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </section>
  );
}
