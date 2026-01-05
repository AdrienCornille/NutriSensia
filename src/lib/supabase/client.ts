/**
 * Client Supabase pour l'application NutriSensia
 *
 * Ce fichier exporte le client Supabase configuré pour être utilisé
 * dans les composants React et les API routes.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase';

// Vérification des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérifier si les clés sont des placeholders ou manquantes
const isValidSupabaseConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key';

// Création du client Supabase avec types TypeScript
const supabaseClient = createSupabaseClient<Database>(
  isValidSupabaseConfig ? supabaseUrl! : 'https://placeholder.supabase.co',
  isValidSupabaseConfig ? supabaseAnonKey! : 'placeholder-key',
  {
    auth: {
      // Configuration pour la conformité GDPR et la sécurité
      autoRefreshToken: isValidSupabaseConfig,
      persistSession: isValidSupabaseConfig,
      detectSessionInUrl: isValidSupabaseConfig,
      // Configuration pour la gestion des cookies
      cookieOptions: {
        name: 'nutrisensia-auth-token',
        lifetime: 60 * 60 * 24 * 7, // 7 jours
        domain:
          process.env.NODE_ENV === 'production'
            ? '.nutrisensia.com'
            : 'localhost',
        path: '/',
        sameSite: 'lax',
      },
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'nutrisensia-web',
        'X-App-Version': process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
      },
    },
  }
);

// Export du client par défaut
export default supabaseClient;

// Export de la fonction createClient pour compatibilité
export const createClient = () => supabaseClient;

// Flag pour indiquer si Supabase est configuré correctement
export const isSupabaseConfigured = isValidSupabaseConfig;

// Types d'erreur personnalisés
export interface SupabaseError {
  message: string;
  status?: number;
  code?: string;
}

// Fonctions utilitaires pour la gestion d'erreurs
export const handleSupabaseError = (error: any): SupabaseError => {
  if (!error) {
    return {
      message: 'Erreur inconnue',
      code: 'UNKNOWN_ERROR',
    };
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

  return {
    message: errorMessages[error.message] || error.message || 'Erreur inconnue',
    status: error.status,
    code: error.code || error.name || 'UNKNOWN_ERROR',
  };
};
