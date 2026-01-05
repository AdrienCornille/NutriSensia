/**
 * Composant client pour la démonstration simplifiée des tests A/B
 *
 * Ce composant gère l'authentification et la protection d'accès
 */

'use client';

import { useState, useEffect } from 'react';
import SimpleABDemo from '@/components/testing/SimpleABDemo';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/AuthContext';

export default function SimpleABDemoClient() {
  const { user, isAuthenticated, loading } = useAuth();
  const { hasRole, isAdmin } = usePermissions();
  const [isLoading, setIsLoading] = useState(true);

  // Debug logs
  useEffect(() => {
    console.log('🔍 [Simple Demo Page Debug]', {
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

  return <SimpleABDemo />;
}
