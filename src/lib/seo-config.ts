import { DefaultSeoProps } from 'next-seo';

/**
 * Configuration SEO par défaut pour NutriSensia
 * Optimisée pour le marché suisse francophone
 */

// URL de base du site
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nutrisensia.ch';

// Configuration SEO par défaut
export const defaultSEO: DefaultSeoProps = {
  // Titre par défaut
  title: 'NutriSensia - Plateforme de Nutrition Personnalisée en Suisse',
  titleTemplate: '%s | NutriSensia',

  // Description par défaut
  description:
    'Plateforme suisse de nutrition personnalisée. Consultations en ligne avec des nutritionnistes certifiés ASCA/RME. Plans alimentaires sur mesure, suivi personnalisé et conseils nutritionnels adaptés à vos besoins.',

  // URL canonique
  canonical: SITE_URL,

  // Configuration Open Graph
  openGraph: {
    type: 'website',
    locale: 'fr_CH',
    url: SITE_URL,
    siteName: 'NutriSensia',
    title: 'NutriSensia - Nutrition Personnalisée en Suisse',
    description:
      'Consultations nutritionnelles en ligne avec des experts certifiés. Plans alimentaires personnalisés et suivi professionnel en Suisse.',
    images: [
      {
        url: `${SITE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'NutriSensia - Plateforme de Nutrition Suisse',
        type: 'image/jpeg',
      },
      {
        url: `${SITE_URL}/images/og-image-square.jpg`,
        width: 800,
        height: 800,
        alt: 'NutriSensia Logo',
        type: 'image/jpeg',
      },
    ],
  },

  // Configuration Twitter
  twitter: {
    handle: '@nutrisensia',
    site: '@nutrisensia',
    cardType: 'summary_large_image',
  },

  // Métadonnées additionnelles
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'robots',
      content: 'index,follow',
    },
    {
      name: 'googlebot',
      content: 'index,follow',
    },
    {
      httpEquiv: 'x-ua-compatible',
      content: 'IE=edge',
    },
    // Métadonnées spécifiques à la Suisse
    {
      name: 'geo.region',
      content: 'CH',
    },
    {
      name: 'geo.country',
      content: 'Switzerland',
    },
    {
      name: 'language',
      content: 'French',
    },
    {
      name: 'author',
      content: 'NutriSensia',
    },
    {
      name: 'publisher',
      content: 'NutriSensia',
    },
    // Métadonnées pour les applications mobiles
    {
      name: 'mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default',
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'NutriSensia',
    },
    // Métadonnées de sécurité
    {
      httpEquiv: 'Content-Security-Policy',
      content:
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google-analytics.com *.googletagmanager.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: *.google-analytics.com *.googletagmanager.com; connect-src 'self' *.supabase.co *.google-analytics.com *.googletagmanager.com;",
    },
  ],

  // Liens additionnels
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'dns-prefetch',
      href: '//google-analytics.com',
    },
    {
      rel: 'dns-prefetch',
      href: '//googletagmanager.com',
    },
  ],
};

/**
 * Mots-clés principaux pour le marché suisse francophone
 */
export const SWISS_FRENCH_KEYWORDS = [
  // Nutrition générale
  'nutrition suisse',
  'nutritionniste suisse',
  'diététicienne suisse',
  'consultation nutrition en ligne',
  'plan alimentaire personnalisé',
  'conseils nutritionnels suisse',

  // Certifications suisses
  'nutritionniste ASCA',
  'diététicienne RME',
  'nutrition certifiée suisse',
  'thérapeute nutrition suisse',

  // Géolocalisation
  'nutritionniste genève',
  'nutritionniste lausanne',
  'nutritionniste zurich',
  'nutritionniste berne',
  'nutritionniste fribourg',
  'nutritionniste neuchâtel',
  'nutritionniste valais',
  'nutritionniste vaud',

  // Services spécifiques
  'perte de poids suisse',
  'nutrition sportive suisse',
  'troubles alimentaires suisse',
  'nutrition clinique suisse',
  'rééquilibrage alimentaire',

  // Assurance et remboursement
  'nutrition remboursée suisse',
  'assurance complémentaire nutrition',
  'consultation nutrition assurance',

  // Problématiques de santé
  'diabète nutrition suisse',
  'cholestérol nutrition suisse',
  'allergies alimentaires suisse',
  'intolérances alimentaires',
];

/**
 * Configuration des pages spécifiques
 */
export const PAGE_SEO_CONFIG = {
  home: {
    title: 'Accueil',
    description:
      'Plateforme suisse de nutrition personnalisée. Consultations en ligne avec des nutritionnistes certifiés ASCA/RME.',
    keywords: [
      'nutrition suisse',
      'nutritionniste en ligne',
      'consultation nutrition',
      'plan alimentaire personnalisé',
    ],
  },

  patients: {
    title: 'Services pour Patients',
    description:
      'Découvrez nos packages de consultation nutritionnelle. Suivi personnalisé par des nutritionnistes certifiés, remboursement par assurance complémentaire.',
    keywords: [
      'consultation nutritionniste',
      'package nutrition',
      'suivi nutritionnel',
      'remboursement assurance nutrition',
    ],
  },

  nutritionnistes: {
    title: 'Rejoindre notre Réseau',
    description:
      'Nutritionnistes et diététiciens certifiés : rejoignez notre plateforme. Développez votre clientèle avec nos outils professionnels.',
    keywords: [
      'nutritionniste partenaire',
      'plateforme nutritionniste',
      'outils nutrition professionnels',
      'réseau nutritionnistes suisse',
    ],
  },

  contact: {
    title: 'Contact',
    description:
      'Contactez NutriSensia pour vos questions sur la nutrition, demandes de consultation ou partenariats professionnels.',
    keywords: [
      'contact nutritionniste',
      'demande consultation',
      'questions nutrition',
    ],
  },

  blog: {
    title: 'Blog Nutrition',
    description:
      'Conseils nutrition, recettes santé et actualités nutritionnelles par nos experts certifiés. Informations fiables pour votre bien-être.',
    keywords: [
      'blog nutrition',
      'conseils nutrition',
      'recettes santé',
      'actualités nutrition suisse',
    ],
  },
};

/**
 * Génère les métadonnées SEO pour une page spécifique
 */
export const generatePageSEO = (
  pageKey: keyof typeof PAGE_SEO_CONFIG,
  customTitle?: string,
  customDescription?: string,
  customKeywords?: string[]
) => {
  const pageConfig = PAGE_SEO_CONFIG[pageKey];

  return {
    title: customTitle || pageConfig.title,
    description: customDescription || pageConfig.description,
    keywords: customKeywords || pageConfig.keywords,
    openGraph: {
      title: customTitle || pageConfig.title,
      description: customDescription || pageConfig.description,
    },
    twitter: {
      title: customTitle || pageConfig.title,
      description: customDescription || pageConfig.description,
    },
  };
};

/**
 * Configuration des données structurées (Schema.org)
 */
export const STRUCTURED_DATA = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NutriSensia',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description:
      'Plateforme suisse de nutrition personnalisée avec des nutritionnistes certifiés',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CH',
      addressRegion: 'Genève',
      addressLocality: 'Genève',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+41-XX-XXX-XX-XX',
      contactType: 'customer service',
      availableLanguage: ['French', 'German', 'Italian'],
    },
    sameAs: [
      'https://www.facebook.com/nutrisensia',
      'https://www.instagram.com/nutrisensia',
      'https://www.linkedin.com/company/nutrisensia',
    ],
  },

  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NutriSensia',
    url: SITE_URL,
    description: 'Plateforme de nutrition personnalisée en Suisse',
    inLanguage: 'fr-CH',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },

  service: {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Consultation Nutritionnelle en Ligne',
    description:
      'Consultations nutritionnelles personnalisées avec des experts certifiés',
    provider: {
      '@type': 'Organization',
      name: 'NutriSensia',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Switzerland',
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceType: 'Online consultation',
      availableLanguage: 'French',
    },
  },
};

export default defaultSEO;
