import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Créer des wrappers légers autour des APIs de navigation Next.js
// qui prennent en compte la configuration de routage
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

// Types pour les paramètres de navigation
export type Locale = (typeof routing.locales)[number];
export type Pathnames = keyof typeof routing.pathnames;

// Utilitaires pour la navigation
export const navigation = {
  // Obtenir l'URL localisée pour un chemin donné
  getLocalizedPath: (pathname: string, locale: Locale) => {
    const pathnames = routing.pathnames as Record<string, any>;
    if (pathnames[pathname]) {
      const localizedPath = pathnames[pathname];
      if (typeof localizedPath === 'object') {
        return localizedPath[locale] || pathname;
      }
      return localizedPath;
    }
    return pathname;
  },

  // Vérifier si une locale est supportée
  isValidLocale: (locale: string): locale is Locale => {
    return routing.locales.includes(locale as Locale);
  },

  // Obtenir la locale par défaut
  getDefaultLocale: () => routing.defaultLocale,

  // Obtenir toutes les locales supportées
  getSupportedLocales: () => routing.locales,

  // Construire un lien alternatif pour une locale donnée
  getAlternateLink: (pathname: string, locale: Locale) => {
    const localizedPath = navigation.getLocalizedPath(pathname, locale);
    const prefix =
      locale === routing.defaultLocale && routing.localePrefix === 'as-needed'
        ? ''
        : `/${locale}`;
    return `${prefix}${localizedPath}`;
  },
};
