import React from 'react';
import { cn } from '@/lib/utils';

export interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  colsSm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  colsMd?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  colsLg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  colsXl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gapX?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gapY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant Grid responsive avec système de colonnes flexible
 *
 * @param cols - Nombre de colonnes par défaut (mobile)
 * @param colsSm - Colonnes pour breakpoint sm (640px+)
 * @param colsMd - Colonnes pour breakpoint md (768px+)
 * @param colsLg - Colonnes pour breakpoint lg (1024px+)
 * @param colsXl - Colonnes pour breakpoint xl (1280px+)
 *
 * @param gap - Espacement uniforme entre les éléments
 * @param gapX - Espacement horizontal uniquement
 * @param gapY - Espacement vertical uniquement
 */
export function Grid({
  children,
  className,
  cols = 1,
  colsSm,
  colsMd,
  colsLg,
  colsXl,
  gap = 'md',
  gapX,
  gapY,
  as: Component = 'div',
  ...props
}: GridProps) {
  const getColsClass = (breakpoint: string, cols?: number) => {
    if (!cols) return '';
    return `${breakpoint}:grid-cols-${cols}`;
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-8dp',
    md: 'gap-16dp',
    lg: 'gap-24dp',
    xl: 'gap-32dp',
  };

  const gapXClasses = {
    none: 'gap-x-0',
    sm: 'gap-x-8dp',
    md: 'gap-x-16dp',
    lg: 'gap-x-24dp',
    xl: 'gap-x-32dp',
  };

  const gapYClasses = {
    none: 'gap-y-0',
    sm: 'gap-y-8dp',
    md: 'gap-y-16dp',
    lg: 'gap-y-24dp',
    xl: 'gap-y-32dp',
  };

  const gridClasses = [
    'grid',
    `grid-cols-${cols}`,
    getColsClass('sm', colsSm),
    getColsClass('md', colsMd),
    getColsClass('lg', colsLg),
    getColsClass('xl', colsXl),
    gapX ? gapXClasses[gapX] : gapClasses[gap],
    gapY && gapYClasses[gapY],
  ].filter(Boolean);

  return (
    <Component className={cn(gridClasses, className)} {...props}>
      {children}
    </Component>
  );
}

export interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  spanSm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  spanMd?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  spanLg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  spanXl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant GridItem pour définir l'étendue des éléments dans la grille
 */
export function GridItem({
  children,
  className,
  span = 1,
  spanSm,
  spanMd,
  spanLg,
  spanXl,
  as: Component = 'div',
  ...props
}: GridItemProps) {
  const getSpanClass = (breakpoint: string, span?: number) => {
    if (!span) return '';
    return `${breakpoint}:col-span-${span}`;
  };

  const spanClasses = [
    `col-span-${span}`,
    getSpanClass('sm', spanSm),
    getSpanClass('md', spanMd),
    getSpanClass('lg', spanLg),
    getSpanClass('xl', spanXl),
  ].filter(Boolean);

  return (
    <Component className={cn(spanClasses, className)} {...props}>
      {children}
    </Component>
  );
}

export default Grid;
