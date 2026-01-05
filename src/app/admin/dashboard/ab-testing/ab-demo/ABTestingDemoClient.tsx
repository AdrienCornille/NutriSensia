/**
 * Composant client pour la démonstration des tests A/B
 *
 * Ce composant gère l'authentification et la protection d'accès
 */

'use client';

import { useState, useEffect } from 'react';
// import ABTestingDemo from '@/components/testing/ABTestingDemo';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/AuthContext';

export default function ABTestingDemoClient() {
  const { user, isAuthenticated, loading } = useAuth();
  const { hasRole, isAdmin } = usePermissions();
  const [isLoading, setIsLoading] = useState(true);

  // Debug logs
  useEffect(() => {
    console.log('🔍 [AB Demo Page Debug]', {
      user: !!user,
      isAuthenticated,
      loading,
      userRole: user?.user_metadata?.role,
      isAdmin: isAdmin(),
      hasAdminRole: hasRole('admin'),
    });

    if (!loading) {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, loading, isAdmin, hasRole]);

  // Affichage de chargement
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    );
  }

  // Vérification d'accès admin
  if (!isAuthenticated || !hasRole('admin')) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-600 text-xl font-semibold mb-2'>
            Accès Refusé
          </div>
          <p className='text-gray-600 mb-4'>
            Vous devez être administrateur pour accéder à cette page de
            démonstration A/B Testing.
          </p>
          <div className='space-x-4'>
            <button
              onClick={() => (window.location.href = '/auth/signin')}
              className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
            >
              Se connecter
            </button>
            <button
              onClick={() => (window.location.href = '/debug-auth-status')}
              className='bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700'
            >
              Diagnostic
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            🧪 Démonstration A/B Testing (Version Complète)
          </h1>
          <p className='text-gray-600 mb-6'>
            Interface de test complète du système A/B Testing pour les
            administrateurs.
          </p>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h3 className='font-medium text-blue-900 mb-2'>
              📋 Fonctionnalités disponibles
            </h3>
            <div className='text-sm text-blue-800 space-y-1'>
              <p>
                • 🎮 <strong>Simulation en temps réel</strong> -
                Démarrez/arrêtez des tests
              </p>
              <p>
                • 📊 <strong>Métriques live</strong> - Utilisateurs,
                conversions, taux, durée
              </p>
              <p>
                • 🎯 <strong>Prévisualisation des variantes</strong> - 4
                versions d'onboarding
              </p>
              <p>
                • 🧪 <strong>Tests interactifs</strong> - Testez différents
                utilisateurs
              </p>
              <p>
                • 📥 <strong>Export de données</strong> - Téléchargez les
                résultats JSON
              </p>
            </div>
          </div>

          <div className='mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <h3 className='font-medium text-yellow-900 mb-2'>⚠️ Note</h3>
            <p className='text-sm text-yellow-800'>
              Cette page utilise le composant ABTestingDemo complet. Pour une
              version simplifiée, utilisez les autres pages de démonstration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
