import React from 'react';
import { cn } from '@/lib/utils';

export interface SpacingProps {
  children?: React.ReactNode;
  className?: string;
  size?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  direction?: 'all' | 'x' | 'y' | 'top' | 'right' | 'bottom' | 'left';
  responsive?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant Spacing pour appliquer des marges et paddings responsive
 *
 * Système d'espacement NutriSensia :
 * - xs: 4dp (0.25rem)
 * - sm: 8dp (0.5rem)
 * - md: 16dp (1rem)
 * - lg: 24dp (1.5rem)
 * - xl: 32dp (2rem)
 * - 2xl: 48dp (3rem)
 * - 3xl: 64dp (4rem)
 *
 * @param size - Taille de l'espacement
 * @param direction - Direction de l'espacement
 *   - all: Toutes les directions
 *   - x: Horizontal uniquement
 *   - y: Vertical uniquement
 *   - top/right/bottom/left: Direction spécifique
 * @param responsive - Appliquer des espacements différents selon les breakpoints
 */
export function Spacing({
  children,
  className,
  size = 'md',
  direction = 'all',
  responsive = false,
  as: Component = 'div',
  ...props
}: SpacingProps) {
  const spacingSizes = {
    none: '0',
    xs: '4dp',
    sm: '8dp',
    md: '16dp',
    lg: '24dp',
    xl: '32dp',
    '2xl': '48dp',
    '3xl': '64dp',
  };

  const getSpacingClass = (
    size: string,
    direction: string,
    responsive: boolean
  ) => {
    const baseSize = spacingSizes[size as keyof typeof spacingSizes];

    if (!responsive) {
      switch (direction) {
        case 'all':
          return `p-${baseSize}`;
        case 'x':
          return `px-${baseSize}`;
        case 'y':
          return `py-${baseSize}`;
        case 'top':
          return `pt-${baseSize}`;
        case 'right':
          return `pr-${baseSize}`;
        case 'bottom':
          return `pb-${baseSize}`;
        case 'left':
          return `pl-${baseSize}`;
        default:
          return `p-${baseSize}`;
      }
    }

    // Espacement responsive avec breakpoints
    const responsiveSizes = {
      xs: { sm: '8dp', md: '12dp', lg: '16dp' },
      sm: { sm: '12dp', md: '16dp', lg: '24dp' },
      md: { sm: '16dp', md: '24dp', lg: '32dp' },
      lg: { sm: '24dp', md: '32dp', lg: '48dp' },
      xl: { sm: '32dp', md: '48dp', lg: '64dp' },
      '2xl': { sm: '48dp', md: '64dp', lg: '80dp' },
      '3xl': { sm: '64dp', md: '80dp', lg: '96dp' },
    };

    const responsiveSize =
      responsiveSizes[size as keyof typeof responsiveSizes];
    if (!responsiveSize) return `p-${baseSize}`;

    const classes = [];
    switch (direction) {
      case 'all':
        classes.push(
          `p-${baseSize}`,
          `sm:p-${responsiveSize.sm}`,
          `md:p-${responsiveSize.md}`,
          `lg:p-${responsiveSize.lg}`
        );
        break;
      case 'x':
        classes.push(
          `px-${baseSize}`,
          `sm:px-${responsiveSize.sm}`,
          `md:px-${responsiveSize.md}`,
          `lg:px-${responsiveSize.lg}`
        );
        break;
      case 'y':
        classes.push(
          `py-${baseSize}`,
          `sm:py-${responsiveSize.sm}`,
          `md:py-${responsiveSize.md}`,
          `lg:py-${responsiveSize.lg}`
        );
        break;
      case 'top':
        classes.push(
          `pt-${baseSize}`,
          `sm:pt-${responsiveSize.sm}`,
          `md:pt-${responsiveSize.md}`,
          `lg:pt-${responsiveSize.lg}`
        );
        break;
      case 'right':
        classes.push(
          `pr-${baseSize}`,
          `sm:pr-${responsiveSize.sm}`,
          `md:pr-${responsiveSize.md}`,
          `lg:pr-${responsiveSize.lg}`
        );
        break;
      case 'bottom':
        classes.push(
          `pb-${baseSize}`,
          `sm:pb-${responsiveSize.sm}`,
          `md:pb-${responsiveSize.md}`,
          `lg:pb-${responsiveSize.lg}`
        );
        break;
      case 'left':
        classes.push(
          `pl-${baseSize}`,
          `sm:pl-${responsiveSize.sm}`,
          `md:pl-${responsiveSize.md}`,
          `lg:pl-${responsiveSize.lg}`
        );
        break;
    }

    return classes.join(' ');
  };

  const spacingClass = getSpacingClass(size, direction, responsive);

  return (
    <Component className={cn(spacingClass, className)} {...props}>
      {children}
    </Component>
  );
}

export interface MarginProps {
  children?: React.ReactNode;
  className?: string;
  size?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  direction?: 'all' | 'x' | 'y' | 'top' | 'right' | 'bottom' | 'left';
  responsive?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant Margin pour appliquer des marges responsive
 */
export function Margin({
  children,
  className,
  size = 'md',
  direction = 'all',
  responsive = false,
  as: Component = 'div',
  ...props
}: MarginProps) {
  const spacingSizes = {
    none: '0',
    xs: '4dp',
    sm: '8dp',
    md: '16dp',
    lg: '24dp',
    xl: '32dp',
    '2xl': '48dp',
    '3xl': '64dp',
  };

  const getMarginClass = (
    size: string,
    direction: string,
    responsive: boolean
  ) => {
    const baseSize = spacingSizes[size as keyof typeof spacingSizes];

    if (!responsive) {
      switch (direction) {
        case 'all':
          return `m-${baseSize}`;
        case 'x':
          return `mx-${baseSize}`;
        case 'y':
          return `my-${baseSize}`;
        case 'top':
          return `mt-${baseSize}`;
        case 'right':
          return `mr-${baseSize}`;
        case 'bottom':
          return `mb-${baseSize}`;
        case 'left':
          return `ml-${baseSize}`;
        default:
          return `m-${baseSize}`;
      }
    }

    // Marges responsive avec breakpoints
    const responsiveSizes = {
      xs: { sm: '8dp', md: '12dp', lg: '16dp' },
      sm: { sm: '12dp', md: '16dp', lg: '24dp' },
      md: { sm: '16dp', md: '24dp', lg: '32dp' },
      lg: { sm: '24dp', md: '32dp', lg: '48dp' },
      xl: { sm: '32dp', md: '48dp', lg: '64dp' },
      '2xl': { sm: '48dp', md: '64dp', lg: '80dp' },
      '3xl': { sm: '64dp', md: '80dp', lg: '96dp' },
    };

    const responsiveSize =
      responsiveSizes[size as keyof typeof responsiveSizes];
    if (!responsiveSize) return `m-${baseSize}`;

    const classes = [];
    switch (direction) {
      case 'all':
        classes.push(
          `m-${baseSize}`,
          `sm:m-${responsiveSize.sm}`,
          `md:m-${responsiveSize.md}`,
          `lg:m-${responsiveSize.lg}`
        );
        break;
      case 'x':
        classes.push(
          `mx-${baseSize}`,
          `sm:mx-${responsiveSize.sm}`,
          `md:mx-${responsiveSize.md}`,
          `lg:mx-${responsiveSize.lg}`
        );
        break;
      case 'y':
        classes.push(
          `my-${baseSize}`,
          `sm:my-${responsiveSize.sm}`,
          `md:my-${responsiveSize.md}`,
          `lg:my-${responsiveSize.lg}`
        );
        break;
      case 'top':
        classes.push(
          `mt-${baseSize}`,
          `sm:mt-${responsiveSize.sm}`,
          `md:mt-${responsiveSize.md}`,
          `lg:mt-${responsiveSize.lg}`
        );
        break;
      case 'right':
        classes.push(
          `mr-${baseSize}`,
          `sm:mr-${responsiveSize.sm}`,
          `md:mr-${responsiveSize.md}`,
          `lg:mr-${responsiveSize.lg}`
        );
        break;
      case 'bottom':
        classes.push(
          `mb-${baseSize}`,
          `sm:mb-${responsiveSize.sm}`,
          `md:mb-${responsiveSize.md}`,
          `lg:mb-${responsiveSize.lg}`
        );
        break;
      case 'left':
        classes.push(
          `ml-${baseSize}`,
          `sm:ml-${responsiveSize.sm}`,
          `md:ml-${responsiveSize.md}`,
          `lg:ml-${responsiveSize.lg}`
        );
        break;
    }

    return classes.join(' ');
  };

  const marginClass = getMarginClass(size, direction, responsive);

  return (
    <Component className={cn(marginClass, className)} {...props}>
      {children}
    </Component>
  );
}

export interface StackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  direction?: 'vertical' | 'horizontal';
  responsive?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant Stack pour empiler des éléments avec espacement uniforme
 *
 * @param spacing - Espacement entre les éléments
 * @param direction - Direction de l'empilement
 *   - vertical: Empilement vertical (par défaut)
 *   - horizontal: Empilement horizontal
 * @param responsive - Espacement responsive selon les breakpoints
 */
export function Stack({
  children,
  className,
  spacing = 'md',
  direction = 'vertical',
  responsive = false,
  as: Component = 'div',
  ...props
}: StackProps) {
  const spacingSizes = {
    none: '0',
    xs: '4dp',
    sm: '8dp',
    md: '16dp',
    lg: '24dp',
    xl: '32dp',
    '2xl': '48dp',
    '3xl': '64dp',
  };

  const getStackClass = (
    spacing: string,
    direction: string,
    responsive: boolean
  ) => {
    const baseSize = spacingSizes[spacing as keyof typeof spacingSizes];

    if (!responsive) {
      return direction === 'vertical'
        ? `flex flex-col space-y-${baseSize}`
        : `flex flex-row space-x-${baseSize}`;
    }

    // Espacement responsive
    const responsiveSizes = {
      xs: { sm: '8dp', md: '12dp', lg: '16dp' },
      sm: { sm: '12dp', md: '16dp', lg: '24dp' },
      md: { sm: '16dp', md: '24dp', lg: '32dp' },
      lg: { sm: '24dp', md: '32dp', lg: '48dp' },
      xl: { sm: '32dp', md: '48dp', lg: '64dp' },
      '2xl': { sm: '48dp', md: '64dp', lg: '80dp' },
      '3xl': { sm: '64dp', md: '80dp', lg: '96dp' },
    };

    const responsiveSize =
      responsiveSizes[spacing as keyof typeof responsiveSizes];
    if (!responsiveSize) {
      return direction === 'vertical'
        ? `flex flex-col space-y-${baseSize}`
        : `flex flex-row space-x-${baseSize}`;
    }

    if (direction === 'vertical') {
      return `flex flex-col space-y-${baseSize} sm:space-y-${responsiveSize.sm} md:space-y-${responsiveSize.md} lg:space-y-${responsiveSize.lg}`;
    } else {
      return `flex flex-row space-x-${baseSize} sm:space-x-${responsiveSize.sm} md:space-x-${responsiveSize.md} lg:space-x-${responsiveSize.lg}`;
    }
  };

  const stackClass = getStackClass(spacing, direction, responsive);

  return (
    <Component className={cn(stackClass, className)} {...props}>
      {children}
    </Component>
  );
}

export default Spacing;
