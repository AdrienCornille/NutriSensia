'use client';

import React from 'react';
import { MethodsSection } from '../landing/approach/MethodsSection';

/**
 * Démonstration de la section "Mes Méthodes"
 *
 * Ce composant permet de tester et prévisualiser la section
 * des méthodes thérapeutiques avec le layout adaptatif.
 *
 * @example
 * ```tsx
 * <MethodsDemo />
 * ```
 */
export function MethodsDemo() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Section Mes Méthodes isolée pour test */}
      <MethodsSection />

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

export default MethodsDemo;
