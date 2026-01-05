'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Fonctionnalités - Scroll Horizontal Style Apple
 *
 * Comportement :
 * - Cartes 25% plus grandes, complètement visibles (non coupées)
 * - Navigation via boutons flèches en dessous des cartes
 * - Première carte alignée au bord gauche du container
 * - Animation fluide et responsive
 *
 * Design conforme au NutriSensia Style Guide
 */

interface FeatureData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  bullets?: string[];
  whyUseful: string;
  image: string;
  alt: string;
}

const featuresData: FeatureData[] = [
  {
    id: 1,
    title: 'Tableau de Bord Personnalisé',
    subtitle: "Votre vue d'ensemble en un coup d'œil",
    description:
      'Dès que vous vous connectez, tout est visible : prochain rendez-vous, progrès de la semaine, objectifs et messages.',
    bullets: [
      'Progrès de la semaine (poids, énergie, symptômes)',
      'Objectifs et leur avancement',
      'Plan de repas du jour',
    ],
    whyUseful:
      'Plus besoin de fouiller. Tout est centralisé, clair, accessible.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80',
    alt: 'Tableau de bord avec graphiques et métriques de santé',
  },
  {
    id: 2,
    title: 'Plans de Repas Personnalisés',
    subtitle: 'Votre feuille de route alimentaire, évolutive',
    description:
      'Chaque semaine, retrouvez vos repas planifiés selon VOS besoins avec quantités ajustables.',
    bullets: [
      'Repas adaptés à vos contraintes',
      "Alternatives si vous n'aimez pas un ingrédient",
      'Informations nutritionnelles complètes',
    ],
    whyUseful:
      "Ce n'est pas un PDF figé. C'est un plan vivant ajusté après chaque consultation.",
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop&q=80',
    alt: 'Assiette équilibrée avec légumes colorés et protéines',
  },
  {
    id: 3,
    title: 'Listes de Courses Automatiques',
    subtitle: 'Ne manquez plus jamais un ingrédient',
    description:
      'En un clic, votre liste se génère depuis votre plan de repas, organisée par rayon.',
    bullets: [
      'Cochez les articles au fur et à mesure',
      'Partagez avec votre conjoint(e)',
      'Accessible depuis votre téléphone',
    ],
    whyUseful: 'Fini les courses à tâtons. Vous savez exactement quoi acheter.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop&q=80',
    alt: 'Panier de courses avec fruits et légumes frais',
  },
  {
    id: 4,
    title: 'Journal Alimentaire Simplifié',
    subtitle: 'Suivez ce que vous mangez sans prise de tête',
    description:
      "Plusieurs façons d'enregistrer : recherche, photo, favoris ou note rapide.",
    bullets: [
      "Base de données avec milliers d'aliments",
      'Photo de votre assiette (rapide et visuel)',
      'Favoris sauvegardés (1 clic)',
    ],
    whyUseful:
      "Le journal n'est pas là pour juger. C'est un outil de conscience et de dialogue.",
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&q=80',
    alt: "Photo d'une assiette saine vue du dessus",
  },
  {
    id: 5,
    title: 'Suivi de Vos Progrès',
    subtitle: 'Mesurez votre évolution au-delà de la balance',
    description:
      "La balance ne raconte qu'une partie de l'histoire. Suivez bien-être, énergie et symptômes.",
    bullets: [
      'Graphiques de progression',
      "Niveau d'énergie et qualité du sommeil",
      'Suivi des symptômes spécifiques',
    ],
    whyUseful:
      "Les graphiques montrent vos progrès réels, même quand vous avez l'impression de stagner.",
    image:
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop&q=80',
    alt: 'Montre connectée affichant des données de santé',
  },
  {
    id: 6,
    title: 'Messagerie + Bibliothèque',
    subtitle: 'Restez en contact et apprenez',
    description:
      'Messagerie sécurisée pour poser vos questions et bibliothèque de ressources éducatives.',
    bullets: [
      'Réponse sous 48-72h garantie',
      'Articles et guides pratiques',
      'Recettes saines et simples',
    ],
    whyUseful:
      "Vous ne devriez pas attendre pour une réponse qui vous bloque aujourd'hui.",
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop&q=80',
    alt: 'Personne utilisant une application de messagerie sur tablette',
  },
];

// Dimensions des cartes (25% plus grandes que 380px original)
const CARD_WIDTH = 475; // 380 * 1.25
const CARD_HEIGHT_IMAGE = 250; // 200 * 1.25
const CARD_HEIGHT_TOTAL = 680; // Hauteur totale fixe pour toutes les cartes
const GAP = 32;
const CONTAINER_MAX_WIDTH = 1200;
const CONTAINER_PADDING = 24;

// Hauteurs fixes pour chaque section du contenu (alignement parfait)
const TITLE_HEIGHT = 68; // Hauteur pour le titre (2 lignes max)
const SUBTITLE_HEIGHT = 70; // Hauteur pour le sous-titre avec underline
const DESCRIPTION_HEIGHT = 78; // Hauteur pour la description (3 lignes)
const BULLETS_HEIGHT = 132; // Hauteur pour 3 bullets
const USEFUL_BOX_HEIGHT = 90; // Hauteur pour la box "Pourquoi c'est utile"

/**
 * Carte Feature individuelle pour le scroll horizontal
 * Toutes les cartes ont exactement la même taille avec des sections alignées
 */
function FeatureCard({
  feature,
  index,
  isFirstVisit = true,
}: {
  feature: FeatureData;
  index: number;
  isFirstVisit?: boolean;
}) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  return (
    <motion.div
      ref={cardRef}
      style={{
        flex: '0 0 auto',
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT_TOTAL}px`,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e5e5',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '8px 8px 0 #E5DED6' /* Beige Sand */,
        display: 'flex',
        flexDirection: 'column',
        ...(isFirstVisit ? { opacity: 0, transform: 'translateY(30px)' } : {}),
      }}
      animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={
        shouldAnimate
          ? { duration: 0.6, delay: index * 0.1, ease: 'easeOut' }
          : { duration: 0 }
      }
      className='feature-card-horizontal'
    >
      {/* Image - hauteur fixe */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `${CARD_HEIGHT_IMAGE}px`,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Image
          src={feature.image}
          alt={feature.alt}
          fill
          style={{
            objectFit: 'cover',
          }}
          sizes={`${CARD_WIDTH}px`}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, transparent 50%, rgba(27, 153, 139, 0.08) 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Numéro badge */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '48px',
            height: '48px',
            backgroundColor: '#1B998B' /* Turquoise Azur */,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {String(feature.id).padStart(2, '0')}
        </div>
      </div>

      {/* Contenu - hauteur fixe avec sections alignées */}
      <div
        style={{
          padding: '28px 32px 32px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Titre - hauteur fixe */}
        <div
          style={{
            height: `${TITLE_HEIGHT}px`,
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '0',
          }}
        >
          <h3
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '24px',
              fontWeight: 700,
              lineHeight: '1.35',
              color: '#1B998B' /* Turquoise Azur */,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {feature.title}
          </h3>
        </div>

        {/* Sous-titre avec underline - hauteur fixe */}
        <div
          style={{
            height: `${SUBTITLE_HEIGHT}px`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '15px',
              lineHeight: '1.4',
              color: '#1B998B' /* Turquoise Azur */,
              fontStyle: 'italic',
              borderBottom: '1px solid #E5DED6' /* Beige Sand */,
              paddingBottom: '14px',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {feature.subtitle}
          </p>
        </div>

        {/* Description - hauteur fixe */}
        <div
          style={{
            height: `${DESCRIPTION_HEIGHT}px`,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '15px',
              lineHeight: '24px',
              color: '#41556b',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {feature.description}
          </p>
        </div>

        {/* Bullets - hauteur fixe */}
        <div
          style={{
            height: `${BULLETS_HEIGHT}px`,
            overflow: 'hidden',
          }}
        >
          {feature.bullets && (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              {feature.bullets.slice(0, 3).map((bullet, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    marginBottom: '10px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: '#41556b',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: '#4A9B7B',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Check
                      style={{
                        width: '11px',
                        height: '11px',
                        color: '#ffffff',
                      }}
                      strokeWidth={3}
                    />
                  </div>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Why Useful Box - hauteur fixe, toujours en bas */}
        <div
          style={{
            height: `${USEFUL_BOX_HEIGHT}px`,
            backgroundColor: 'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
            borderRadius: '10px',
            padding: '14px 16px',
            border: '1px solid #E5DED6' /* Beige Sand */,
            display: 'flex',
            alignItems: 'center',
            marginTop: 'auto',
          }}
        >
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#41556b',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            <span style={{ fontWeight: 700, color: '#3f6655' }}>
              Pourquoi c&apos;est utile :
            </span>{' '}
            {feature.whyUseful}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Bouton de navigation (flèche)
 */
function NavigationButton({
  direction,
  onClick,
  disabled,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        backgroundColor: disabled ? '#e0e0e0' : '#3f6655',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: disabled ? 'none' : '0 4px 12px rgba(27, 153, 139, 0.3)',
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.5 : 1,
      }}
      aria-label={direction === 'left' ? 'Carte précédente' : 'Carte suivante'}
    >
      {direction === 'left' ? (
        <ChevronLeft
          style={{
            width: '21px',
            height: '21px',
            color: disabled ? '#999' : '#ffffff',
          }}
          strokeWidth={2.5}
        />
      ) : (
        <ChevronRight
          style={{
            width: '21px',
            height: '21px',
            color: disabled ? '#999' : '#ffffff',
          }}
          strokeWidth={2.5}
        />
      )}
    </motion.button>
  );
}

/**
 * Composant principal avec navigation par boutons
 */
export function PlatformFeaturesHorizontal() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  // Détection mobile
  useEffect(() => {
    const updateLayout = () => {
      const windowWidth = window.innerWidth;
      setIsMobile(windowWidth < 1024);
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // Mettre à jour les états de navigation
  const updateNavigationState = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Calculer l'index actuel
      const cardTotalWidth = CARD_WIDTH + GAP;
      const newIndex = Math.round(scrollLeft / cardTotalWidth);
      setCurrentIndex(Math.min(newIndex, featuresData.length - 1));
    }
  }, []);

  // Écouter le scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateNavigationState);
      updateNavigationState();
      return () =>
        container.removeEventListener('scroll', updateNavigationState);
    }
  }, [updateNavigationState]);

  // Navigation vers une carte spécifique
  const scrollToCard = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const cardTotalWidth = CARD_WIDTH + GAP;
      const targetScroll = index * cardTotalWidth;
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  }, []);

  // Navigation gauche/droite
  const handlePrevious = useCallback(() => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToCard(newIndex);
  }, [currentIndex, scrollToCard]);

  const handleNext = useCallback(() => {
    const newIndex = Math.min(featuresData.length - 1, currentIndex + 1);
    scrollToCard(newIndex);
  }, [currentIndex, scrollToCard]);

  // Version mobile : scroll horizontal natif
  if (isMobile) {
    return (
      <section
        style={{
          backgroundColor: '#FBF9F7' /* Warm Cream */,
          padding: '80px 0',
        }}
      >
        {/* Header */}
        <div
          style={{
            maxWidth: `${CONTAINER_MAX_WIDTH}px`,
            margin: '0 auto',
            padding: `0 ${CONTAINER_PADDING}px`,
            textAlign: 'center',
            marginBottom: '48px',
          }}
        >
          <h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: '40px',
              color: '#1B998B' /* Turquoise Azur */,
              marginBottom: '16px',
            }}
          >
            Tout Ce Dont Vous Avez Besoin
          </h2>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '16px',
              lineHeight: '24px',
              color: '#41556b',
            }}
          >
            Six outils essentiels pour transformer votre quotidien nutritionnel.
          </p>
        </div>

        {/* Scroll horizontal natif sur mobile */}
        <div
          ref={scrollContainerRef}
          onScroll={updateNavigationState}
          style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
            paddingBottom: '24px',
            paddingLeft: `${CONTAINER_PADDING}px`,
            paddingRight: `${CONTAINER_PADDING}px`,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className='hide-scrollbar'
        >
          {featuresData.map((feature, index) => (
            <div
              key={feature.id}
              style={{
                scrollSnapAlign: 'start',
                flex: '0 0 auto',
                width: '320px',
              }}
            >
              <FeatureCard
                feature={feature}
                index={index}
                isFirstVisit={isFirstVisit}
              />
            </div>
          ))}
        </div>

        {/* Navigation mobile - Boutons flèches */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px',
            marginTop: '40px',
            padding: `0 ${CONTAINER_PADDING}px`,
          }}
        >
          <NavigationButton
            direction='left'
            onClick={handlePrevious}
            disabled={!canScrollLeft}
          />
          <NavigationButton
            direction='right'
            onClick={handleNext}
            disabled={!canScrollRight}
          />
        </div>

        {/* Style pour masquer la scrollbar */}
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>
    );
  }

  // Version desktop : Navigation par boutons en bas
  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: '#FBF9F7' /* Warm Cream */,
        padding: '96px 0',
        overflow: 'hidden',
      }}
    >
      {/* Header - aligné avec le container */}
      <div
        style={{
          maxWidth: `${CONTAINER_MAX_WIDTH}px`,
          margin: '0 auto',
          padding: `0 ${CONTAINER_PADDING}px`,
          marginBottom: '56px',
        }}
      >
        <motion.h2
          style={{
            fontFamily: "'Marcellus', serif",
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: '57.6px',
            color: '#1B998B' /* Turquoise Azur */,
            marginBottom: '16px',
            ...getHiddenStyle(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          Tout Ce Dont Vous Avez Besoin, au Même Endroit
        </motion.h2>
        <motion.p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '18px',
            lineHeight: '28px',
            color: '#41556b',
            maxWidth: '600px',
            ...getHiddenStyle(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.1)}
        >
          Six outils essentiels pour transformer votre quotidien nutritionnel.
        </motion.p>
      </div>

      {/* Container des cartes - aligné à gauche avec le titre, étendu à droite jusqu'au bord */}
      <div
        style={{
          maxWidth: `${CONTAINER_MAX_WIDTH}px`,
          margin: '0 auto',
          paddingLeft: `${CONTAINER_PADDING}px`,
          overflow: 'visible',
        }}
      >
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            gap: `${GAP}px`,
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            paddingBottom: '8px',
            paddingRight: '150px',
            marginRight: 'calc(-50vw + 50%)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className='hide-scrollbar'
        >
          {featuresData.map((feature, index) => (
            <div
              key={feature.id}
              style={{
                scrollSnapAlign: 'start',
                flex: '0 0 auto',
              }}
            >
              <FeatureCard
                feature={feature}
                index={index}
                isFirstVisit={isFirstVisit}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation - Boutons flèches positionnés à 75% de la largeur */}
      <motion.div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginTop: '48px',
          marginLeft: '75%',
          transform: 'translateX(-50%)',
          ...getHiddenStyle(20),
        }}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={getTransition(0.3)}
      >
        <NavigationButton
          direction='left'
          onClick={handlePrevious}
          disabled={!canScrollLeft}
        />

        <NavigationButton
          direction='right'
          onClick={handleNext}
          disabled={!canScrollRight}
        />
      </motion.div>

      {/* Style pour masquer la scrollbar */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

export default PlatformFeaturesHorizontal;
