'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';

/**
 * Composant pour gérer les redirections d'authentification Supabase
 * Traite les tokens dans l'URL et redirige vers la page appropriée
 */
export function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState("Traitement de l'authentification...");
  const router = useRouter();

  /**
   * Vérifie si l'utilisateur a des facteurs 2FA configurés et vérifiés
   */
  const checkMFAFactors = async (userId: string) => {
    // Vérifier s'il a déjà des facteurs configurés (Supabase Auth + Base de données)
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactorsInAuth =
      factorsData?.totp?.some(f => f.status === 'verified') ||
      factorsData?.phone?.some(f => f.status === 'verified');

    // Vérifier aussi dans la base de données
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const twoFactorEnabledInDB = profileData
      ? (profileData as any).two_factor_enabled
      : false;
    const hasVerifiedFactors = hasVerifiedFactorsInAuth && twoFactorEnabledInDB;

    console.log('🔍 Diagnostic MFA:', {
      userId,
      hasVerifiedFactorsInAuth,
      twoFactorEnabledInDB,
      hasVerifiedFactors,
      factorsData,
    });

    return hasVerifiedFactors;
  };

  /**
   * Vérifie si c'est un nouveau compte (créé récemment ou sans 2FA configuré)
   */
  const isNewAccount = async (user: any) => {
    try {
      // Récupérer les informations du profil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('created_at, two_factor_enabled, last_sign_in_at')
        .eq('id', user.id)
        .single();

      if (!profileData) return true; // Profil pas encore créé = nouveau compte

      // Vérifier si le compte a été créé récemment (moins de 10 minutes)
      const accountAge =
        Date.now() - new Date(profileData.created_at).getTime();
      const isRecentAccount = accountAge < 10 * 60 * 1000; // 10 minutes

      // Vérifier si c'est la première connexion
      const isFirstSignIn = !profileData.last_sign_in_at;

      // Vérifier si 2FA n'est pas configuré
      const no2FAConfigured = !profileData.two_factor_enabled;

      console.log('🔍 Analyse nouveau compte:', {
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

      console.log('🔍 Décision finale nouveau compte:', {
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
   * Gère la redirection après authentification selon le statut 2FA
   */
  const handleMFARedirection = async (user: any, urlType?: string) => {
    try {
      // Récupérer le rôle de l'utilisateur
      const userRole = user?.user_metadata?.role || 'patient';

      console.log('🔍 Début redirection:', {
        userRole,
        userEmail: user.email,
        urlType,
        userId: user.id,
      });

      // PRIORITÉ 1: Vérifier si c'est un nouveau compte
      const isNew = await isNewAccount(user);

      if (isNew) {
        console.log(
          '🆕 NOUVEAU COMPTE DÉTECTÉ - Redirection obligatoire vers 2FA'
        );
        setMessage(
          'Configuration de sécurité requise pour les nouveaux comptes...'
        );
        setTimeout(() => {
          router.push('/auth/enroll-mfa');
        }, 2000);
        return;
      }

      // PRIORITÉ 2: Pour les comptes existants, vérifier le statut 2FA
      const { data: mfaData, error: mfaError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (mfaError) {
        console.error('Erreur lors de la vérification 2FA:', mfaError);
        // En cas d'erreur, rediriger vers la configuration 2FA par sécurité
        setMessage('Vérification de sécurité...');
        setTimeout(() => {
          router.push('/auth/enroll-mfa');
        }, 2000);
        return;
      }

      // Analyser le niveau d'assurance pour déterminer la redirection selon le rôle
      const { currentLevel, nextLevel } = mfaData;

      console.log('🔍 OAuth - Analyse des niveaux AAL:', {
        userRole,
        currentLevel,
        nextLevel,
        mfaData,
        userEmail: user.email,
      });

      if (userRole === 'nutritionist') {
        // Les nutritionnistes ont TOUJOURS besoin de AAL2
        if (nextLevel === 'aal2' && currentLevel === 'aal1') {
          // Le nutritionniste doit configurer ou vérifier le 2FA
          setMessage('Configuration de la sécurité requise...');

          // Vérifier s'il a déjà des facteurs configurés
          const hasVerifiedFactors = await checkMFAFactors(user.id);

          setTimeout(() => {
            if (hasVerifiedFactors) {
              // Le nutritionniste a déjà configuré le 2FA, rediriger vers la vérification
              router.push('/auth/verify-mfa');
            } else {
              // Le nutritionniste n'a pas encore configuré le 2FA, rediriger vers l'enrôlement
              router.push('/auth/enroll-mfa');
            }
          }, 2000);
        } else if (currentLevel === 'aal2') {
          // Le nutritionniste est déjà au niveau AAL2 requis
          setMessage('Redirection vers votre espace...');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          // Cas par défaut pour les nutritionnistes
          setMessage('Configuration de la sécurité requise...');
          setTimeout(() => {
            router.push('/auth/enroll-mfa');
          }, 2000);
        }
      } else {
        // Les patients DOIVENT utiliser le 2FA comme les nutritionnistes
        console.log(
          '👤 Patient OAuth connecté, vérification 2FA obligatoire...'
        );

        // FORCER le 2FA pour tous les patients, indépendamment de nextLevel
        if (currentLevel === 'aal1') {
          // Le patient doit configurer ou vérifier le 2FA
          setMessage('Configuration de la sécurité en cours...');

          // Vérifier s'il a déjà des facteurs configurés
          const hasVerifiedFactors = await checkMFAFactors(user.id);

          setTimeout(() => {
            if (hasVerifiedFactors) {
              // Le patient a déjà configuré le 2FA, rediriger vers la vérification
              console.log(
                '🔐 Patient OAuth avec 2FA configuré -> /auth/verify-mfa'
              );
              router.push('/auth/verify-mfa');
            } else {
              // Le patient n'a pas encore configuré le 2FA, rediriger vers l'enrôlement
              console.log('📱 Patient OAuth sans 2FA -> /auth/enroll-mfa');
              router.push('/auth/enroll-mfa');
            }
          }, 2000);
        } else if (currentLevel === 'aal2') {
          // Le patient est déjà au niveau AAL2 requis
          console.log(
            '✅ Patient OAuth déjà au niveau AAL2, redirection dashboard'
          );
          setMessage('Redirection vers votre espace...');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          // Cas par défaut : redirection vers l'accueil
          console.log(
            "🏠 Patient OAuth - redirection par défaut vers l'accueil"
          );
          setMessage('Redirection vers votre espace...');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la redirection MFA:', error);
      // En cas d'erreur, rediriger vers la page d'accueil
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setMessage("Récupération des paramètres d'authentification...");

        // Récupérer les paramètres de l'URL
        const urlParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');

        if (!accessToken || !refreshToken) {
          throw new Error("Tokens d'authentification manquants");
        }

        setMessage('Configuration de la session...');

        // Configurer la session avec les tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          throw new Error('Session non créée');
        }

        setMessage('Session configurée avec succès !');
        setStatus('success');

        // Vérifier le statut 2FA et rediriger appropriément
        await handleMFARedirection(data.session.user, type);
      } catch (error: any) {
        console.error(
          "Erreur lors du traitement de l'authentification:",
          error
        );
        setStatus('error');
        setMessage(`Erreur: ${error.message}`);

        // Rediriger vers la page de connexion en cas d'erreur
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      }
    };

    // Vérifier si nous sommes sur une page de callback
    if (window.location.hash.includes('access_token')) {
      handleAuthCallback();
    } else {
      // Si pas de tokens, rediriger vers la page d'accueil
      router.push('/');
    }
  }, [router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <Card className='p-8 max-w-md w-full'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>{getStatusIcon()}</div>
          <h1 className='text-xl font-semibold mb-2'>Authentification</h1>
          <p className={`text-sm ${getStatusColor()}`}>{message}</p>

          {status === 'loading' && (
            <div className='mt-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
            </div>
          )}

          {status === 'success' && (
            <div className='mt-4 text-sm text-gray-600'>
              Redirection en cours...
            </div>
          )}

          {status === 'error' && (
            <div className='mt-4 text-sm text-gray-600'>
              Redirection vers la page de connexion...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
