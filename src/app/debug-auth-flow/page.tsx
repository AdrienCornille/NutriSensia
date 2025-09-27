'use client';

import React from 'react';

/**
 * Page de debug temporairement désactivée pour améliorer les performances
 */
export default function DebugAuthFlowPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">🔍 Debug Flux d'Authentification</h1>
          <p className="text-gray-600">
            Cette page de debug a été temporairement désactivée pour améliorer les performances de compilation.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Elle sera réactivée une fois les problèmes de TypeScript résolus.
          </p>
        </div>
      </div>
    </div>
  );
}