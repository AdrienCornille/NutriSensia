'use client';

import { useEffect, useState } from 'react';

/**
 * Hook personnalisé pour gérer l'accessibilité
 */
export function useAccessibility() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isScreenReader, setIsScreenReader] = useState(false);

  useEffect(() => {
    // Détecter les préférences de mouvement réduit
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);

    // Détecter les préférences de contraste élevé
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(contrastQuery.matches);

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    contrastQuery.addEventListener('change', handleContrastChange);

    // Détecter si un lecteur d'écran est utilisé
    const detectScreenReader = () => {
      // Vérifier si l'utilisateur navigue avec le clavier
      let isKeyboardUser = false;

      document.addEventListener(
        'keydown',
        () => {
          isKeyboardUser = true;
        },
        { once: true }
      );

      // Vérifier les attributs ARIA
      const hasAriaLive = document.querySelector('[aria-live]') !== null;
      const hasAriaLabel = document.querySelector('[aria-label]') !== null;

      setIsScreenReader(isKeyboardUser || hasAriaLive || hasAriaLabel);
    };

    detectScreenReader();

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return {
    isReducedMotion,
    isHighContrast,
    isScreenReader,
  };
}

/**
 * Hook pour gérer le focus et la navigation clavier
 */
export function useKeyboardNavigation() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(
    null
  );

  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      setFocusedElement(event.target as HTMLElement);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Gérer la navigation par tabulation
      if (event.key === 'Tab') {
        // L'ordre de tabulation est géré par l'ordre du DOM
        // Assurez-vous que tous les éléments interactifs sont focusables
      }

      // Gérer la navigation par flèches
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        // Logique de navigation verticale
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        // Logique de navigation horizontale
      }

      // Gérer l'activation avec Entrée et Espace
      if (event.key === 'Enter' || event.key === ' ') {
        const target = event.target as HTMLElement;
        if (target.role === 'button' || target.tagName === 'BUTTON') {
          event.preventDefault();
          target.click();
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    focusedElement,
  };
}

/**
 * Hook pour gérer les annonces aux lecteurs d'écran
 */
export function useScreenReaderAnnouncements() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const announcement = {
      id: Date.now(),
      message,
      priority,
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Créer un élément temporaire pour l'annonce
    const announcementElement = document.createElement('div');
    announcementElement.setAttribute('aria-live', priority);
    announcementElement.setAttribute('aria-atomic', 'true');
    announcementElement.className = 'sr-only';
    announcementElement.textContent = message;

    document.body.appendChild(announcementElement);

    // Supprimer l'élément après l'annonce
    setTimeout(() => {
      document.body.removeChild(announcementElement);
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 1000);
  };

  const announceError = (message: string) => {
    announce(message, 'assertive');
  };

  const announceSuccess = (message: string) => {
    announce(message, 'polite');
  };

  const announceLoading = (message: string) => {
    announce(message, 'polite');
  };

  return {
    announcements,
    announce,
    announceError,
    announceSuccess,
    announceLoading,
  };
}

/**
 * Hook pour gérer les préférences d'accessibilité
 */
export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState({
    fontSize: 'medium', // small, medium, large
    lineHeight: 'normal', // tight, normal, loose
    colorScheme: 'auto', // light, dark, auto
    animations: true,
    focusIndicator: true,
  });

  const updatePreference = (key: keyof typeof preferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));

    // Sauvegarder dans localStorage
    localStorage.setItem(
      'accessibility-preferences',
      JSON.stringify({
        ...preferences,
        [key]: value,
      })
    );
  };

  useEffect(() => {
    // Charger les préférences depuis localStorage
    const saved = localStorage.getItem('accessibility-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des préférences d'accessibilité:",
          error
        );
      }
    }
  }, []);

  return {
    preferences,
    updatePreference,
  };
}
