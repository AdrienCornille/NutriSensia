'use client';

import React from 'react';
import { PersonalStorySection } from '../landing/approach/PersonalStorySection';

/**
 * Démonstration de la section "Mon Parcours"
 *
 * Ce composant permet de tester et prévisualiser la section
 * d'histoire personnelle de manière isolée.
 *
 * @example
 * ```tsx
 * <PersonalStoryDemo />
 * ```
 */
export function PersonalStoryDemo() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Section Mon Parcours isolée pour test */}
      <PersonalStorySection />

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

export default PersonalStoryDemo;
