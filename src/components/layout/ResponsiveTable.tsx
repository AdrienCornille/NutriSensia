import React from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'striped' | 'bordered' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  responsive?: 'scroll' | 'stack' | 'cards';
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant Table responsive avec différentes stratégies d'adaptation
 *
 * @param variant - Style du tableau
 *   - default: Style standard
 *   - striped: Lignes alternées
 *   - bordered: Bordures complètes
 *   - compact: Espacement réduit
 *
 * @param size - Taille du tableau
 *   - sm: Espacement compact
 *   - md: Espacement standard
 *   - lg: Espacement large
 *
 * @param responsive - Stratégie d'adaptation mobile
 *   - scroll: Défilement horizontal
 *   - stack: Empilement vertical
 *   - cards: Transformation en cartes
 */
export function ResponsiveTable({
  children,
  className,
  variant = 'default',
  size = 'md',
  responsive = 'scroll',
  as: Component = 'table',
  ...props
}: ResponsiveTableProps) {
  const variantClasses = {
    default: 'w-full',
    striped: 'w-full [&>tbody>tr:nth-child(odd)]:bg-background-secondary',
    bordered: 'w-full border border-neutral-border',
    compact: 'w-full',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const responsiveClasses = {
    scroll: 'overflow-x-auto',
    stack: 'block lg:table',
    cards: 'block lg:table',
  };

  const tableClasses = [
    variantClasses[variant],
    sizeClasses[size],
    responsiveClasses[responsive],
    className,
  ];

  return (
    <div className={cn(responsiveClasses[responsive])}>
      <Component className={cn(tableClasses)} {...props}>
        {children}
      </Component>
    </div>
  );
}

export interface ResponsiveTableHeadProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered';
}

/**
 * En-tête de tableau responsive
 */
export function ResponsiveTableHead({
  children,
  className,
  variant = 'default',
  ...props
}: ResponsiveTableHeadProps) {
  const variantClasses = {
    default: 'bg-background-secondary',
    bordered: 'bg-background-secondary border-b border-neutral-border',
  };

  return (
    <thead
      className={cn(
        variantClasses[variant],
        'lg:table-header-group hidden lg:table-row',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export interface ResponsiveTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Corps de tableau responsive
 */
export function ResponsiveTableBody({
  children,
  className,
  ...props
}: ResponsiveTableBodyProps) {
  return (
    <tbody className={cn('lg:table-row-group', className)} {...props}>
      {children}
    </tbody>
  );
}

export interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'selected';
  responsive?: 'scroll' | 'stack' | 'cards';
}

/**
 * Ligne de tableau responsive
 */
export function ResponsiveTableRow({
  children,
  className,
  variant = 'default',
  responsive = 'scroll',
  ...props
}: ResponsiveTableRowProps) {
  const variantClasses = {
    default: '',
    hover: 'hover:bg-background-accent transition-colors duration-200',
    selected: 'bg-primary bg-opacity-10',
  };

  const responsiveClasses = {
    scroll: 'lg:table-row',
    stack: 'block lg:table-row',
    cards: 'block lg:table-row',
  };

  return (
    <tr
      className={cn(
        variantClasses[variant],
        responsiveClasses[responsive],
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'header' | 'data';
  responsive?: 'scroll' | 'stack' | 'cards';
  label?: string; // Pour les cartes responsive
}

/**
 * Cellule de tableau responsive
 */
export function ResponsiveTableCell({
  children,
  className,
  variant = 'data',
  responsive = 'scroll',
  label,
  ...props
}: ResponsiveTableCellProps) {
  const variantClasses = {
    header: 'font-semibold text-neutral-dark bg-background-secondary',
    data: 'text-neutral-dark',
  };

  const responsiveClasses = {
    scroll: 'lg:table-cell',
    stack:
      'block lg:table-cell before:content-[attr(data-label)] before:font-semibold before:mr-8dp lg:before:content-none',
    cards: 'block lg:table-cell',
  };

  const cardClasses =
    responsive === 'cards'
      ? 'p-16dp border-b border-neutral-border last:border-b-0'
      : '';

  return (
    <td
      className={cn(
        variantClasses[variant],
        responsiveClasses[responsive],
        cardClasses,
        'p-12dp',
        className
      )}
      data-label={label}
      {...props}
    >
      {children}
    </td>
  );
}

export interface ResponsiveTableCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'selected';
}

/**
 * Carte de tableau pour l'adaptation mobile
 */
export function ResponsiveTableCard({
  children,
  className,
  variant = 'default',
  ...props
}: ResponsiveTableCardProps) {
  const variantClasses = {
    default: 'bg-background-primary border border-neutral-border rounded-8dp',
    hover:
      'bg-background-primary border border-neutral-border rounded-8dp hover:bg-background-accent transition-colors duration-200',
    selected: 'bg-primary bg-opacity-10 border border-primary rounded-8dp',
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        'p-16dp mb-16dp lg:hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ResponsiveTableContainerProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  stickyHeader?: boolean;
}

/**
 * Conteneur de tableau avec options avancées
 */
export function ResponsiveTableContainer({
  children,
  className,
  maxHeight,
  stickyHeader = false,
  ...props
}: ResponsiveTableContainerProps) {
  const containerClasses = [
    'relative',
    maxHeight && `max-h-${maxHeight}`,
    stickyHeader && 'overflow-auto',
    className,
  ].filter(Boolean);

  return (
    <div className={cn(containerClasses)} {...props}>
      {children}
    </div>
  );
}

export default ResponsiveTable;
