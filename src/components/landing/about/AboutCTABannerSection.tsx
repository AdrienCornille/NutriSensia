'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section CTA Banner pour la page About - Bande Terracotta Méditerranée
 *
 * Design Méditerranée :
 * - Background Terracotta : #E76F51
 * - Texte blanc centré
 * - Bouton blanc avec texte turquoise foncé (#147569)
 * - Layout flex horizontal sur desktop, vertical sur mobile
 */
export function AboutCTABannerSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Transition conditionnelle
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
            Prêt·e à faire le premier pas vers une meilleure santé ?
          </motion.span>

          {/* Bouton CTA */}
          <motion.a
            href='/contact'
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
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              ...(isFirstVisit
                ? { opacity: 0, transform: 'translateX(20px)' }
                : {}),
            }}
            animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={getTransition(0.4)}
            whileHover={{ backgroundColor: '#f0f0f0' }}
          >
            Premier pas →
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
