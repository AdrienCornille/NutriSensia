import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

/**
 * Composant Typography pour le Design System 2025
 *
 * Ce composant applique automatiquement les polices, tailles et couleurs
 * selon les spécifications du design system.
 */

// Titre principal H1
export function H1({
  children,
  className = '',
  as: Component = 'h1',
}: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-heading text-h1 text-text font-bold',
        'leading-tight tracking-tight',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Titre secondaire H2
export function H2({
  children,
  className = '',
  as: Component = 'h2',
}: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-heading text-h2 text-text font-bold',
        'leading-tight tracking-tight',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Titre tertiaire H3
export function H3({
  children,
  className = '',
  as: Component = 'h3',
}: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-heading text-h3 text-text font-semibold',
        'leading-tight tracking-tight',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Titre quaternaire H4
export function H4({
  children,
  className = '',
  as: Component = 'h4',
}: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-heading text-xl text-text font-semibold',
        'leading-tight tracking-tight',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Paragraphe principal
export function P({
  children,
  className = '',
  as: Component = 'p',
}: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-sans text-body text-text',
        'leading-relaxed',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Paragraphe large
export function PLarge({
  children,
  className = '',
  as: Component = 'p',
}: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-sans text-body-large text-text',
        'leading-relaxed',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Paragraphe petit
export function PSmall({
  children,
  className = '',
  as: Component = 'p',
}: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-sans text-body-small text-text-light',
        'leading-relaxed',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Texte d'accent
export function AccentText({
  children,
  className = '',
  as: Component = 'span',
}: TypographyProps) {
  return (
    <Component className={cn('font-sans text-accent font-medium', className)}>
      {children}
    </Component>
  );
}

// Texte de label
export function Label({
  children,
  className = '',
  as: Component = 'label',
}: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-sans text-label text-text font-medium',
        'uppercase tracking-wide',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Texte de caption
export function Caption({
  children,
  className = '',
  as: Component = 'span',
}: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-sans text-caption text-text-light',
        'uppercase tracking-wider',
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * Composant Lead pour les textes d'introduction
 */
export function Lead({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'font-sans text-xl text-text-light',
        'leading-relaxed font-medium',
        'max-w-3xl',
        className
      )}
    >
      {children}
    </p>
  );
}

/**
 * Composant Blockquote pour les citations
 */
export function Blockquote({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <blockquote
      className={cn(
        'border-l-4 border-primary pl-6 py-4',
        'font-sans text-lg text-text-light italic',
        'bg-background-light rounded-r-lg',
        className
      )}
    >
      {children}
    </blockquote>
  );
}
