/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Amélioration de la gestion des modules Node.js
    serverComponentsExternalPackages: ['crypto'],
  },
  webpack: (config, { isServer }) => {
    // Configuration pour gérer les modules Node.js natifs
    if (isServer) {
      config.externals.push({
        crypto: 'commonjs crypto',
      });
    }

    return config;
  },
};

module.exports = nextConfig;
