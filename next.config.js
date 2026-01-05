const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration MDX
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],

  // Configuration des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Désactiver la vérification TypeScript et ESLint temporairement
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimisations pour améliorer les performances de compilation
  swcMinify: true,
  // NOTE: experimental.optimizePackageImports a été désactivé car il cause
  // des erreurs "Cannot find module './vendor-chunks/...'" avec Next.js 14.2.x
  // Réactiver après mise à jour vers Next.js 15+ si le bug est corrigé

  // Optimisations webpack pour accélérer le développement
  webpack: (config, { isServer, dev }) => {
    // En développement, optimiser la compilation
    if (dev) {
      // Réduire la verbosité des logs
      config.stats = 'errors-warnings';
      config.infrastructureLogging = {
        level: 'error',
      };

      // NOTE: Les optimisations agressives (splitChunks: false, etc.) ont été
      // retirées car elles causaient des problèmes de stabilité avec le HMR
    }

    return config;
  },
};

module.exports = withNextIntl(nextConfig);
