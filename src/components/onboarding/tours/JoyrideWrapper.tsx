'use client';

/**
 * Wrapper dynamique pour react-joyride
 * Permet de charger le composant uniquement côté client
 * et d'éviter les erreurs de build avec Next.js 15
 *
 * Note: react-joyride utilise des APIs React deprecated (unmountComponentAtNode)
 * qui ne sont plus disponibles dans React 18+. Ce wrapper utilise dynamic import
 * avec ssr: false pour contourner ce problème lors du build.
 */

import dynamic from 'next/dynamic';

// Import dynamique avec SSR désactivé pour éviter les erreurs d'API deprecated
const Joyride = dynamic(
  () => import('react-joyride').then(mod => mod.default),
  {
    ssr: false,
    loading: () => null,
  }
);

export default Joyride;
