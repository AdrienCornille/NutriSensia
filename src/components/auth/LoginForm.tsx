'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui';
import { AuthDivider } from './OAuthButtons';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
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

/**
 * Modal de confirmation d'envoi d'email
 */
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  email: string;
  type: 'success' | 'error';
  message: string;
}> = ({ isOpen, onClose, email, type, message }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-50 flex items-center justify-center p-4'
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className='bg-white p-6 max-w-sm w-full text-center'
          style={{
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Icone */}
          <div className='flex justify-center mb-4'>
            {type === 'success' ? (
              <div
                className='w-16 h-16 rounded-full flex items-center justify-center'
                style={{ backgroundColor: 'rgba(27, 153, 139, 0.1)' }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='32'
                  height='32'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#1b998b'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                  <polyline points='22 4 12 14.01 9 11.01' />
                </svg>
              </div>
            ) : (
              <div
                className='w-16 h-16 rounded-full flex items-center justify-center'
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='32'
                  height='32'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#ef4444'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <circle cx='12' cy='12' r='10' />
                  <line x1='15' y1='9' x2='9' y2='15' />
                  <line x1='9' y1='9' x2='15' y2='15' />
                </svg>
              </div>
            )}
          </div>

          {/* Titre */}
          <h3
            className='text-xl font-bold mb-2'
            style={{
              fontFamily: 'Marcellus, serif',
              color: type === 'success' ? '#1b998b' : '#ef4444',
            }}
          >
            {type === 'success' ? 'Email envoyé !' : 'Erreur'}
          </h3>

          {/* Message */}
          <p
            className='mb-2'
            style={{
              fontSize: '14px',
              lineHeight: '22px',
              color: '#41556b',
            }}
          >
            {message}
          </p>

          {/* Email affiché */}
          {type === 'success' && email && (
            <p
              className='font-semibold mb-4'
              style={{
                fontSize: '14px',
                color: '#1b998b',
              }}
            >
              {email}
            </p>
          )}

          {/* Bouton fermer */}
          <motion.button
            type='button'
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='w-full py-3 px-6 font-semibold text-white transition-all duration-300'
            style={{
              fontSize: '14px',
              background:
                type === 'success'
                  ? 'linear-gradient(135deg, #1b998b 0%, #147569 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '35px',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background =
                type === 'success'
                  ? 'linear-gradient(135deg, #147569 0%, #0f5a50 100%)'
                  : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background =
                type === 'success'
                  ? 'linear-gradient(135deg, #1b998b 0%, #147569 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            }}
          >
            Compris
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

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

const REMEMBER_EMAIL_KEY = 'nutrisensia-remember-email';

/**
 * Formate les secondes en minutes:secondes (ex: 14:32)
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

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
  const supabase = createClient(); // Utiliser le client SSR pour la cohérence des sessions
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      rememberMe: false,
    },
  });

  // Charger l'email mémorisé au montage du composant
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setValue('email', savedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  // Compte à rebours pour le temps de blocage
  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setMessage(null); // Effacer le message quand le temps est écoulé
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

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
    setEmailNotConfirmed(false);

    try {
      // Utiliser l'API avec rate limiting
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      // Cas: Compte bloqué
      if (response.status === 429) {
        const remaining = result.remainingSeconds ?? 900; // 15 min par défaut
        setLockoutSeconds(remaining);
        setMessage({
          type: 'error',
          text: `Compte temporairement bloqué. Réessayez dans ${formatTime(remaining)}.`,
        });
        return;
      }

      // Cas: Échec de connexion
      if (!response.ok) {
        // Afficher le nombre de tentatives restantes si proche du blocage
        let errorMessage = result.error || 'Email ou mot de passe incorrect';

        if (
          result.remainingAttempts !== undefined &&
          result.remainingAttempts <= 2
        ) {
          errorMessage += ` (${result.remainingAttempts} tentative${result.remainingAttempts > 1 ? 's' : ''} restante${result.remainingAttempts > 1 ? 's' : ''})`;
        }

        if (result.code === 'EMAIL_NOT_CONFIRMED') {
          setEmailNotConfirmed(true);
          setCurrentEmail(data.email);
        }

        setMessage({
          type: 'error',
          text: errorMessage,
        });
        return;
      }

      // Connexion réussie via l'API - maintenant authentifier côté client
      // pour établir la session dans le navigateur
      const { error: clientError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (clientError) {
        // Si l'API a réussi mais pas le client, c'est bizarre mais on continue
        console.warn('Client-side auth failed after API success:', clientError);
      }

      // Connexion réussie
      setMessage({
        type: 'success',
        text: 'Connexion réussie ! Redirection...',
      });

      // Gérer "Se souvenir de moi"
      if (data.rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, data.email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      if (onSuccess) {
        onSuccess();
      }

      // Utiliser window.location.href pour forcer un rechargement complet
      // Cela garantit que les cookies de session sont envoyés avec la requête
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 1000);
    } catch (error: unknown) {
      console.error('Login error:', error);
      setMessage({
        type: 'error',
        text: "Une erreur s'est produite lors de la connexion",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!currentEmail) return;

    setIsResending(true);

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: currentEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur s'est produite");
      }

      // Afficher le modal de succès
      setModalState({
        isOpen: true,
        type: 'success',
        message: 'Un nouvel email de confirmation a été envoyé à :',
      });
      setEmailNotConfirmed(false);
      setMessage(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors de l'envoi de l'email";

      // Afficher le modal d'erreur
      setModalState({
        isOpen: true,
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        email={currentEmail}
        type={modalState.type}
        message={modalState.message}
      />

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

          {/* Message d'erreur/succès/info */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-body-small ${
                message.type === 'success'
                  ? 'bg-functional-success/10 text-functional-success border border-functional-success/20'
                  : message.type === 'info'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-functional-error/10 text-functional-error border border-functional-error/20'
              }`}
            >
              {lockoutSeconds !== null && lockoutSeconds > 0 ? (
                <span>
                  Compte temporairement bloqué. Réessayez dans{' '}
                  <span className='font-semibold'>
                    {formatTime(lockoutSeconds)}
                  </span>
                  .
                </span>
              ) : (
                message.text
              )}
            </motion.div>
          )}

          {/* Bouton pour renvoyer l'email de confirmation */}
          {emailNotConfirmed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='p-3 rounded-lg bg-amber-50 border border-amber-200'
            >
              <p className='text-body-small text-amber-800 mb-2'>
                Vous n'avez pas reçu l'email de confirmation ?
              </p>
              <button
                type='button'
                onClick={handleResendConfirmation}
                disabled={isResending}
                className='text-body-small font-medium text-amber-700 hover:text-amber-900 underline disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isResending
                  ? 'Envoi en cours...'
                  : "Renvoyer l'email de confirmation"}
              </button>
            </motion.div>
          )}

          {/* Bouton de connexion - Style CTA NutriSensia */}
          <motion.button
            type='submit'
            disabled={
              isLoading || (lockoutSeconds !== null && lockoutSeconds > 0)
            }
            whileHover={{
              scale:
                isLoading || (lockoutSeconds !== null && lockoutSeconds > 0)
                  ? 1
                  : 1.02,
            }}
            whileTap={{
              scale:
                isLoading || (lockoutSeconds !== null && lockoutSeconds > 0)
                  ? 1
                  : 0.98,
            }}
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
              cursor:
                isLoading || (lockoutSeconds !== null && lockoutSeconds > 0)
                  ? 'not-allowed'
                  : 'pointer',
              transition: 'all 0.3s ease',
              border: 'none',
              background: 'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
              color: '#FDFCFB',
              opacity:
                isLoading || (lockoutSeconds !== null && lockoutSeconds > 0)
                  ? 0.7
                  : 1,
            }}
            onMouseEnter={e => {
              if (
                !isLoading &&
                !(lockoutSeconds !== null && lockoutSeconds > 0)
              ) {
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
              href='/auth/signup'
              className='font-medium transition-colors hover:underline'
              style={{ color: '#1B998B' }}
            >
              {t('createAccount')}
            </Link>
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default LoginForm;
