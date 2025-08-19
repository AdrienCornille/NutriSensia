'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Variantes de boutons disponibles selon le design system NutriSensia
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

/**
 * Tailles de boutons disponibles
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props du composant Button
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variante du bouton selon le design system
   */
  variant?: ButtonVariant;
  /**
   * Taille du bouton
   */
  size?: ButtonSize;
  /**
   * Contenu du bouton
   */
  children: React.ReactNode;
  /**
   * État de chargement
   */
  loading?: boolean;
  /**
   * Icône à afficher avant le texte
   */
  leftIcon?: React.ReactNode;
  /**
   * Icône à afficher après le texte
   */
  rightIcon?: React.ReactNode;
  /**
   * Bouton plein largeur
   */
  fullWidth?: boolean;
}

/**
 * Composant Button réutilisable selon le design system NutriSensia
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Mon Bouton
 * </Button>
 *
 * <Button variant="secondary" loading>
 *   Chargement...
 * </Button>
 *
 * <Button variant="ghost" leftIcon={<Icon />}>
 *   Avec Icône
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Classes de base communes à tous les boutons
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-medium text-button',
      'transition-all duration-standard ease-out',
      'focus:outline-none focus:shadow-focus',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95',
    ];

    // Classes spécifiques aux variantes
    const variantClasses = {
      primary: [
        'h-48dp bg-primary text-white',
        'rounded-8dp shadow-sm',
        'hover:bg-secondary hover:shadow-md',
        'focus:ring-2 focus:ring-primary focus:ring-opacity-20',
      ],
      secondary: [
        'h-48dp bg-transparent text-primary',
        'border-2 border-primary rounded-8dp',
        'hover:bg-primary hover:text-white',
        'focus:ring-2 focus:ring-primary focus:ring-opacity-20',
      ],
      ghost: [
        'h-44dp bg-transparent text-primary',
        'rounded-8dp',
        'hover:bg-secondary-pale',
        'focus:ring-2 focus:ring-primary focus:ring-opacity-20',
      ],
      destructive: [
        'h-48dp bg-functional-error text-white',
        'rounded-8dp shadow-sm',
        'hover:bg-red-600 hover:shadow-md',
        'focus:ring-2 focus:ring-functional-error focus:ring-opacity-20',
      ],
    };

    // Classes spécifiques aux tailles
    const sizeClasses = {
      sm: ['px-16dp py-8dp text-body-small'],
      md: ['px-24dp py-12dp text-button'],
      lg: ['px-32dp py-16dp text-body-large'],
    };

    // Classes pour la largeur
    const widthClasses = fullWidth ? ['w-full'] : [];

    // Classes pour l'état de chargement
    const loadingClasses = loading ? ['cursor-wait'] : [];

    // Combinaison de toutes les classes
    const buttonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClasses,
      loadingClasses,
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {/* Spinner de chargement */}
        {loading && (
          <svg
            className='animate-spin -ml-4dp mr-8dp h-5 w-5'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        )}

        {/* Icône gauche */}
        {!loading && leftIcon && (
          <span className='mr-8dp flex-shrink-0'>{leftIcon}</span>
        )}

        {/* Contenu du bouton */}
        <span className='flex items-center'>{children}</span>

        {/* Icône droite */}
        {!loading && rightIcon && (
          <span className='ml-8dp flex-shrink-0'>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Composants de boutons pré-configurés pour un usage rapide
 */
export const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant'>
>((props, ref) => <Button ref={ref} variant='primary' {...props} />);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant'>
>((props, ref) => <Button ref={ref} variant='secondary' {...props} />);
SecondaryButton.displayName = 'SecondaryButton';

export const GhostButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant'>
>((props, ref) => <Button ref={ref} variant='ghost' {...props} />);
GhostButton.displayName = 'GhostButton';

export const DestructiveButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant'>
>((props, ref) => <Button ref={ref} variant='destructive' {...props} />);
DestructiveButton.displayName = 'DestructiveButton';
