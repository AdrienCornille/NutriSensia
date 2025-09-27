'use client';

import { useEffect, useState } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';

interface MFAProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Composant de protection qui vérifie le statut 2FA et redirige si nécessaire
 * Utilisé pour protéger les pages qui nécessitent une authentification complète
 */
export function MFAProtection({ children, fallback }: MFAProtectionProps) {
  const { checkMFAAndRedirect } = useAuthRedirect();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Vérifier si l'utilisateur est connecté
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // L'utilisateur n'est pas connecté, rediriger vers la connexion
          window.location.href = '/auth/signin';
          return;
        }

        // Vérifier le niveau d'assurance d'authentification
        const { data: mfaData, error: mfaError } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (mfaError) {
          console.error('Erreur lors de la vérification 2FA:', mfaError);
          setIsAuthenticated(true); // Continuer malgré l'erreur
          setIsChecking(false);
          return;
        }

        const { currentLevel, nextLevel } = mfaData;

        if (nextLevel === 'aal2' && currentLevel === 'aal1') {
          // L'utilisateur doit configurer ou vérifier le 2FA
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          const hasVerifiedFactors =
            factorsData.totp?.some(f => f.status === 'verified') ||
            factorsData.phone?.some(f => f.status === 'verified');

          if (hasVerifiedFactors) {
            // L'utilisateur a déjà configuré le 2FA, rediriger vers la vérification
            window.location.href = '/auth/verify-mfa';
          } else {
            // L'utilisateur n'a pas encore configuré le 2FA, rediriger vers l'enrôlement
            window.location.href = '/auth/enroll-mfa';
          }
        } else {
          // L'utilisateur est authentifié et a le bon niveau d'assurance
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error
        );
        setIsAuthenticated(true); // Continuer malgré l'erreur
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthStatus();
  }, [checkMFAAndRedirect]);

  // Afficher un indicateur de chargement pendant la vérification
  if (isChecking) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
        <Card className='p-8 max-w-md w-full'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-blue-600 animate-spin'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Vérification de sécurité
            </h2>
            <p className='text-gray-600'>
              Vérification de votre statut d'authentification...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Afficher le contenu protégé si l'utilisateur est authentifié
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Afficher le fallback personnalisé ou rien
  return fallback ? <>{fallback}</> : null;
}
