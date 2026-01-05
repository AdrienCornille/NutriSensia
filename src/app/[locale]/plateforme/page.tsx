import { PlatformPage } from '@/components/landing/platform';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'La Plateforme NutriSensia - Votre Coach Nutritionnel 24/7',
  description:
    'Découvrez la plateforme digitale NutriSensia qui centralise tous vos outils nutritionnels : plans de repas personnalisés, journal alimentaire, suivi des progrès, messagerie sécurisée et ressources éducatives.',
  keywords: [
    'plateforme nutrition',
    'outils nutritionnels',
    'coach nutritionnel digital',
    'plans de repas personnalisés',
    'journal alimentaire',
    'suivi progrès nutrition',
    'messagerie diététicienne',
    'ressources nutrition',
    'NutriSensia',
  ],
  openGraph: {
    title: 'La Plateforme NutriSensia - Votre Coach Nutritionnel 24/7',
    description:
      'Plateforme digitale complète pour votre suivi nutritionnel : plans de repas, journal alimentaire, suivi des progrès et accompagnement personnalisé.',
    type: 'website',
    locale: 'fr_CH',
  },
  alternates: {
    canonical: '/fr/plateforme',
    languages: {
      'fr-CH': '/fr/plateforme',
      'en-US': '/en/platform',
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

/**
 * Page La Plateforme
 *
 * Présente la plateforme digitale NutriSensia avec ses fonctionnalités
 * principales et incite à l'essai gratuit de 7 jours.
 *
 * URL: /fr/plateforme
 */
export default function PlateformePage() {
  return <PlatformPage />;
}
