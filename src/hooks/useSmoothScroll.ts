'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Hook pour implémenter un smooth scrolling avec momentum (effet mobile)
 * Utilise Lenis pour créer un scrolling fluide et naturel
 *
 * Ce hook remplace le comportement natif de scroll par un scroll avec inertie
 * qui crée une expérience similaire à celle d'une application mobile.
 *
 * @param options - Options de configuration pour Lenis
 * @returns Instance de Lenis (pour contrôle manuel si nécessaire)
 */
export function useSmoothScroll(options?: {
  duration?: number;
  easing?: (t: number) => number;
  smooth?: boolean;
  smoothTouch?: boolean;
  infinite?: boolean;
}) {
  useEffect(() => {
    // Désactiver Lenis en développement pour accélérer la compilation
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    // Créer une instance de Lenis avec les options par défaut
    const lenis = new Lenis({
      // Durée de l'animation (plus c'est élevé, plus c'est lent)
      duration: options?.duration ?? 1.2,

      // Fonction d'easing pour une courbe d'accélération naturelle
      easing:
        options?.easing ?? (t => Math.min(1, 1.001 - Math.pow(2, -10 * t))),

      // Active le smooth scrolling
      smooth: options?.smooth ?? true,

      // Active le smooth scrolling sur mobile (tactile)
      smoothTouch: options?.smoothTouch ?? false, // Désactivé par défaut pour éviter les conflits avec le scroll natif mobile

      // Désactive le scroll infini
      infinite: options?.infinite ?? false,

      // Direction du scroll (vertical par défaut)
      orientation: 'vertical' as const,

      // Désactive le scroll avec la molette sur les éléments gesturables
      gestureOrientation: 'vertical' as const,

      // Multiplicateur de la vélocité de la molette
      wheelMultiplier: 1,

      // Multiplicateur de la vélocité tactile
      touchMultiplier: 2,
    });

    // Fonction de mise à jour de Lenis (RAF - requestAnimationFrame)
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    // Démarrer la boucle d'animation
    requestAnimationFrame(raf);

    // Nettoyage lors du démontage du composant
    return () => {
      lenis.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Hook pour créer une instance Lenis avec contrôle manuel
 * Utile si vous avez besoin d'accéder aux méthodes de Lenis (scrollTo, stop, start, etc.)
 *
 * @param options - Options de configuration pour Lenis
 * @returns Instance de Lenis
 */
export function useLenis(options?: {
  duration?: number;
  easing?: (t: number) => number;
  smooth?: boolean;
  smoothTouch?: boolean;
  infinite?: boolean;
}) {
  useEffect(() => {
    // Désactiver Lenis en développement pour accélérer la compilation
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    // Créer une instance de Lenis
    const lenis = new Lenis({
      duration: options?.duration ?? 1.2,
      easing:
        options?.easing ?? (t => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      smooth: options?.smooth ?? true,
      smoothTouch: options?.smoothTouch ?? false,
      infinite: options?.infinite ?? false,
      orientation: 'vertical' as const,
      gestureOrientation: 'vertical' as const,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // RAF
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Stocker l'instance globalement pour un accès facile
    (window as any).lenis = lenis;

    return () => {
      lenis.destroy();
      delete (window as any).lenis;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Retourner l'instance depuis window (peut être null au premier render)
  return typeof window !== 'undefined' ? (window as any).lenis : null;
}

/**
 * Fonction utilitaire pour scroller vers un élément avec Lenis
 *
 * @param target - Sélecteur CSS, élément HTML, ou position numérique
 * @param options - Options de scroll (duration, offset, etc.)
 */
export function scrollToElement(
  target: string | HTMLElement | number,
  options?: {
    duration?: number;
    offset?: number;
    immediate?: boolean;
  }
) {
  const lenis = (window as any).lenis as Lenis | undefined;

  if (!lenis) {
    console.warn(
      'Lenis is not initialized. Make sure to use useSmoothScroll or useLenis hook.'
    );
    return;
  }

  lenis.scrollTo(target, {
    duration: options?.duration ?? 1.2,
    offset: options?.offset ?? 0,
    immediate: options?.immediate ?? false,
  });
}
