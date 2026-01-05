'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Link } from '@/i18n/navigation';

// Schéma de validation Zod
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise")
    .email('Adresse e-mail invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Formulaire de réinitialisation de mot de passe NutriSensia
 * - Champ email uniquement
 * - Message de succès après envoi
 * - Lien retour vers connexion
 */
export const ForgotPasswordForm: React.FC = () => {
  const t = useTranslations('Auth.ForgotPassword');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
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
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      // Succès - afficher le message de confirmation
      setIsSuccess(true);
      setMessage({
        type: 'success',
        text: t('successMessage'),
      });
    } catch (error: any) {
      // Traduire les erreurs Supabase en français
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';

      if (error.message?.includes('Too many requests')) {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
      } else if (error.message?.includes('User not found')) {
        // Pour des raisons de sécurité, on affiche quand même un message de succès
        setIsSuccess(true);
        setMessage({
          type: 'success',
          text: t('successMessage'),
        });
        return;
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
      {/* État de succès */}
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className='text-center'
        >
          {/* Icône de succès */}
          <div className='mb-6 flex justify-center'>
            <div
              className='w-16 h-16 rounded-full flex items-center justify-center'
              style={{ backgroundColor: 'rgba(27, 153, 139, 0.1)' }}
            >
              <CheckCircleIcon
                className='w-8 h-8'
                style={{ color: '#1B998B' }}
              />
            </div>
          </div>

          {/* Titre succès */}
          <h1
            className='text-[28px] leading-[36px] font-bold mb-3'
            style={{
              fontFamily: 'Marcellus, serif',
              color: '#3f6655',
            }}
          >
            {t('successTitle')}
          </h1>

          {/* Message */}
          <p className='text-body mb-6' style={{ color: '#41556b' }}>
            {t('successMessage')}
          </p>

          {/* Email envoyé à */}
          <p
            className='text-body-small mb-8 px-4 py-3 rounded-lg'
            style={{
              backgroundColor: 'rgba(27, 153, 139, 0.05)',
              color: '#41556b',
            }}
          >
            {t('sentTo')} <strong>{getValues('email')}</strong>
          </p>

          {/* Bouton retour connexion */}
          <Link
            href='/auth/login'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 32px',
              borderRadius: '35px',
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
              color: '#FDFCFB',
            }}
          >
            {t('backToLogin')}
          </Link>
        </motion.div>
      ) : (
        <>
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
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className='space-y-5'
          >
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

            {/* Message d'erreur */}
            {message && message.type === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='p-3 rounded-lg text-body-small bg-functional-error/10 text-functional-error border border-functional-error/20'
              >
                {message.text}
              </motion.div>
            )}

            {/* Bouton d'envoi - Style CTA NutriSensia */}
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

          {/* Lien retour connexion */}
          <div className='mt-6 text-center'>
            <p className='text-body text-neutral-medium'>
              {t('rememberPassword')}{' '}
              <Link
                href='/auth/login'
                className='font-medium transition-colors hover:underline'
                style={{ color: '#1B998B' }}
              >
                {t('backToLogin')}
              </Link>
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ForgotPasswordForm;
