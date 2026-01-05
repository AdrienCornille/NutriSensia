'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useFirstVisit } from '@/hooks/useFirstVisit';

interface Pillar {
  image: string;
  title: string;
  tagline: string;
  description: string;
}

export interface PrinciplesSectionProps {
  className?: string;
}

export function PrinciplesSection({ className }: PrinciplesSectionProps) {
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

  const pillars: Pillar[] = [
    {
      image:
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&q=80',
      title: 'Écouter avant\nde conseiller',
      tagline: "Vous n'êtes pas un cas, vous êtes une personne",
      description:
        "Avant tout plan alimentaire, nous prenons le temps de vraiment vous écouter. Votre histoire, vos goûts, votre quotidien, vos blocages. Comprendre qui vous êtes, c'est la base d'un accompagnement qui vous ressemble. Parce qu'une approche qui fonctionne ne sort jamais d'un livre, elle naît d'une rencontre entre votre réalité et notre expertise.",
    },
    {
      image:
        'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop&q=80',
      title: 'Comprendre et\nressentir',
      tagline: 'Le meilleur des deux mondes',
      description:
        "Les chiffres d'un bilan, c'est important. Mais ce que vous ressentez au quotidien l'est tout autant. Nous ne nous contentons pas d'analyser vos résultats : nous écoutons aussi les signaux de votre corps. Votre fatigue, votre digestion, votre énergie. Les vraies transformations naissent quand science et ressenti travaillent ensemble, pas quand on suit aveuglément des données sur un papier.",
    },
    {
      image:
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80',
      title: 'Entre ambition\net réalisme',
      tagline: 'Ce que votre corps peut vraiment atteindre',
      description:
        'Des objectifs ambitieux ? Oui. Des promesses irréalistes ? Non. Notre rôle ? Vous accompagner vers la meilleure version de vous-même, celle que VOTRE corps peut atteindre. Ensemble, nous définissons des objectifs motivants ET réalistes, en tenant compte de votre physiologie, votre mode de vie, votre santé.',
    },
  ];

  return (
    <section
      ref={ref}
      className={className}
      style={{
        backgroundColor: '#FBF9F7' /* Crème Méditerranée */,
        padding: '96px 0',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {/* Header de section */}
        <motion.div
          style={{
            textAlign: 'center',
            marginBottom: '64px',
            ...getHiddenStyle(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          {/* Titre principal */}
          <h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: '57.6px',
              color: '#1B998B' /* Turquoise Méditerranée */,
              marginBottom: '24px',
            }}
          >
            Les 3 Piliers de Notre Approche
          </h2>

          {/* Sous-titre */}
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '18px',
              lineHeight: '28px',
              color: '#41556b',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            Voici les trois principes qui guident chaque accompagnement. Ce sont
            nos convictions profondes, forgées par notre expérience
            professionnelle et notre parcours.
          </p>
        </motion.div>

        {/* Grille de 3 cartes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}
          className='principles-grid'
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '8px 8px 0 #E5DED6' /* Beige sand */,
                ...getHiddenStyle(40),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
              }
              transition={getTransition(0.1 + index * 0.15)}
            >
              {/* Image */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '220px',
                }}
              >
                <Image
                  src={pillar.image}
                  alt={pillar.title.replace('\n', ' ')}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />
              </div>

              {/* Contenu de la carte */}
              <div style={{ padding: '32px' }}>
                {/* Titre de la carte */}
                <h3
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '24px',
                    fontWeight: 700,
                    lineHeight: '1.3',
                    color: '#1B998B' /* Turquoise Méditerranée */,
                    marginBottom: '12px',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {pillar.title}
                </h3>

                {/* Tagline avec underline */}
                <p
                  style={{
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '1.4',
                    color: '#1B998B' /* Turquoise Méditerranée */,
                    borderBottom: '1px solid #E5DED6' /* Beige sand */,
                    paddingBottom: '12px',
                    marginBottom: '16px',
                  }}
                >
                  {pillar.tagline}
                </p>

                {/* Description */}
                <p
                  style={{
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '16px',
                    lineHeight: '26px',
                    color: '#41556b',
                  }}
                >
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .principles-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .principles-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default PrinciplesSection;
