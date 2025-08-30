'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';

/**
 * Composant pour gérer les redirections d'authentification Supabase
 * Traite les tokens dans l'URL et redirige vers la page appropriée
 */
export function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState("Traitement de l'authentification...");
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setMessage("Récupération des paramètres d'authentification...");

        // Récupérer les paramètres de l'URL
        const urlParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');

        if (!accessToken || !refreshToken) {
          throw new Error("Tokens d'authentification manquants");
        }

        setMessage('Configuration de la session...');

        // Configurer la session avec les tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          throw new Error('Session non créée');
        }

        setMessage('Session configurée avec succès !');
        setStatus('success');

        // Attendre un peu pour que l'utilisateur voie le message
        setTimeout(() => {
          // Rediriger vers la page appropriée
          if (type === 'signup') {
            router.push('/mfa-test');
          } else {
            router.push('/mfa-test');
          }
        }, 2000);
      } catch (error: any) {
        console.error(
          "Erreur lors du traitement de l'authentification:",
          error
        );
        setStatus('error');
        setMessage(`Erreur: ${error.message}`);

        // Rediriger vers la page de connexion en cas d'erreur
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      }
    };

    // Vérifier si nous sommes sur une page de callback
    if (window.location.hash.includes('access_token')) {
      handleAuthCallback();
    } else {
      // Si pas de tokens, rediriger vers la page d'accueil
      router.push('/');
    }
  }, [router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <Card className='p-8 max-w-md w-full'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>{getStatusIcon()}</div>
          <h1 className='text-xl font-semibold mb-2'>Authentification</h1>
          <p className={`text-sm ${getStatusColor()}`}>{message}</p>

          {status === 'loading' && (
            <div className='mt-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
            </div>
          )}

          {status === 'success' && (
            <div className='mt-4 text-sm text-gray-600'>
              Redirection vers la page de test MFA...
            </div>
          )}

          {status === 'error' && (
            <div className='mt-4 text-sm text-gray-600'>
              Redirection vers la page de connexion...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
