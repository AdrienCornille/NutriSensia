'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Pourquoi Choisir NutriSensia
 *
 * Design inspiré de la section Award-Winning Care :
 * - Fond vert foncé (#3f6655)
 * - Cercles décoratifs en arrière-plan
 * - Grille 2 colonnes x 3 lignes avec icônes personnalisées
 * - Bouton CTA en bas
 */

// Icônes personnalisées pour chaque raison
const icons = {
  // Diplôme/formation
  diploma: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 3L2 9l10 6 10-6-10-6z'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinejoin='round'
      />
      <path
        d='M20 9v7'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M6 12v5c0 2 3 3 6 3s6-1 6-3v-5'
        stroke='#1B998B'
        strokeWidth='1.5'
      />
      <circle cx='20' cy='17' r='2' fill='#1B998B' />
    </svg>
  ),
  // Science/recherche
  science: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M9 3v6l-5 8c-.7 1.1.2 2.5 1.5 2.5h13c1.3 0 2.2-1.4 1.5-2.5l-5-8V3'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 3h6'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <circle cx='10' cy='14' r='1.5' fill='#1B998B' />
      <circle cx='14' cy='16' r='1' fill='#1B998B' />
    </svg>
  ),
  // Assurance/bouclier
  insurance: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 3L4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7l-8-4z'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinejoin='round'
      />
      <path
        d='M9 12l2 2 4-4'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  // En ligne/vidéo
  online: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect
        x='2'
        y='4'
        width='20'
        height='14'
        rx='2'
        stroke='#1B998B'
        strokeWidth='1.5'
      />
      <path
        d='M8 21h8'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M12 18v3'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <circle cx='12' cy='11' r='3' stroke='#1B998B' strokeWidth='1.5' />
    </svg>
  ),
  // Coeur/bienveillance
  heart: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 21C12 21 4 15 4 9.5C4 6.5 6.5 4 9.5 4C11 4 12 5 12 5C12 5 13 4 14.5 4C17.5 4 20 6.5 20 9.5C20 15 12 21 12 21Z'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinejoin='round'
      />
      <path
        d='M12 8v5'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M9.5 10.5h5'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  ),
  // Balance/équilibre (sans jugement)
  balance: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 3v18'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M5 7l7-2 7 2'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M3 14c0 1.5 1 3 2 3h2c1 0 2-1.5 2-3l-3-5-3 5z'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinejoin='round'
      />
      <path
        d='M15 14c0 1.5 1 3 2 3h2c1 0 2-1.5 2-3l-3-5-3 5z'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinejoin='round'
      />
    </svg>
  ),
  // Graphique/résultats
  results: (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M3 20h18'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M5 20v-8'
        stroke='#1B998B'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <path
        d='M9 20v-12'
        stroke='#1B998B'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <path
        d='M13 20v-6'
        stroke='#1B998B'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <path
        d='M17 20v-10'
        stroke='#1B998B'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <path
        d='M4 9l4-4 4 2 5-4'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle cx='17' cy='3' r='2' fill='#1B998B' />
    </svg>
  ),
};

export function WhyChooseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Helpers pour les animations conditionnelles
  const getHiddenStyle = (yOffset: number) => {
    if (!isFirstVisit) return {};
    return { opacity: 0, transform: `translateY(${yOffset}px)` };
  };

  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.5, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  const reasons = [
    { text: 'Nutritionniste formée et expérimentée', icon: icons.diploma },
    {
      text: 'Approche fondée sur les connaissances actuelles en nutrition',
      icon: icons.science,
    },
    {
      text: 'Remboursement possible par les assurances complémentaires',
      icon: icons.insurance,
    },
    {
      text: 'Consultations en ligne flexibles et pratiques',
      icon: icons.online,
    },
    { text: 'Suivi personnalisé et bienveillant', icon: icons.heart },
    { text: 'Résultats durables et mesurables', icon: icons.results },
  ];

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#1B998B' /* Turquoise Azur - Méditerranée */,
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Cercles décoratifs en arrière-plan */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Cercles à droite */}
        <div
          style={{
            position: 'absolute',
            right: '-50px',
            top: '10%',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            backgroundColor: 'rgba(27, 153, 139, 0.3)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '80px',
            top: '25%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'rgba(27, 153, 139, 0.25)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '20px',
            bottom: '20%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: 'rgba(27, 153, 139, 0.2)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '150px',
            bottom: '10%',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(27, 153, 139, 0.35)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '250px',
            top: '15%',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(27, 153, 139, 0.2)',
          }}
        />
        {/* Cercles à gauche (plus subtils) */}
        <div
          style={{
            position: 'absolute',
            left: '-30px',
            top: '40%',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: 'rgba(27, 153, 139, 0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50px',
            bottom: '15%',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: 'rgba(27, 153, 139, 0.2)',
          }}
        />
      </div>

      {/* Contenu */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Titre */}
        <motion.h2
          style={{
            color: '#ffffff',
            fontFamily: "'Marcellus', serif",
            fontSize: '48px',
            lineHeight: '57.6px',
            textAlign: 'center',
            marginBottom: '16px',
            fontWeight: 700,
            ...getHiddenStyle(30),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
        >
          Pourquoi Choisir NutriSensia ?
        </motion.h2>

        {/* Sous-titre */}
        <motion.p
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily:
              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '20px',
            lineHeight: '28px',
            textAlign: 'center',
            marginBottom: '48px',
            ...getHiddenStyle(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.1)}
        >
          L'excellence nutritionnelle à portée de clic
        </motion.p>

        {/* Grille des raisons - 2 colonnes x 4 lignes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
          className='why-choose-grid'
        >
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              style={{
                backgroundColor: '#FBF9F7' /* Warm Cream */,
                borderRadius: '10px',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                // Centrer le dernier élément s'il est seul sur sa ligne
                ...(index === reasons.length - 1 && reasons.length % 2 !== 0
                  ? {
                      gridColumn: '1 / -1',
                      maxWidth: '480px',
                      margin: '0 auto',
                    }
                  : {}),
                ...getHiddenStyle(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.2 + index * 0.08)}
            >
              {/* Icône */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  minWidth: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {reason.icon}
              </div>

              {/* Texte */}
              <p
                style={{
                  color: '#41556b',
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '18px',
                  lineHeight: '26px',
                  margin: 0,
                  flex: 1,
                  fontWeight: 500,
                }}
              >
                {reason.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Styles responsive */}
        <style jsx>{`
          @media (max-width: 768px) {
            .why-choose-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        {/* Bouton CTA */}
        <motion.div
          style={{
            textAlign: 'center',
            marginTop: '48px',
            ...getHiddenStyle(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.8)}
        >
          <Link
            href='/contact'
            style={{
              display: 'inline-block',
              backgroundColor: '#ffffff',
              color: '#147569' /* Turquoise foncé */,
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: '25.2px',
              padding: '16px 40px',
              borderRadius: '35px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            Prendre rendez-vous →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default WhyChooseSection;
