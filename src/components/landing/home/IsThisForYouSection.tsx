'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section "Est-ce pour vous ?" - Design Culina Health "Conditions We Treat"
 *
 * Grid de cartes inspirée de Culina Health avec:
 * - Background crème (#f8f7ef)
 * - Cartes avec border verte, shadow signature
 * - Layout grid 3 colonnes
 * - Hover effects élégants
 * - Icônes SVG personnalisées pour chaque condition
 */

interface SituationItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Icônes SVG personnalisées selon le Style Guide NutriSensia
const conditionIcons = {
  menopause: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-16 h-16'
    >
      {/* Symbole féminin stylisé avec flamme */}
      <circle
        cx='40'
        cy='32'
        r='16'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      <line x1='40' y1='48' x2='40' y2='65' stroke='#1B998B' strokeWidth='2' />
      <line x1='32' y1='58' x2='48' y2='58' stroke='#1B998B' strokeWidth='2' />
      {/* Flamme représentant bouffées de chaleur */}
      <path
        d='M40 20 C42 24 46 26 46 30 C46 34 43 36 40 36 C37 36 34 34 34 30 C34 26 38 24 40 20Z'
        fill='#E76F51'
      />
      <path
        d='M40 24 C41 26 43 27 43 29 C43 31 42 32 40 32 C38 32 37 31 37 29 C37 27 39 26 40 24Z'
        fill='#F0F9F8'
      />
    </svg>
  ),
  weightLoss: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-16 h-16'
    >
      {/* Balance/poids */}
      <circle
        cx='40'
        cy='40'
        r='24'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      <path
        d='M25 45 L35 35 L45 42 L55 30'
        stroke='#147569'
        strokeWidth='3'
        fill='none'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle cx='55' cy='30' r='4' fill='#E76F51' />
      {/* Flèche descendante */}
      <path
        d='M58 48 L58 58 M54 54 L58 58 L62 54'
        stroke='#1B998B'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  digestive: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-16 h-16'
    >
      {/* Estomac stylisé */}
      <path
        d='M30 25 C25 25 20 35 20 45 C20 55 28 60 35 60 L45 60 C52 60 60 55 60 45 C60 35 55 25 50 25 L30 25Z'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      {/* Lignes représentant le bien-être digestif */}
      <path
        d='M32 38 C36 42 44 42 48 38'
        stroke='#147569'
        strokeWidth='2'
        fill='none'
        strokeLinecap='round'
      />
      <path
        d='M34 48 C38 52 42 52 46 48'
        stroke='#147569'
        strokeWidth='2'
        fill='none'
        strokeLinecap='round'
      />
      {/* Petit check */}
      <circle cx='55' cy='55' r='8' fill='#1B998B' />
      <path
        d='M52 55 L54 57 L58 53'
        stroke='#fff'
        strokeWidth='2'
        fill='none'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  diabetes: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-16 h-16'
    >
      {/* Goutte de sang/glucose */}
      <path
        d='M40 15 C40 15 55 35 55 48 C55 58 48 65 40 65 C32 65 25 58 25 48 C25 35 40 15 40 15Z'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      {/* Graphique glycémie */}
      <path
        d='M30 45 L36 50 L44 40 L50 48'
        stroke='#147569'
        strokeWidth='2'
        fill='none'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      {/* Cercle central */}
      <circle cx='40' cy='48' r='6' fill='#E76F51' />
      <path
        d='M38 48 L40 50 L44 46'
        stroke='#fff'
        strokeWidth='1.5'
        fill='none'
        strokeLinecap='round'
      />
    </svg>
  ),
  cardiovascular: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-16 h-16'
    >
      {/* Coeur stylisé */}
      <path
        d='M40 60 C25 50 15 40 15 30 C15 22 22 16 30 16 C35 16 38 18 40 22 C42 18 45 16 50 16 C58 16 65 22 65 30 C65 40 55 50 40 60Z'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      {/* Ligne ECG */}
      <path
        d='M22 38 L32 38 L36 30 L40 46 L44 34 L48 38 L58 38'
        stroke='#E76F51'
        strokeWidth='2'
        fill='none'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  fatigue: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-16 h-16'
    >
      {/* Batterie/énergie */}
      <rect
        x='20'
        y='25'
        width='40'
        height='30'
        rx='4'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      <rect x='60' y='35' width='6' height='10' rx='1' fill='#1B998B' />
      {/* Niveaux d'énergie */}
      <rect x='26' y='31' width='10' height='18' rx='2' fill='#1B998B' />
      <rect x='40' y='31' width='10' height='18' rx='2' fill='#E5DED6' />
      {/* Éclair */}
      <path
        d='M38 58 L42 62 L40 64 L46 72 L44 66 L48 66 L42 58 Z'
        fill='#E9C46A'
      />
    </svg>
  ),
  longevity: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-16 h-16'
    >
      {/* Sablier/temps */}
      <path
        d='M25 20 L55 20 L55 25 C55 35 45 40 45 40 C45 40 55 45 55 55 L55 60 L25 60 L25 55 C25 45 35 40 35 40 C35 40 25 35 25 25 L25 20Z'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      {/* Sable */}
      <path d='M30 25 L50 25 L45 35 L35 35 Z' fill='#E9C46A' />
      <path d='M35 45 L45 45 L50 55 L30 55 Z' fill='#E76F51' />
      {/* Feuille de vitalité */}
      <path
        d='M58 15 C58 15 65 22 62 30 C60 25 55 23 55 23 C55 23 58 20 58 15Z'
        fill='#1B998B'
      />
    </svg>
  ),
  hormonal: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-16 h-16'
    >
      {/* Molécule/hormones */}
      <circle
        cx='40'
        cy='40'
        r='12'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      <circle
        cx='25'
        cy='25'
        r='8'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      <circle
        cx='55'
        cy='25'
        r='8'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      <circle
        cx='55'
        cy='55'
        r='8'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      <circle
        cx='25'
        cy='55'
        r='8'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      {/* Connexions */}
      <line x1='31' y1='31' x2='34' y2='34' stroke='#1B998B' strokeWidth='2' />
      <line x1='49' y1='31' x2='46' y2='34' stroke='#1B998B' strokeWidth='2' />
      <line x1='49' y1='49' x2='46' y2='46' stroke='#1B998B' strokeWidth='2' />
      <line x1='31' y1='49' x2='34' y2='46' stroke='#1B998B' strokeWidth='2' />
      {/* Centre */}
      <circle cx='40' cy='40' r='5' fill='#E76F51' />
    </svg>
  ),
  healthyEating: (
    <svg
      viewBox='0 0 80 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-16 h-16'
    >
      {/* Assiette */}
      <ellipse
        cx='40'
        cy='45'
        rx='28'
        ry='20'
        fill='#F0F9F8'
        stroke='#1B998B'
        strokeWidth='2'
      />
      <ellipse
        cx='40'
        cy='45'
        rx='20'
        ry='14'
        fill='#fff'
        stroke='#E5DED6'
        strokeWidth='1'
      />
      {/* Légumes stylisés */}
      <circle cx='35' cy='42' r='5' fill='#1B998B' />
      <circle cx='45' cy='42' r='5' fill='#E76F51' />
      <circle cx='40' cy='50' r='4' fill='#E9C46A' />
      {/* Fourchette */}
      <path
        d='M18 25 L18 38 M15 25 L15 32 M18 25 L18 32 M21 25 L21 32'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <line
        x1='18'
        y1='38'
        x2='18'
        y2='55'
        stroke='#1B998B'
        strokeWidth='1.5'
      />
      {/* Couteau */}
      <path
        d='M62 25 L62 55 M62 25 C65 25 66 30 66 35 L62 35'
        stroke='#1B998B'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  ),
};

export function IsThisForYouSection() {
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

  const situations: SituationItem[] = [
    {
      id: 1,
      title: 'Ménopause et péri-ménopause',
      description: 'Bouffées de chaleur, prise de poids, fatigue chronique.',
      icon: conditionIcons.menopause,
    },
    {
      id: 2,
      title: 'Perte de poids durable',
      description:
        'Vous avez tout essayé, mais rien ne tient sur le long terme.',
      icon: conditionIcons.weightLoss,
    },
    {
      id: 3,
      title: 'Troubles digestifs',
      description:
        "Ballonnements, inconforts, syndrome de l'intestin irritable.",
      icon: conditionIcons.digestive,
    },
    {
      id: 4,
      title: 'Glycémie et diabète',
      description: "Prédiabète, diabète de type 2, résistance à l'insuline.",
      icon: conditionIcons.diabetes,
    },
    {
      id: 5,
      title: 'Santé cardiovasculaire',
      description:
        'Cholestérol, hypertension, prévention des maladies cardiaques.',
      icon: conditionIcons.cardiovascular,
    },
    {
      id: 6,
      title: "Fatigue et manque d'énergie",
      description: 'Vous êtes épuisée dès le matin, même après une bonne nuit.',
      icon: conditionIcons.fatigue,
    },
    {
      id: 7,
      title: 'Longévité et vieillissement',
      description: 'Préserver votre santé et votre vitalité à long terme.',
      icon: conditionIcons.longevity,
    },
    {
      id: 8,
      title: 'Santé hormonale',
      description: 'SOPK, troubles thyroïdiens, déséquilibres hormonaux.',
      icon: conditionIcons.hormonal,
    },
    {
      id: 9,
      title: 'Alimentation saine générale',
      description:
        'Apprendre à bien manger au quotidien, sans régime restrictif.',
      icon: conditionIcons.healthyEating,
    },
  ];

  return (
    <section
      id='is-this-for-you'
      ref={ref}
      style={{
        backgroundColor: '#FBF9F7' /* Crème Méditerranée */,
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
            color: '#1B998B' /* Turquoise Méditerranée */,
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
          Les troubles que nous accompagnons
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
          Nous vous accompagnons pour tout ce qui concerne l'alimentation saine
          au quotidien, jusqu'à la gestion nutritionnelle de conditions
          chroniques. Nous créons toujours des plans réalistes qui tiennent
          compte de votre mode de vie, de vos préférences et de votre situation
          personnelle.
        </motion.p>

        {/* ============================================ */}
        {/* CARDS GRID - 3 colonnes                      */}
        {/* ============================================ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            marginTop: '48px',
          }}
          className='conditions-grid-responsive'
        >
          {situations.map((situation, index) => (
            <motion.div
              key={situation.id}
              style={{
                backgroundColor:
                  'rgba(240, 249, 248, 0.4)' /* Turquoise pale transparent */,
                border: '1px solid #E5DED6',
                borderRadius: '10px',
                padding: '32px',
                textAlign: 'center',
                transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
                boxShadow: '8px 8px 0 #E5DED6' /* Beige sand shadow */,
                cursor: 'pointer',
                ...getHiddenStyle(40),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
              }
              transition={getTransition(0.3 + index * 0.1)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '10px 10px 0 #E5DED6';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '8px 8px 0 #E5DED6';
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 24px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {situation.icon}
              </div>

              {/* Title */}
              <h3
                style={{
                  color: '#1B998B' /* Turquoise Méditerranée */,
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '18px',
                  lineHeight: '27px',
                  textAlign: 'center',
                  margin: '0 0 12px 0',
                  fontWeight: 600,
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
                  fontSize: '14px',
                  lineHeight: '21px',
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
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
