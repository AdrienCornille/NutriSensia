/**
 * Composant de protection d'accès pour les administrateurs
 *
 * Ce composant vérifie si l'utilisateur a les permissions d'administrateur
 * et redirige vers la page de connexion si nécessaire.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface AdminProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Interface pour les informations utilisateur
 */
interface UserInfo {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

/**
 * Composant de protection d'accès administrateur
 */
export default function AdminProtection({
  children,
  fallback,
  redirectTo = '/auth/signin',
}: AdminProtectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  /**
   * Vérifie l'accès administrateur
   */
  const checkAdminAccess = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Récupérer les informations utilisateur depuis l'API
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Utilisateur non authentifié - afficher message d'erreur au lieu de rediriger
          setError(
            'Accès refusé : vous devez être connecté avec un compte administrateur'
          );
          return;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const userData = await response.json();

      if (!userData || !userData.role) {
        throw new Error('Informations utilisateur manquantes');
      }

      // Debug: afficher le rôle exact
      console.log('🔍 Rôle utilisateur détecté:', userData.role);
      console.log('🔍 Type du rôle:', typeof userData.role);
      console.log('🔍 Longueur du rôle:', userData.role?.length);

      // Vérifier si l'utilisateur est administrateur (plus flexible)
      const role = userData.role?.toLowerCase().trim();
      const isAdmin =
        role === 'admin' ||
        role === 'super_admin' ||
        role === 'administrator' ||
        role === 'superadmin' ||
        role === 'admin_user' ||
        role === 'system_admin';

      console.log('🔍 Rôle normalisé:', role);
      console.log('🔍 Est administrateur:', isAdmin);

      if (!isAdmin) {
        setError(
          `Accès refusé : permissions administrateur requises (rôle actuel: "${userData.role}")`
        );
        return;
      }

      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        isAdmin: true,
      });
    } catch (err) {
      console.error('Erreur lors de la vérification des permissions:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  // Affichage du loader pendant la vérification
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto text-blue-600 mb-4' />
          <p className='text-gray-600'>Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur si l'utilisateur n'est pas administrateur
  if (error || !user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
          <div className='mb-6'>
            <Shield className='h-16 w-16 mx-auto text-red-500 mb-4' />
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Accès Refusé
            </h1>
            <p className='text-gray-600 mb-4'>
              {error ||
                'Permissions administrateur requises pour accéder à cette page.'}
            </p>
          </div>

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
              <p className='text-sm text-gray-500'>
                Rôle : <strong>{user.role}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Affichage du contenu protégé si l'utilisateur est administrateur
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* En-tête de protection */}
      <div className='bg-blue-600 text-white py-2 px-4'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Shield className='h-5 w-5' />
            <span className='text-sm font-medium'>
              Mode Administrateur - A/B Testing
            </span>
          </div>
          <div className='text-sm'>
            {user.email} ({user.role})
          </div>
        </div>
      </div>

      {/* Contenu protégé */}
      {children}
    </div>
  );
}

/**
 * Hook pour vérifier les permissions administrateur
 */
export function useAdminAccess() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        setIsAdmin(false);
        return;
      }

      const userData = await response.json();
      const hasAdminRole =
        userData.role === 'admin' || userData.role === 'super_admin';
      setIsAdmin(hasAdminRole);
    } catch (err) {
      console.error('Erreur lors de la vérification des permissions:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { isAdmin, isLoading, error, refetch: checkAdminStatus };
}
