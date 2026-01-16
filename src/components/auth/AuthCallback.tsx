'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

/**
 * Icône de chargement animée (spinner NutriSensia)
 */
const LoadingIcon = () => (
  <svg
    className='animate-spin'
    width='48'
    height='48'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <circle
      className='opacity-25'
      cx='12'
      cy='12'
      r='10'
      stroke='#1B998B'
      strokeWidth='3'
    />
    <path
      className='opacity-75'
      fill='#1B998B'
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    />
  </svg>
);

/**
 * Icône de succès
 */
const SuccessIcon = () => (
  <svg
    width='48'
    height='48'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M22 11.08V12a10 10 0 1 1-5.93-9.14'
      stroke='#1B998B'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M22 4L12 14.01l-3-3'
      stroke='#1B998B'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

/**
 * Icône d'erreur
 */
const ErrorIcon = () => (
  <svg
    width='48'
    height='48'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <circle
      cx='12'
      cy='12'
      r='10'
      stroke='#EF4444'
      strokeWidth='2'
    />
    <path
      d='M15 9L9 15M9 9l6 6'
      stroke='#EF4444'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

/**
 * Composant pour gérer les redirections d'authentification Supabase
 * Traite les tokens dans l'URL et redirige vers la page appropriée
 * Pour OAuth (Google), crée automatiquement le profil avec les données du provider
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

        if (!accessToken || !refreshToken) {
          throw new Error("Tokens d'authentification manquants");
        }

        setMessage('Configuration de la session...');

        // Créer le client Supabase SSR compatible
        const supabase = createClient();

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

        // Vérifier si c'est une connexion OAuth (Google, etc.)
        const provider = data.session.user?.app_metadata?.provider;
        const isOAuthLogin = provider && provider !== 'email';

        if (isOAuthLogin) {
          setMessage('Création de votre profil...');

          // Appeler l'API pour créer/vérifier le profil OAuth
          // Passer le token directement car les cookies ne sont pas encore disponibles
          const profileResponse = await fetch('/api/auth/create-oauth-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
          });

          const profileResult = await profileResponse.json();

          if (!profileResponse.ok) {
            console.error('Erreur création profil:', profileResult.error);
            // Continuer même si erreur - le profil peut déjà exister
          }

          setMessage('Connexion réussie !');
          setStatus('success');

          // Rediriger selon l'état du profil
          setTimeout(() => {
            if (profileResult.isComplete) {
              // Profil complet - aller au dashboard (connexion suivante)
              router.push('/dashboard');
            } else {
              // Profil incomplet - aller compléter le profil (raison consultation)
              router.push('/auth/complete-profile');
            }
          }, 1500);
        } else {
          // Connexion email classique - aller au dashboard
          setMessage('Connexion réussie !');
          setStatus('success');

          // Redirection vers le dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } catch (error: unknown) {
        console.error(
          "Erreur lors du traitement de l'authentification:",
          error
        );
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
        setMessage(errorMessage);

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

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <LoadingIcon />;
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <LoadingIcon />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#1B998B';
      case 'error':
        return '#EF4444';
      default:
        return '#41556b';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Connexion en cours';
      case 'success':
        return 'Bienvenue !';
      case 'error':
        return 'Erreur de connexion';
      default:
        return 'Connexion en cours';
    }
  };

  return (
    <div
      className='min-h-screen flex items-center justify-center px-4'
      style={{ backgroundColor: '#FBF9F7' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-sm'
      >
        {/* Card */}
        <div
          className='bg-white p-8 text-center'
          style={{
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Icône */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className='flex justify-center mb-6'
          >
            <div
              className='w-20 h-20 rounded-full flex items-center justify-center'
              style={{
                backgroundColor:
                  status === 'error'
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(27, 153, 139, 0.08)',
              }}
            >
              {renderIcon()}
            </div>
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className='text-2xl font-bold mb-3'
            style={{
              fontFamily: 'Marcellus, serif',
              color: status === 'error' ? '#EF4444' : '#3f6655',
            }}
          >
            {getTitle()}
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className='text-body-small mb-4'
            style={{ color: getStatusColor() }}
          >
            {message}
          </motion.p>

          {/* Indicateur de progression */}
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className='mt-4'
            >
              <div
                className='h-1 rounded-full overflow-hidden'
                style={{ backgroundColor: 'rgba(27, 153, 139, 0.1)' }}
              >
                <motion.div
                  className='h-full rounded-full'
                  style={{ backgroundColor: '#1B998B' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: 2,
                    ease: 'easeInOut',
                    repeat: Infinity,
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Message de redirection */}
          {status === 'success' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className='text-body-small mt-4'
              style={{ color: '#A89888' }}
            >
              Redirection en cours...
            </motion.p>
          )}

          {status === 'error' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className='text-body-small mt-4'
              style={{ color: '#A89888' }}
            >
              Redirection vers la page de connexion...
            </motion.p>
          )}
        </div>

        {/* Logo NutriSensia en bas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className='text-center mt-8'
        >
          <p
            className='text-body-small'
            style={{ color: '#A89888' }}
          >
            NutriSensia
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
