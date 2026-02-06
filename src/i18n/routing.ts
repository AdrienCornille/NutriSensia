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
    '/auth/signin': '/auth/signin',
    '/auth/signup': '/auth/signup',
    '/auth/confirm': '/auth/confirm',
    '/auth/callback': '/auth/callback',
    '/auth/welcome': '/auth/welcome',
    '/auth/forgot-password': '/auth/forgot-password',
    '/profile': '/profile',
    '/settings': '/settings',
    '/onboarding': '/onboarding',
    // Dashboard redirect
    '/dashboard': '/dashboard',

    // Patient dashboard routes
    '/dashboard/patient': '/dashboard/patient',
    '/dashboard/patient/agenda': '/dashboard/patient/agenda',
    '/dashboard/patient/dossier': '/dashboard/patient/dossier',
    '/dashboard/patient/plan': '/dashboard/patient/plan',
    '/dashboard/patient/repas': '/dashboard/patient/repas',
    '/dashboard/patient/suivi': '/dashboard/patient/suivi',
    '/dashboard/patient/notifications': '/dashboard/patient/notifications',
    '/dashboard/patient/profil': '/dashboard/patient/profil',
    '/dashboard/patient/recettes': '/dashboard/patient/recettes',
    '/dashboard/patient/aliments': '/dashboard/patient/aliments',
    '/dashboard/patient/messagerie': '/dashboard/patient/messagerie',
    '/dashboard/patient/contenu': '/dashboard/patient/contenu',

    // Nutritionist dashboard routes
    '/dashboard/nutritionist': '/dashboard/nutritionist',
    '/dashboard/nutritionist/disponibilites':
      '/dashboard/nutritionist/disponibilites',
    '/dashboard/nutritionist/agenda': '/dashboard/nutritionist/agenda',
    '/dashboard/nutritionist/patients': '/dashboard/nutritionist/patients',
    '/dashboard/nutritionist/messagerie': '/dashboard/nutritionist/messagerie',
    '/dashboard/nutritionist/parametres/types-consultation':
      '/dashboard/nutritionist/parametres/types-consultation',

    // Nutritionist registration status pages
    '/inscription/nutritionniste': '/inscription/nutritionniste',
    '/inscription/nutritionniste/en-attente':
      '/inscription/nutritionniste/en-attente',
    '/inscription/nutritionniste/rejete': '/inscription/nutritionniste/rejete',
    '/inscription/nutritionniste/info-requise':
      '/inscription/nutritionniste/info-requise',
    '/inscription/nutritionniste/valide': '/inscription/nutritionniste/valide',

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

    // Pages consultation
    '/consultation/reserver': {
      fr: '/consultation/reserver',
      en: '/consultation/book',
    },
    '/consultation/confirmation': {
      fr: '/consultation/confirmation',
      en: '/consultation/confirmation',
    },

    // Pages légales
    '/terms': {
      fr: '/conditions',
      en: '/terms',
    },
    '/privacy': {
      fr: '/confidentialite',
      en: '/privacy',
    },
  },
});
