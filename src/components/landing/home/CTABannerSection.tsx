'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section CTA Banner - Bande séparatrice violette
 *
 * Design basé sur culina-health-recreation.html :
 * - Background violet : #5e69bd
 * - Texte blanc centré
 * - Bouton blanc avec texte vert (#3f6655)
 * - Layout flex horizontal sur desktop, vertical sur mobile
 */
export function CTABannerSection() {
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
        padding: '2rem 0',
      }}
    >
      <div className='container mx-auto max-w-[1200px] px-6'>
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap',
            ...(isFirstVisit
              ? { opacity: 0, transform: 'translateY(20px)' }
              : {}),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
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
            Réservez une consultation avec une diététicienne diplômée
          </motion.span>

          {/* Bouton CTA */}
          <motion.a
            href='/contact?type=consultation'
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '35px',
              padding: '14px 32px',
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
              ...(isFirstVisit
                ? { opacity: 0, transform: 'translateX(20px)' }
                : {}),
            }}
            animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={getTransition(0.4)}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            Commencer →
          </motion.a>
        </motion.div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          section > div > div {
            flex-direction: column !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
