'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section "Comment nous travaillons ensemble" - Cartes de processus
 *
 * Design System NutriSensia - Palette Méditerranée :
 * - Police titres : Marcellus (serif)
 * - Police body : Plus Jakarta Sans (sans-serif)
 * - Couleur principale : #1B998B (Turquoise Azur)
 * - Couleur texte : #41556b
 * - Background : #FBF9F7 (Warm Cream)
 * - Cartes : fond blanc, bordure #e5e5e5, ombre 8px 8px 0 #E5DED6 (Beige Sand)
 */

interface ProcessStep {
  number: string;
  title: string;
  duration: string;
  description: string;
  image: string;
}

const steps: ProcessStep[] = [
  {
    number: '01',
    title: 'Consultation Découverte',
    duration: '1h30 en visioconférence',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop&q=80',
    description:
      'Analyse approfondie de votre situation (1h30 en visio)\nProgramme nutritionnel personnalisé livré sous 48-72h\nAccès immédiat à votre plateforme 24/7\nMessagerie sécurisée avec réponse sous 24h\nPremières actions concrètes à mettre en place dès le départ',
  },
  {
    number: '02',
    title: 'Suivi Régulier & Ajustements',
    duration: '4 à 12 semaines',
    image:
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop&q=80',
    description:
      'Consultations 1h toutes les 2-4 semaines pour analyser vos progrès\nAjustements du plan nutritionnel en temps réel selon vos résultats\nÉducation continue : comprendre le "pourquoi" derrière chaque action\nSupport illimité entre les consultations (réponse sous 24h)\nCélébration des victoires et résolution des blocages ensemble',
  },
  {
    number: '03',
    title: 'Autonomie et Résultats Durables',
    duration: 'À vie',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop&q=80',
    description:
      "Vous savez lire les signaux de votre corps et y répondre\nVous composez vos repas naturellement, sans stress ni calcul\nVous gérez les écarts et situations sociales sans culpabilité\nVos nouvelles habitudes sont ancrées pour toute la vie\nVous n'avez plus besoin de nous : vous êtes autonome",
  },
];

/**
 * Carte de processus individuelle
 */
interface ProcessCardProps {
  step: ProcessStep;
  index: number;
  showContent: boolean;
  isFirstVisit: boolean;
  shouldAnimate: boolean;
}

function ProcessCard({
  step,
  index,
  showContent,
  isFirstVisit,
  shouldAnimate,
}: ProcessCardProps) {
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

  return (
    <motion.div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e5e5',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '8px 8px 0 #E5DED6' /* Beige Sand */,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...getHiddenStyle(40),
      }}
      animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={getTransition(index * 0.15)}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '200px',
        }}
      >
        <img
          src={step.image}
          alt={step.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Badge numéro sur l'image */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            width: '48px',
            height: '48px',
            backgroundColor: '#1B998B' /* Turquoise Azur */,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily:
              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {step.number}
        </div>
      </div>

      {/* Contenu de la carte */}
      <div
        style={{
          padding: '28px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Titre - hauteur fixe pour alignement entre cartes */}
        <h3
          style={{
            fontFamily: "'Marcellus', serif",
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: '1.3',
            color: '#1B998B' /* Turquoise Azur */,
            marginBottom: '8px',
            minHeight: '58px', // 2 lignes de titre pour alignement
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {step.title}
        </h3>

        {/* Durée avec underline */}
        <p
          style={{
            fontFamily:
              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '1.4',
            color: '#1B998B' /* Turquoise Azur */,
            borderBottom: '1px solid #E5DED6' /* Beige Sand */,
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          {step.duration}
        </p>

        {/* Description sous forme de liste */}
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', flex: 1 }}>
          {step.description.split('\n').map((line, lineIndex) => (
            <li
              key={lineIndex}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '12px',
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '15px',
                lineHeight: '1.5',
                color: '#41556b',
              }}
            >
              <span
                style={{
                  color: '#1B998B' /* Turquoise Azur */,
                  fontWeight: 600,
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                •
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/**
 * Composant principal ProcessTimelineCards
 */
export default function ProcessTimelineCards() {
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

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#FBF9F7' /* Warm Cream */,
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
              color: '#1B998B' /* Turquoise Azur */,
              marginBottom: '24px',
            }}
          >
            Comment nous travaillons ensemble ?
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
            Un accompagnement en 3 étapes pour des résultats durables
          </p>
        </motion.div>

        {/* Grille de 3 cartes */}
        <div
          className='process-grid'
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            alignItems: 'stretch',
          }}
        >
          {steps.map((step, index) => (
            <ProcessCard
              key={index}
              step={step}
              index={index}
              showContent={showContent}
              isFirstVisit={isFirstVisit}
              shouldAnimate={shouldAnimate}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          style={{
            textAlign: 'center',
            marginTop: '64px',
            ...getHiddenStyle(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.5)}
        >
          <a
            href='/contact?type=consultation'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background:
                'linear-gradient(135deg, #1B998B 0%, #147569 100%)' /* Dégradé CTA */,
              color: '#ffffff',
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '16px',
              fontWeight: 600,
              padding: '16px 32px',
              borderRadius: '35px',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
              <line x1='16' y1='2' x2='16' y2='6' />
              <line x1='8' y1='2' x2='8' y2='6' />
              <line x1='3' y1='10' x2='21' y2='10' />
            </svg>
            <span>Réserver ma première consultation</span>
          </a>
        </motion.div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .process-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .process-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
