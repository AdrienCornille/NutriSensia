'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'nutrisensia_visited_pages';

interface FirstVisitResult {
  /** true si c'est la première visite de CETTE PAGE dans la session */
  isFirstVisit: boolean;
  /** true une fois que la vérification est terminée */
  isReady: boolean;
}

// Set des pages visitées au niveau du module - partagé entre TOUS les composants
let visitedPages: Set<string> | null = null;

/**
 * Hook pour détecter si c'est la première visite de l'utilisateur sur CETTE PAGE dans cette session.
 *
 * Utilise sessionStorage pour persister l'état pendant la navigation.
 * Les animations d'entrée s'exécutent à la PREMIÈRE visite de CHAQUE page.
 *
 * Comportement :
 * - Première visite sur /approche → animations
 * - Navigation vers / puis retour sur /approche → PAS d'animations
 * - Première visite sur / → animations
 * - Navigation vers /approche puis retour sur / → PAS d'animations
 *
 * IMPORTANT: Utilise usePathname() de Next.js pour obtenir le bon chemin
 * lors de la navigation client-side (window.location.pathname ne se met pas
 * à jour immédiatement lors des navigations internes).
 *
 * Chaque composant CAPTURE la valeur de isFirstVisit au moment de son
 * montage via un useRef. Ceci permet aux sections hors écran de toujours avoir
 * leurs animations quand elles deviennent visibles via useInView.
 *
 * @returns {FirstVisitResult} Objet avec isFirstVisit et isReady
 */
export function useFirstVisit(): FirstVisitResult {
  // Utiliser usePathname() de Next.js pour obtenir le chemin correct
  // lors de la navigation client-side (contrairement à window.location.pathname
  // qui ne se met pas à jour immédiatement)
  const pathname = usePathname();

  // Initialiser visitedPages depuis sessionStorage au premier accès
  if (visitedPages === null && typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      visitedPages = stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      visitedPages = new Set();
    }
  }

  // Déterminer si c'est la première visite sur CETTE page
  // Vérifié AVANT que useEffect ne marque la page comme visitée
  const isFirstVisitToPage =
    visitedPages !== null && pathname ? !visitedPages.has(pathname) : false;

  // CRUCIAL: Chaque composant capture la valeur au moment de son montage
  // Cette valeur reste stable même si visitedPages est mis à jour plus tard
  // Le ref est identifié par pathname pour se réinitialiser sur changement de page
  const capturedPathRef = useRef<string | null>(null);
  const capturedValueRef = useRef<boolean>(false);

  // Si le pathname change (navigation), réinitialiser la capture
  if (capturedPathRef.current !== pathname) {
    capturedPathRef.current = pathname;
    capturedValueRef.current = isFirstVisitToPage;
  }

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Marquer cette page comme visitée après le rendu initial
    if (visitedPages && pathname && !visitedPages.has(pathname)) {
      visitedPages.add(pathname);
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify([...visitedPages]));
      } catch {
        // Ignorer
      }
    }

    setIsReady(true);
  }, [pathname]);

  // Retourner la valeur CAPTURÉE, pas la valeur actuelle
  return {
    isFirstVisit: capturedValueRef.current,
    isReady,
  };
}
