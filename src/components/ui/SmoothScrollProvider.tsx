'use client';

import React, { ReactNode } from 'react';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

interface SmoothScrollProviderProps {
  children: ReactNode;
  /**
   * Durée de l'animation de scroll (en secondes)
   * @default 1.2
   */
  duration?: number;
  /**
   * Active le smooth scrolling
   * @default true
   */
  smooth?: boolean;
  /**
   * Active le smooth scrolling sur mobile/tactile
   * @default false (pour éviter les conflits avec le scroll natif mobile)
   */
  smoothTouch?: boolean;
  /**
   * Fonction d'easing personnalisée
   */
  easing?: (t: number) => number;
  /**
   * Active le scroll infini (pour les pages one-page)
   * @default false
   */
  infinite?: boolean;
}

/**
 * Provider pour activer le smooth scrolling avec momentum sur toute une page
 *
 * Utilise Lenis pour créer un effet de scroll fluide similaire aux applications mobiles.
 * Le scroll devient plus naturel avec une inertie qui continue après le mouvement de la molette.
 */
export function SmoothScrollProvider({
  children,
  duration = 1.2,
  smooth = true,
  smoothTouch = false,
  easing,
  infinite = false,
}: SmoothScrollProviderProps) {
  // Active le smooth scrolling avec Lenis
  useSmoothScroll({
    duration,
    smooth,
    smoothTouch,
    easing,
    infinite,
  });

  // Le provider ne fait que wrapper les enfants
  // Le hook useSmoothScroll s'occupe de tout
  return <>{children}</>;
}

export default SmoothScrollProvider;
