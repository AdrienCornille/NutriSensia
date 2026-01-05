'use client';

import React from 'react';
import { ExpectationsSection } from '../landing/approach/ExpectationsSection';

/**
 * Démonstration de la section "À Quoi S'Attendre"
 *
 * Ce composant permet de tester et prévisualiser la section
 * des attentes pour la première consultation.
 *
 * @example
 * ```tsx
 * <ExpectationsDemo />
 * ```
 */
export function ExpectationsDemo() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Section À Quoi S'Attendre isolée pour test */}
      <ExpectationsSection />

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

export default ExpectationsDemo;
