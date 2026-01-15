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

  // Optimisation des imports pour réduire la taille des bundles
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
  },

  experimental: {
    // Optimiser les imports de packages volumineux
    optimizePackageImports: ['framer-motion', 'date-fns', 'lucide-react', '@heroicons/react'],
  },

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
