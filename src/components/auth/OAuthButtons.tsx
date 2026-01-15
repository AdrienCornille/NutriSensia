'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Composant pour l'authentification OAuth avec Google
 * Design: Palette Méditerranée
 */
export const GoogleOAuthButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion Google:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type='button'
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className='w-full flex items-center justify-center gap-3 py-4 px-6 border rounded-full transition-all duration-300 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed'
      style={{
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: '15px',
        fontWeight: 600,
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
        borderColor: '#e5e5e5',
        borderRadius: '35px',
      }}
      onMouseEnter={e => {
        (e.target as HTMLButtonElement).style.backgroundColor = '#f8f7ef';
        (e.target as HTMLButtonElement).style.borderColor = '#1b998b';
      }}
      onMouseLeave={e => {
        (e.target as HTMLButtonElement).style.backgroundColor = '#ffffff';
        (e.target as HTMLButtonElement).style.borderColor = '#e5e5e5';
      }}
    >
      {/* Google Logo */}
      <svg className='w-5 h-5' viewBox='0 0 24 24'>
        <path
          fill='#4285F4'
          d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        />
        <path
          fill='#34A853'
          d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        />
        <path
          fill='#FBBC05'
          d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
        />
        <path
          fill='#EA4335'
          d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        />
      </svg>
      {isLoading ? 'Connexion en cours...' : 'Continuer avec Google'}
    </button>
  );
};

/**
 * Composant pour l'authentification OAuth avec GitHub (optionnel)
 * Design: Palette Méditerranée
 */
export const GitHubOAuthButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion GitHub:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type='button'
      onClick={handleGitHubSignIn}
      disabled={isLoading}
      className='w-full flex items-center justify-center gap-3 py-4 px-6 border rounded-full transition-all duration-300 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed'
      style={{
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: '15px',
        fontWeight: 600,
        color: '#ffffff',
        backgroundColor: '#1a1a1a',
        borderColor: '#1a1a1a',
        borderRadius: '35px',
      }}
      onMouseEnter={e => {
        (e.target as HTMLButtonElement).style.backgroundColor = '#333333';
      }}
      onMouseLeave={e => {
        (e.target as HTMLButtonElement).style.backgroundColor = '#1a1a1a';
      }}
    >
      {/* GitHub Logo */}
      <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
      </svg>
      {isLoading ? 'Connexion...' : 'Continuer avec GitHub'}
    </button>
  );
};

/**
 * Composant de séparateur pour les formulaires d'authentification
 * Design: Palette Méditerranée
 */
export const AuthDivider: React.FC = () => {
  return (
    <div className='flex items-center gap-4 my-2'>
      <div className='flex-1 h-px' style={{ backgroundColor: '#e5ded6' }} />
      <span
        style={{
          fontFamily:
            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: '14px',
          color: '#41556b',
        }}
      >
        ou
      </span>
      <div className='flex-1 h-px' style={{ backgroundColor: '#e5ded6' }} />
    </div>
  );
};

/**
 * Composant de navigation entre les formulaires d'authentification
 * Design: Palette Méditerranée
 */
export const AuthNavigation: React.FC<{
  currentForm: 'signin' | 'signup' | 'reset';
}> = ({ currentForm }) => {
  const getNavigationText = () => {
    switch (currentForm) {
      case 'signin':
        return {
          question: "Vous n'avez pas de compte ?",
          link: 'Créer un compte',
          href: '/auth/signup',
        };
      case 'signup':
        return {
          question: 'Vous avez déjà un compte ?',
          link: 'Se connecter',
          href: '/auth/signin',
        };
      case 'reset':
        return {
          question: 'Vous vous souvenez de votre mot de passe ?',
          link: 'Se connecter',
          href: '/auth/signin',
        };
      default:
        return {
          question: '',
          link: '',
          href: '',
        };
    }
  };

  const { question, link, href } = getNavigationText();

  return (
    <div className='text-center'>
      <p
        style={{
          fontFamily:
            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: '15px',
          color: '#41556b',
        }}
      >
        {question}{' '}
        <button
          type='button'
          onClick={() => (window.location.href = href)}
          className='font-semibold transition-all duration-300 hover:underline'
          style={{ color: '#1b998b' }}
        >
          {link}
        </button>
      </p>
    </div>
  );
};
