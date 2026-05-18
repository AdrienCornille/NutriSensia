'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Fonctionnalités — Scroll horizontal (DS v2 Editorial)
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
    title: 'Tableau de bord personnalisé',
    subtitle: "Votre vue d'ensemble en un coup d'œil",
    description:
      'Tout ce qui compte, au premier regard : prochain rendez-vous, progrès de la semaine, objectifs, messages.',
    bullets: [
      'Progrès de la semaine (poids, énergie, symptômes)',
      'Objectifs et leur avancement',
      'Plan de repas du jour',
    ],
    whyUseful: 'Plus besoin de chercher. Tout est là où vous le cherchiez.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80',
    alt: 'Tableau de bord avec graphiques et métriques de santé',
  },
  {
    id: 2,
    title: 'Plans de repas personnalisés',
    subtitle: "Une feuille de route qui s'ajuste avec vous",
    description:
      'Chaque semaine, vos repas planifiés selon vos vraies contraintes. Quantités ajustables, alternatives prévues.',
    bullets: [
      'Repas adaptés à vos contraintes',
      "Alternatives si vous n'aimez pas un ingrédient",
      'Informations nutritionnelles complètes',
    ],
    whyUseful:
      "Fini le PDF figé. C'est un plan vivant, ajusté après chaque consultation.",
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop&q=80',
    alt: 'Assiette équilibrée avec légumes colorés et protéines',
  },
  {
    id: 3,
    title: 'Listes de courses automatiques',
    subtitle: 'Ne manquez plus jamais un ingrédient',
    description:
      'En un clic, votre liste se génère depuis le plan de repas — déjà rangée par rayon.',
    bullets: [
      'Cochez les articles au fur et à mesure',
      'Partagez avec votre conjoint(e)',
      'Accessible depuis votre téléphone',
    ],
    whyUseful:
      'Fini les allers-retours dans le supermarché. On sait pourquoi on est venu.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop&q=80',
    alt: 'Panier de courses avec fruits et légumes frais',
  },
  {
    id: 4,
    title: 'Journal alimentaire, sans le calvaire',
    subtitle: 'Suivez ce que vous mangez sans prise de tête',
    description:
      "Plusieurs façons d'enregistrer : recherche, photo, favoris ou note rapide. Vous choisissez.",
    bullets: [
      "Base de données avec milliers d'aliments",
      'Photo de votre assiette (rapide et visuel)',
      'Favoris sauvegardés (1 clic)',
    ],
    whyUseful:
      "Le journal n'est pas là pour juger — c'est un outil de conscience, pas un tribunal.",
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&q=80',
    alt: "Photo d'une assiette saine vue du dessus",
  },
  {
    id: 5,
    title: 'Suivi de vos progrès',
    subtitle: 'Mesurez votre évolution au-delà de la balance',
    description:
      "La balance ne raconte qu'une partie de l'histoire. Suivez aussi votre bien-être, votre énergie, vos symptômes.",
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
    title: 'Messagerie & bibliothèque',
    subtitle: 'Une question, une réponse. Et de quoi lire entre les séances.',
    description:
      'Messagerie sécurisée pour poser vos questions, bibliothèque de ressources pour aller plus loin.',
    bullets: [
      'Réponse sous 48-72 h garantie',
      'Articles et guides pratiques',
      'Recettes saines et simples',
    ],
    whyUseful:
      "Une question qui bloque aujourd'hui ne devrait pas attendre la semaine prochaine.",
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop&q=80',
    alt: 'Personne utilisant une application de messagerie sur tablette',
  },
];

const CARD_WIDTH = 460;
const CARD_HEIGHT_IMAGE = 240;
const CARD_HEIGHT_TOTAL = 680;
const GAP = 32;
const CONTAINER_MAX_WIDTH = 1320;
const CONTAINER_PADDING = 32;

const TITLE_HEIGHT = 68;
const SUBTITLE_HEIGHT = 70;
const DESCRIPTION_HEIGHT = 78;
const BULLETS_HEIGHT = 132;
const USEFUL_BOX_HEIGHT = 96;

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

  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  return (
    <motion.article
      ref={cardRef}
      className='ns2-card-static'
      style={{
        flex: '0 0 auto',
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT_TOTAL}px`,
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
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `${CARD_HEIGHT_IMAGE}px`,
          flexShrink: 0,
          overflow: 'hidden',
          borderBottom: '1.5px solid var(--ns-ink)',
        }}
      >
        <Image
          src={feature.image}
          alt={feature.alt}
          fill
          style={{ objectFit: 'cover' }}
          sizes={`${CARD_WIDTH}px`}
        />
        {/* Numéro sticker */}
        <span
          className='ns2-sticker'
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            transform: 'rotate(-4deg)',
          }}
        >
          {String(feature.id).padStart(2, '0')}
        </span>
      </div>

      {/* Contenu */}
      <div
        style={{
          padding: '28px 32px 32px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: `${TITLE_HEIGHT}px`,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <h3
            className='ns2-display'
            style={{
              fontSize: 26,
              lineHeight: 1.15,
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

        <div
          style={{
            height: `${SUBTITLE_HEIGHT}px`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--ns-font-serif-stack)',
              fontSize: 16,
              lineHeight: 1.4,
              color: 'var(--ns-ink-2)',
              fontStyle: 'italic',
              borderBottom: '1.5px solid var(--ns-ink)',
              paddingBottom: 14,
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

        <div
          style={{
            height: `${DESCRIPTION_HEIGHT}px`,
            display: 'flex',
            alignItems: 'flex-start',
            paddingTop: 14,
          }}
        >
          <p
            className='ns2-body'
            style={{
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

        <div style={{ height: `${BULLETS_HEIGHT}px`, overflow: 'hidden' }}>
          {feature.bullets && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {feature.bullets.slice(0, 3).map((bullet, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginBottom: 10,
                    fontFamily: 'var(--ns-font-sans-stack)',
                    fontSize: 14,
                    lineHeight: '22px',
                    color: 'var(--ns-ink-2)',
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      background: 'var(--ns-peps)',
                      border: '1.5px solid var(--ns-ink)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Check
                      style={{
                        width: 11,
                        height: 11,
                        color: 'var(--ns-ink)',
                      }}
                      strokeWidth={3}
                    />
                  </span>
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

        {/* Why useful */}
        <div
          style={{
            height: `${USEFUL_BOX_HEIGHT}px`,
            background: 'var(--ns-peps-soft)',
            border: '1.5px solid var(--ns-ink)',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            marginTop: 'auto',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--ns-font-sans-stack)',
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--ns-ink)',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            <span className='ns2-eyebrow' style={{ marginRight: 8 }}>
              · Pourquoi
            </span>
            {feature.whyUseful}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

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
      whileHover={!disabled ? { x: direction === 'left' ? -2 : 2, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: disabled ? 'var(--ns-cream-300)' : 'var(--ns-peps)',
        border: '1.5px solid var(--ns-ink)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: disabled ? 'none' : 'var(--ns-shadow-hard-sm)',
        transition: 'all var(--ns-dur) var(--ns-ease)',
        opacity: disabled ? 0.6 : 1,
        color: 'var(--ns-ink)',
      }}
      aria-label={direction === 'left' ? 'Carte précédente' : 'Carte suivante'}
    >
      {direction === 'left' ? (
        <ChevronLeft style={{ width: 22, height: 22 }} strokeWidth={2.5} />
      ) : (
        <ChevronRight style={{ width: 22, height: 22 }} strokeWidth={2.5} />
      )}
    </motion.button>
  );
}

export function PlatformFeaturesHorizontal() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  const getHidden = (yOffset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${yOffset}px)` };

  const getTransition = (delay: number) =>
    shouldAnimate
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  useEffect(() => {
    const updateLayout = () => setIsMobile(window.innerWidth < 1024);
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const updateNavigationState = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      const cardTotalWidth = CARD_WIDTH + GAP;
      const newIndex = Math.round(scrollLeft / cardTotalWidth);
      setCurrentIndex(Math.min(newIndex, featuresData.length - 1));
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateNavigationState);
      updateNavigationState();
      return () =>
        container.removeEventListener('scroll', updateNavigationState);
    }
  }, [updateNavigationState]);

  const scrollToCard = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const cardTotalWidth = CARD_WIDTH + GAP;
      scrollContainerRef.current.scrollTo({
        left: index * cardTotalWidth,
        behavior: 'smooth',
      });
    }
  }, []);

  const handlePrevious = useCallback(() => {
    scrollToCard(Math.max(0, currentIndex - 1));
  }, [currentIndex, scrollToCard]);

  const handleNext = useCallback(() => {
    scrollToCard(Math.min(featuresData.length - 1, currentIndex + 1));
  }, [currentIndex, scrollToCard]);

  const Header = (
    <>
      <motion.div
        className='ns2-eyebrow ns2-eyebrow-dot'
        style={{ marginBottom: 16, ...getHidden(20) }}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={getTransition(0)}
      >
        Six outils essentiels
      </motion.div>
      <motion.h2
        className='ns2-display'
        style={{
          fontSize: 'clamp(36px, 5vw, 60px)',
          marginBottom: 18,
          maxWidth: 760,
          ...getHidden(20),
        }}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={getTransition(0.05)}
      >
        Tout ce dont vous avez besoin,
        <br />
        au <em>même</em> <span className='ns2-hl'>endroit</span>.
      </motion.h2>
      <motion.p
        className='ns2-body-lg'
        style={{ maxWidth: 600, ...getHidden(20) }}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={getTransition(0.1)}
      >
        Six outils pensés pour que la nutrition devienne un réflexe — pas une
        corvée.
      </motion.p>
    </>
  );

  if (isMobile) {
    return (
      <section
        id='platform-features'
        style={{
          background: 'var(--ns-cream-200)',
          padding: '80px 0',
          borderTop: '1.5px solid var(--ns-ink)',
          borderBottom: '1.5px solid var(--ns-ink)',
        }}
      >
        <div className='ns2-container' style={{ marginBottom: 40 }}>
          {Header}
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={updateNavigationState}
          style={{
            display: 'flex',
            gap: 20,
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className='hide-scrollbar'
        >
          {featuresData.map((feature, index) => (
            <div
              key={feature.id}
              style={{ scrollSnapAlign: 'start', flex: '0 0 auto', width: 320 }}
            >
              <FeatureCard
                feature={feature}
                index={index}
                isFirstVisit={isFirstVisit}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 24,
            marginTop: 32,
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

        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>
    );
  }

  return (
    <section
      id='platform-features'
      ref={sectionRef}
      style={{
        background: 'var(--ns-cream-200)',
        padding: '112px 0',
        overflow: 'hidden',
        borderTop: '1.5px solid var(--ns-ink)',
        borderBottom: '1.5px solid var(--ns-ink)',
      }}
    >
      <div className='ns2-container' style={{ marginBottom: 56 }}>
        {Header}
      </div>

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
            paddingTop: 12,
            paddingBottom: 12,
            paddingRight: 200,
            marginRight: 'calc(-50vw + 50%)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className='hide-scrollbar'
        >
          {featuresData.map((feature, index) => (
            <div
              key={feature.id}
              style={{ scrollSnapAlign: 'start', flex: '0 0 auto' }}
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

      <motion.div
        className='ns2-container'
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 14,
          marginTop: 48,
          ...getHidden(20),
        }}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={getTransition(0.3)}
      >
        <span
          className='ns2-meta'
          style={{ marginRight: 'auto', color: 'var(--ns-ink-2)' }}
        >
          {String(currentIndex + 1).padStart(2, '0')} ·{' '}
          {String(featuresData.length).padStart(2, '0')}
        </span>
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

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

export default PlatformFeaturesHorizontal;
