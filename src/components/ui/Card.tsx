import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

/**
 * Composant Card pour le Design System 2025
 *
 * Ce composant applique automatiquement les styles, ombres et animations
 * selon les spécifications du design system.
 *
 * @param children - Contenu de la carte
 * @param className - Classes CSS supplémentaires
 * @param variant - Style de la carte (default, elevated, outlined, glass)
 * @param padding - Espacement interne (none, sm, md, lg)
 * @param hover - Effet de survol
 */
export function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
}: CardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'shadow-lg';
      case 'outlined':
        return 'border-2 border-neutral-border shadow-none';
      case 'glass':
        return 'backdrop-blur-md bg-white/80 border border-white/20 shadow-glass';
      default:
        return 'shadow-card-primary'; // 0 4px 20px rgba(0,0,0,0.08)
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return 'p-0';
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  return (
    <div
      className={cn(
        // Classes de base du design system
        'card-component',
        'bg-background-white',
        'rounded-12dp', // 12px border radius pour les cartes
        'transition-all duration-300 ease',
        getVariantClasses(),
        getPaddingClasses(),
        hover && 'hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Composant CardHeader pour l'en-tête d'une carte
 */
export function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

/**
 * Composant CardContent pour le contenu d'une carte
 */
export function CardContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

/**
 * Composant CardFooter pour le pied d'une carte
 */
export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-neutral-border', className)}>
      {children}
    </div>
  );
}

/**
 * Composant CardTitle pour le titre d'une carte
 */
export function CardTitle({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn('font-heading text-h3 text-text font-semibold', className)}
    >
      {children}
    </h3>
  );
}

/**
 * Composant CardDescription pour la description d'une carte
 */
export function CardDescription({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-body text-text-light', className)}>{children}</p>
  );
}
