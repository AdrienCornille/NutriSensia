'use client';

import { useState, useEffect, useCallback } from 'react';

// Types pour les thèmes
export type Theme = 'light' | 'dark' | 'auto';
export type ThemeMode = 'light' | 'dark';

// Types pour les préférences de thème
export interface ThemePreferences {
  theme: Theme;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  accessibility?: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
  };
}

// Configuration des thèmes
const THEME_CONFIG = {
  light: {
    name: 'Clair',
    icon: '☀️',
    description: 'Thème clair par défaut',
  },
  dark: {
    name: 'Sombre',
    icon: '🌙',
    description: 'Thème sombre pour les environnements peu éclairés',
  },
  auto: {
    name: 'Automatique',
    icon: '🔄',
    description: 'Suit les préférences système',
  },
} as const;

// Clés de stockage
const STORAGE_KEYS = {
  theme: 'nutrisensia-theme',
  preferences: 'nutrisensia-theme-preferences',
} as const;

export function useTheme() {
  // État du thème sélectionné
  const [theme, setTheme] = useState<Theme>('auto');

  // État du mode actuel (light/dark)
  const [mode, setMode] = useState<ThemeMode>('light');

  // État de chargement
  const [isLoading, setIsLoading] = useState(true);

  // État des préférences personnalisées
  const [preferences, setPreferences] = useState<ThemePreferences>({
    theme: 'auto',
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
    },
  });

  // Détection du mode système
  const getSystemTheme = useCallback((): ThemeMode => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, []);

  // Application du thème au DOM
  const applyTheme = useCallback((newMode: ThemeMode) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Suppression des classes existantes
    root.classList.remove('light', 'dark');

    // Application de la nouvelle classe
    root.classList.add(newMode);

    // Mise à jour de l'attribut data-theme pour l'accessibilité
    root.setAttribute('data-theme', newMode);

    // Mise à jour du mode actuel
    setMode(newMode);
  }, []);

  // Calcul du mode effectif
  const getEffectiveMode = useCallback(
    (selectedTheme: Theme): ThemeMode => {
      if (selectedTheme === 'auto') {
        return getSystemTheme();
      }
      return selectedTheme;
    },
    [getSystemTheme]
  );

  // Changement de thème
  const changeTheme = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme);

      // Calcul du mode effectif
      const effectiveMode = getEffectiveMode(newTheme);
      applyTheme(effectiveMode);

      // Sauvegarde dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.theme, newTheme);
      }
    },
    [getEffectiveMode, applyTheme]
  );

  // Mise à jour des préférences
  const updatePreferences = useCallback(
    (newPreferences: Partial<ThemePreferences>) => {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      // Sauvegarde dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEYS.preferences,
          JSON.stringify(updatedPreferences)
        );
      }

      // Application des préférences d'accessibilité
      if (newPreferences.accessibility) {
        const root = document.documentElement;

        if (newPreferences.accessibility.highContrast) {
          root.classList.add('high-contrast');
        } else {
          root.classList.remove('high-contrast');
        }

        if (newPreferences.accessibility.reducedMotion) {
          root.classList.add('reduced-motion');
        } else {
          root.classList.remove('reduced-motion');
        }

        if (newPreferences.accessibility.largeText) {
          root.classList.add('large-text');
        } else {
          root.classList.remove('large-text');
        }
      }
    },
    [preferences]
  );

  // Chargement des préférences depuis localStorage
  const loadPreferences = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // Chargement du thème
      const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) as Theme;
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setTheme(savedTheme);
      }

      // Chargement des préférences
      const savedPreferences = localStorage.getItem(STORAGE_KEYS.preferences);
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
      }
    } catch (error) {
      console.warn(
        'Erreur lors du chargement des préférences de thème:',
        error
      );
    }
  }, []);

  // Écouteur pour les changements de préférences système
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'auto') {
        const newMode = getSystemTheme();
        applyTheme(newMode);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, getSystemTheme, applyTheme]);

  // Initialisation au montage
  useEffect(() => {
    loadPreferences();

    // Application du thème initial
    const effectiveMode = getEffectiveMode(theme);
    applyTheme(effectiveMode);

    setIsLoading(false);
  }, [loadPreferences, getEffectiveMode, applyTheme, theme]);

  // Fonctions utilitaires
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  }, [theme, changeTheme]);

  const isDark = mode === 'dark';
  const isLight = mode === 'light';
  const isAuto = theme === 'auto';

  return {
    // État
    theme,
    mode,
    isLoading,
    preferences,

    // Actions
    changeTheme,
    toggleTheme,
    updatePreferences,

    // Utilitaires
    isDark,
    isLight,
    isAuto,
    getSystemTheme,

    // Configuration
    themeConfig: THEME_CONFIG,
  };
}
