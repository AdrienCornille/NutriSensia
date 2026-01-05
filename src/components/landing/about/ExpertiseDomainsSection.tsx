'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Domaines d'Expertise - Les troubles accompagnés (Page À propos)
 *
 * Variation distinctive de la IsThisForYouSection pour créer une rupture visuelle.
 * Design alternatif dans le Style Guide NutriSensia:
 * - Cartes sans icônes, texte uniquement
 * - Fond #d7e1ce (même vert que la section ValuesSection)
 * - Sans shadow signature, subtle shadow card
 * - Bordure adoucie #b6ccae
 * - Border-radius 16px (style blog cards)
 * - Polices plus grandes pour lisibilité
 */

interface SituationItem {
  id: number;
  title: string;
  description: string;
}

export function ExpertiseDomainsSection() {
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

  const situations: SituationItem[] = [
    {
      id: 1,
      title: 'Ménopause et péri-ménopause',
      description: 'Bouffées de chaleur, prise de poids, fatigue chronique.',
    },
    {
      id: 2,
      title: 'Perte de poids durable',
      description:
        'Vous avez tout essayé, mais rien ne tient sur le long terme.',
    },
    {
      id: 3,
      title: 'Troubles digestifs',
      description:
        "Ballonnements, inconforts, syndrome de l'intestin irritable.",
    },
    {
      id: 4,
      title: 'Glycémie et diabète',
      description: "Prédiabète, diabète de type 2, résistance à l'insuline.",
    },
    {
      id: 5,
      title: 'Santé cardiovasculaire',
      description:
        'Cholestérol, hypertension, prévention des maladies cardiaques.',
    },
    {
      id: 6,
      title: "Fatigue et manque d'énergie",
      description: 'Vous êtes épuisée dès le matin, même après une bonne nuit.',
    },
    {
      id: 7,
      title: 'Longévité et vieillissement',
      description: 'Préserver votre santé et votre vitalité à long terme.',
    },
    {
      id: 8,
      title: 'Santé hormonale',
      description: 'SOPK, troubles thyroïdiens, déséquilibres hormonaux.',
    },
    {
      id: 9,
      title: 'Alimentation saine générale',
      description:
        'Apprendre à bien manger au quotidien, sans régime restrictif.',
    },
  ];

  return (
    <section
      id='expertise-domains'
      ref={ref}
      style={{
        backgroundColor: '#FBF9F7' /* Warm Cream - Méditerranée */,
        padding: '80px 0',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
      }}
    >
      {/* Container */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {/* ============================================ */}
        {/* HEADER - Marcellus Serif Title               */}
        {/* ============================================ */}
        <motion.h2
          style={{
            color: '#1B998B' /* Turquoise Azur */,
            fontFamily: "'Marcellus', serif",
            fontSize: '48px',
            lineHeight: '57.6px',
            textAlign: 'center',
            marginBottom: '24px',
            fontWeight: 700,
            ...getHiddenStyle(30),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
        >
          Nos Domaines d'Expertise
        </motion.h2>

        <motion.p
          style={{
            color: '#41556b',
            fontFamily:
              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '18px',
            lineHeight: '28px',
            textAlign: 'center',
            maxWidth: '1000px',
            margin: '0 auto 48px',
            ...getHiddenStyle(30),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0.15)}
        >
          Des accompagnements personnalisés pour vos besoins
        </motion.p>

        {/* ============================================ */}
        {/* CARDS GRID - 3 colonnes, layout horizontal   */}
        {/* Design alternatif pour la page À propos      */}
        {/* ============================================ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginTop: '48px',
          }}
          className='conditions-grid-responsive'
        >
          {situations.map((situation, index) => (
            <motion.div
              key={situation.id}
              style={{
                backgroundColor:
                  'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                padding: '24px 28px',
                transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
                boxShadow: '8px 8px 0 #E5DED6' /* Beige Sand */,
                cursor: 'pointer',
                ...getHiddenStyle(30),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={getTransition(0.2 + index * 0.08)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '10px 10px 0 #E5DED6';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '8px 8px 0 #E5DED6';
              }}
            >
              {/* Title */}
              <h3
                style={{
                  color: '#1B998B' /* Turquoise Azur */,
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '18px',
                  lineHeight: '24px',
                  textAlign: 'center',
                  margin: '0 0 8px 0',
                  fontWeight: 700,
                }}
              >
                {situation.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  color: '#41556b',
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '15px',
                  lineHeight: '22px',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                {situation.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* RESPONSIVE STYLES                            */}
      {/* ============================================ */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .conditions-grid-responsive {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .conditions-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default ExpertiseDomainsSection;
