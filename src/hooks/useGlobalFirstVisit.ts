'use client';

import { useState, useEffect, useRef } from 'react';

const SESSION_KEY = 'nutrisensia_site_visited';

interface GlobalFirstVisitResult {
  /** true si c'est la première visite du SITE dans cette session */
  isFirstVisit: boolean;
  /** true une fois que la vérification est terminée */
  isReady: boolean;
}

// Variable au niveau du module - partagée entre TOUS les composants
let globalIsFirstVisit: boolean | null = null;
let hasWrittenToStorage = false;

/**
 * Hook pour détecter si c'est la première visite du SITE dans cette session.
 *
 * Utilise sessionStorage pour persister l'état pendant la navigation.
 * Les animations d'entrée s'exécutent UNIQUEMENT à la première visite du site,
 * PAS lors des navigations internes.
 *
 * Comportement :
 * - Première visite sur n'importe quelle page → animations
 * - Navigation vers une autre page → PAS d'animations
 * - Retour sur la page d'origine → PAS d'animations
 * - Nouvelle session navigateur → animations
 *
 * À UTILISER POUR : Header, Footer, et autres éléments de layout persistants
 *
 * @returns {GlobalFirstVisitResult} Objet avec isFirstVisit et isReady
 */
export function useGlobalFirstVisit(): GlobalFirstVisitResult {
  // Lecture synchrone de sessionStorage au premier rendu (côté client uniquement)
  if (globalIsFirstVisit === null && typeof window !== 'undefined') {
    try {
      const hasVisited = sessionStorage.getItem(SESSION_KEY);
      globalIsFirstVisit = !hasVisited;
    } catch {
      globalIsFirstVisit = false;
    }
  }

  // Capturer la valeur au montage - reste stable pour la vie du composant
  const capturedValueRef = useRef<boolean | null>(null);
  if (capturedValueRef.current === null) {
    capturedValueRef.current = globalIsFirstVisit ?? false;
  }

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Écrire dans sessionStorage après le premier rendu
    if (!hasWrittenToStorage && globalIsFirstVisit === true) {
      try {
        sessionStorage.setItem(SESSION_KEY, 'true');
        hasWrittenToStorage = true;
      } catch {
        // Ignorer
      }
    }

    // Mettre globalIsFirstVisit à false pour les navigations futures
    if (globalIsFirstVisit === true) {
      globalIsFirstVisit = false;
    }

    setIsReady(true);
  }, []);

  return {
    isFirstVisit: capturedValueRef.current ?? false,
    isReady,
  };
}
