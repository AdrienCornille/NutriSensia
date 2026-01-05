'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section "Pourquoi me faire confiance ?"
 *
 * Design inspiré de Culina Health selon le Style Guide NutriSensia :
 * - Layout split 50/50 : Image à gauche, contenu à droite
 * - Titre H2 en Marcellus (serif), 48px, #3f6655
 * - Liste à puces avec éléments en gras
 * - Bouton CTA pill-shaped (border-radius: 35px)
 * - Image avec coins arrondis 20px
 */
export function AboutMeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Transition : animation seulement si première visite et en vue
  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.7, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  return (
    <section
      id='about-me'
      ref={ref}
      className='relative bg-white'
      style={{ padding: '96px 0' }}
    >
      {/* Container principal - max-width 1200px */}
      <div className='container mx-auto max-w-[1200px] px-6'>
        {/* Layout Grid 2 colonnes */}
        <div
          className={cn('grid', 'grid-cols-1 lg:grid-cols-2', 'items-center')}
          style={{ gap: '96px' }}
        >
          {/* ============================================ */}
          {/* LEFT COLUMN - Image                          */}
          {/* ============================================ */}
          <motion.div
            className='relative'
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateX(-40px)' } : {}
            }
            animate={
              showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }
            }
            transition={getTransition(0)}
          >
            <div
              className='relative overflow-hidden min-h-[400px] lg:min-h-[500px]'
              style={{
                backgroundColor: '#F0F9F8' /* Turquoise pale */,
                borderRadius: '20px',
              }}
            >
              <img
                src='/images/lucie-cornille-profile.jpg'
                alt='Lucie Cornille - Nutritionniste ASCA/RME'
                onError={e => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop';
                }}
                className='w-full h-full object-cover min-h-[400px] lg:min-h-[500px]'
              />
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* RIGHT COLUMN - Content                       */}
          {/* ============================================ */}
          <motion.div
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateX(40px)' } : {}
            }
            animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={getTransition(0.2)}
          >
            {/* H2 Title - Marcellus serif */}
            <h2
              style={{
                fontFamily: "'Marcellus', serif",
                color: '#1B998B' /* Turquoise Méditerranée */,
                fontSize: '48px',
                lineHeight: '57.6px',
                textAlign: 'left',
                marginBottom: '24px',
                fontWeight: 700,
              }}
            >
              Pourquoi une nutritionniste, pas une IA ?
            </h2>

            {/* Subtitle - Greeting */}
            <p
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: '#2D3748',
                textAlign: 'left',
                marginBottom: '24px',
                fontWeight: 600,
                fontSize: '18px',
              }}
            >
              Moi, c'est Lucie
            </p>

            {/* Story Paragraphs */}
            <div style={{ marginBottom: '24px' }}>
              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  color: '#41556b',
                  fontSize: '16px',
                  lineHeight: '24px',
                  textAlign: 'left',
                  marginBottom: '16px',
                }}
              >
                Oui, une IA peut vous générer un plan alimentaire en quelques
                secondes. Mais elle ne vous demandera jamais comment s'est
                passée votre semaine, ne percevra pas votre fatigue, ne
                réajustera pas votre programme quand la vie bouleverse vos
                routines.
              </p>
              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  color: '#41556b',
                  fontSize: '16px',
                  lineHeight: '24px',
                  textAlign: 'left',
                  marginBottom: '24px',
                }}
              >
                C'est justement pour ça que j'ai créé NutriSensia. Après 3 ans
                d'études en nutrition, j'en avais assez de voir des personnes se
                battre contre leur corps avec des régimes standardisés qui ne
                tiennent jamais leurs promesses.
              </p>

              {/* Ce que nous vous offrons - Liste */}
              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  color: '#2D3748',
                  fontSize: '16px',
                  lineHeight: '24px',
                  textAlign: 'left',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                Ce que nous vous offrons :
              </p>
              <ul
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  color: '#41556b',
                  fontSize: '16px',
                  lineHeight: '28px',
                  textAlign: 'left',
                  paddingLeft: '20px',
                  marginBottom: '24px',
                  listStyleType: 'disc',
                }}
              >
                <li>
                  Un accompagnement qui évolue avec vous, pas un programme figé
                </li>
                <li>
                  Une écoute pour comprendre votre relation à l'alimentation
                </li>
                <li>Des ajustements en temps réel selon vos ressentis</li>
                <li>Un soutien humain dans les moments de doute</li>
              </ul>

              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  color: '#41556b',
                  fontSize: '16px',
                  lineHeight: '24px',
                  textAlign: 'left',
                  fontStyle: 'italic',
                }}
              >
                Parce que{' '}
                <strong style={{ color: '#2D3748', fontStyle: 'normal' }}>
                  chaque corps est unique
                </strong>
                , et qu'un changement durable ne se fait pas seul·e devant un
                écran.
              </p>
            </div>

            {/* CTA Button - Style guide: pill-shaped, #3f6655 */}
            <motion.div
              style={
                isFirstVisit
                  ? { opacity: 0, transform: 'translateY(20px)' }
                  : {}
              }
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.9)}
            >
              <a
                href='/a-propos'
                style={{
                  background:
                    'linear-gradient(135deg, #1B998B 0%, #147569 100%)' /* Dégradé CTA */,
                  borderRadius: '35px',
                  lineHeight: '16px',
                  color: '#fff',
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
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #147569 0%, #0f5a50 100%)'; /* Dégradé hover */
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
                }}
              >
                Découvrir notre histoire complète →
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
