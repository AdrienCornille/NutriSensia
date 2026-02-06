'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ScrollSection {
  id: string;
  label: string;
  order: number;
}

interface SectionScrollbarProps {
  sections: ScrollSection[];
  className?: string;
}

export function SectionScrollbar({
  sections,
  className = '',
}: SectionScrollbarProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Détecter la section active pendant le scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section.id);

        if (element) {
          const { top } = element.getBoundingClientRect();
          const absoluteTop = top + window.scrollY;

          if (scrollPosition >= absoluteTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Navigation vers une section avec smooth scroll forcé
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Utiliser getBoundingClientRect pour obtenir la position exacte
      const elementRect = element.getBoundingClientRect();
      const absoluteTop = elementRect.top + window.scrollY;

      // Pas d'offset - la section commence exactement en haut de l'écran
      const headerOffset = 0;
      const targetPosition = absoluteTop - headerOffset;

      // Implémentation de smooth scroll avec requestAnimationFrame pour garantir le comportement
      const startPosition = window.scrollY;
      const distance = targetPosition - startPosition;
      const duration = 800; // durée en millisecondes
      let startTime: number | null = null;

      function animation(currentTime: number) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Fonction d'easing (easeInOutCubic) pour un mouvement plus naturel
        const ease =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      }

      requestAnimationFrame(animation);
    }
  }, []);

  // Calculer la hauteur égale pour chaque segment
  const getSegmentHeight = (): number => {
    // Hauteur fixe de la scrollbar (en vh)
    const scrollbarHeight = 85; // 85vh
    // Diviser équitablement entre toutes les sections
    return scrollbarHeight / sections.length;
  };

  // Calculer la position Y d'un segment
  const getSegmentPosition = (index: number): number => {
    // Position basée sur l'index multiplié par la hauteur égale
    return index * getSegmentHeight();
  };

  return (
    <div
      className={`fixed right-0 top-0 bottom-0 z-50 hidden lg:flex items-center justify-end pr-4 ${className}`}
      role='navigation'
      aria-label='Navigation par sections'
    >
      <div className='relative' style={{ height: '85vh' }}>
        {/* Ligne de fond - plus fine et discrète */}
        <div className='absolute right-0 top-0 bottom-0 w-px bg-gray-200/60' />

        {/* Segments de sections */}
        {sections.map((section, index) => {
          const isActive = activeSection === section.id;
          const isHovered = hoveredSection === section.id;
          const segmentHeight = getSegmentHeight();
          const segmentPosition = getSegmentPosition(index);

          return (
            <div
              key={section.id}
              className='absolute right-0 group'
              style={{
                top: `${segmentPosition}vh`,
                height: `${segmentHeight}vh`,
              }}
            >
              {/* Ligne de section - couvre toute la hauteur du segment */}
              <div
                className={`absolute right-0 top-0 w-px transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/90'
                    : isHovered
                      ? 'bg-gray-400/70'
                      : 'bg-transparent'
                }`}
                style={{ height: '100%' }}
              />

              {/* Conteneur du numéro positionné en bas du segment */}
              <div className='absolute bottom-0 right-0 flex items-center justify-end'>
                {/* Label au survol - même style que le numéro */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: 4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 4 }}
                      transition={{ duration: 0.15 }}
                      className='absolute right-8 whitespace-nowrap'
                    >
                      <span
                        className={`text-[10px] font-semibold ${
                          isActive ? 'text-primary' : 'text-gray-700'
                        }`}
                      >
                        {section.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Numéro et ligne active */}
                <button
                  onClick={() => scrollToSection(section.id)}
                  onMouseEnter={() => setHoveredSection(section.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                  className='relative flex items-center transition-all duration-200 hover:cursor-pointer'
                  aria-label={`Aller à ${section.label}`}
                >
                  {/* Numéro de section - complètement à gauche de la scrollbar avec marge */}
                  <div
                    className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 mr-[5px] ${
                      isActive
                        ? 'bg-primary/10 text-primary scale-100'
                        : isHovered
                          ? 'bg-gray-100 text-gray-700 scale-95'
                          : 'bg-transparent text-gray-300 scale-90'
                    }`}
                  >
                    <span className='text-[10px] font-semibold'>
                      {String(section.order).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Indicateur de position active - plus subtil */}
                  {isActive && (
                    <motion.div
                      layoutId='activeIndicator'
                      className='absolute right-[-2px] w-1 h-1 bg-primary rounded-full'
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                      }}
                    />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
