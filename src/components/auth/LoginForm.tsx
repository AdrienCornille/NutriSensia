'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui';
import { AuthDivider } from './OAuthButtons';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Link } from '@/i18n/navigation';

// Logo Google officiel en SVG avec couleurs
const GoogleLogo = () => (
  <svg
    width='18'
    height='18'
    viewBox='0 0 18 18'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z'
      fill='#4285F4'
    />
    <path
      d='M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z'
      fill='#34A853'
    />
    <path
      d='M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z'
      fill='#FBBC05'
    />
    <path
      d='M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z'
      fill='#EA4335'
    />
  </svg>
);

// Schéma de validation Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise")
    .email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

/**
 * Formulaire de connexion NutriSensia
 * - Email/Password avec validation Zod
 * - Toggle visibilité mot de passe
 * - Checkbox "Se souvenir de moi"
 * - Connexion Google OAuth
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  redirectTo = '/dashboard',
}) => {
  const t = useTranslations('Auth.Login');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!isSupabaseConfigured) {
      setMessage({
        type: 'error',
        text: "Service d'authentification non configuré",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      // Gérer "Se souvenir de moi" - Supabase gère la persistance par défaut
      // Si rememberMe est false, on pourrait implémenter une logique de session plus courte

      // Vérifier si 2FA est requis
      const { data: mfaData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (mfaData?.nextLevel === 'aal2' && mfaData?.currentLevel === 'aal1') {
        // Rediriger vers la vérification MFA
        setMessage({
          type: 'success',
          text: 'Vérification de sécurité requise...',
        });
        setTimeout(() => {
          router.push('/auth/verify-mfa');
        }, 1000);
        return;
      }

      // Connexion réussie
      setMessage({
        type: 'success',
        text: 'Connexion réussie ! Redirection...',
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        router.push(redirectTo);
      }, 1000);
    } catch (error: any) {
      // Traduire les erreurs Supabase en français
      let errorMessage = 'Email ou mot de passe incorrect';

      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='w-full max-w-sm mx-auto'
    >
      {/* Titre et sous-titre */}
      <div className='mb-8'>
        <h1
          className='text-[32px] leading-[40px] font-bold mb-2'
          style={{
            fontFamily: 'Marcellus, serif',
            color: '#3f6655',
          }}
        >
          {t('title')}
        </h1>
        <p className='text-body' style={{ color: '#41556b' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-5'>
        {/* Email */}
        <Input
          id='email'
          type='email'
          label={t('email')}
          placeholder={t('emailPlaceholder')}
          {...register('email')}
          error={errors.email?.message}
          required
          fullWidth
          autoComplete='email'
        />

        {/* Mot de passe avec toggle */}
        <div className='relative'>
          <Input
            id='password'
            type={showPassword ? 'text' : 'password'}
            label={t('password')}
            placeholder={t('passwordPlaceholder')}
            {...register('password')}
            error={errors.password?.message}
            required
            fullWidth
            autoComplete='current-password'
            rightIcon={
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='text-neutral-medium hover:text-neutral-dark transition-colors'
                aria-label={
                  showPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
              >
                {showPassword ? (
                  <EyeSlashIcon className='w-5 h-5' />
                ) : (
                  <EyeIcon className='w-5 h-5' />
                )}
              </button>
            }
          />
        </div>

        {/* Remember me et Mot de passe oublié */}
        <div className='flex items-center justify-between'>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              {...register('rememberMe')}
              className='w-4 h-4 rounded border-neutral-border text-primary focus:ring-primary focus:ring-offset-0'
            />
            <span className='text-body-small text-neutral-medium'>
              {t('rememberMe')}
            </span>
          </label>

          <Link
            href='/auth/forgot-password'
            className='text-body-small font-medium transition-colors hover:underline'
            style={{ color: '#1B998B' }}
          >
            {t('forgotPassword')}
          </Link>
        </div>

        {/* Message d'erreur/succès */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg text-body-small ${
              message.type === 'success'
                ? 'bg-functional-success/10 text-functional-success border border-functional-success/20'
                : 'bg-functional-error/10 text-functional-error border border-functional-error/20'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Bouton de connexion - Style CTA NutriSensia */}
        <motion.button
          type='submit'
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 24px',
            borderRadius: '35px',
            fontFamily:
              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '25.2px',
            textAlign: 'center',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            border: 'none',
            background: 'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
            color: '#FDFCFB',
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            if (!isLoading) {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background =
              'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
          }}
        >
          {isLoading ? (
            <>
              <svg
                className='animate-spin h-5 w-5'
                viewBox='0 0 24 24'
                fill='none'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              {t('submitting')}
            </>
          ) : (
            t('submit')
          )}
        </motion.button>
      </form>

      {/* Séparateur */}
      <AuthDivider />

      {/* Google OAuth - Bouton avec vrai logo */}
      <motion.button
        type='button'
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={async () => {
          if (!isSupabaseConfigured) return;
          try {
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                },
              },
            });
          } catch (error) {
            console.error('Erreur connexion Google:', error);
          }
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '14px 24px',
          borderRadius: '35px',
          fontFamily:
            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: '1.5px solid #e5e5e5',
          backgroundColor: '#ffffff',
          color: '#41556b',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#f8f8f8';
          e.currentTarget.style.borderColor = '#d0d0d0';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#e5e5e5';
        }}
      >
        <GoogleLogo />
        {t('googleSignIn')}
      </motion.button>

      {/* Lien vers l'inscription */}
      <div className='mt-6 text-center'>
        <p className='text-body text-neutral-medium'>
          {t('noAccount')}{' '}
          <Link
            href='/auth/register'
            className='font-medium transition-colors hover:underline'
            style={{ color: '#1B998B' }}
          >
            {t('createAccount')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;
