import { MetadataRoute } from 'next';

/**
 * Génération automatique du fichier robots.txt pour NutriSensia
 *
 * Ce fichier configure les directives pour les robots d'indexation
 * en optimisant l'exploration et l'indexation du site.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nutrisensia.ch';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/blog/',
          '/blog/*',
          '/contact',
          '/services/',
          '/services/*',
          '/nutritionists/',
          '/nutritionists/*',
          '/auth/signin',
          '/auth/signup',
          // Pages légales
          '/privacy',
          '/terms',
          '/cookies',
          '/accessibility',
        ],
        disallow: [
          // Pages privées et administratives
          '/profile/',
          '/profile/*',
          '/settings/',
          '/settings/*',
          '/admin/',
          '/admin/*',
          '/dashboard/',
          '/dashboard/*',

          // API routes
          '/api/',
          '/api/*',

          // Pages de test et développement
          '/test/',
          '/test/*',
          '/debug/',
          '/debug/*',
          '/mfa-test',
          '/auth-flow-test',
          '/role-test',
          '/navigation-test',
          '/debug-auth',
          '/profile-debug',
          '/profile-diagnostic',

          // Fichiers système
          '/_next/',
          '/_next/*',
          '/static/',
          '/static/*',

          // Pages temporaires ou en construction
          '/coming-soon',
          '/maintenance',

          // Paramètres de recherche et filtres
          '/blog?*',
          '/search?*',

          // Pages de confirmation et redirections
          '/auth/callback',
          '/auth/confirm',
          '/auth/reset-password',
          '/auth/update-password',

          // Ressources non indexables
          '*.json',
          '*.xml',
          '*.txt',
          '*.pdf',
          '*.doc',
          '*.docx',
        ],
        crawlDelay: 1, // Délai d'1 seconde entre les requêtes
      },

      // Règles spécifiques pour Googlebot
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/blog/',
          '/blog/*',
          '/contact',
          '/services/',
          '/services/*',
          '/nutritionists/',
          '/nutritionists/*',
        ],
        disallow: [
          '/api/',
          '/profile/',
          '/settings/',
          '/admin/',
          '/dashboard/',
          '/_next/',
          '/test/',
          '/debug/',
        ],
      },

      // Règles pour Bingbot
      {
        userAgent: 'Bingbot',
        allow: ['/', '/blog/', '/contact', '/services/', '/nutritionists/'],
        disallow: ['/api/', '/profile/', '/settings/', '/admin/', '/_next/'],
        crawlDelay: 2,
      },

      // Bloquer les bots malveillants
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'BLEXBot',
          'DataForSeoBot',
        ],
        disallow: '/',
      },
    ],

    // Référence au sitemap
    sitemap: `${baseUrl}/sitemap.xml`,

    // Directives d'hôte (pour éviter les problèmes de domaine)
    host: baseUrl,
  };
}
