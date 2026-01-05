'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section CTA Finale pour la page Plateforme - Bande Terracotta
 *
 * Design Méditerranée basé sur CTABannerSection :
 * - Background Terracotta : #E76F51
 * - Texte blanc centré
 * - 2 boutons : Essai gratuit (blanc) + Commencer (outline)
 */
export function PlatformFinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Transition : animation seulement si première visite et en vue
  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#E76F51' /* Terracotta Méditerranée */,
        padding: '3rem 0',
      }}
    >
      <div className='container mx-auto max-w-[1200px] px-6'>
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            ...(isFirstVisit
              ? { opacity: 0, transform: 'translateY(20px)' }
              : {}),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
          className='cta-container'
        >
          {/* Texte */}
          <motion.span
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              color: '#ffffff',
              textAlign: 'center',
              ...(isFirstVisit
                ? { opacity: 0, transform: 'translateX(-20px)' }
                : {}),
            }}
            animate={
              showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
            }
            transition={getTransition(0.2)}
          >
            Prêt à transformer votre alimentation ?
          </motion.span>

          {/* Boutons CTA */}
          <motion.div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              ...(isFirstVisit
                ? { opacity: 0, transform: 'translateX(20px)' }
                : {}),
            }}
            animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={getTransition(0.4)}
          >
            {/* Bouton Essai Gratuit - Blanc */}
            <a
              href='/essai-gratuit'
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '35px',
                padding: '14px 28px',
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#147569' /* Turquoise foncé */,
                textDecoration: 'none',
                textAlign: 'center',
                lineHeight: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Essai gratuit →
            </a>

            {/* Bouton Commencer - Outline */}
            <a
              href='/contact?type=consultation'
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #ffffff',
                borderRadius: '35px',
                padding: '12px 28px',
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#ffffff',
                textDecoration: 'none',
                textAlign: 'center',
                lineHeight: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#E76F51'; /* Terracotta */
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Commencer l'expérience
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .cta-container {
            flex-direction: column !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
