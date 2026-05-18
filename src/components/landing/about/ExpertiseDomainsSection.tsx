'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Domaines d'Expertise (DS v2 Editorial)
 *
 * 9 cartes ns2-card en grille 3×3, hover lift,
 * tags variés selon nature du domaine.
 */

interface SituationItem {
  id: number;
  title: string;
  description: string;
  tag: string;
  tagVariant: 'peps' | 'sage' | 'coral' | 'dark';
}

export function ExpertiseDomainsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  const getHidden = (yOffset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${yOffset}px)` };

  const getTransition = (delay: number) =>
    shouldAnimate
      ? { duration: 0.5, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  const situations: SituationItem[] = [
    {
      id: 1,
      title: 'Ménopause & péri-ménopause',
      description: 'Quand le corps change les règles du jeu sans prévenir.',
      tag: 'Hormones',
      tagVariant: 'coral',
    },
    {
      id: 2,
      title: 'Perte de poids durable',
      description: 'Vous avez tout essayé. Et rien ne tient dans la durée.',
      tag: 'Poids',
      tagVariant: 'peps',
    },
    {
      id: 3,
      title: 'Troubles digestifs',
      description: 'Quand le ventre prend trop de place dans vos journées.',
      tag: 'Digestif',
      tagVariant: 'sage',
    },
    {
      id: 4,
      title: 'Glycémie & diabète',
      description: "Prédiabète, diabète de type 2, résistance à l'insuline.",
      tag: 'Métabolisme',
      tagVariant: 'dark',
    },
    {
      id: 5,
      title: 'Santé cardiovasculaire',
      description: 'Cholestérol, hypertension, prévention.',
      tag: 'Cœur',
      tagVariant: 'sage',
    },
    {
      id: 6,
      title: "Fatigue & manque d'énergie",
      description: 'Épuisée dès le matin, même après une bonne nuit.',
      tag: 'Énergie',
      tagVariant: 'peps',
    },
    {
      id: 7,
      title: 'Longévité & vieillissement',
      description: 'Vieillir, oui — mais en pleine forme.',
      tag: 'Long terme',
      tagVariant: 'dark',
    },
    {
      id: 8,
      title: 'Santé hormonale',
      description: 'SOPK, troubles thyroïdiens, déséquilibres hormonaux.',
      tag: 'Hormones',
      tagVariant: 'coral',
    },
    {
      id: 9,
      title: 'Alimentation saine au quotidien',
      description: 'Bien manger, sans en faire un projet de vie.',
      tag: 'Quotidien',
      tagVariant: 'peps',
    },
  ];

  return (
    <section
      id='expertise-domains'
      ref={ref}
      style={{
        background: 'var(--ns-cream-100)',
        padding: '112px 0',
      }}
    >
      <div className='ns2-container'>
        <div
          style={{
            textAlign: 'center',
            marginBottom: 56,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <motion.div
            className='ns2-eyebrow ns2-eyebrow-dot'
            style={{ marginBottom: 16, ...getHidden(20) }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0)}
          >
            Nos domaines d&apos;expertise
          </motion.div>
          <motion.h2
            className='ns2-display'
            style={{
              fontSize: 'clamp(36px, 5vw, 60px)',
              marginBottom: 18,
              maxWidth: 880,
              ...getHidden(30),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={getTransition(0.05)}
          >
            Des accompagnements <em>personnalisés</em>
            <br />
            pour vos <span className='ns2-hl'>besoins</span>.
          </motion.h2>
          <motion.p
            className='ns2-body-lg'
            style={{ maxWidth: 640, ...getHidden(20) }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.1)}
          >
            Quel que soit le point de départ, on construit un chemin qui vous
            ressemble — et qui tient.
          </motion.p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
          className='domains-grid'
        >
          {situations.map((situation, index) => (
            <motion.article
              key={situation.id}
              className='ns2-card'
              style={{
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                ...getHidden(30),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={getTransition(0.15 + index * 0.05)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--ns-font-serif-stack)',
                    fontSize: 22,
                    fontStyle: 'italic',
                    color: 'var(--ns-ink-3)',
                  }}
                >
                  {String(situation.id).padStart(2, '0')}
                </span>
                <span className={`ns2-tag ns2-tag-${situation.tagVariant}`}>
                  {situation.tag}
                </span>
              </div>
              <h3
                className='ns2-display'
                style={{ fontSize: 22, lineHeight: 1.2, margin: 0 }}
              >
                {situation.title}
              </h3>
              <p
                className='ns2-body'
                style={{
                  margin: 0,
                  lineHeight: 1.6,
                  borderTop: '1.5px solid var(--ns-ink)',
                  paddingTop: 14,
                }}
              >
                {situation.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .domains-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .domains-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default ExpertiseDomainsSection;
