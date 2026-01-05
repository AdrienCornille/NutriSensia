'use client';

import React from 'react';
import { MethodologySection } from '../landing/approach/MethodologySection';

/**
 * Démonstration de la section "Comment Ça Marche"
 *
 * Ce composant permet de tester et prévisualiser la section
 * de méthodologie avec la timeline en 4 étapes.
 *
 * @example
 * ```tsx
 * <MethodologyDemo />
 * ```
 */
export function MethodologyDemo() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Section Comment Ça Marche isolée pour test */}
      <MethodologySection />

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

export default MethodologyDemo;
