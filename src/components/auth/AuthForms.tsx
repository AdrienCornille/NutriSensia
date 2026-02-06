'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
} from '@/components/ui';
// Note: SignUpForm utilise des styles inline Palette Méditerranée
// Les autres composants (SignInForm, ResetPasswordForm, UpdatePasswordForm) utilisent encore les composants UI
import { supabase } from '@/lib/supabase';

// Liste des pays avec indicatifs et drapeaux
const countries = [
  { code: '+41', flag: '🇨🇭', name: 'Suisse' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Allemagne' },
  { code: '+39', flag: '🇮🇹', name: 'Italie' },
  { code: '+43', flag: '🇦🇹', name: 'Autriche' },
  { code: '+32', flag: '🇧🇪', name: 'Belgique' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+377', flag: '🇲🇨', name: 'Monaco' },
  { code: '+34', flag: '🇪🇸', name: 'Espagne' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+44', flag: '🇬🇧', name: 'Royaume-Uni' },
  { code: '+1', flag: '🇺🇸', name: 'États-Unis' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
];

// Schéma de validation Zod pour l'inscription complète
const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
      .regex(
        /^[a-zA-ZÀ-ÿ\s'-]+$/,
        'Le prénom ne peut contenir que des lettres'
      ),
    lastName: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres'),
    email: z.string().email('Adresse email invalide'),
    phoneCountryCode: z.string().default('+41'),
    phoneNumber: z
      .string()
      .regex(/^[1-9]\d{7,9}$/, 'Numéro invalide (sans le 0, ex: 791234567)')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      ),
    confirmPassword: z.string(),
    acceptedTerms: z.boolean().refine(val => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
    marketingConsent: z.boolean().optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

const signInSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Adresse email invalide'),
});

// Types TypeScript dérivés des schémas
type SignUpData = z.infer<typeof signUpSchema>;
type SignInData = z.infer<typeof signInSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

/**
 * Icône d'œil pour afficher/masquer le mot de passe
 */
const EyeIcon: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (visible) {
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
        <line x1='1' y1='1' x2='23' y2='23' />
      </svg>
    );
  }
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
      <circle cx='12' cy='12' r='3' />
    </svg>
  );
};

/**
 * Composant d'inscription complet avec validation et intégration Supabase
 *
 * Fonctionnalités:
 * - Barre de progression (étape 1/3)
 * - Validation complète avec Zod + react-hook-form
 * - Afficher/masquer le mot de passe
 * - Intégration Supabase Auth + table profiles
 * - Consentement RGPD (conditions + marketing)
 * - Design NutriSensia "Palette Méditerranée"
 */
export const SignUpForm: React.FC = () => {
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
    reset,
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneCountryCode: '+41',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
      marketingConsent: false,
    },
  });

  const onSubmit = async (data: SignUpData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Combiner l'indicatif pays et le numéro de téléphone
      const normalizedPhone = data.phoneNumber
        ? `${data.phoneCountryCode}${data.phoneNumber}`
        : '';

      // 1. Inscription avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: normalizedPhone,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Erreur lors de la création de l'utilisateur");
      }

      // 2. Insérer dans la table profiles
      // Note: Utilisation de 'as any' car le client lib/supabase.ts utilise des types obsolètes
      // qui ne correspondent pas au schéma actuel de la DB (types/database.ts)
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: normalizedPhone || null,
        marketing_consent: data.marketingConsent || false,
        accepted_terms_at: new Date().toISOString(),
        account_status: 'trial',
      } as any);

      if (profileError) {
        console.error('Erreur création profil:', profileError);
        // On ne bloque pas l'inscription si le profil échoue
        // Le trigger Supabase peut aussi créer le profil
      }

      console.log('✅ Inscription réussie pour:', authData.user.id);

      setMessage({
        type: 'success',
        text: 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.',
      });

      reset();

      // Redirection vers la page de confirmation après 2 secondes
      setTimeout(() => {
        window.location.href = '/auth/confirm';
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'inscription";
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Styles communs Palette Méditerranée
  const labelStyle = {
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: '#41556b',
  };

  const inputStyle = {
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: '16px',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '10px',
    padding: '14px 16px',
    width: '100%',
    transition: 'all 0.3s ease',
    outline: 'none',
  };

  const inputFocusStyle = {
    borderColor: '#1b998b',
    boxShadow: '0 0 0 3px rgba(27, 153, 139, 0.1)',
  };

  const errorStyle = {
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: '13px',
    color: '#ef4444',
    marginTop: '4px',
  };

  const helperStyle = {
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: '13px',
    color: '#41556b',
    marginTop: '4px',
  };

  return (
    <div className='w-full'>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-5'>
        {/* Prénom et Nom sur la même ligne */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label style={labelStyle} className='block mb-2'>
              Prénom *
            </label>
            <input
              type='text'
              placeholder='Marie'
              {...register('firstName')}
              style={{
                ...inputStyle,
                borderColor: errors.firstName ? '#ef4444' : '#e5e5e5',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#1b998b';
                e.target.style.boxShadow = '0 0 0 3px rgba(27, 153, 139, 0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = errors.firstName
                  ? '#ef4444'
                  : '#e5e5e5';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.firstName && (
              <p style={errorStyle}>{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label style={labelStyle} className='block mb-2'>
              Nom *
            </label>
            <input
              type='text'
              placeholder='Dupont'
              {...register('lastName')}
              style={{
                ...inputStyle,
                borderColor: errors.lastName ? '#ef4444' : '#e5e5e5',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#1b998b';
                e.target.style.boxShadow = '0 0 0 3px rgba(27, 153, 139, 0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = errors.lastName
                  ? '#ef4444'
                  : '#e5e5e5';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.lastName && (
              <p style={errorStyle}>{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle} className='block mb-2'>
            Adresse email *
          </label>
          <input
            type='email'
            placeholder='marie.dupont@exemple.ch'
            {...register('email')}
            style={{
              ...inputStyle,
              borderColor: errors.email ? '#ef4444' : '#e5e5e5',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#1b998b';
              e.target.style.boxShadow = '0 0 0 3px rgba(27, 153, 139, 0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = errors.email ? '#ef4444' : '#e5e5e5';
              e.target.style.boxShadow = 'none';
            }}
          />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
        </div>

        {/* Téléphone (optionnel) */}
        <div>
          <label style={labelStyle} className='block mb-2'>
            Téléphone
          </label>
          <div className='flex gap-3'>
            {/* Sélecteur de pays avec drapeau */}
            <select
              {...register('phoneCountryCode')}
              style={{
                ...inputStyle,
                width: '220px',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2341556b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 8px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px',
                paddingRight: '28px',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#1b998b';
                e.target.style.boxShadow = '0 0 0 3px rgba(27, 153, 139, 0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e5e5e5';
                e.target.style.boxShadow = 'none';
              }}
            >
              {countries.map((country, index) => (
                <option key={`${country.code}-${index}`} value={country.code}>
                  {country.flag} {country.name} ({country.code})
                </option>
              ))}
            </select>

            {/* Numéro de téléphone */}
            <input
              type='tel'
              placeholder='79 123 45 67'
              {...register('phoneNumber')}
              style={{
                ...inputStyle,
                flex: 1,
                borderColor: errors.phoneNumber ? '#ef4444' : '#e5e5e5',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#1b998b';
                e.target.style.boxShadow = '0 0 0 3px rgba(27, 153, 139, 0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = errors.phoneNumber
                  ? '#ef4444'
                  : '#e5e5e5';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {errors.phoneNumber && (
            <p style={errorStyle}>{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Mot de passe avec toggle */}
        <div>
          <label style={labelStyle} className='block mb-2'>
            Mot de passe *
          </label>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Votre mot de passe sécurisé'
              {...register('password')}
              style={{
                ...inputStyle,
                borderColor: errors.password ? '#ef4444' : '#e5e5e5',
                paddingRight: '48px',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#1b998b';
                e.target.style.boxShadow = '0 0 0 3px rgba(27, 153, 139, 0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = errors.password
                  ? '#ef4444'
                  : '#e5e5e5';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors'
              style={{ color: '#41556b' }}
              aria-label={
                showPassword
                  ? 'Masquer le mot de passe'
                  : 'Afficher le mot de passe'
              }
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>
          <p style={helperStyle}>
            Au moins 8 caractères avec minuscule, majuscule et chiffre
          </p>
          {errors.password && (
            <p style={errorStyle}>{errors.password.message}</p>
          )}
        </div>

        {/* Confirmation mot de passe avec toggle */}
        <div>
          <label style={labelStyle} className='block mb-2'>
            Confirmer le mot de passe *
          </label>
          <div className='relative'>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Confirmez votre mot de passe'
              {...register('confirmPassword')}
              style={{
                ...inputStyle,
                borderColor: errors.confirmPassword ? '#ef4444' : '#e5e5e5',
                paddingRight: '48px',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#1b998b';
                e.target.style.boxShadow = '0 0 0 3px rgba(27, 153, 139, 0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = errors.confirmPassword
                  ? '#ef4444'
                  : '#e5e5e5';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors'
              style={{ color: '#41556b' }}
              aria-label={
                showConfirmPassword
                  ? 'Masquer le mot de passe'
                  : 'Afficher le mot de passe'
              }
            >
              <EyeIcon visible={showConfirmPassword} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={errorStyle}>{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Séparateur */}
        <div className='h-px my-2' style={{ backgroundColor: '#e5ded6' }} />

        {/* Conditions d'utilisation (obligatoire) */}
        <div>
          <label className='flex items-start gap-3 cursor-pointer'>
            <input
              type='checkbox'
              {...register('acceptedTerms')}
              className='mt-1 w-5 h-5 rounded'
              style={{
                accentColor: '#1b998b',
                borderColor: '#e5e5e5',
              }}
            />
            <span
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '14px',
                color: '#41556b',
                lineHeight: '22px',
              }}
            >
              J&apos;accepte les{' '}
              <a
                href='/conditions-utilisation'
                target='_blank'
                className='underline hover:no-underline'
                style={{ color: '#1b998b' }}
              >
                conditions d&apos;utilisation
              </a>{' '}
              et la{' '}
              <a
                href='/politique-confidentialite'
                target='_blank'
                className='underline hover:no-underline'
                style={{ color: '#1b998b' }}
              >
                politique de confidentialité
              </a>{' '}
              *
            </span>
          </label>
          {errors.acceptedTerms && (
            <p style={errorStyle} className='ml-8'>
              {errors.acceptedTerms.message}
            </p>
          )}
        </div>

        {/* Consentement marketing (optionnel) */}
        <label className='flex items-start gap-3 cursor-pointer'>
          <input
            type='checkbox'
            {...register('marketingConsent')}
            className='mt-1 w-5 h-5 rounded'
            style={{
              accentColor: '#1b998b',
              borderColor: '#e5e5e5',
            }}
          />
          <span
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '13px',
              color: '#41556b',
              lineHeight: '20px',
            }}
          >
            Je souhaite recevoir des conseils nutritionnels et les dernières
            actualités de NutriSensia par email (optionnel)
          </span>
        </label>

        {/* Message de succès/erreur */}
        {message && (
          <div
            className='p-4 rounded-xl'
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '14px',
              backgroundColor:
                message.type === 'success'
                  ? 'rgba(27, 153, 139, 0.08)'
                  : 'rgba(239, 68, 68, 0.08)',
              color: message.type === 'success' ? '#1b998b' : '#ef4444',
              border: `1px solid ${message.type === 'success' ? 'rgba(27, 153, 139, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Bouton CTA avec dégradé */}
        <button
          type='submit'
          disabled={isLoading}
          className='w-full py-4 px-6 rounded-full font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed'
          style={{
            fontFamily:
              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '16px',
            background: isLoading
              ? '#a0a0a0'
              : 'linear-gradient(135deg, #1b998b 0%, #147569 100%)',
            borderRadius: '35px',
          }}
          onMouseEnter={e => {
            if (!isLoading) {
              (e.target as HTMLButtonElement).style.background =
                'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
            }
          }}
          onMouseLeave={e => {
            if (!isLoading) {
              (e.target as HTMLButtonElement).style.background =
                'linear-gradient(135deg, #1b998b 0%, #147569 100%)';
            }
          }}
        >
          {isLoading ? (
            <span className='flex items-center justify-center gap-2'>
              <svg
                className='animate-spin h-5 w-5'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Création en cours...
            </span>
          ) : (
            'Créer mon compte'
          )}
        </button>
      </form>
    </div>
  );
};

/**
 * Composant de connexion avec validation
 */
export const SignInForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignInData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Connexion avec Supabase
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      // Connexion réussie - redirection vers l'accueil
      // Note: La vérification 2FA est désactivée pour le moment
      setMessage({
        type: 'success',
        text: 'Connexion réussie ! Redirection en cours...',
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Email ou mot de passe incorrect',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant='elevated' className='max-w-md mx-auto'>
      <CardHeader>
        <h2 className='text-h2 font-bold text-neutral-dark dark:text-neutral-light'>
          Se connecter
        </h2>
        <p className='text-body text-neutral-medium dark:text-neutral-medium'>
          Accédez à votre espace personnel NutriSensia
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className='space-y-16dp'>
          {/* Email */}
          <Input
            label='Adresse email'
            type='email'
            placeholder='votre@email.com'
            {...register('email')}
            error={errors.email?.message}
            required
            fullWidth
          />

          {/* Mot de passe */}
          <Input
            label='Mot de passe'
            type='password'
            placeholder='Votre mot de passe'
            {...register('password')}
            error={errors.password?.message}
            required
            fullWidth
          />

          {/* Message de succès/erreur */}
          {message && (
            <div
              className={`p-12dp rounded-8dp text-body ${
                message.type === 'success'
                  ? 'bg-functional-success/10 text-functional-success border border-functional-success/20'
                  : 'bg-functional-error/10 text-functional-error border border-functional-error/20'
              }`}
            >
              {message.text}
            </div>
          )}
        </CardContent>

        <CardFooter className='flex flex-col space-y-12dp'>
          <Button
            type='submit'
            variant='primary'
            size='lg'
            loading={isLoading}
            fullWidth
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>

          {/* Lien vers la réinitialisation de mot de passe */}
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => (window.location.href = '/auth/reset-password')}
            fullWidth
          >
            Mot de passe oublié ?
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

/**
 * Composant de réinitialisation de mot de passe
 */
export const ResetPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ResetPasswordData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Envoi de l'email de réinitialisation avec Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.',
      });
      reset();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text:
          error.message || "Une erreur est survenue lors de l'envoi de l'email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant='elevated' className='max-w-md mx-auto'>
      <CardHeader>
        <h2 className='text-h2 font-bold text-neutral-dark dark:text-neutral-light'>
          Réinitialiser le mot de passe
        </h2>
        <p className='text-body text-neutral-medium dark:text-neutral-medium'>
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className='space-y-16dp'>
          {/* Email */}
          <Input
            label='Adresse email'
            type='email'
            placeholder='votre@email.com'
            {...register('email')}
            error={errors.email?.message}
            required
            fullWidth
          />

          {/* Message de succès/erreur */}
          {message && (
            <div
              className={`p-12dp rounded-8dp text-body ${
                message.type === 'success'
                  ? 'bg-functional-success/10 text-functional-success border border-functional-success/20'
                  : 'bg-functional-error/10 text-functional-error border border-functional-error/20'
              }`}
            >
              {message.text}
            </div>
          )}
        </CardContent>

        <CardFooter className='flex flex-col space-y-12dp'>
          <Button
            type='submit'
            variant='primary'
            size='lg'
            loading={isLoading}
            fullWidth
          >
            {isLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
          </Button>

          {/* Retour à la connexion */}
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => (window.location.href = '/auth/signin')}
            fullWidth
          >
            Retour à la connexion
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

/**
 * Composant de mise à jour de mot de passe (après réinitialisation)
 */
export const UpdatePasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const updatePasswordSchema = z
    .object({
      password: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
        ),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: 'Les mots de passe ne correspondent pas',
      path: ['confirmPassword'],
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updatePasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Mise à jour du mot de passe avec Supabase
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Mot de passe mis à jour avec succès ! Redirection vers la connexion...',
      });

      // Redirection vers la connexion après mise à jour
      setTimeout(() => {
        window.location.href = '/auth/signin';
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text:
          error.message ||
          'Une erreur est survenue lors de la mise à jour du mot de passe',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant='elevated' className='max-w-md mx-auto'>
      <CardHeader>
        <h2 className='text-h2 font-bold text-neutral-dark dark:text-neutral-light'>
          Nouveau mot de passe
        </h2>
        <p className='text-body text-neutral-medium dark:text-neutral-medium'>
          Choisissez votre nouveau mot de passe
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className='space-y-16dp'>
          {/* Nouveau mot de passe */}
          <Input
            label='Nouveau mot de passe'
            type='password'
            placeholder='Votre nouveau mot de passe'
            {...register('password')}
            error={errors.password?.message}
            helperText='Au moins 8 caractères avec minuscule, majuscule et chiffre'
            required
            fullWidth
          />

          {/* Confirmation du nouveau mot de passe */}
          <Input
            label='Confirmer le nouveau mot de passe'
            type='password'
            placeholder='Confirmez votre nouveau mot de passe'
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            required
            fullWidth
          />

          {/* Message de succès/erreur */}
          {message && (
            <div
              className={`p-12dp rounded-8dp text-body ${
                message.type === 'success'
                  ? 'bg-functional-success/10 text-functional-success border border-functional-success/20'
                  : 'bg-functional-error/10 text-functional-error border border-functional-error/20'
              }`}
            >
              {message.text}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            type='submit'
            variant='primary'
            size='lg'
            loading={isLoading}
            fullWidth
          >
            {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
