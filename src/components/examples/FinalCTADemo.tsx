'use client';

import React from 'react';
import { FinalCTASection } from '../landing/approach/FinalCTASection';

/**
 * Démonstration de la section CTA Finale
 *
 * Ce composant permet de tester et prévisualiser la section
 * CTA finale avec le gradient et les boutons.
 *
 * @example
 * ```tsx
 * <FinalCTADemo />
 * ```
 */
export function FinalCTADemo() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Section CTA Finale isolée pour test */}
      <FinalCTASection />

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

export default FinalCTADemo;
