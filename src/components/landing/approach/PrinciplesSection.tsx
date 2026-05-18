'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Les 3 piliers — page Approche, DS v2.
 * Cream-200 section with 3 .ns2-card editorial cards (image top + content
 * bottom). Each card carries a number, a colored tag, italic tagline, body
 * description. Hover lift signature.
 */

interface Pillar {
  number: string;
  tagVariant: 'sage' | 'coral' | 'peps';
  tag: string;
  image: string;
  title: string;
  tagline: string;
  description: string;
}

export interface PrinciplesSectionProps {
  className?: string;
}

const PILLARS: Pillar[] = [
  {
    number: '01',
    tagVariant: 'sage',
    tag: 'Écoute',
    image:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&q=80',
    title: 'Écouter avant de conseiller',
    tagline: "Vous n'êtes pas un cas, vous êtes une personne.",
    description:
      "Avant tout plan, on écoute. Vraiment. Votre histoire, vos goûts, votre quotidien, ce qui coince. Parce qu'un accompagnement qui ne part pas de vous ne vous emmène nulle part.",
  },
  {
    number: '02',
    tagVariant: 'coral',
    tag: 'Bilan',
    image:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop&q=80',
    title: 'Comprendre et ressentir',
    tagline: 'La science écoute le corps.',
    description:
      "Les chiffres d'un bilan racontent une partie de l'histoire. Votre ressenti raconte l'autre. Les vraies transformations naissent quand on lit les deux.",
  },
  {
    number: '03',
    tagVariant: 'peps',
    tag: 'Objectifs',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80',
    title: 'Entre ambition et réalisme',
    tagline: "Ambitieux. Réaliste. Pas l'un sans l'autre.",
    description:
      "Des objectifs ambitieux, oui. Des promesses miraculeuses, non. On vous accompagne vers la meilleure version possible — la vôtre, pas celle d'Instagram.",
  },
];

export function PrinciplesSection({ className }: PrinciplesSectionProps) {
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
      ref={ref}
      className={className}
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
          <div className='ns2-eyebrow ns2-eyebrow-dot'>Les 3 piliers</div>
          <h2
            className='ns2-display'
            style={{
              fontSize: 'clamp(32px, 4.4vw, 56px)',
              marginTop: 18,
              color: 'var(--ns-ink)',
            }}
          >
            Trois <em>convictions</em> <span className='ns2-hl'>profondes</span>
            ,
            <br />
            forgées par l&apos;expérience.
          </h2>
          <p className='ns2-body-lg' style={{ marginTop: 20, maxWidth: 780 }}>
            Voici les principes qui guident chaque accompagnement. Pas des
            slogans — des choix qu&apos;on tient, séance après séance.
          </p>
        </motion.div>

        {/* Cards */}
        <div className='principles-grid'>
          {PILLARS.map((p, index) => (
            <motion.article
              key={p.number}
              className='ns2-card'
              style={{
                display: 'flex',
                flexDirection: 'column',
                ...getHidden(40),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
              }
              transition={getTransition(0.15 + index * 0.12)}
            >
              {/* Image */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '4 / 3',
                  borderBottom: 'var(--ns-bw) solid var(--ns-ink)',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />
              </div>

              {/* Body */}
              <div
                style={{
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span className={`ns2-tag ns2-tag-${p.tagVariant}`}>
                    {p.tag}
                  </span>
                  <span
                    className='ns2-display'
                    style={{
                      fontStyle: 'italic',
                      fontSize: 32,
                      color: 'var(--ns-ink-3)',
                      lineHeight: 1,
                    }}
                  >
                    {p.number}
                  </span>
                </div>

                <h3
                  className='ns2-display'
                  style={{
                    fontSize: 24,
                    color: 'var(--ns-ink)',
                    lineHeight: 1.1,
                  }}
                >
                  {p.title}
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--ns-font-serif-stack)',
                    fontStyle: 'italic',
                    fontSize: 16,
                    color: 'var(--ns-ink)',
                    lineHeight: 1.4,
                  }}
                >
                  {p.tagline}
                </p>

                <p className='ns2-body' style={{ marginTop: 'auto' }}>
                  {p.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .principles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .principles-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </section>
  );
}

export default PrinciplesSection;
