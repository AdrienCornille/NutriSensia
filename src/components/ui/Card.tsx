'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Variantes de cartes disponibles selon le design system NutriSensia
 */
export type CardVariant = 'primary' | 'dashboard' | 'nutrition';

/**
 * Props du composant Card
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variante de la carte selon le design system
   */
  variant?: CardVariant;
  /**
   * Contenu de la carte
   */
  children: React.ReactNode;
  /**
   * État de chargement avec skeleton
   */
  loading?: boolean;
  /**
   * Carte cliquable
   */
  clickable?: boolean;
  /**
   * État de survol pour les cartes cliquables
   */
  hover?: boolean;
  /**
   * Ombre personnalisée
   */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Props du composant CardHeader
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Props du composant CardContent
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Props du composant CardFooter
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Composant Card réutilisable selon le design system NutriSensia
 *
 * @example
 * ```tsx
 * <Card variant="primary">
 *   <CardHeader>
 *     <h3>Titre de la carte</h3>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Contenu de la carte</p>
 *   </CardContent>
 * </Card>
 *
 * <Card variant="dashboard" clickable hover>
 *   <CardContent>
 *     <p>Carte cliquable avec effet de survol</p>
 *   </CardContent>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'primary',
      loading = false,
      clickable = false,
      hover = false,
      shadow = 'md',
      children,
      ...props
    },
    ref
  ) => {
    // Classes de base communes à toutes les cartes
    const baseClasses = [
      'bg-background-primary',
      'transition-all duration-standard ease-out',
      'focus:outline-none',
    ];

    // Classes spécifiques aux variantes
    const variantClasses = {
      primary: [
        'rounded-12dp',
        'shadow-card-primary',
        'border border-neutral-border',
      ],
      dashboard: [
        'rounded-16dp',
        'shadow-card-dashboard',
        'border border-neutral-border',
      ],
      nutrition: [
        'rounded-12dp',
        'bg-background-accent',
        'border border-secondary-sage',
      ],
    };

    // Classes pour les cartes cliquables
    const clickableClasses = clickable
      ? [
          'cursor-pointer',
          'focus:shadow-focus',
          'focus:ring-2 focus:ring-primary focus:ring-opacity-20',
        ]
      : [];

    // Classes pour l'effet de survol
    const hoverClasses = hover
      ? ['hover:shadow-lg', 'hover:scale-[1.02]', 'hover:border-primary']
      : [];

    // Classes pour les ombres personnalisées
    const shadowClasses = {
      none: [],
      sm: ['shadow-sm'],
      md: ['shadow-md'],
      lg: ['shadow-lg'],
    };

    // Classes pour l'état de chargement
    const loadingClasses = loading ? ['animate-pulse'] : [];

    // Combinaison de toutes les classes
    const cardClasses = cn(
      baseClasses,
      variantClasses[variant],
      clickableClasses,
      hoverClasses,
      shadowClasses[shadow],
      loadingClasses,
      className
    );

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {loading ? (
          <div className='p-20dp'>
            <div className='h-4 bg-neutral-light rounded-4dp mb-12dp animate-pulse' />
            <div className='h-3 bg-neutral-light rounded-4dp mb-8dp animate-pulse' />
            <div className='h-3 bg-neutral-light rounded-4dp w-2/3 animate-pulse' />
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Composant CardHeader pour l'en-tête de la carte
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-20dp pb-12dp', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Composant CardContent pour le contenu principal de la carte
 */
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-20dp', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

/**
 * Composant CardFooter pour le pied de page de la carte
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-20dp pt-12dp border-t border-neutral-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

/**
 * Composants de cartes pré-configurées pour un usage rapide
 */
export const PrimaryCard = React.forwardRef<
  HTMLDivElement,
  Omit<CardProps, 'variant'>
>((props, ref) => <Card ref={ref} variant='primary' {...props} />);
PrimaryCard.displayName = 'PrimaryCard';

export const DashboardCard = React.forwardRef<
  HTMLDivElement,
  Omit<CardProps, 'variant'>
>((props, ref) => <Card ref={ref} variant='dashboard' {...props} />);
DashboardCard.displayName = 'DashboardCard';

export const NutritionCard = React.forwardRef<
  HTMLDivElement,
  Omit<CardProps, 'variant'>
>((props, ref) => <Card ref={ref} variant='nutrition' {...props} />);
NutritionCard.displayName = 'NutritionCard';
