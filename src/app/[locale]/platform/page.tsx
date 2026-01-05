import { PlatformPage } from '@/components/landing/platform';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'The NutriSensia Platform - Your 24/7 Nutritional Coach',
  description:
    'Discover the NutriSensia digital platform that centralizes all your nutritional tools: personalized meal plans, food diary, progress tracking, secure messaging and educational resources.',
  keywords: [
    'nutrition platform',
    'nutritional tools',
    'digital nutrition coach',
    'personalized meal plans',
    'food diary',
    'nutrition progress tracking',
    'dietitian messaging',
    'nutrition resources',
    'NutriSensia',
  ],
  openGraph: {
    title: 'The NutriSensia Platform - Your 24/7 Nutritional Coach',
    description:
      'Complete digital platform for your nutritional monitoring: meal plans, food diary, progress tracking and personalized support.',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: '/en/platform',
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
 * Platform Page (English)
 *
 * Presents the NutriSensia digital platform with its main
 * features and encourages the 7-day free trial.
 *
 * URL: /en/platform
 */
export default function PlatformPageEn() {
  return <PlatformPage />;
}
