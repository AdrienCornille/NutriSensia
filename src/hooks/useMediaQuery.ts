import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour détecter les media queries
 * Utile pour désactiver certaines animations sur mobile
 *
 * @param query - La media query à tester (ex: '(max-width: 768px)')
 * @returns boolean - true si la media query correspond
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Vérifier si window est disponible (SSR)
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);

    // Mettre à jour l'état initial
    setMatches(media.matches);

    // Créer le listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Ajouter le listener (compatible avec les anciennes et nouvelles API)
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback pour les vieux navigateurs
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}
