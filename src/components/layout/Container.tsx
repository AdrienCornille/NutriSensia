import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'narrow' | 'wide';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant Container responsive pour structurer le contenu
 *
 * @param size - Taille du conteneur
 *   - sm: 640px (mobile)
 *   - md: 768px (tablet)
 *   - lg: 1024px (desktop)
 *   - xl: 1280px (large desktop)
 *   - full: 100% de la largeur
 *
 * @param variant - Variante du conteneur
 *   - default: Centré avec marges automatiques
 *   - narrow: Plus étroit pour le contenu focalisé
 *   - wide: Plus large pour les dashboards
 *
 * @param padding - Espacement interne
 *   - none: Aucun padding
 *   - sm: 16dp (1rem)
 *   - md: 24dp (1.5rem)
 *   - lg: 32dp (2rem)
 *   - xl: 48dp (3rem)
 */
export function Container({
  children,
  className,
  size = 'lg',
  variant = 'default',
  padding = 'md',
  as: Component = 'div',
  ...props
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  const variantClasses = {
    default: 'mx-auto',
    narrow: 'mx-auto max-w-2xl',
    wide: 'mx-auto max-w-7xl',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-16dp',
    md: 'px-24dp',
    lg: 'px-32dp',
    xl: 'px-48dp',
  };

  return (
    <Component
      className={cn(
        'w-full',
        sizeClasses[size],
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Container;
