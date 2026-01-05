'use client';

import React from 'react';
import { DifferentiationSection } from '../landing/approach/DifferentiationSection';

/**
 * Démonstration de la section "Ma Différence"
 *
 * Ce composant permet de tester et prévisualiser la section
 * des différenciateurs avec le grid 2x2.
 *
 * @example
 * ```tsx
 * <DifferentiationDemo />
 * ```
 */
export function DifferentiationDemo() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Section Ma Différence isolée pour test */}
      <DifferentiationSection />

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

export default DifferentiationDemo;
