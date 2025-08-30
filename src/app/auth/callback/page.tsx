import { AuthCallback } from '@/components/auth/AuthCallback';

/**
 * Page pour gérer les redirections d'authentification Supabase
 * Traite les tokens dans l'URL et redirige vers la page appropriée
 */
export default function AuthCallbackPage() {
  return <AuthCallback />;
}
