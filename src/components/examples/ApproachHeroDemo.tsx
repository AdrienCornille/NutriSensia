'use client';

import React from 'react';
import { ApproachHeroSection } from '../landing/approach/ApproachHeroSection';

/**
 * Démonstration de la section Hero de la page "L'Approche"
 *
 * Ce composant permet de tester et prévisualiser la section Hero
 * de manière isolée pour validation du design et des animations.
 *
 * @example
 * ```tsx
 * <ApproachHeroDemo />
 * ```
 */
export function ApproachHeroDemo() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Section Hero isolée pour test */}
      <ApproachHeroSection />

      {/* Section de test pour voir le scroll */}
      <section className='py-20 px-10 bg-gray-50 text-center'>
        <h2 className='text-2xl font-bold text-gray-800 mb-4'>
          Section de test
        </h2>
        <p className='text-gray-600'>
          Cette section permet de tester le scroll et l'intégration avec
          d'autres composants.
        </p>
      </section>
    </div>
  );
}

export default ApproachHeroDemo;
