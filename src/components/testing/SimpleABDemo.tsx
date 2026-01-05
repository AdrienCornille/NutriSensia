/**
 * Version simplifiée du composant de démonstration A/B Testing
 *
 * Ce composant permet de tester les fonctionnalités de base
 * sans dépendances complexes.
 */

'use client';

import React, { useState } from 'react';

/**
 * Composant de démonstration simplifié
 */
export default function SimpleABDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [testStats, setTestStats] = useState({
    users: 0,
    conversions: 0,
    duration: 0,
  });

  const toggleTest = () => {
    setIsRunning(!isRunning);
  };

  const resetTest = () => {
    setIsRunning(false);
    setTestStats({ users: 0, conversions: 0, duration: 0 });
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                🧪 Démonstration A/B Testing (Version Simple)
              </h1>
              <p className='text-gray-600 mt-1'>
                Interface de test simplifiée du système A/B Testing
              </p>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={toggleTest}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  isRunning
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isRunning ? 'Arrêter le test' : 'Démarrer le test'}
              </button>

              <button
                onClick={resetTest}
                className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                Reset
              </button>
            </div>
          </div>

          {/* Métriques temps réel */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-blue-50 rounded-lg p-4'>
              <div className='text-sm font-medium text-blue-900 mb-1'>
                Utilisateurs
              </div>
              <div className='text-2xl font-bold text-blue-900'>
                {testStats.users}
              </div>
            </div>

            <div className='bg-green-50 rounded-lg p-4'>
              <div className='text-sm font-medium text-green-900 mb-1'>
                Conversions
              </div>
              <div className='text-2xl font-bold text-green-900'>
                {testStats.conversions}
              </div>
            </div>

            <div className='bg-purple-50 rounded-lg p-4'>
              <div className='text-sm font-medium text-purple-900 mb-1'>
                Durée
              </div>
              <div className='text-2xl font-bold text-purple-900'>
                {Math.floor(testStats.duration / 60)}:
                {(testStats.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Variantes d'onboarding */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            🎯 Variantes d'onboarding disponibles
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {[
              {
                key: 'control',
                name: 'Contrôle',
                description: 'Version standard actuelle',
                color: 'bg-gray-100',
              },
              {
                key: 'simplified',
                name: 'Simplifiée',
                description: 'Interface épurée',
                color: 'bg-blue-100',
              },
              {
                key: 'gamified',
                name: 'Gamifiée',
                description: 'Éléments de jeu',
                color: 'bg-purple-100',
              },
              {
                key: 'guided',
                name: 'Guidée',
                description: 'Aide contextuelle',
                color: 'bg-green-100',
              },
            ].map(variant => (
              <div
                key={variant.key}
                className={`p-4 rounded-lg border-2 border-gray-200 ${variant.color}`}
              >
                <div className='font-medium text-gray-900 mb-1'>
                  {variant.name}
                </div>
                <div className='text-sm text-gray-600'>
                  {variant.description}
                </div>
                <div className='mt-2 text-xs text-gray-500'>
                  Taux: {Math.random() * 30 + 10}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tests de base */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            🧪 Tests de base
          </h2>

          <div className='space-y-4'>
            <div className='p-4 border border-gray-200 rounded-lg'>
              <h3 className='font-medium text-gray-900 mb-2'>
                Test 1: Attribution des variantes
              </h3>
              <p className='text-sm text-gray-600 mb-3'>
                Vérifiez que les utilisateurs reçoivent des variantes de manière
                cohérente.
              </p>
              <button className='px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'>
                Tester l'attribution
              </button>
            </div>

            <div className='p-4 border border-gray-200 rounded-lg'>
              <h3 className='font-medium text-gray-900 mb-2'>
                Test 2: Tracking des événements
              </h3>
              <p className='text-sm text-gray-600 mb-3'>
                Vérifiez que les événements sont correctement enregistrés.
              </p>
              <button className='px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700'>
                Simuler un événement
              </button>
            </div>

            <div className='p-4 border border-gray-200 rounded-lg'>
              <h3 className='font-medium text-gray-900 mb-2'>
                Test 3: API Analytics
              </h3>
              <p className='text-sm text-gray-600 mb-3'>
                Testez les endpoints d'analyse des données.
              </p>
              <button className='px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700'>
                Tester l'API
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className='mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <h3 className='font-medium text-yellow-900 mb-2'>
            📋 Instructions de test
          </h3>
          <div className='text-sm text-yellow-800 space-y-1'>
            <p>
              1. Cliquez sur "Démarrer le test" pour commencer la simulation
            </p>
            <p>2. Observez l'évolution des métriques en temps réel</p>
            <p>3. Testez les différents boutons pour simuler des actions</p>
            <p>4. Utilisez "Reset" pour recommencer le test</p>
          </div>
        </div>
      </div>
    </div>
  );
}
