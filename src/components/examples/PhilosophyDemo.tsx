'use client';

import React from 'react';
import { PhilosophySection } from '../landing/approach/PhilosophySection';

/**
 * Démonstration de la section "Mes Principes"
 *
 * Ce composant permet de tester et prévisualiser la section
 * des 3 piliers de l'approche de manière isolée.
 *
 * @example
 * ```tsx
 * <PhilosophyDemo />
 * ```
 */
export function PhilosophyDemo() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Section Mes Principes isolée pour test */}
      <PhilosophySection />

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

export default PhilosophyDemo;
