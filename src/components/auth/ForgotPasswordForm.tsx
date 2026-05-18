'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Link } from '@/i18n/navigation';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise")
    .email('Adresse e-mail invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

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

      if (error) throw error;

      setIsSuccess(true);
      setMessage({ type: 'success', text: t('successMessage') });
    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      if (error.message?.includes('Too many requests')) {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
      } else if (error.message?.includes('User not found')) {
        // Security: still show success to avoid email enumeration
        setIsSuccess(true);
        setMessage({ type: 'success', text: t('successMessage') });
        return;
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
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

      {isSuccess ? (
        <>
          {/* Success card — rotated peps card with hard shadow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, rotate: -0.5 }}
            transition={{ duration: 0.3 }}
            className='bg-peps border-[1.5px] border-ink rounded-ns-md p-5 px-6 mb-5 shadow-hard'
          >
            <h3 className='font-serif text-[22px] font-medium tracking-[-0.02em] leading-tight text-ink mb-2'>
              {t('successHeadlinePre')}{' '}
              <em className='italic font-normal'>{t('successHeadlineEm')}</em>
              {t('successHeadlinePost')}
            </h3>
            <p className='font-sans text-[13px] leading-[1.5] text-ink-2'>
              {t('successBodyPre')}{' '}
              <strong className='inline-block bg-cream-50 px-1.5 py-0.5 border-[1.5px] border-ink rounded text-xs font-bold'>
                {getValues('email')}
              </strong>
              {t('successBodyMid')}{' '}
              <strong className='inline-block bg-cream-50 px-1.5 py-0.5 border-[1.5px] border-ink rounded text-xs font-bold'>
                {t('successBodyExpiry')}
              </strong>{' '}
              {t('successBodyPost')}
            </p>
          </motion.div>

          <Link
            href='/auth/signin'
            className='w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-pill font-sans text-[15px] font-bold bg-peps text-ink border-[1.5px] border-ink shadow-hard transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg no-underline'
          >
            {t('backToLogin')} <span aria-hidden='true'>→</span>
          </Link>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className='flex flex-col gap-2 mb-[18px]'>
            <label
              htmlFor='fp-email'
              className='font-sans text-xs font-bold tracking-[0.1em] uppercase text-ink'
            >
              {t('email')}
            </label>
            <input
              id='fp-email'
              type='email'
              autoComplete='username'
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

          {/* Info chip — sage tone */}
          <div className='flex gap-3 items-start bg-[var(--ns-sage-100)] border-[1.5px] border-[var(--ns-sage-600)] text-[var(--ns-sage-700)] rounded-[10px] px-4 py-3.5 mb-5 font-sans text-[13px] leading-[1.5]'>
            <span className='font-serif italic text-[22px] leading-none shrink-0'>
              i
            </span>
            <span>
              {t('infoChipPre')}{' '}
              <strong className='font-semibold'>{t('infoChipBold1')}</strong>{' '}
              {t('infoChipMid')}{' '}
              <strong className='font-semibold'>{t('infoChipBold2')}</strong>{' '}
              {t('infoChipPost')}
            </span>
          </div>

          {/* Error message */}
          {message?.type === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className='mb-4 p-3 px-3.5 rounded-lg border-[1.5px] border-coral bg-coral-soft font-sans text-[13px] text-ink leading-[1.4]'
            >
              {message.text}
            </motion.div>
          )}

          {/* Submit */}
          <button
            type='submit'
            disabled={isLoading}
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
        </form>
      )}

      {/* Foot */}
      <div className='mt-[22px] pt-[22px] border-t border-dashed border-ink-4 text-center font-sans text-[13px] text-ink-3 leading-[1.5]'>
        {t('rememberPassword')}{' '}
        <Link
          href='/auth/signin'
          className='font-bold text-ink no-underline border-b-[1.5px] border-peps pb-px hover:border-ink transition-colors'
        >
          {t('backToLogin')}
        </Link>{' '}
        {t('backToLoginTail')}
      </div>
    </motion.div>
  );
};

export default ForgotPasswordForm;
