import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Liste de toutes les locales supportées
  // Français (Suisse) comme langue principale, puis anglais
  locales: ['fr', 'en'],

  // Utilisé quand aucune locale ne correspond
  defaultLocale: 'fr',

  // Configuration des chemins localisés
  // 'as-needed' signifie que le préfixe de locale est omis pour la langue par défaut (français)
  // Exemple: /about pour français, /en/about pour anglais
  localePrefix: 'as-needed',

  // Chemins localisés pour différentes pages
  pathnames: {
    // Pages communes avec les mêmes chemins
    '/': '/',
    '/contact': '/contact',
    '/blog': '/blog',
    '/auth/login': '/auth/login',
    '/auth/register': '/auth/register',
    '/auth/forgot-password': '/auth/forgot-password',
    '/profile': '/profile',
    '/settings': '/settings',
    '/onboarding': '/onboarding',
    '/dashboard': '/dashboard',

    // Pages avec chemins différents selon la langue
    '/about': {
      fr: '/a-propos',
      en: '/about',
    },
    '/services': {
      fr: '/services',
      en: '/services',
    },
    '/pricing': {
      fr: '/tarifs',
      en: '/pricing',
    },
    '/nutrition': {
      fr: '/nutrition',
      en: '/nutrition',
    },
    '/calorie-calculator': {
      fr: '/calculateur-calories',
      en: '/calorie-calculator',
    },

    // Pages blog avec segments dynamiques
    '/blog/[slug]': {
      fr: '/blog/[slug]',
      en: '/blog/[slug]',
    },

    // Pages d'administration
    '/admin': '/admin',
    '/admin/dashboard': '/admin/dashboard',
    '/admin/users': '/admin/users',
    '/admin/analytics': '/admin/analytics',
  },
});
