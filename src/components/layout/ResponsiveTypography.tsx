import React from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveHeadingProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?:
    | 'primary'
    | 'secondary'
    | 'neutral'
    | 'accent'
    | 'success'
    | 'error'
    | 'warning'
    | 'info';
  align?: 'left' | 'center' | 'right' | 'justify';
  responsive?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant Heading responsive avec tailles adaptatives
 *
 * Système de typographie NutriSensia :
 * - H1: 32px/40px, Bold, Letter spacing -0.3px
 * - H2: 28px/36px, Bold, Letter spacing -0.2px
 * - H3: 24px/32px, Semibold, Letter spacing -0.1px
 * - H4: 20px/28px, Semibold, Letter spacing 0px
 *
 * @param level - Niveau de titre (1-4)
 * @param size - Taille responsive
 * @param weight - Poids de la police
 * @param color - Couleur du texte
 * @param align - Alignement du texte
 * @param responsive - Tailles adaptatives selon les breakpoints
 */
export function ResponsiveHeading({
  children,
  className,
  level = 1,
  size,
  weight,
  color = 'neutral',
  align,
  responsive = false,
  as: Component = `h${level}` as keyof JSX.IntrinsicElements,
  ...props
}: ResponsiveHeadingProps) {
  const defaultSizes = {
    1: 'text-h1',
    2: 'text-h2',
    3: 'text-h3',
    4: 'text-h4',
  };

  const sizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
    '3xl': 'text-4xl',
    '4xl': 'text-5xl',
  };

  const responsiveSizes = {
    xs: { sm: 'text-base', md: 'text-lg', lg: 'text-xl' },
    sm: { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' },
    md: { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl' },
    lg: { sm: 'text-2xl', md: 'text-3xl', lg: 'text-4xl' },
    xl: { sm: 'text-3xl', md: 'text-4xl', lg: 'text-5xl' },
    '2xl': { sm: 'text-4xl', md: 'text-5xl', lg: 'text-6xl' },
    '3xl': { sm: 'text-5xl', md: 'text-6xl', lg: 'text-7xl' },
    '4xl': { sm: 'text-6xl', md: 'text-7xl', lg: 'text-8xl' },
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    neutral: 'text-neutral-dark',
    accent: 'text-accent-teal',
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-info',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const getSizeClass = () => {
    if (size && responsive) {
      const responsiveSize = responsiveSizes[size];
      return `${sizeClasses[size]} sm:${responsiveSize.sm} md:${responsiveSize.md} lg:${responsiveSize.lg}`;
    }
    if (size) {
      return sizeClasses[size];
    }
    return defaultSizes[level];
  };

  const headingClasses = [
    getSizeClass(),
    weight && weightClasses[weight],
    colorClasses[color],
    align && alignClasses[align],
    'leading-tight tracking-tight',
  ].filter(Boolean);

  return (
    <Component className={cn(headingClasses, className)} {...props}>
      {children}
    </Component>
  );
}

export interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  variant?:
    | 'body'
    | 'body-large'
    | 'body-small'
    | 'caption'
    | 'button'
    | 'link'
    | 'label';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?:
    | 'primary'
    | 'secondary'
    | 'neutral'
    | 'accent'
    | 'success'
    | 'error'
    | 'warning'
    | 'info';
  align?: 'left' | 'center' | 'right' | 'justify';
  responsive?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant Text responsive pour le contenu de base
 *
 * Variantes de texte NutriSensia :
 * - Body Large: 18px/28px, Regular, Letter spacing 0px
 * - Body: 16px/24px, Regular, Letter spacing 0px
 * - Body Small: 14px/20px, Regular, Letter spacing 0.1px
 * - Caption: 12px/16px, Medium, Letter spacing 0.3px
 * - Button Text: 16px/24px, Medium, Letter spacing 0.2px
 * - Link Text: 16px/24px, Medium, Letter spacing 0px, Primary Green
 * - Label Text: 14px/20px, Medium, Letter spacing 0.1px
 */
export function ResponsiveText({
  children,
  className,
  variant = 'body',
  size,
  weight,
  color = 'neutral',
  align,
  responsive = false,
  as: Component = 'p',
  ...props
}: ResponsiveTextProps) {
  const variantClasses = {
    'body-large': 'text-body-large',
    body: 'text-body',
    'body-small': 'text-body-small',
    caption: 'text-caption',
    button: 'text-button',
    link: 'text-link text-primary hover:text-primary-dark underline',
    label: 'text-label',
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const responsiveSizes = {
    xs: { sm: 'text-sm', md: 'text-base', lg: 'text-lg' },
    sm: { sm: 'text-base', md: 'text-lg', lg: 'text-xl' },
    md: { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' },
    lg: { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl' },
    xl: { sm: 'text-2xl', md: 'text-3xl', lg: 'text-4xl' },
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    neutral: 'text-neutral-dark',
    accent: 'text-accent-teal',
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-info',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const getSizeClass = () => {
    if (size && responsive) {
      const responsiveSize = responsiveSizes[size];
      return `${sizeClasses[size]} sm:${responsiveSize.sm} md:${responsiveSize.md} lg:${responsiveSize.lg}`;
    }
    if (size) {
      return sizeClasses[size];
    }
    return variantClasses[variant];
  };

  const textClasses = [
    getSizeClass(),
    weight && weightClasses[weight],
    colorClasses[color],
    align && alignClasses[align],
    'leading-relaxed',
  ].filter(Boolean);

  return (
    <Component className={cn(textClasses, className)} {...props}>
      {children}
    </Component>
  );
}

export interface ResponsiveListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'ul' | 'ol';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  marker?:
    | 'disc'
    | 'circle'
    | 'square'
    | 'decimal'
    | 'lower-alpha'
    | 'upper-alpha';
  responsive?: boolean;
}

/**
 * Composant List responsive pour les listes ordonnées et non ordonnées
 */
export function ResponsiveList({
  children,
  className,
  variant = 'ul',
  spacing = 'md',
  marker = 'disc',
  responsive = false,
  ...props
}: ResponsiveListProps) {
  const spacingClasses = {
    none: 'space-y-0',
    xs: 'space-y-4dp',
    sm: 'space-y-8dp',
    md: 'space-y-16dp',
    lg: 'space-y-24dp',
  };

  const responsiveSpacing = {
    none: { sm: 'space-y-0', md: 'space-y-0', lg: 'space-y-0' },
    xs: { sm: 'space-y-6dp', md: 'space-y-8dp', lg: 'space-y-12dp' },
    sm: { sm: 'space-y-8dp', md: 'space-y-12dp', lg: 'space-y-16dp' },
    md: { sm: 'space-y-12dp', md: 'space-y-16dp', lg: 'space-y-24dp' },
    lg: { sm: 'space-y-16dp', md: 'space-y-24dp', lg: 'space-y-32dp' },
  };

  const markerClasses = {
    disc: 'list-disc',
    circle: 'list-circle',
    square: 'list-square',
    decimal: 'list-decimal',
    'lower-alpha': 'list-lower-alpha',
    'upper-alpha': 'list-upper-alpha',
  };

  const getSpacingClass = () => {
    if (responsive) {
      const responsiveSpacingClass = responsiveSpacing[spacing];
      return `${spacingClasses[spacing]} sm:${responsiveSpacingClass.sm} md:${responsiveSpacingClass.md} lg:${responsiveSpacingClass.lg}`;
    }
    return spacingClasses[spacing];
  };

  const listClasses = [getSpacingClass(), markerClasses[marker], 'pl-24dp'];

  const Component = variant;

  return (
    <Component className={cn(listClasses, className)} {...props}>
      {children}
    </Component>
  );
}

export default ResponsiveTypography;
