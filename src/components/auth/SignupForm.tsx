'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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

const consultationReasonKeys = [
  'menopause_perimenopause',
  'perte_poids_durable',
  'troubles_digestifs',
  'glycemie_diabete',
  'sante_cardiovasculaire',
  'fatigue_energie',
  'longevite_vieillissement',
  'sante_hormonale',
  'alimentation_saine',
  'autre',
] as const;

const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Le prénom est requis')
      .min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z
      .string()
      .min(1, 'Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z
      .string()
      .min(1, "L'adresse e-mail est requise")
      .email('Adresse e-mail invalide'),
    password: z
      .string()
      .min(1, 'Le mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins 1 majuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins 1 chiffre')
      .regex(
        /[^A-Za-z0-9]/,
        'Le mot de passe doit contenir au moins 1 caractère spécial'
      ),
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
    consultationReason: z.enum(consultationReasonKeys),
    marketingConsent: z.boolean(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'Vous devez accepter les conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

function computeStrength(v: string): 0 | 1 | 2 | 3 | 4 {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v) && v.length >= 12) s++;
  return s as 0 | 1 | 2 | 3 | 4;
}

const STRENGTH_BAR_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: 'bg-coral',
  2: 'bg-honey',
  3: 'bg-peps-deep',
  4: 'bg-[var(--ns-sage-500)]',
};

interface SignupFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  redirectTo = '/auth/confirm',
}) => {
  const t = useTranslations('Auth.Signup');
  const tReasons = useTranslations('Auth.Signup.consultationReasons');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: { acceptTerms: false, marketingConsent: false },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          consultationReason: data.consultationReason,
          marketingConsent: data.marketingConsent,
          acceptTerms: data.acceptTerms,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Une erreur s'est produite");
      }

      localStorage.setItem('nutrisensia-pending-email', data.email);
      if (onSuccess) onSuccess();
      router.push(redirectTo);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors de l'inscription";
      setMessage({ type: 'error', text: errorMessage });
      setIsLoading(false);
    }
  };

  const passwordRegister = register('password');
  const strength = computeStrength(passwordValue);
  const strengthLabel = t(`strengthLevel${strength}` as const);

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className='w-full max-w-[460px] bg-cream-50 border-[1.5px] border-ink rounded-[18px] p-7 pb-6 shadow-hard-lg relative'
    >
      {/* Form head */}
      <div className='pb-4 mb-4 border-b-[1.5px] border-ink'>
        <h2 className='font-serif text-[30px] font-medium tracking-[-0.025em] leading-none text-ink'>
          {t('formTitlePre')}{' '}
          <em className='italic font-normal'>{t('formTitleEm')}</em>
        </h2>
        <p className='font-serif italic text-[15px] leading-[1.4] text-ink-3 mt-2'>
          {t('formSubtitle')}
        </p>
      </div>

      {/* Name */}
      <div className='flex flex-col gap-2 mb-3'>
        <label className='font-sans text-xs font-bold tracking-[0.1em] uppercase text-ink'>
          {t('nameLabel')}
        </label>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
          <input
            id='firstName'
            type='text'
            autoComplete='given-name'
            placeholder={t('firstNamePlaceholder')}
            aria-label={t('firstName')}
            {...register('firstName')}
            className={`w-full px-[18px] py-3.5 font-sans text-[15px] text-ink bg-cream-100 border-[1.5px] rounded-[10px] placeholder:italic placeholder:text-ink-4 focus:outline-none focus:shadow-hard-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-200 ${
              errors.firstName ? 'border-coral' : 'border-ink'
            }`}
          />
          <input
            id='lastName'
            type='text'
            autoComplete='family-name'
            placeholder={t('lastNamePlaceholder')}
            aria-label={t('lastName')}
            {...register('lastName')}
            className={`w-full px-[18px] py-3.5 font-sans text-[15px] text-ink bg-cream-100 border-[1.5px] rounded-[10px] placeholder:italic placeholder:text-ink-4 focus:outline-none focus:shadow-hard-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-200 ${
              errors.lastName ? 'border-coral' : 'border-ink'
            }`}
          />
        </div>
        {errors.firstName || errors.lastName ? (
          <span className='font-sans text-xs text-coral pl-0.5'>
            {errors.firstName?.message || errors.lastName?.message}
          </span>
        ) : (
          <span className='font-sans text-xs text-ink-3 leading-[1.4] pl-0.5'>
            {t('nameHelper')}
          </span>
        )}
      </div>

      {/* Email */}
      <div className='flex flex-col gap-2 mb-3'>
        <label
          htmlFor='su-email'
          className='font-sans text-xs font-bold tracking-[0.1em] uppercase text-ink'
        >
          {t('email')}
        </label>
        <input
          id='su-email'
          type='email'
          autoComplete='email'
          placeholder={t('emailPlaceholder')}
          {...register('email')}
          className={`w-full px-[18px] py-3.5 font-sans text-[15px] text-ink bg-cream-100 border-[1.5px] rounded-[10px] placeholder:italic placeholder:text-ink-4 focus:outline-none focus:shadow-hard-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-200 ${
            errors.email ? 'border-coral' : 'border-ink'
          }`}
        />
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
      <div className='flex flex-col gap-2 mb-3'>
        <label
          htmlFor='su-pw'
          className='font-sans text-xs font-bold tracking-[0.1em] uppercase text-ink'
        >
          {t('password')}
        </label>
        <div className='relative'>
          <input
            id='su-pw'
            type={showPassword ? 'text' : 'password'}
            autoComplete='new-password'
            placeholder={t('passwordPlaceholder')}
            {...passwordRegister}
            onChange={e => {
              passwordRegister.onChange(e);
              setPasswordValue(e.target.value);
            }}
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

        {/* Strength meter — bars + Caveat label on one row, replaces helper */}
        <div className='flex items-center gap-2.5 mt-0.5'>
          <div className='flex gap-1 flex-1'>
            {[1, 2, 3, 4].map(i => (
              <span
                key={i}
                className={`flex-1 h-1 rounded ${
                  strength >= i
                    ? STRENGTH_BAR_COLORS[i as 1 | 2 | 3 | 4]
                    : 'bg-ink-4 opacity-[0.35]'
                } transition-colors duration-150`}
              />
            ))}
          </div>
          <span className='font-script text-[14px] text-coral leading-none shrink-0'>
            {strengthLabel}
          </span>
        </div>

        {errors.password && (
          <span className='font-sans text-xs text-coral pl-0.5'>
            {errors.password.message}
          </span>
        )}
      </div>

      {/* Confirm password */}
      <div className='flex flex-col gap-2 mb-3'>
        <label
          htmlFor='su-pw2'
          className='font-sans text-xs font-bold tracking-[0.1em] uppercase text-ink'
        >
          {t('confirmPassword')}
        </label>
        <div className='relative'>
          <input
            id='su-pw2'
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete='new-password'
            placeholder={t('confirmPasswordPlaceholder')}
            {...register('confirmPassword')}
            className={`w-full px-[18px] py-3.5 pr-14 font-sans text-[15px] text-ink bg-cream-100 border-[1.5px] rounded-[10px] placeholder:italic placeholder:text-ink-4 focus:outline-none focus:shadow-hard-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-200 ${
              errors.confirmPassword ? 'border-coral' : 'border-ink'
            }`}
          />
          <button
            type='button'
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={
              showConfirmPassword ? t('hidePassword') : t('showPassword')
            }
            className='absolute right-3.5 top-1/2 -translate-y-1/2 font-sans text-xs font-semibold text-ink-3 hover:text-ink transition-colors'
          >
            {showConfirmPassword ? t('hidePassword') : t('showPassword')}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className='font-sans text-xs text-coral pl-0.5'>
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      {/* Consultation reason */}
      <div className='flex flex-col gap-2 mb-3'>
        <label
          htmlFor='su-reason'
          className='font-sans text-xs font-bold tracking-[0.1em] uppercase text-ink'
        >
          {t('consultationReasonLabel')}
        </label>
        <select
          id='su-reason'
          {...register('consultationReason')}
          defaultValue=''
          className={`w-full px-[18px] py-3.5 font-sans text-[15px] text-ink bg-cream-100 border-[1.5px] rounded-[10px] focus:outline-none focus:shadow-hard-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-200 ${
            errors.consultationReason ? 'border-coral' : 'border-ink'
          }`}
        >
          <option value='' disabled>
            {t('consultationReasonPlaceholder')}
          </option>
          {consultationReasonKeys.map(key => (
            <option key={key} value={key}>
              {tReasons(key)}
            </option>
          ))}
        </select>
        {errors.consultationReason && (
          <span className='font-sans text-xs text-coral pl-0.5'>
            {errors.consultationReason.message}
          </span>
        )}
      </div>

      {/* Marketing consent */}
      <label className='flex items-start gap-2.5 cursor-pointer select-none mb-2 font-sans text-[13px] text-ink-2'>
        <input
          type='checkbox'
          {...register('marketingConsent')}
          className='peer sr-only'
        />
        <span className='mt-0.5 w-5 h-5 border-[1.5px] border-ink rounded-[5px] bg-cream-50 flex items-center justify-center transition-all duration-150 peer-checked:bg-peps peer-checked:shadow-hard-sm peer-checked:-translate-x-[1px] peer-checked:-translate-y-[1px] shrink-0 [&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100'>
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
        <span className='leading-[1.4]'>{t('marketingConsent')}</span>
      </label>

      {/* Accept terms */}
      <label className='flex items-start gap-2.5 cursor-pointer select-none mb-2 font-sans text-[13px] text-ink-2'>
        <input
          type='checkbox'
          {...register('acceptTerms')}
          className='peer sr-only'
        />
        <span className='mt-0.5 w-5 h-5 border-[1.5px] border-ink rounded-[5px] bg-cream-50 flex items-center justify-center transition-all duration-150 peer-checked:bg-peps peer-checked:shadow-hard-sm peer-checked:-translate-x-[1px] peer-checked:-translate-y-[1px] shrink-0 [&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100'>
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
        <span className='leading-[1.4]'>
          {t('termsPre')}{' '}
          <Link
            href='/terms'
            className='text-ink border-b-[1.5px] border-peps pb-px no-underline hover:border-ink transition-colors'
          >
            {t('termsLink')}
          </Link>{' '}
          {t('termsMid')}{' '}
          <Link
            href='/privacy'
            className='text-ink border-b-[1.5px] border-peps pb-px no-underline hover:border-ink transition-colors'
          >
            {t('privacyLink')}
          </Link>
          .
        </span>
      </label>
      {errors.acceptTerms && (
        <p className='mb-2 font-sans text-xs text-coral pl-0.5'>
          {errors.acceptTerms.message}
        </p>
      )}

      {/* Server message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`my-3 p-3 px-3.5 rounded-lg border-[1.5px] font-sans text-[13px] leading-[1.4] ${
            message.type === 'success'
              ? 'bg-peps-soft border-peps-deep text-ink'
              : 'bg-coral-soft border-coral text-ink'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Submit */}
      <button
        type='submit'
        disabled={isLoading}
        className='mt-3 w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-pill font-sans text-[15px] font-bold bg-peps text-ink border-[1.5px] border-ink shadow-hard transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-hard'
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
      <div className='my-4 flex items-center gap-3.5 font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-ink-3'>
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
            console.error('Erreur inscription Google:', error);
          }
        }}
        className='w-full inline-flex items-center justify-center gap-2.5 px-4 py-[13px] rounded-pill bg-cream-50 text-ink border-[1.5px] border-ink font-sans text-[13px] font-semibold transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm hover:bg-cream-100'
      >
        <GoogleLogo />
        {t('googleSignUp')}
      </button>

      {/* Foot */}
      <div className='mt-4 pt-4 border-t border-dashed border-ink-4 text-center font-sans text-[13px] text-ink-3 leading-[1.5]'>
        {t('haveAccount')}{' '}
        <Link
          href='/auth/signin'
          className='font-bold text-ink no-underline border-b-[1.5px] border-peps pb-px hover:border-ink transition-colors'
        >
          {t('loginLink')}
        </Link>{' '}
        {t('haveAccountTail')}
      </div>
    </motion.form>
  );
};

export default SignupForm;
