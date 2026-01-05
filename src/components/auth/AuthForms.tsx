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
import { supabase } from '@/lib/supabase';

// Schémas de validation Zod pour l'authentification
const signUpSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Adresse email invalide'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      ),
    confirmPassword: z.string(),
    role: z.enum(['patient', 'nutritionist']),
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
 * Composant d'inscription avec validation complète
 */
export const SignUpForm: React.FC = () => {
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
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignUpData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Inscription avec Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
          },
        },
      });

      if (error) {
        throw error;
      }

      // L'inscription a réussi - l'entrée dans la table nutritionists/patients
      // sera créée automatiquement lors de la première connexion ou de l'onboarding
      if (authData.user) {
        console.log(
          `✅ Inscription réussie pour l'utilisateur ${data.role}:`,
          authData.user.id
        );
        console.log(
          "ℹ️  L'entrée dans la table correspondante sera créée lors de la première connexion"
        );
      }

      setMessage({
        type: 'success',
        text: 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.',
      });
      reset();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || "Une erreur est survenue lors de l'inscription",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant='primary' className='max-w-md mx-auto'>
      <CardHeader>
        <h2 className='text-h2 font-bold text-neutral-dark dark:text-neutral-light'>
          Créer un compte
        </h2>
        <p className='text-body text-neutral-medium dark:text-neutral-medium'>
          Rejoignez NutriSensia pour votre bien-être nutritionnel
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className='space-y-16dp'>
          {/* Nom complet */}
          <Input
            label='Nom complet'
            placeholder='Votre nom complet'
            {...register('name')}
            error={errors.name?.message}
            required
            fullWidth
          />

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

          {/* Rôle */}
          <div className='space-y-8dp'>
            <label className='block text-label font-medium text-neutral-dark dark:text-neutral-light'>
              Rôle *
            </label>
            <div className='space-y-8dp'>
              <label className='flex items-center space-x-8dp'>
                <input
                  type='radio'
                  value='patient'
                  {...register('role')}
                  className='text-primary focus:ring-primary'
                />
                <span className='text-body'>Patient</span>
              </label>
              <label className='flex items-center space-x-8dp'>
                <input
                  type='radio'
                  value='nutritionist'
                  {...register('role')}
                  className='text-primary focus:ring-primary'
                />
                <span className='text-body'>Nutritionniste</span>
              </label>
            </div>
            {errors.role && (
              <p className='text-caption text-functional-error'>
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <Input
            label='Mot de passe'
            type='password'
            placeholder='Votre mot de passe'
            {...register('password')}
            error={errors.password?.message}
            helperText='Au moins 8 caractères avec minuscule, majuscule et chiffre'
            required
            fullWidth
          />

          {/* Confirmation du mot de passe */}
          <Input
            label='Confirmer le mot de passe'
            type='password'
            placeholder='Confirmez votre mot de passe'
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
            {isLoading ? 'Création du compte...' : 'Créer mon compte'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

/**
 * Vérifie si c'est un nouveau compte (créé récemment ou sans 2FA configuré)
 */
const checkIfNewAccount = async (user: any): Promise<boolean> => {
  try {
    // Récupérer les informations du profil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('created_at, two_factor_enabled, last_sign_in_at')
      .eq('id', user.id)
      .single();

    if (!profileData) return true; // Profil pas encore créé = nouveau compte

    // Vérifier si le compte a été créé récemment (moins de 10 minutes)
    const accountAge = Date.now() - new Date(profileData.created_at).getTime();
    const isRecentAccount = accountAge < 10 * 60 * 1000; // 10 minutes

    // Vérifier si c'est la première connexion
    const isFirstSignIn = !profileData.last_sign_in_at;

    // Vérifier si 2FA n'est pas configuré
    const no2FAConfigured = !profileData.two_factor_enabled;

    console.log('🔍 AuthForms - Analyse nouveau compte:', {
      userId: user.id,
      userEmail: user.email,
      accountAge: `${Math.round(accountAge / 1000 / 60)} minutes`,
      isRecentAccount,
      isFirstSignIn,
      no2FAConfigured,
      createdAt: profileData.created_at,
      lastSignIn: profileData.last_sign_in_at,
    });

    // PRIORITÉ : Si 2FA est déjà configuré, ce n'est PAS un nouveau compte
    if (profileData.two_factor_enabled === true) {
      console.log('✅ 2FA déjà configuré - Compte existant confirmé');
      return false;
    }

    // C'est un nouveau compte si : récent OU première connexion OU pas de 2FA
    const isNewAccount = isRecentAccount || isFirstSignIn || no2FAConfigured;

    console.log('🔍 AuthForms - Décision finale nouveau compte:', {
      isNewAccount,
      raison: isRecentAccount
        ? 'compte récent'
        : isFirstSignIn
          ? 'première connexion'
          : no2FAConfigured
            ? 'pas de 2FA'
            : 'aucune',
    });

    return isNewAccount;
  } catch (error) {
    console.error('Erreur vérification nouveau compte:', error);
    return true; // En cas d'erreur, traiter comme nouveau compte par sécurité
  }
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

      // Vérifier le statut 2FA après connexion réussie
      const { data: mfaData, error: mfaError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (mfaError) {
        console.error('Erreur lors de la vérification 2FA:', mfaError);
        // En cas d'erreur, rediriger vers la page d'accueil
        setMessage({
          type: 'success',
          text: 'Connexion réussie ! Redirection en cours...',
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
        return;
      }

      // Récupérer le rôle de l'utilisateur
      const userRole = authData.user?.user_metadata?.role || 'patient';

      // PRIORITÉ 1: Vérifier si c'est un nouveau compte
      const isNewAccount = await checkIfNewAccount(authData.user);

      if (isNewAccount) {
        console.log(
          '🆕 NOUVEAU COMPTE DÉTECTÉ - Redirection obligatoire vers 2FA'
        );
        setMessage({
          type: 'success',
          text: 'Connexion réussie ! Configuration de sécurité requise...',
        });
        setTimeout(() => {
          window.location.href = '/auth/enroll-mfa';
        }, 1000);
        return;
      }

      // PRIORITÉ 2: Pour les comptes existants, analyser le niveau d'assurance
      const { currentLevel, nextLevel } = mfaData;

      console.log('🔍 Analyse des niveaux AAL:', {
        userRole,
        currentLevel,
        nextLevel,
        mfaData,
        userEmail: authData.user?.email,
      });

      if (userRole === 'nutritionist') {
        // Les nutritionnistes ont TOUJOURS besoin de AAL2
        if (nextLevel === 'aal2' && currentLevel === 'aal1') {
          // Le nutritionniste doit configurer ou vérifier le 2FA
          setMessage({
            type: 'success',
            text: 'Connexion réussie ! Configuration de la sécurité requise...',
          });

          // Vérifier s'il a déjà des facteurs configurés (Supabase Auth + Base de données)
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          const hasVerifiedFactorsInAuth =
            factorsData?.totp?.some(f => f.status === 'verified') ||
            factorsData?.phone?.some(f => f.status === 'verified');

          // Vérifier aussi dans la base de données
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user?.id)
            .single();

          const twoFactorEnabledInDB = profileData
            ? (profileData as any).two_factor_enabled
            : false;
          const hasVerifiedFactors =
            hasVerifiedFactorsInAuth && twoFactorEnabledInDB;

          console.log('🔍 Diagnostic MFA (AuthForms):', {
            userId: authData.user?.id,
            hasVerifiedFactorsInAuth,
            twoFactorEnabledInDB,
            hasVerifiedFactors,
            factorsData,
          });

          setTimeout(() => {
            if (hasVerifiedFactors) {
              // Le nutritionniste a déjà configuré le 2FA, rediriger vers la vérification
              window.location.href = '/auth/verify-mfa';
            } else {
              // Le nutritionniste n'a pas encore configuré le 2FA, rediriger vers l'enrôlement
              window.location.href = '/auth/enroll-mfa';
            }
          }, 1000);
        } else if (currentLevel === 'aal2') {
          // Le nutritionniste est déjà au niveau AAL2 requis
          setMessage({
            type: 'success',
            text: 'Connexion réussie ! Redirection en cours...',
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          // Cas par défaut pour les nutritionnistes
          setMessage({
            type: 'success',
            text: 'Connexion réussie ! Configuration de la sécurité requise...',
          });
          setTimeout(() => {
            window.location.href = '/auth/enroll-mfa';
          }, 1000);
        }
      } else {
        // Les patients DOIVENT utiliser le 2FA comme les nutritionnistes
        console.log(
          '👤 Utilisateur patient connecté, vérification 2FA obligatoire...'
        );

        // FORCER le 2FA pour tous les patients, indépendamment de nextLevel
        if (currentLevel === 'aal1') {
          // Le patient doit configurer ou vérifier le 2FA
          setMessage({
            type: 'success',
            text: 'Connexion réussie ! Configuration de la sécurité en cours...',
          });

          // Vérifier s'il a déjà des facteurs configurés (Supabase Auth + Base de données)
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          const hasVerifiedFactorsInAuth =
            factorsData?.totp?.some(f => f.status === 'verified') ||
            factorsData?.phone?.some(f => f.status === 'verified');

          // Vérifier aussi dans la base de données
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user?.id)
            .single();

          const twoFactorEnabledInDB = profileData
            ? (profileData as any).two_factor_enabled
            : false;
          const hasVerifiedFactors =
            hasVerifiedFactorsInAuth && twoFactorEnabledInDB;

          console.log('🔍 Diagnostic MFA Patient (AuthForms):', {
            userId: authData.user?.id,
            userRole,
            hasVerifiedFactorsInAuth,
            twoFactorEnabledInDB,
            hasVerifiedFactors,
            factorsData,
            currentLevel,
            nextLevel,
          });

          setTimeout(() => {
            if (hasVerifiedFactors) {
              // Le patient a déjà configuré le 2FA, rediriger vers la vérification
              console.log('🔐 Patient avec 2FA configuré -> /auth/verify-mfa');
              window.location.href = '/auth/verify-mfa';
            } else {
              // Le patient n'a pas encore configuré le 2FA, rediriger vers l'enrôlement
              console.log('📱 Patient sans 2FA -> /auth/enroll-mfa');
              window.location.href = '/auth/enroll-mfa';
            }
          }, 1000);
        } else if (currentLevel === 'aal2') {
          // Le patient est déjà au niveau AAL2 requis
          console.log('✅ Patient déjà au niveau AAL2, redirection dashboard');
          setMessage({
            type: 'success',
            text: 'Connexion réussie ! Redirection vers votre espace...',
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          // Cas par défaut : redirection vers l'accueil
          console.log("🏠 Patient - redirection par défaut vers l'accueil");
          setMessage({
            type: 'success',
            text: 'Connexion réussie ! Redirection vers votre espace...',
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      }
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
    <Card variant='primary' className='max-w-md mx-auto'>
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
    <Card variant='primary' className='max-w-md mx-auto'>
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
    <Card variant='primary' className='max-w-md mx-auto'>
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
