'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';

const GoogleLogo = () => (
  <svg
    width='18'
    height='18'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
  >
    <path
      d='M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.3-.9 2.4-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5z'
      fill='#4285F4'
    />
    <path
      d='M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3v2.6C4.7 19.8 8.1 22 12 22z'
      fill='#34A853'
    />
    <path
      d='M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.5H3C2.3 8.8 2 10.4 2 12s.4 3.2 1 4.5l3.4-2.6z'
      fill='#FBBC05'
    />
    <path
      d='M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2 8.1 2 4.7 4.2 3 7.5l3.4 2.6C7.2 7.6 9.4 5.9 12 5.9z'
      fill='#EA4335'
    />
  </svg>
);

/**
 * Confirmation modal (resend email confirmation result) — DS v2 styling
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
        className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className='bg-cream-50 border-[1.5px] border-ink rounded-ns-md p-7 max-w-sm w-full text-center shadow-hard-lg'
          onClick={e => e.stopPropagation()}
        >
          <div className='flex justify-center mb-4'>
            <div
              className={`w-14 h-14 rounded-full border-[1.5px] border-ink flex items-center justify-center ${
                type === 'success' ? 'bg-peps' : 'bg-coral-soft'
              }`}
            >
              {type === 'success' ? (
                <svg
                  width='28'
                  height='28'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='text-ink'
                >
                  <polyline points='20 6 9 17 4 12' />
                </svg>
              ) : (
                <svg
                  width='28'
                  height='28'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='text-coral'
                >
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              )}
            </div>
          </div>

          <h3 className='font-serif text-[24px] font-medium tracking-[-0.025em] text-ink mb-2'>
            {type === 'success' ? 'Email envoyé !' : 'Erreur'}
          </h3>

          <p className='font-sans text-[14px] text-ink-2 leading-[1.5] mb-2'>
            {message}
          </p>

          {type === 'success' && email && (
            <p className='font-sans text-[14px] font-semibold text-ink mb-5'>
              {email}
            </p>
          )}

          <button
            type='button'
            onClick={onClose}
            className='w-full inline-flex items-center justify-center px-6 py-3 rounded-pill font-sans text-[14px] font-bold bg-peps text-ink border-[1.5px] border-ink shadow-hard transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
          >
            Compris
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  redirectTo = '/dashboard',
}) => {
  const t = useTranslations('Auth.Login');
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
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
    defaultValues: { rememberMe: false },
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setValue('email', savedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setMessage(null);
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const result = await response.json();

      if (response.status === 429) {
        const remaining = result.remainingSeconds ?? 900;
        setLockoutSeconds(remaining);
        setMessage({
          type: 'error',
          text: `Compte temporairement bloqué. Réessayez dans ${formatTime(remaining)}.`,
        });
        return;
      }

      if (!response.ok) {
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
        setMessage({ type: 'error', text: errorMessage });
        return;
      }

      const { error: clientError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (clientError) {
        console.warn('Client-side auth failed after API success:', clientError);
      }

      setMessage({
        type: 'success',
        text: 'Connexion réussie ! Redirection...',
      });

      if (data.rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, data.email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      if (onSuccess) onSuccess();

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentEmail }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Une erreur s'est produite");
      }
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
      setModalState({ isOpen: true, type: 'error', message: errorMessage });
    } finally {
      setIsResending(false);
    }
  };

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const handleCapsCheck = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (typeof e.getModifierState === 'function') {
      setCapsOn(e.getModifierState('CapsLock'));
    }
  };

  const isLocked = lockoutSeconds !== null && lockoutSeconds > 0;
  const isDisabled = isLoading || isLocked;

  return (
    <>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        email={currentEmail}
        type={modalState.type}
        message={modalState.message}
      />

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className='w-full max-w-[460px] bg-cream-50 border-[1.5px] border-ink rounded-[18px] p-9 pb-8 shadow-hard-lg relative'
      >
        {/* Form head */}
        <div className='pb-6 mb-[26px] border-b-[1.5px] border-ink'>
          <h2 className='font-serif text-[30px] font-medium tracking-[-0.025em] leading-none text-ink'>
            {t('formTitlePre')}{' '}
            <em className='italic font-normal'>{t('formTitleEm')}</em>
          </h2>
          <p className='font-serif italic text-[15px] leading-[1.4] text-ink-3 mt-2'>
            {t('formSubtitle')}
          </p>
        </div>

        {/* Email */}
        <div className='flex flex-col gap-2 mb-[18px]'>
          <label
            htmlFor='lg-email'
            className='font-sans text-xs font-bold tracking-[0.1em] uppercase text-ink'
          >
            {t('email')}
          </label>
          <div className='relative'>
            <input
              id='lg-email'
              type='email'
              autoComplete='username'
              placeholder={t('emailPlaceholder')}
              {...register('email')}
              className={`w-full px-[18px] py-3.5 pr-12 font-sans text-[15px] text-ink bg-cream-100 border-[1.5px] rounded-[10px] placeholder:italic placeholder:text-ink-4 focus:outline-none focus:shadow-hard-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-200 ${
                errors.email ? 'border-coral' : 'border-ink'
              }`}
            />
          </div>
          {errors.email ? (
            <span className='font-sans text-xs text-coral pl-0.5'>
              {errors.email.message}
            </span>
          ) : (
            <span className='font-sans text-xs text-ink-3 leading-[1.4] pl-0.5'>
              {t('emailHelper')}
            </span>
          )}
        </div>

        {/* Password */}
        <div className='flex flex-col gap-2 mb-[18px]'>
          <div className='flex items-baseline justify-between gap-3'>
            <label
              htmlFor='lg-pw'
              className='font-sans text-xs font-bold tracking-[0.1em] uppercase text-ink'
            >
              {t('password')}
            </label>
            <Link
              href='/auth/forgot-password'
              className='font-sans text-[13px] font-semibold text-ink no-underline border-b-[1.5px] border-ink pb-px hover:bg-peps hover:border-peps transition-colors'
            >
              {t('forgotPassword')}
            </Link>
          </div>
          <div className='relative'>
            <input
              id='lg-pw'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              placeholder={t('passwordPlaceholder')}
              {...register('password')}
              onKeyDown={handleCapsCheck}
              onKeyUp={handleCapsCheck}
              onBlur={() => setCapsOn(false)}
              className={`w-full px-[18px] py-3.5 pr-14 font-sans text-[15px] text-ink bg-cream-100 border-[1.5px] rounded-[10px] placeholder:italic placeholder:text-ink-4 focus:outline-none focus:shadow-hard-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-200 ${
                errors.password ? 'border-coral' : 'border-ink'
              }`}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              className='absolute right-3.5 top-1/2 -translate-y-1/2 font-sans text-xs font-semibold text-ink-3 hover:text-ink transition-colors'
            >
              {showPassword ? t('hidePassword') : t('showPassword')}
            </button>
          </div>
          {errors.password ? (
            <span className='font-sans text-xs text-coral pl-0.5'>
              {errors.password.message}
            </span>
          ) : (
            <span className='font-sans text-xs text-ink-3 leading-[1.4] pl-0.5'>
              {t('passwordHelper')}
            </span>
          )}

          {capsOn && (
            <div className='mt-1.5 p-2.5 px-3 bg-coral-soft border-[1.5px] border-coral rounded-lg font-sans text-xs text-ink leading-[1.4] flex items-start gap-2'>
              <span className='bg-coral text-cream-50 text-[10px] tracking-[0.12em] uppercase font-bold px-1.5 py-0.5 rounded shrink-0'>
                {t('capsLockLabel')}
              </span>
              <span>{t('capsLockText')}</span>
            </div>
          )}
        </div>

        {/* Remember me */}
        <div className='flex items-center justify-between gap-4 my-1.5 mb-[22px]'>
          <label className='inline-flex items-center gap-2.5 cursor-pointer select-none font-sans text-[13px] text-ink-2'>
            <input
              type='checkbox'
              {...register('rememberMe')}
              className='peer sr-only'
            />
            <span className='w-5 h-5 border-[1.5px] border-ink rounded-[5px] bg-cream-50 flex items-center justify-center transition-all duration-150 peer-checked:bg-peps peer-checked:shadow-hard-sm peer-checked:-translate-x-[1px] peer-checked:-translate-y-[1px] [&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100'>
              <svg
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-ink transition-opacity duration-150'
              >
                <polyline points='20 6 9 17 4 12' />
              </svg>
            </span>
            <span>
              {t('rememberMe')}{' '}
              <em className='font-serif italic text-ink-3'>
                {t('rememberMeHint')}
              </em>
            </span>
          </label>
        </div>

        {/* Server messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 px-3.5 rounded-lg border-[1.5px] font-sans text-[13px] leading-[1.4] ${
              message.type === 'success'
                ? 'bg-peps-soft border-peps-deep text-ink'
                : message.type === 'info'
                  ? 'bg-[var(--ns-sage-100)] border-[var(--ns-sage-600)] text-[var(--ns-sage-700)]'
                  : 'bg-coral-soft border-coral text-ink'
            }`}
          >
            {isLocked ? (
              <span>
                Compte temporairement bloqué. Réessayez dans{' '}
                <span className='font-bold'>{formatTime(lockoutSeconds!)}</span>
                .
              </span>
            ) : (
              message.text
            )}
          </motion.div>
        )}

        {emailNotConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-4 p-3 px-3.5 rounded-lg border-[1.5px] border-honey bg-honey/15 font-sans text-[13px] text-ink leading-[1.4]'
          >
            <p className='mb-1.5'>
              Vous n'avez pas reçu l'email de confirmation ?
            </p>
            <button
              type='button'
              onClick={handleResendConfirmation}
              disabled={isResending}
              className='font-sans text-[13px] font-bold text-ink no-underline border-b-[1.5px] border-ink pb-px hover:bg-peps hover:border-peps disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isResending
                ? 'Envoi en cours...'
                : "Renvoyer l'email de confirmation"}
            </button>
          </motion.div>
        )}

        {/* Submit */}
        <button
          type='submit'
          disabled={isDisabled}
          className='w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-pill font-sans text-[15px] font-bold bg-peps text-ink border-[1.5px] border-ink shadow-hard transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-hard'
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
            <>
              {t('submit')} <span aria-hidden='true'>→</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className='my-[26px] flex items-center gap-3.5 font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-ink-3'>
          <span className='flex-1 h-[1.5px] bg-ink opacity-[0.18]' />
          <span>{t('orContinueWith')}</span>
          <span className='flex-1 h-[1.5px] bg-ink opacity-[0.18]' />
        </div>

        {/* Google */}
        <button
          type='button'
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
          className='w-full inline-flex items-center justify-center gap-2.5 px-4 py-[13px] rounded-pill bg-cream-50 text-ink border-[1.5px] border-ink font-sans text-[13px] font-semibold transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm hover:bg-cream-100'
        >
          <GoogleLogo />
          {t('googleSignIn')}
        </button>

        {/* Foot */}
        <div className='mt-[22px] pt-[22px] border-t border-dashed border-ink-4 text-center font-sans text-[13px] text-ink-3 leading-[1.5]'>
          {t('noAccount')}{' '}
          <Link
            href='/auth/signup'
            className='font-bold text-ink no-underline border-b-[1.5px] border-peps pb-px hover:border-ink transition-colors'
          >
            {t('createAccount')}
          </Link>{' '}
          {t('noAccountTail')}
        </div>
      </motion.form>
    </>
  );
};

export default LoginForm;
