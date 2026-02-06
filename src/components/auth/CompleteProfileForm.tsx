'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';

// Options pour la raison de consultation
const consultationReasonOptions = [
  { value: 'menopause_perimenopause', label: 'Ménopause / Périménopause' },
  { value: 'perte_poids_durable', label: 'Perte de poids durable' },
  { value: 'troubles_digestifs', label: 'Troubles digestifs' },
  { value: 'glycemie_diabete', label: 'Glycémie / Diabète' },
  { value: 'sante_cardiovasculaire', label: 'Santé cardiovasculaire' },
  { value: 'fatigue_energie', label: 'Fatigue / Énergie' },
  { value: 'longevite_vieillissement', label: 'Longévité / Bien vieillir' },
  { value: 'sante_hormonale', label: 'Santé hormonale' },
  { value: 'alimentation_saine', label: 'Alimentation saine' },
  { value: 'autre', label: 'Autre' },
] as const;

// Schéma de validation Zod
const consultationReasonEnum = [
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

const completeProfileSchema = z.object({
  consultationReason: z.enum(consultationReasonEnum, {
    message: 'Veuillez sélectionner une raison de consultation',
  }),
  marketingConsent: z.boolean(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
});

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

/**
 * Formulaire de complétion du profil pour les utilisateurs OAuth
 * Affiché après une inscription Google pour collecter la raison de consultation
 */
export const CompleteProfileForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    mode: 'onChange',
    defaultValues: {
      acceptTerms: false,
      marketingConsent: false,
    },
  });

  // Surveiller les champs obligatoires pour activer/désactiver le bouton
  const consultationReason = watch('consultationReason');
  const acceptTerms = watch('acceptTerms');
  const isFormValid = !!consultationReason && acceptTerms === true;

  // Récupérer les informations de l'utilisateur au chargement
  useEffect(() => {
    const fetchUserInfo = async () => {
      const supabase = createClient();

      // Récupérer la session pour avoir le token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        setAccessToken(session.access_token);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const firstName =
          user.user_metadata?.first_name ||
          user.user_metadata?.given_name ||
          user.user_metadata?.name?.split(' ')[0] ||
          '';
        const lastName =
          user.user_metadata?.last_name ||
          user.user_metadata?.family_name ||
          user.user_metadata?.name?.split(' ').slice(1).join(' ') ||
          '';
        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          undefined;

        setUserInfo({
          firstName,
          lastName,
          email: user.email || '',
          avatarUrl,
        });
      } else {
        // Si pas d'utilisateur connecté, rediriger vers signin
        router.push('/auth/signin');
      }
    };

    fetchUserInfo();
  }, [router]);

  const onSubmit = async (data: CompleteProfileFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Préparer les headers avec le token si disponible
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          consultationReason: data.consultationReason,
          marketingConsent: data.marketingConsent,
          acceptTerms: data.acceptTerms,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur s'est produite");
      }

      setMessage({
        type: 'success',
        text: 'Profil complété avec succès !',
      });

      // Redirection vers la page de bienvenue
      setTimeout(() => {
        router.push('/auth/welcome');
      }, 1500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur s'est produite";

      setMessage({
        type: 'error',
        text: errorMessage,
      });
      setIsLoading(false);
    }
  };

  if (!userInfo) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

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
          Bienvenue {userInfo.firstName} !
        </h1>
        <p className='text-body' style={{ color: '#41556b' }}>
          Plus qu'une étape pour finaliser votre inscription
        </p>
      </div>

      {/* Informations utilisateur (affichage seulement) */}
      <div
        className='p-4 rounded-xl mb-6 flex items-center gap-4'
        style={{ backgroundColor: 'rgba(27, 153, 139, 0.08)' }}
      >
        {userInfo.avatarUrl ? (
          <img
            src={userInfo.avatarUrl}
            alt={`${userInfo.firstName} ${userInfo.lastName}`}
            className='w-12 h-12 rounded-full object-cover'
          />
        ) : (
          <div
            className='w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg'
            style={{ backgroundColor: '#1B998B' }}
          >
            {userInfo.firstName.charAt(0)}
            {userInfo.lastName.charAt(0)}
          </div>
        )}
        <div>
          <p className='font-semibold text-body' style={{ color: '#3f6655' }}>
            {userInfo.firstName} {userInfo.lastName}
          </p>
          <p className='text-body-small' style={{ color: '#41556b' }}>
            {userInfo.email}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4'>
        {/* Raison de consultation */}
        <div>
          <label
            htmlFor='consultationReason'
            className='block text-body-small font-medium text-neutral-dark mb-1.5'
          >
            Raison de votre consultation{' '}
            <span className='text-functional-error'>*</span>
          </label>
          <select
            id='consultationReason'
            {...register('consultationReason')}
            className={`w-full px-4 py-3 rounded-lg border bg-white text-body transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.consultationReason
                ? 'border-functional-error focus:border-functional-error'
                : 'border-neutral-border focus:border-primary'
            }`}
            style={{ color: '#41556b' }}
          >
            <option value=''>Sélectionnez une raison...</option>
            {consultationReasonOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.consultationReason && (
            <p className='mt-1.5 text-sm text-functional-error'>
              {errors.consultationReason.message}
            </p>
          )}
        </div>

        {/* Checkbox Marketing */}
        <div className='flex items-start gap-2'>
          <input
            type='checkbox'
            id='marketingConsent'
            {...register('marketingConsent')}
            className='w-4 h-4 mt-1 rounded border-neutral-border text-primary focus:ring-primary focus:ring-offset-0'
          />
          <label
            htmlFor='marketingConsent'
            className='text-body-small text-neutral-medium cursor-pointer'
          >
            J'accepte de recevoir des conseils nutritionnels et des offres par
            email
          </label>
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

        {/* Bouton de validation */}
        <motion.button
          type='submit'
          disabled={isLoading || !isFormValid}
          whileHover={isFormValid && !isLoading ? { scale: 1.02 } : {}}
          whileTap={isFormValid && !isLoading ? { scale: 0.98 } : {}}
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
            cursor: isFormValid && !isLoading ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            border: 'none',
            background: isFormValid
              ? 'linear-gradient(135deg, #1B998B 0%, #147569 100%)'
              : 'linear-gradient(135deg, #78CFC6 0%, #5DB5A8 100%)',
            color: '#FDFCFB',
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            if (!isLoading && isFormValid) {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
            }
          }}
          onMouseLeave={e => {
            if (isFormValid) {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
            } else {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #78CFC6 0%, #5DB5A8 100%)';
            }
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
              Finalisation...
            </>
          ) : (
            'Finaliser mon inscription'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default CompleteProfileForm;
