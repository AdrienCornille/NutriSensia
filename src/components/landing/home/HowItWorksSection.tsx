'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Comment nous vous accompagnons — DS v2.
 * Dark ink section (signature) — cream typography, peps accents.
 * 4 numbered steps with eyebrow numbers, recolored SVG icons inside cream-bordered
 * frames, dotted connector line on desktop, peps CTA at bottom.
 */

interface ProcessStep {
  id: number;
  number: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}

const PEPS = '#c4f048';
const PEPS_DEEP = '#9bd418';
const SAGE = '#95ad7e';
const CREAM = '#faf6ea';
const INK = '#14160f';

const processSteps: ProcessStep[] = [
  {
    id: 1,
    number: '01',
    title: 'Première rencontre, sans chrono',
    body: 'On parle de vous, vraiment. Pas de questionnaire à la chaîne.',
    icon: (
      <svg
        viewBox='0 0 200 200'
        xmlns='http://www.w3.org/2000/svg'
        style={{ width: '100%', height: '100%' }}
      >
        <rect
          x='30'
          y='40'
          width='140'
          height='110'
          rx='12'
          fill={CREAM}
          stroke={INK}
          strokeWidth='3'
        />
        <circle
          cx='80'
          cy='95'
          r='22'
          fill={PEPS}
          stroke={INK}
          strokeWidth='3'
        />
        <path
          d='M 60 130 Q 80 115 100 130'
          stroke={INK}
          strokeWidth='3'
          fill='none'
          strokeLinecap='round'
        />
        <g transform='translate(120, 70)'>
          <path
            d='M 18 0 L 22 12 L 34 12 L 24 20 L 28 32 L 18 24 L 8 32 L 12 20 L 2 12 L 14 12 Z'
            fill={PEPS_DEEP}
            stroke={INK}
            strokeWidth='2'
          />
          <path
            d='M 14 16 L 18 20 L 24 13'
            stroke={INK}
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
    number: '02',
    title: 'Un plan, pas un protocole',
    body: 'Construit pour vous, vos goûts, votre semaine. Et modifiable autant de fois qu’il faudra.',
    icon: (
      <svg
        viewBox='0 0 200 200'
        xmlns='http://www.w3.org/2000/svg'
        style={{ width: '100%', height: '100%' }}
      >
        <rect
          x='50'
          y='40'
          width='100'
          height='120'
          rx='10'
          fill={CREAM}
          stroke={INK}
          strokeWidth='3'
        />
        <rect x='62' y='60' width='76' height='8' rx='2' fill={INK} />
        <rect
          x='62'
          y='80'
          width='56'
          height='6'
          rx='2'
          fill={INK}
          opacity='0.5'
        />
        <rect
          x='62'
          y='95'
          width='66'
          height='6'
          rx='2'
          fill={INK}
          opacity='0.5'
        />
        <rect
          x='62'
          y='110'
          width='48'
          height='6'
          rx='2'
          fill={INK}
          opacity='0.5'
        />
        <circle
          cx='130'
          cy='120'
          r='28'
          fill={PEPS}
          stroke={INK}
          strokeWidth='3'
        />
        <circle
          cx='130'
          cy='120'
          r='20'
          fill={CREAM}
          stroke={INK}
          strokeWidth='2'
        />
        <line
          x1='150'
          y1='140'
          x2='168'
          y2='158'
          stroke={INK}
          strokeWidth='5'
          strokeLinecap='round'
        />
        <path
          d='M 121 120 L 128 127 L 140 113'
          stroke={INK}
          strokeWidth='3'
          fill='none'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
  },
  {
    id: 3,
    number: '03',
    title: 'La vie bouge, le plan suit',
    body: 'Ajustements en messagerie, consultations de suivi. La vraie vie ne respecte pas les tableurs Excel.',
    icon: (
      <svg
        viewBox='0 0 200 200'
        xmlns='http://www.w3.org/2000/svg'
        style={{ width: '100%', height: '100%' }}
      >
        <rect
          x='30'
          y='50'
          width='60'
          height='105'
          rx='10'
          fill={CREAM}
          stroke={INK}
          strokeWidth='3'
        />
        <rect
          x='36'
          y='60'
          width='48'
          height='80'
          rx='4'
          fill='#fff'
          stroke={INK}
          strokeWidth='1.5'
        />
        <circle cx='60' cy='148' r='3' fill={INK} />
        <circle
          cx='60'
          cy='90'
          r='12'
          fill={SAGE}
          stroke={INK}
          strokeWidth='2'
        />
        <path
          d='M 48 115 Q 60 105 72 115'
          stroke={INK}
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
        />
        <rect
          x='10'
          y='20'
          width='50'
          height='30'
          rx='6'
          fill={PEPS}
          stroke={INK}
          strokeWidth='2.5'
        />
        <polygon
          points='48,40 56,48 48,52'
          fill={PEPS}
          stroke={INK}
          strokeWidth='2.5'
        />
        <line
          x1='18'
          y1='30'
          x2='42'
          y2='30'
          stroke={INK}
          strokeWidth='2'
          strokeLinecap='round'
        />
        <line
          x1='18'
          y1='40'
          x2='36'
          y2='40'
          stroke={INK}
          strokeWidth='2'
          strokeLinecap='round'
        />

        <rect
          x='110'
          y='50'
          width='60'
          height='105'
          rx='10'
          fill={CREAM}
          stroke={INK}
          strokeWidth='3'
        />
        <rect
          x='116'
          y='60'
          width='48'
          height='80'
          rx='4'
          fill='#fff'
          stroke={INK}
          strokeWidth='1.5'
        />
        <circle cx='140' cy='148' r='3' fill={INK} />
        <circle
          cx='140'
          cy='90'
          r='12'
          fill={SAGE}
          stroke={INK}
          strokeWidth='2'
        />
        <path
          d='M 128 115 Q 140 105 152 115'
          stroke={INK}
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
        />
        <rect
          x='140'
          y='20'
          width='50'
          height='30'
          rx='6'
          fill={PEPS_DEEP}
          stroke={INK}
          strokeWidth='2.5'
        />
        <polygon
          points='150,40 144,48 152,52'
          fill={PEPS_DEEP}
          stroke={INK}
          strokeWidth='2.5'
        />
        <line
          x1='148'
          y1='30'
          x2='182'
          y2='30'
          stroke={INK}
          strokeWidth='2'
          strokeLinecap='round'
        />
        <line
          x1='148'
          y1='40'
          x2='176'
          y2='40'
          stroke={INK}
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    ),
  },
  {
    id: 4,
    number: '04',
    title: 'Vous tenez la barre',
    body: 'Les bons gestes deviennent naturels. Vous décidez, on reste là si besoin.',
    icon: (
      <svg
        viewBox='0 0 200 200'
        xmlns='http://www.w3.org/2000/svg'
        style={{ width: '100%', height: '100%' }}
      >
        <rect
          x='40'
          y='35'
          width='120'
          height='130'
          rx='10'
          fill={CREAM}
          stroke={INK}
          strokeWidth='3'
        />
        <line x1='40' y1='55' x2='160' y2='55' stroke={INK} strokeWidth='2.5' />
        <circle cx='62' cy='46' r='4' fill={INK} />
        <circle cx='100' cy='46' r='4' fill={INK} />
        <circle cx='138' cy='46' r='4' fill={INK} />
        {[
          [60, 75],
          [85, 75],
          [110, 75],
          [135, 75],
          [60, 100],
          [85, 100],
          [110, 100],
          [135, 100],
          [60, 125],
          [85, 125],
          [110, 125],
          [135, 125],
        ].map(([x, y], idx) => {
          const fill =
            idx === 5
              ? PEPS
              : idx === 11
                ? PEPS_DEEP
                : idx === 2
                  ? SAGE
                  : '#fff';
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width='20'
              height='20'
              rx='3'
              fill={fill}
              stroke={INK}
              strokeWidth='1.8'
            />
          );
        })}
        <path
          d='M 91 109 L 95 113 L 102 105'
          stroke={INK}
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
        />
        <path
          d='M 116 84 L 119 87 L 125 81'
          stroke={INK}
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
        />
        <path
          d='M 141 134 L 144 137 L 150 131'
          stroke={INK}
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
        />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
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
      id='how-it-works'
      ref={ref}
      style={{
        background: 'var(--ns-ink)',
        color: 'var(--ns-cream-100)',
        paddingTop: 96,
        paddingBottom: 96,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className='ns2-container'>
        {/* Header */}
        <motion.div
          style={{ marginBottom: 72, ...getHidden(20) }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          <div
            className='ns2-eyebrow ns2-eyebrow-dot'
            style={{ color: 'var(--ns-cream-100)' }}
          >
            Le parcours
          </div>
          <h2
            className='ns2-display'
            style={{
              fontSize: 'clamp(36px, 5vw, 60px)',
              marginTop: 18,
              maxWidth: 880,
              color: 'var(--ns-cream-100)',
            }}
          >
            Quatre étapes simples,
            <br />
            <span className='ns2-hl' style={{ color: 'var(--ns-cream-100)' }}>
              zéro brutalité
            </span>
            .
          </h2>
        </motion.div>

        {/* Steps */}
        <div className='steps-grid'>
          {processSteps.map((step, index) => (
            <motion.div
              key={step.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
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
                  alignItems: 'baseline',
                  gap: 12,
                }}
              >
                <span
                  className='ns2-display'
                  style={{
                    fontSize: 56,
                    color: 'var(--ns-peps)',
                    fontStyle: 'italic',
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </span>
                <span
                  style={{
                    flex: 1,
                    height: 2,
                    borderTop: '1.5px dashed rgba(250, 246, 234, 0.3)',
                    marginBottom: 6,
                  }}
                />
              </div>

              <div
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  border: 'var(--ns-bw) solid var(--ns-cream-100)',
                  borderRadius: 'var(--ns-r-md)',
                  background: 'rgba(250, 246, 234, 0.04)',
                  padding: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {step.icon}
              </div>

              <h3
                className='ns2-display'
                style={{
                  fontSize: 22,
                  color: 'var(--ns-cream-100)',
                  marginTop: 8,
                  lineHeight: 1.1,
                }}
              >
                {step.title}
              </h3>
              <p
                className='ns2-body'
                style={{ color: 'rgba(250, 246, 234, 0.75)' }}
              >
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          style={{
            marginTop: 64,
            display: 'flex',
            justifyContent: 'center',
            ...getHidden(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.85)}
        >
          <Link href='/approche' className='ns2-btn ns2-btn-peps'>
            Découvrir l&apos;approche
            <ArrowRight className='w-4 h-4' />
          </Link>
        </motion.div>
      </div>

      <style jsx>{`
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
          }
        }
        @media (max-width: 640px) {
          .steps-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
    </section>
  );
}
