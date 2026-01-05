/**
 * Composant de protection d'accès simple pour les administrateurs
 *
 * Version simplifiée pour diagnostiquer les problèmes
 */

'use client';

import React, { useEffect, useState } from 'react';

interface SimpleAdminProtectionProps {
  children: React.ReactNode;
}

export default function SimpleAdminProtection({
  children,
}: SimpleAdminProtectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔧 SimpleAdminProtection: Début de la vérification');

    async function checkAccess() {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔧 SimpleAdminProtection: Appel de l'API /api/auth/me");

        const response = await fetch('/api/auth/me');
        const userData = await response.json();

        console.log('🔧 SimpleAdminProtection: Réponse API:', userData);
        console.log('🔧 SimpleAdminProtection: Rôle:', userData.role);
        console.log('🔧 SimpleAdminProtection: isAdmin:', userData.isAdmin);

        setUser(userData);

        // Vérifier si l'utilisateur est administrateur
        const isAdmin =
          userData.role === 'admin' ||
          userData.role === 'super_admin' ||
          userData.role === 'administrator';

        console.log('🔧 SimpleAdminProtection: Est administrateur:', isAdmin);

        if (!isAdmin) {
          setError(
            `Accès refusé : permissions administrateur requises (rôle: ${userData.role})`
          );
          console.log(
            '🔧 SimpleAdminProtection: Accès refusé pour le rôle:',
            userData.role
          );
        } else {
          console.log(
            '🔧 SimpleAdminProtection: Accès autorisé pour le rôle:',
            userData.role
          );
        }
      } catch (err) {
        console.error('🔧 SimpleAdminProtection: Erreur:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, []);

  // Affichage du loader
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error || !user || user.role !== 'admin') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center p-6 bg-white rounded-lg shadow-md max-w-md'>
          <div className='text-red-600 text-6xl mb-4'>🛡️</div>
          <h1 className='text-2xl font-bold text-red-600 mb-4'>Accès Refusé</h1>
          <p className='text-gray-700 mb-4'>
            {error ||
              'Permissions administrateur requises pour accéder à cette page.'}
          </p>
          <div className='space-y-3'>
            <button
              onClick={() => (window.location.href = '/auth/signin')}
              className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors'
            >
              Se connecter
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className='w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors'
            >
              Retour à l'accueil
            </button>
          </div>
          {user && (
            <div className='mt-6 p-4 bg-gray-100 rounded-md'>
              <p className='text-sm text-gray-600'>
                Connecté en tant que : <strong>{user.email}</strong>
              </p>
              <p className='text-sm text-gray-600'>
                Rôle : <strong>{user.role}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Affichage du contenu protégé
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='bg-blue-600 text-white py-2 px-4 text-center'>
        🔵 Mode Administrateur - A/B Testing {user.email} ({user.role})
      </div>
      {children}
    </div>
  );
}
