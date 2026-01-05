'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Hero NutriSensia - Style Guide Compliant
 *
 * Design conforme au NutriSensia Style Guide :
 * - Image de fond avec overlay subtil
 * - Carte blanche avec shadow signature (8px 8px 0 #d7e1ce)
 * - Typographie : Marcellus (serif) pour titres + Plus Jakarta Sans pour body
 * - Underline accent sur le sous-titre
 * - Bordure verte sur la carte
 * - Positionnement à gauche
 * - Responsive breakpoints
 */
export function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { isFirstVisit } = useFirstVisit();

  // Détermine si on doit afficher l'animation
  // - Première visite ET en vue = animer
  // - Pas première visite = toujours visible sans animation
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Style initial : cacher seulement si première visite ET pas encore en vue
  const getHiddenStyle = (yOffset: number, scale: number = 1) => {
    if (!isFirstVisit) {
      // Pas première visite : toujours visible
      return {};
    }
    // Première visite : cacher pour l'animation (sera révélé quand isInView devient true)
    return {
      opacity: 0,
      transform: `translateY(${yOffset}px) scale(${scale})`,
    };
  };

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
      id='hero'
      className='hero-section'
      style={{
        minHeight: '800px',
        backgroundColor: '#ffffff',
        padding: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'stretch',
        position: 'relative',
        overflow: 'hidden',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
      }}
    >
      {/* ============================================ */}
      {/* IMAGE DE FOND PLEINE LARGEUR                 */}
      {/* ============================================ */}
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
            'url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&h=1080&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* LAYER VERT TRANSPARENT - 20% opacité */}
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

      {/* CONTENU CENTRÉ */}
      <div
        className='hero-content'
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          width: '100%',
          maxWidth: '900px' /* 3/4 de la largeur du header (1200px) */,
          padding: '0 24px',
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
            ...getHiddenStyle(40, 0.95),
          }}
          animate={
            showContent
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 40, scale: 0.95 }
          }
          transition={getTransition(0)}
        >
          {/* TITRE H2 - Marcellus 42px avec font-weight augmenté */}
          <motion.h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '42px',
              fontWeight: 700,
              lineHeight: '54.6px',
              color: '#1B998B' /* Turquoise Méditerranée */,
              textAlign: 'center',
              marginBottom: '20px',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.2)}
          >
            Et si manger redevenait un simple plaisir ?
          </motion.h2>

          {/* SOUS-TITRE avec underline accent - Style Guide */}
          <motion.p
            className='hero-subtitle'
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '24px',
              lineHeight: '32px',
              color: '#1a1a1a' /* Noir */,
              borderBottom: '1px solid #E5DED6' /* Sable Beige */,
              paddingBottom: '20px',
              marginBottom: '20px',
              display: 'block',
              textAlign: 'center',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.35)}
          >
            Un accompagnement nutritionnel bienveillant, adapté à votre vie.
            Sans régime. Sans culpabilité.
          </motion.p>

          {/* TESTIMONIAL - Style Guide Pattern */}
          <motion.p
            className='hero-testimonial'
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '14px',
              lineHeight: '28px',
              color: '#41556b',
              marginBottom: '24px',
              textAlign: 'center',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.5)}
          >
            "Ma diététicienne écoute, conseille et m'encourage à poursuivre mon
            parcours santé. Je recommande vivement NutriSensia pour des
            changements de mode de vie durables." - Michèle C.
          </motion.p>

          {/* BOUTON CTA - Style Guide */}
          <motion.div
            style={{
              textAlign: 'center',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.65)}
          >
            <button
              className='hero-btn'
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: '35px',
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '25.2px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                background:
                  'linear-gradient(135deg, #1B998B 0%, #147569 100%)' /* Dégradé CTA */,
                color: '#FDFCFB' /* Crème chaud */,
                textDecoration: 'none',
              }}
              onClick={() => {
                window.location.href = '/contact?type=consultation';
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #147569 0%, #0f5a50 100%)'; /* Dégradé hover */
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #1B998B 0%, #147569 100%)'; /* Dégradé CTA */
              }}
            >
              Commencer →
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* RESPONSIVE STYLES                            */}
      {/* ============================================ */}
      <style jsx>{`
        /* Large Tablets (≤ 1024px) */
        @media (max-width: 1024px) {
          .hero-card h2 {
            font-size: 36px !important;
            line-height: 48px !important;
          }

          .hero-subtitle {
            font-size: 20px !important;
            line-height: 28px !important;
          }
        }

        /* Mobile (≤ 768px) */
        @media (max-width: 768px) {
          .hero-section {
            min-height: 828px !important;
          }

          .hero-content {
            position: static !important;
            transform: none !important;
            width: 90% !important;
            max-width: none !important;
            margin: 0 auto !important;
            padding: 40px 20px !important;
            display: flex !important;
            align-items: center !important;
            min-height: 720px !important;
            left: auto !important;
          }

          .hero-card {
            padding: 32px 24px !important;
          }

          .hero-card h2 {
            font-size: 28px !important;
            line-height: 36px !important;
            margin-bottom: 16px !important;
          }

          .hero-subtitle {
            font-size: 18px !important;
            line-height: 22px !important;
            margin-bottom: 8px !important;
          }

          .hero-testimonial {
            font-size: 13px !important;
            line-height: 24px !important;
            margin-bottom: 20px !important;
          }

          .hero-btn {
            width: 100% !important;
            padding: 14px 24px !important;
          }
        }

        /* Small Mobile (≤ 480px) */
        @media (max-width: 480px) {
          .hero-card {
            padding: 24px 20px !important;
          }

          .hero-card h2 {
            font-size: 24px !important;
            line-height: 32px !important;
          }

          .hero-subtitle {
            font-size: 16px !important;
            line-height: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
