/**
 * Composant de debug pour tester le positionnement des tours guidés
 * À utiliser temporairement pour vérifier les positions
 */

'use client';

import React, { useState } from 'react';
import { SimpleTour } from './SimpleTour';

export const TourDebug: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  const testSteps = [
    {
      target: '.debug-top-left',
      title: 'Test coin supérieur gauche',
      content: "Ce tooltip devrait s'afficher correctement même près du bord.",
      placement: 'right' as const,
    },
    {
      target: '.debug-top-right',
      title: 'Test coin supérieur droit',
      content:
        'Ce tooltip devrait se repositionner automatiquement à gauche pour éviter le débordement.',
      placement: 'left' as const,
    },
    {
      target: '.debug-bottom-right',
      title: 'Test coin inférieur droit',
      content:
        "Ce tooltip devrait s'afficher en haut pour éviter de sortir de l'écran.",
      placement: 'top' as const,
    },
    {
      target: '.debug-center',
      title: 'Test centre',
      content: 'Ce tooltip centré devrait toujours être visible.',
      placement: 'center' as const,
    },
  ];

  return (
    <div className='min-h-screen p-4 bg-gray-100'>
      <div className='mb-4'>
        <button
          onClick={() => setIsActive(true)}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          Démarrer le test de positionnement
        </button>
      </div>

      {/* Éléments de test positionnés dans les coins */}
      <div className='debug-top-left absolute top-4 left-4 w-16 h-16 bg-red-500 rounded flex items-center justify-center text-white text-xs'>
        TL
      </div>

      <div className='debug-top-right absolute top-4 right-4 w-16 h-16 bg-green-500 rounded flex items-center justify-center text-white text-xs'>
        TR
      </div>

      <div className='debug-bottom-right absolute bottom-4 right-4 w-16 h-16 bg-blue-500 rounded flex items-center justify-center text-white text-xs'>
        BR
      </div>

      <div className='debug-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-purple-500 rounded flex items-center justify-center text-white text-xs'>
        C
      </div>

      {/* Tour de test */}
      <SimpleTour
        steps={testSteps}
        isActive={isActive}
        onComplete={() => {
          setIsActive(false);
          alert('Test terminé !');
        }}
        onSkip={() => {
          setIsActive(false);
          alert('Test abandonné');
        }}
      />
    </div>
  );
};
