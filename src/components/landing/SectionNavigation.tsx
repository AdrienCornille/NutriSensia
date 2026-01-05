'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props du composant SectionNavigation
 */
export interface SectionNavigationProps {
  /**
   * Classes CSS personnalisées
   */
  className?: string;
  /**
   * Sections disponibles pour la navigation
   */
  sections?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  /**
   * Position de la navigation (fixe ou relative)
   */
  position?: 'fixed' | 'relative';
}

/**
 * Composant SectionNavigation pour la landing page NutriSensia
 *
 * Ce composant fournit une navigation fluide entre les différentes sections
 * de la landing page avec défilement automatique et indicateur de section active.
 *
 * @example
 * ```tsx
 * <SectionNavigation
 *   sections={[
 *     { id: 'hero', label: 'Accueil' },
 *     { id: 'patients', label: 'Patients' },
 *     { id: 'nutritionnistes', label: 'Nutritionnistes' }
 *   ]}
 * />
 * ```
 */
export const SectionNavigation: React.FC<SectionNavigationProps> = ({
  className,
  sections = [
    {
      id: 'hero',
      label: 'Accueil',
      icon: (
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
          />
        </svg>
      ),
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: (
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      ),
    },
    {
      id: 'nutritionnistes',
      label: 'Nutritionnistes',
      icon: (
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6'
          />
        </svg>
      ),
    },
  ],
  position = 'fixed',
}) => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isVisible, setIsVisible] = useState(false);

  // Fonction pour faire défiler vers une section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Offset pour la navigation fixe
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  // Observer les sections pour mettre à jour la section active
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Observer toutes les sections
    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  // Gérer la visibilité de la navigation en fonction du scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (position === 'fixed' && !isVisible) {
    return null;
  }

  return (
    <nav
      className={cn(
        'z-50 transition-all duration-300',
        position === 'fixed' && [
          'fixed top-1/2 right-6 transform -translate-y-1/2',
          'hidden lg:block',
        ],
        position === 'relative' && 'relative',
        className
      )}
    >
      <div
        className={cn(
          'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-gray-700',
          position === 'fixed' ? 'p-2' : 'p-4'
        )}
      >
        <ul
          className={cn(
            'space-y-2',
            position === 'relative' && 'flex space-y-0 space-x-4'
          )}
        >
          {sections.map(section => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  'group relative flex items-center transition-all duration-200',
                  position === 'fixed'
                    ? 'p-3 rounded-full'
                    : 'px-4 py-2 rounded-full',
                  activeSection === section.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                )}
                title={section.label}
              >
                {/* Icône */}
                <span
                  className={cn(
                    'flex-shrink-0',
                    position === 'relative' && 'mr-2'
                  )}
                >
                  {section.icon}
                </span>

                {/* Label (visible sur desktop en mode relative, ou au survol en mode fixed) */}
                {position === 'relative' && (
                  <span className='text-sm font-medium'>{section.label}</span>
                )}

                {position === 'fixed' && (
                  <span className='absolute right-full mr-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap'>
                    {section.label}
                  </span>
                )}

                {/* Indicateur actif pour le mode fixed */}
                {position === 'fixed' && activeSection === section.id && (
                  <span className='absolute inset-0 rounded-full ring-2 ring-blue-300 ring-opacity-50 animate-pulse' />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Indicateur de progression pour le mode fixed */}
      {position === 'fixed' && (
        <div className='mt-4 w-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
          <div
            className='w-full bg-gradient-to-b from-blue-500 to-green-500 transition-all duration-300 ease-out'
            style={{
              height: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%`,
            }}
          />
        </div>
      )}
    </nav>
  );
};

/**
 * Hook personnalisé pour la navigation par sections
 */
export const useSectionNavigation = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return {
    scrollToSection,
    scrollToTop,
  };
};

export default SectionNavigation;
