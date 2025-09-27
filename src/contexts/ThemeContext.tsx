'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme, Theme, ThemePreferences } from '@/hooks/useTheme';

// Interface du contexte
interface ThemeContextType {
  // État
  theme: Theme;
  mode: 'light' | 'dark';
  isLoading: boolean;
  preferences: ThemePreferences;

  // Actions
  changeTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  updatePreferences: (preferences: Partial<ThemePreferences>) => void;

  // Utilitaires
  isDark: boolean;
  isLight: boolean;
  isAuto: boolean;
  getSystemTheme: () => 'light' | 'dark';

  // Configuration
  themeConfig: {
    light: { name: string; icon: string; description: string };
    dark: { name: string; icon: string; description: string };
    auto: { name: string; icon: string; description: string };
  };
}

// Création du contexte
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Interface des props du provider
interface ThemeProviderProps {
  children: ReactNode;
}

// Provider du thème
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeData = useTheme();

  return (
    <ThemeContext.Provider value={themeData}>{children}</ThemeContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      "useThemeContext doit être utilisé à l'intérieur d'un ThemeProvider"
    );
  }

  return context;
}

// Hook de raccourci pour les cas d'usage courants
export function useThemeMode() {
  const { mode, isDark, isLight } = useThemeContext();
  return { mode, isDark, isLight };
}

// Hook pour les préférences d'accessibilité
export function useAccessibilityPreferences() {
  const { preferences, updatePreferences } = useThemeContext();
  return {
    preferences: preferences.accessibility,
    updateAccessibility: (
      accessibility: Partial<ThemePreferences['accessibility']>
    ) => {
      updatePreferences({
        accessibility: { ...preferences.accessibility, ...accessibility },
      });
    },
  };
}
