'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
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
      .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins 1 caractère spécial'),
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'Vous devez accepter les conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

// Texte d'aide pour les exigences du mot de passe
const PasswordRequirementsHint: React.FC = () => (
  <p className='mt-1.5 text-xs text-neutral-medium'>
    Min. 8 caractères avec 1 majuscule, 1 chiffre et 1 caractère spécial
  </p>
);

interface SignupFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

/**
 * Formulaire d'inscription NutriSensia
 * - Nom complet, Email, Password avec validation Zod
 * - Toggle visibilité mot de passe
 * - Checkbox CGU
 * - Inscription Google OAuth
 */
export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  redirectTo = '/auth/confirm',
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignupFormData) => {
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
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      // Inscription réussie - redirection immédiate vers la page de confirmation
      if (onSuccess) {
        onSuccess();
      }

      router.push(redirectTo);
    } catch (error: any) {
      // Traduire les erreurs Supabase en français
      let errorMessage = "Une erreur s'est produite lors de l'inscription";

      if (error.message?.includes('User already registered')) {
        errorMessage = 'Un compte existe déjà avec cet email';
      } else if (error.message?.includes('Password should be')) {
        errorMessage = 'Le mot de passe doit contenir au moins 8 caractères';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Adresse email invalide';
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      });
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
          Créer un compte
        </h1>
        <p className='text-body' style={{ color: '#41556b' }}>
          Rejoignez NutriSensia pour votre accompagnement nutritionnel
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4'>
        {/* Prénom et Nom sur la même ligne */}
        <div className='grid grid-cols-2 gap-3'>
          <Input
            id='firstName'
            type='text'
            label='Prénom'
            placeholder='Votre prénom'
            {...register('firstName')}
            error={errors.firstName?.message}
            required
            fullWidth
            autoComplete='given-name'
          />
          <Input
            id='lastName'
            type='text'
            label='Nom'
            placeholder='Votre nom'
            {...register('lastName')}
            error={errors.lastName?.message}
            required
            fullWidth
            autoComplete='family-name'
          />
        </div>

        {/* Email */}
        <Input
          id='email'
          type='email'
          label='Adresse e-mail'
          placeholder='votre@email.com'
          {...register('email')}
          error={errors.email?.message}
          required
          fullWidth
          autoComplete='email'
        />

        {/* Mot de passe avec toggle */}
        <div>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              label='Mot de passe'
              placeholder='Créez un mot de passe sécurisé'
              {...register('password')}
              error={errors.password?.message}
              required
              fullWidth
              autoComplete='new-password'
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
          {/* Exigences du mot de passe */}
          <PasswordRequirementsHint />
        </div>

        {/* Confirmer mot de passe */}
        <div className='relative'>
          <Input
            id='confirmPassword'
            type={showConfirmPassword ? 'text' : 'password'}
            label='Confirmer le mot de passe'
            placeholder='Confirmez votre mot de passe'
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            required
            fullWidth
            autoComplete='new-password'
            rightIcon={
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='text-neutral-medium hover:text-neutral-dark transition-colors'
                aria-label={
                  showConfirmPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className='w-5 h-5' />
                ) : (
                  <EyeIcon className='w-5 h-5' />
                )}
              </button>
            }
          />
        </div>

        {/* Checkbox CGU */}
        <div className='flex items-start gap-2'>
          <input
            type='checkbox'
            id='acceptTerms'
            {...register('acceptTerms')}
            className='w-4 h-4 mt-1 rounded border-neutral-border text-primary focus:ring-primary focus:ring-offset-0'
          />
          <label
            htmlFor='acceptTerms'
            className='text-body-small text-neutral-medium cursor-pointer'
          >
            J'accepte les{' '}
            <Link
              href='/terms'
              className='font-medium hover:underline'
              style={{ color: '#1B998B' }}
            >
              conditions d'utilisation
            </Link>{' '}
            et la{' '}
            <Link
              href='/privacy'
              className='font-medium hover:underline'
              style={{ color: '#1B998B' }}
            >
              politique de confidentialité
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className='text-sm text-functional-error'>
            {errors.acceptTerms.message}
          </p>
        )}

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

        {/* Bouton d'inscription - Style CTA NutriSensia */}
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
              Création en cours...
            </>
          ) : (
            'Créer mon compte'
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
            console.error('Erreur inscription Google:', error);
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
        S'inscrire avec Google
      </motion.button>

      {/* Lien vers la connexion */}
      <div className='mt-6 text-center'>
        <p className='text-body text-neutral-medium'>
          Déjà un compte ?{' '}
          <Link
            href='/auth/signin'
            className='font-medium transition-colors hover:underline'
            style={{ color: '#1B998B' }}
          >
            Se connecter
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignupForm;
