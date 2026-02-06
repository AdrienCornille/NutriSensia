/**
 * Page d'onboarding générique qui redirige vers la bonne page selon le rôle
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Force dynamic rendering - cette page utilise useAuth qui nécessite AuthProvider
export const dynamic = 'force-dynamic';

/**
 * Page d'onboarding générique
 */
export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const redirectToCorrectOnboarding = () => {
      console.log(
        '🔍 [Onboarding] Vérification du rôle - authLoading:',
        authLoading,
        'user:',
        !!user
      );

      // Attendre que l'authentification soit chargée
      if (authLoading) {
        console.log(
          "⏳ [Onboarding] En attente du chargement de l'authentification..."
        );
        return;
      }

      if (!user) {
        console.log(
          '🚫 [Onboarding] Aucun utilisateur connecté - redirection vers signin'
        );
        router.push('/auth/signin?redirect=/onboarding');
        return;
      }

      // Déterminer la page d'onboarding appropriée selon le rôle
      const userRole = user.user_metadata?.role;
      console.log('🔍 [Onboarding] Rôle utilisateur détecté:', userRole);

      switch (userRole) {
        case 'nutritionist':
          console.log(
            '🔄 [Onboarding] Redirection vers onboarding nutritionniste'
          );
          router.push('/onboarding/nutritionist');
          break;
        case 'patient':
          console.log('🔄 [Onboarding] Redirection vers onboarding patient');
          router.push('/onboarding/patient');
          break;
        case 'admin':
          console.log('🔄 [Onboarding] Redirection vers dashboard admin');
          router.push('/dashboard/admin');
          break;
        default:
          console.log(
            '❓ [Onboarding] Rôle inconnu:',
            userRole,
            '- redirection vers dashboard'
          );
          router.push('/dashboard');
          break;
      }
    };

    redirectToCorrectOnboarding();
  }, [user, authLoading, router]);

  // Affichage de chargement
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
        <p className='text-gray-600'>Redirection vers votre onboarding...</p>
      </div>
    </div>
  );
}
