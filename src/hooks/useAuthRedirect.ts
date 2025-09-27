import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * Hook personnalisé pour gérer les redirections après authentification
 * Vérifie le statut 2FA et redirige vers la page appropriée selon le rôle
 */
export function useAuthRedirect() {
  const router = useRouter();

  /**
   * Vérifie le statut 2FA et redirige vers la page appropriée selon le rôle
   */
  const checkMFAAndRedirect = useCallback(async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // L'utilisateur n'est pas connecté, rediriger vers la connexion
        router.push('/auth/signin');
        return;
      }

      // Récupérer le rôle de l'utilisateur
      const userRole = session.user.user_metadata?.role || 'patient';

      // Vérifier le niveau d'assurance d'authentification
      const { data: mfaData, error: mfaError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (mfaError) {
        console.error('Erreur lors de la vérification 2FA:', mfaError);
        // En cas d'erreur, rediriger vers la page d'accueil
        router.push('/');
        return;
      }

      const { currentLevel, nextLevel } = mfaData;

      // Logique différenciée selon le rôle
      if (userRole === 'nutritionist') {
        // Les nutritionnistes ont TOUJOURS besoin de AAL2
        if (nextLevel === 'aal2' && currentLevel === 'aal1') {
          // Le nutritionniste doit configurer ou vérifier le 2FA
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          const hasVerifiedFactors =
            factorsData.totp?.some(f => f.status === 'verified') ||
            factorsData.phone?.some(f => f.status === 'verified');

          if (hasVerifiedFactors) {
            // Le nutritionniste a déjà configuré le 2FA, rediriger vers la vérification
            router.push('/auth/verify-mfa');
          } else {
            // Le nutritionniste n'a pas encore configuré le 2FA, rediriger vers l'enrôlement
            router.push('/auth/enroll-mfa');
          }
        } else if (currentLevel === 'aal2') {
          // Le nutritionniste est déjà au niveau AAL2 requis
          router.push('/');
        } else {
          // Cas par défaut pour les nutritionnistes
          router.push('/auth/enroll-mfa');
        }
      } else {
        // Les patients peuvent utiliser AAL1 ou AAL2 (selon la configuration)
        if (nextLevel === 'aal2' && currentLevel === 'aal1') {
          // Le patient doit configurer ou vérifier le 2FA
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          const hasVerifiedFactors =
            factorsData.totp?.some(f => f.status === 'verified') ||
            factorsData.phone?.some(f => f.status === 'verified');

          if (hasVerifiedFactors) {
            // Le patient a déjà configuré le 2FA, rediriger vers la vérification
            router.push('/auth/verify-mfa');
          } else {
            // Le patient n'a pas encore configuré le 2FA, rediriger vers l'enrôlement
            router.push('/auth/enroll-mfa');
          }
        } else {
          // Le patient est déjà au niveau requis ou n'a pas besoin de 2FA
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut 2FA:', error);
      // En cas d'erreur, rediriger vers la page d'accueil
      router.push('/');
    }
  }, [router]);

  /**
   * Vérifie si un utilisateur a besoin de 2FA selon son rôle
   */
  const needsMFAForRole = useCallback(async (role: string) => {
    // Les nutritionnistes ont TOUJOURS besoin de 2FA
    if (role === 'nutritionist') {
      return true;
    }

    // Pour les patients, on peut configurer si c'est obligatoire ou optionnel
    // Actuellement, on force AAL2 pour tous, mais on pourrait le rendre configurable
    return true; // Pour l'instant, tous les patients ont besoin de 2FA aussi
  }, []);

  /**
   * Redirige vers la page d'accueil après une action 2FA réussie
   */
  const redirectToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  /**
   * Redirige vers la page de connexion
   */
  const redirectToSignIn = useCallback(() => {
    router.push('/auth/signin');
  }, [router]);

  /**
   * Redirige vers la page d'enrôlement 2FA
   */
  const redirectToEnrollMFA = useCallback(() => {
    router.push('/auth/enroll-mfa');
  }, [router]);

  /**
   * Redirige vers la page de vérification 2FA
   */
  const redirectToVerifyMFA = useCallback(() => {
    router.push('/auth/verify-mfa');
  }, [router]);

  return {
    checkMFAAndRedirect,
    needsMFAForRole,
    redirectToHome,
    redirectToSignIn,
    redirectToEnrollMFA,
    redirectToVerifyMFA,
  };
}
