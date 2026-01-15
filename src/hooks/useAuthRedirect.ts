import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * Hook personnalisé pour gérer les redirections d'authentification
 */
export function useAuthRedirect() {
  const router = useRouter();

  /**
   * Vérifie l'authentification et redirige vers la page appropriée
   */
  const checkAuthAndRedirect = useCallback(async () => {
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

      // L'utilisateur est connecté, rediriger vers l'accueil
      router.push('/');
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      // En cas d'erreur, rediriger vers la page d'accueil
      router.push('/');
    }
  }, [router]);

  /**
   * Redirige vers la page d'accueil
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

  return {
    checkAuthAndRedirect,
    redirectToHome,
    redirectToSignIn,
  };
}
