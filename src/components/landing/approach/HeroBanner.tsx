'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Interface pour les props du Hero Banner
 */
export interface HeroBannerProps {
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Hero Banner de la page L'Approche
 *
 * Un hero section full-width avec image de fond et texte centré.
 * Overlay sombre pour assurer la lisibilité du texte blanc.
 *
 * Design System NutriSensia (nouveau) :
 * - Police titres : Marcellus (serif)
 * - Police body : Plus Jakarta Sans (sans-serif)
 * - Texte blanc sur fond sombre pour contraste
 * - Bouton : border-radius 35px, padding 12px 24px
 *
 * @example
 * ```tsx
 * <HeroBanner />
 * ```
 */
export function HeroBanner({ className }: HeroBannerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Style initial : cacher seulement si première visite
  const getHiddenStyle = (yOffset: number, scale: number = 1) => {
    if (!isFirstVisit) {
      return {};
    }
    return {
      opacity: 0,
      transform: `translateY(${yOffset}px) scale(${scale})`,
    };
  };

  // Transition : animation seulement si première visite et en vue
  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.7, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  return (
    <section
      ref={ref}
      className={`hero-banner-section ${className || ''}`}
      style={{
        minHeight: '800px',
        backgroundColor: '#ffffff',
        padding: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
      }}
    >
      {/* IMAGE DE FOND PLEINE LARGEUR */}
      <div
        className='hero-background'
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          width: '100%',
          minHeight: '800px',
          backgroundImage:
            'url(https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&h=1080&fit=crop&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* LAYER VERT TRANSPARENT - 20% opacité (comme page d'accueil) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          width: '100%',
          minHeight: '800px',
          backgroundColor:
            'rgba(27, 153, 139, 0.08)' /* Turquoise Méditerranée - opacité légère */,
          zIndex: 1,
        }}
      />

      {/* WRAPPER CENTRÉ POUR TOUT LE CONTENU */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          minHeight: '800px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        {/* CARTE BLANCHE AVEC CONTENU - Style Guide Compliant */}
        <motion.div
          className='hero-card'
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            border: '1px solid #e5e5e5',
            borderRadius: '20px',
            padding: '48px',
            backdropFilter: 'blur(10px)',
            maxWidth: '750px',
            width: '100%',
            textAlign: 'center',
            ...getHiddenStyle(40, 0.95),
          }}
          animate={
            showContent
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 40, scale: 0.95 }
          }
          transition={getTransition(0)}
        >
          {/* TITRE H1 - Marcellus */}
          <motion.h1
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: '57.6px',
              color: '#1B998B' /* Turquoise Méditerranée */,
              textAlign: 'center',
              marginBottom: '20px',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.2)}
          >
            Notre Approche Nutritionnelle
          </motion.h1>

          {/* SOUS-TITRE avec underline accent - Plus Jakarta Sans */}
          <motion.p
            className='hero-subtitle'
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '24px',
              lineHeight: '1.3',
              color: '#1a1a1a' /* Noir */,
              borderBottom: '1px solid #E5DED6' /* Beige sand */,
              paddingBottom: '20px',
              marginBottom: '20px',
              display: 'inline-block',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.35)}
          >
            Une méthode qui vous ressemble
          </motion.p>

          {/* DESCRIPTION - Plus Jakarta Sans */}
          <motion.p
            className='hero-description'
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '16px',
              lineHeight: '28px',
              color: '#41556b',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.5)}
          >
            Fini les régimes restrictifs et les approches culpabilisantes. Notre
            approche nutritionnelle est scientifique, personnalisée et
            bienveillante. Ensemble, nous créerons des habitudes durables qui
            respectent votre corps, votre rythme et votre vie.
          </motion.p>
        </motion.div>

        {/* INDICATEUR DE SCROLL - EN BAS DE LA SECTION */}
        <motion.div
          className='scroll-indicator'
          style={{
            position: 'absolute',
            bottom: '40px',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            ...(isFirstVisit
              ? { opacity: 0, transform: 'translateY(-10px)' }
              : {}),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={getTransition(0.7)}
        >
          <span
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#1B998B' /* Turquoise Méditerranée */,
            }}
          >
            Découvrir notre approche
          </span>
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#1B998B'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            style={{
              animation: 'bounce 2s infinite',
            }}
          >
            <path d='M12 5v14M5 12l7 7 7-7' />
          </svg>
        </motion.div>
      </div>

      {/* ANIMATION BOUNCE */}
      <style jsx global>{`
        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(8px);
          }
          60% {
            transform: translateY(4px);
          }
        }
      `}</style>

      {/* RESPONSIVE STYLES */}
      <style jsx>{`
        /* Large Tablets (≤ 1024px) */
        @media (max-width: 1024px) {
          .hero-content h1 {
            font-size: 48px !important;
          }

          .hero-subtitle {
            font-size: 22px !important;
          }

          .hero-description {
            font-size: 16px !important;
          }
        }

        /* Mobile (≤ 768px) */
        @media (max-width: 768px) {
          .hero-banner-section {
            min-height: 700px !important;
          }

          .hero-content h1 {
            font-size: 36px !important;
            margin-bottom: 20px !important;
          }

          .hero-subtitle {
            font-size: 20px !important;
            margin-bottom: 16px !important;
          }

          .hero-description {
            font-size: 15px !important;
            margin-bottom: 28px !important;
          }

          .hero-btn {
            padding: 14px 28px !important;
            font-size: 15px !important;
          }
        }

        /* Small Mobile (≤ 480px) */
        @media (max-width: 480px) {
          .hero-content h1 {
            font-size: 28px !important;
          }

          .hero-subtitle {
            font-size: 18px !important;
          }

          .hero-description {
            font-size: 14px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default HeroBanner;
