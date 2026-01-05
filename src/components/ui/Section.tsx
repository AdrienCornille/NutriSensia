import { ReactNode } from 'react';
import { ScrollAnimation } from './ScrollAnimation';

interface SectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideInRight' | 'scaleIn';
  delay?: number;
  id?: string;
  background?: 'default' | 'secondary' | 'accent' | 'white';
}

/**
 * Composant Section pour le Design System 2025
 *
 * Ce composant applique automatiquement le système d'espacement,
 * les couleurs de fond et les animations de scroll selon les spécifications.
 *
 * @param children - Contenu de la section
 * @param className - Classes CSS supplémentaires
 * @param animation - Type d'animation de scroll
 * @param delay - Délai avant l'animation
 * @param id - ID de la section pour la navigation
 * @param background - Couleur de fond de la section
 */
export function Section({
  children,
  className = '',
  animation = 'fadeIn',
  delay = 0,
  id,
  background = 'default',
}: SectionProps) {
  const getBackgroundClass = () => {
    switch (background) {
      case 'secondary':
        return 'bg-secondary';
      case 'accent':
        return 'bg-accent';
      case 'white':
        return 'bg-background-white';
      default:
        return 'bg-background';
    }
  };

  return (
    <section
      id={id}
      className={`section-padding ${getBackgroundClass()} ${className}`}
    >
      <div className='container-max-width'>
        <ScrollAnimation animation={animation} delay={delay}>
          {children}
        </ScrollAnimation>
      </div>
    </section>
  );
}

/**
 * Composant Container pour le contenu principal
 *
 * Applique automatiquement la largeur maximale et le centrage
 * selon les spécifications du design system.
 */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`container-max-width ${className}`}>{children}</div>;
}

/**
 * Composant Grid pour les layouts en grille
 *
 * Applique automatiquement l'espacement de grille selon les spécifications.
 */
export function Grid({
  children,
  className = '',
  cols = 1,
  gap = 'default',
}: {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'default' | 'small' | 'large';
}) {
  const getGridCols = () => {
    switch (cols) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1';
    }
  };

  const getGapClass = () => {
    switch (gap) {
      case 'small':
        return 'gap-4';
      case 'large':
        return 'gap-16';
      default:
        return 'grid-gap'; // 40px selon les spécifications
    }
  };

  return (
    <div className={`grid ${getGridCols()} ${getGapClass()} ${className}`}>
      {children}
    </div>
  );
}
