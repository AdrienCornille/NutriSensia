'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Les troubles que nous accompagnons — DS v2.
 * Cream section, asymmetric tag-style cards (3-col grid) with rotating tag
 * accents (sage / coral / peps). Each card has hard ink border + offset shadow
 * and a recolored SVG icon.
 */

const SAGE = '#6b8a55';
const SAGE_LIGHT = '#e6efd9';
const PEPS = '#c4f048';
const PEPS_DEEP = '#9bd418';
const INK = '#14160f';
const CREAM = '#faf6ea';
const CORAL = '#ff6b4a';
const HONEY = '#f4b860';

const conditionIcons = {
  menopause: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      style={{ width: '100%', height: '100%' }}
    >
      <circle
        cx='40'
        cy='32'
        r='16'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <line x1='40' y1='48' x2='40' y2='65' stroke={INK} strokeWidth='1.5' />
      <line x1='32' y1='58' x2='48' y2='58' stroke={INK} strokeWidth='1.5' />
      <path
        d='M40 20 C42 24 46 26 46 30 C46 34 43 36 40 36 C37 36 34 34 34 30 C34 26 38 24 40 20Z'
        fill={CORAL}
        stroke={INK}
        strokeWidth='1.5'
      />
    </svg>
  ),
  weightLoss: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      style={{ width: '100%', height: '100%' }}
    >
      <circle
        cx='40'
        cy='40'
        r='24'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <path
        d='M25 45 L35 35 L45 42 L55 30'
        stroke={INK}
        strokeWidth='2'
        fill='none'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle
        cx='55'
        cy='30'
        r='4'
        fill={PEPS}
        stroke={INK}
        strokeWidth='1.5'
      />
      <path
        d='M58 48 L58 58 M54 54 L58 58 L62 54'
        stroke={INK}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  digestive: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      style={{ width: '100%', height: '100%' }}
    >
      <path
        d='M30 25 C25 25 20 35 20 45 C20 55 28 60 35 60 L45 60 C52 60 60 55 60 45 C60 35 55 25 50 25 L30 25Z'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <path
        d='M32 38 C36 42 44 42 48 38'
        stroke={INK}
        strokeWidth='1.5'
        fill='none'
        strokeLinecap='round'
      />
      <path
        d='M34 48 C38 52 42 52 46 48'
        stroke={INK}
        strokeWidth='1.5'
        fill='none'
        strokeLinecap='round'
      />
      <circle
        cx='55'
        cy='55'
        r='8'
        fill={PEPS}
        stroke={INK}
        strokeWidth='1.5'
      />
      <path
        d='M52 55 L54 57 L58 53'
        stroke={INK}
        strokeWidth='2'
        fill='none'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  diabetes: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      style={{ width: '100%', height: '100%' }}
    >
      <path
        d='M40 15 C40 15 55 35 55 48 C55 58 48 65 40 65 C32 65 25 58 25 48 C25 35 40 15 40 15Z'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <path
        d='M30 45 L36 50 L44 40 L50 48'
        stroke={INK}
        strokeWidth='1.5'
        fill='none'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle
        cx='40'
        cy='48'
        r='6'
        fill={CORAL}
        stroke={INK}
        strokeWidth='1.5'
      />
    </svg>
  ),
  cardiovascular: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      style={{ width: '100%', height: '100%' }}
    >
      <path
        d='M40 60 C25 50 15 40 15 30 C15 22 22 16 30 16 C35 16 38 18 40 22 C42 18 45 16 50 16 C58 16 65 22 65 30 C65 40 55 50 40 60Z'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <path
        d='M22 38 L32 38 L36 30 L40 46 L44 34 L48 38 L58 38'
        stroke={CORAL}
        strokeWidth='2'
        fill='none'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  fatigue: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      style={{ width: '100%', height: '100%' }}
    >
      <rect
        x='20'
        y='25'
        width='40'
        height='30'
        rx='4'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <rect x='60' y='35' width='6' height='10' rx='1' fill={INK} />
      <rect
        x='26'
        y='31'
        width='10'
        height='18'
        rx='2'
        fill={PEPS}
        stroke={INK}
        strokeWidth='1.2'
      />
      <rect
        x='40'
        y='31'
        width='10'
        height='18'
        rx='2'
        fill={CREAM}
        stroke={INK}
        strokeWidth='1.2'
      />
      <path
        d='M38 58 L42 62 L40 64 L46 72 L44 66 L48 66 L42 58 Z'
        fill={HONEY}
        stroke={INK}
        strokeWidth='1.5'
      />
    </svg>
  ),
  longevity: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      style={{ width: '100%', height: '100%' }}
    >
      <path
        d='M25 20 L55 20 L55 25 C55 35 45 40 45 40 C45 40 55 45 55 55 L55 60 L25 60 L25 55 C25 45 35 40 35 40 C35 40 25 35 25 25 L25 20Z'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <path
        d='M30 25 L50 25 L45 35 L35 35 Z'
        fill={HONEY}
        stroke={INK}
        strokeWidth='1.2'
      />
      <path
        d='M35 45 L45 45 L50 55 L30 55 Z'
        fill={CORAL}
        stroke={INK}
        strokeWidth='1.2'
      />
    </svg>
  ),
  hormonal: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      style={{ width: '100%', height: '100%' }}
    >
      <circle
        cx='40'
        cy='40'
        r='12'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <circle
        cx='25'
        cy='25'
        r='8'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <circle
        cx='55'
        cy='25'
        r='8'
        fill={PEPS}
        stroke={INK}
        strokeWidth='1.5'
      />
      <circle
        cx='55'
        cy='55'
        r='8'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <circle
        cx='25'
        cy='55'
        r='8'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <line x1='31' y1='31' x2='34' y2='34' stroke={INK} strokeWidth='1.5' />
      <line x1='49' y1='31' x2='46' y2='34' stroke={INK} strokeWidth='1.5' />
      <line x1='49' y1='49' x2='46' y2='46' stroke={INK} strokeWidth='1.5' />
      <line x1='31' y1='49' x2='34' y2='46' stroke={INK} strokeWidth='1.5' />
      <circle cx='40' cy='40' r='5' fill={CORAL} />
    </svg>
  ),
  healthyEating: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      style={{ width: '100%', height: '100%' }}
    >
      <ellipse
        cx='40'
        cy='45'
        rx='28'
        ry='20'
        fill={SAGE_LIGHT}
        stroke={INK}
        strokeWidth='1.5'
      />
      <ellipse
        cx='40'
        cy='45'
        rx='20'
        ry='14'
        fill={CREAM}
        stroke={INK}
        strokeWidth='1.2'
      />
      <circle cx='35' cy='42' r='5' fill={SAGE} stroke={INK} strokeWidth='1' />
      <circle cx='45' cy='42' r='5' fill={CORAL} stroke={INK} strokeWidth='1' />
      <circle cx='40' cy='50' r='4' fill={PEPS} stroke={INK} strokeWidth='1' />
    </svg>
  ),
};

const TAG_VARIANTS = ['ns2-tag-sage', 'ns2-tag-coral', 'ns2-tag-peps'] as const;

interface SituationItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

export function IsThisForYouSection() {
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

  const situations: SituationItem[] = [
    {
      id: 1,
      title: 'Ménopause & péri-ménopause',
      description: 'Quand le corps change les règles du jeu sans prévenir.',
      icon: conditionIcons.menopause,
      category: 'Hormones',
    },
    {
      id: 2,
      title: 'Perte de poids durable',
      description: 'Vous avez tout essayé. Et rien ne tient dans la durée.',
      icon: conditionIcons.weightLoss,
      category: 'Poids',
    },
    {
      id: 3,
      title: 'Troubles digestifs',
      description: 'Quand le ventre prend trop de place dans vos journées.',
      icon: conditionIcons.digestive,
      category: 'Digestif',
    },
    {
      id: 4,
      title: 'Glycémie & diabète',
      description: 'Prédiabète, diabète de type 2, résistance à l’insuline.',
      icon: conditionIcons.diabetes,
      category: 'Métabolisme',
    },
    {
      id: 5,
      title: 'Santé cardiovasculaire',
      description: 'Cholestérol, hypertension, prévention.',
      icon: conditionIcons.cardiovascular,
      category: 'Cœur',
    },
    {
      id: 6,
      title: 'Fatigue & manque d’énergie',
      description: 'Épuisée dès le matin, même après une bonne nuit.',
      icon: conditionIcons.fatigue,
      category: 'Énergie',
    },
    {
      id: 7,
      title: 'Longévité & vieillissement',
      description: 'Vieillir, oui — mais en pleine forme.',
      icon: conditionIcons.longevity,
      category: 'Long terme',
    },
    {
      id: 8,
      title: 'Santé hormonale',
      description: 'SOPK, troubles thyroïdiens, déséquilibres hormonaux.',
      icon: conditionIcons.hormonal,
      category: 'Hormones',
    },
    {
      id: 9,
      title: 'Alimentation saine au quotidien',
      description: 'Bien manger, sans en faire un projet de vie.',
      icon: conditionIcons.healthyEating,
      category: 'Quotidien',
    },
  ];

  return (
    <section
      id='is-this-for-you'
      ref={ref}
      style={{
        background: 'var(--ns-cream-100)',
        paddingTop: 96,
        paddingBottom: 96,
      }}
    >
      <div className='ns2-container'>
        <motion.div
          style={{ marginBottom: 64, ...getHidden(20) }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          <div className='ns2-eyebrow ns2-eyebrow-dot'>Pour qui</div>
          <h2
            className='ns2-display'
            style={{
              fontSize: 'clamp(36px, 5vw, 60px)',
              marginTop: 18,
              maxWidth: 980,
              color: 'var(--ns-ink)',
            }}
          >
            Tout ce que{' '}
            <em>
              <span className='ns2-hl'>la vie pose</span>
            </em>{' '}
            dans
            <br />
            <span className='ns2-hl'>votre assiette</span>.
          </h2>
          <p className='ns2-body-lg' style={{ marginTop: 20, maxWidth: 780 }}>
            De l’alimentation du quotidien à la gestion de conditions
            chroniques. Toujours adaptés au monde réel — celui avec les enfants,
            le boulot et le frigo à moitié vide le jeudi soir.
          </p>
        </motion.div>

        <div className='situations-grid'>
          {situations.map((s, index) => (
            <motion.article
              key={s.id}
              className='ns2-card'
              style={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                ...getHidden(30),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={getTransition(0.05 + index * 0.06)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <span
                  className={`ns2-tag ${TAG_VARIANTS[index % TAG_VARIANTS.length]}`}
                >
                  {s.category}
                </span>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    background: 'var(--ns-cream-100)',
                    border: 'var(--ns-bw) solid var(--ns-ink)',
                    borderRadius: 'var(--ns-r-sm)',
                    padding: 8,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {s.icon}
                </div>
              </div>
              <h3
                className='ns2-display'
                style={{ fontSize: 22, color: 'var(--ns-ink)' }}
              >
                {s.title}
              </h3>
              <p className='ns2-body'>{s.description}</p>
            </motion.article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .situations-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .situations-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .situations-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
