/**
 * Client Supabase pour le navigateur (Browser Client)
 *
 * Utilise @supabase/ssr pour une gestion correcte des cookies et sessions
 * Compatible avec Next.js App Router
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Vérification des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérifier si les clés sont des placeholders ou manquantes
export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key';

/**
 * Crée un client Supabase pour le navigateur
 *
 * Ce client utilise automatiquement document.cookie pour gérer les sessions
 * et supporte le rafraîchissement automatique des tokens
 */
export function createClient() {
  return createBrowserClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      cookieOptions: {
        name: 'nutrisensia-auth',
        domain:
          process.env.NODE_ENV === 'production' ? '.nutrisensia.ch' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }
  );
}

// Export par défaut pour compatibilité
export default createClient;

// Types d'erreur personnalisés
export interface SupabaseError {
  message: string;
  status?: number;
  code?: string;
}

// Messages d'erreur traduits en français
const errorMessages: { [key: string]: string } = {
  'Invalid login credentials': 'Email ou mot de passe incorrect',
  'Email not confirmed':
    'Veuillez confirmer votre email avant de vous connecter',
  'Too many requests': 'Trop de tentatives. Veuillez réessayer plus tard',
  'User not found': 'Aucun compte trouvé avec cet email',
  'User already registered': 'Un compte existe déjà avec cet email',
  'Password should be at least 6 characters':
    'Le mot de passe doit contenir au moins 6 caractères',
  'Invalid email': 'Adresse email invalide',
  'Unable to validate email address': "Impossible de valider l'adresse email",
  'JWT expired': 'Session expirée. Veuillez vous reconnecter',
  'JWT malformed': 'Token de session invalide',
};

// Fonction utilitaire pour la gestion d'erreurs
export const handleSupabaseError = (error: unknown): SupabaseError => {
  if (!error) {
    return {
      message: 'Erreur inconnue',
      code: 'UNKNOWN_ERROR',
    };
  }

  const err = error as { message?: string; status?: number; code?: string };

  return {
    message: errorMessages[err.message || ''] || err.message || 'Erreur inconnue',
    status: err.status,
    code: err.code || 'UNKNOWN_ERROR',
  };
};
