/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver la vérification TypeScript temporairement
  typescript: {
    ignoreBuildErrors: true,
  },
  // Désactiver ESLint temporairement
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimisations pour améliorer les performances de compilation
  swcMinify: true,
  experimental: {
    // Amélioration de la gestion des modules Node.js
    serverComponentsExternalPackages: ['crypto'],
    // Optimisations de compilation
    optimizePackageImports: ['lucide-react', 'framer-motion', '@supabase/supabase-js'],
    // Turbo réactivé pour de meilleures performances
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Optimisations supplémentaires
    webVitalsAttribution: ['CLS', 'LCP'],
    optimizeCss: true,
  },
  webpack: (config, { isServer, dev }) => {
    // Configuration pour gérer les modules Node.js natifs
    if (isServer) {
      config.externals.push({
        crypto: 'commonjs crypto',
      });
    }

    // Optimisations pour la production et le développement
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              minChunks: 2,
              priority: -10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Réduire la verbosité des logs en développement
    if (dev) {
      config.stats = 'errors-warnings';
      config.infrastructureLogging = {
        level: 'error',
      };
    }

    return config;
  },
};

module.exports = nextConfig;
