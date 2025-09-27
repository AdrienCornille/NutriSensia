/**
 * Client Supabase pour le serveur (Server-Side Rendering)
 * 
 * Ce fichier exporte le client Supabase configuré pour être utilisé
 * dans les API routes et les Server Components de Next.js.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import type { Database } from './supabase';

// Vérification des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Vérifier si les clés sont des placeholders ou manquantes
const isValidSupabaseConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key';

/**
 * Crée un client Supabase pour le serveur
 * Utilise la clé de service pour les opérations côté serveur
 */
export function createClient() {
  const cookieStore = cookies();
  const headerStore = headers();

  return createSupabaseClient<Database>(
    isValidSupabaseConfig ? supabaseUrl! : 'https://placeholder.supabase.co',
    // Utiliser la clé de service pour les opérations côté serveur
    supabaseServiceKey || (isValidSupabaseConfig ? supabaseAnonKey! : 'placeholder-key'),
    {
      auth: {
        // Configuration pour le serveur
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        // Gestion des cookies pour le SSR
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
          'X-Client-Info': 'nutrisensia-server',
          'X-App-Version': process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
          // Transmettre les headers de la requête
          ...Object.fromEntries(headerStore.entries()),
        },
      },
    }
  );
}

/**
 * Crée un client Supabase pour les API routes
 * Utilise les cookies de session pour l'authentification
 */
export function createServerClient() {
  const cookieStore = cookies();
  const headerStore = headers();

  return createSupabaseClient<Database>(
    isValidSupabaseConfig ? supabaseUrl! : 'https://placeholder.supabase.co',
    isValidSupabaseConfig ? supabaseAnonKey! : 'placeholder-key',
    {
      auth: {
        // Configuration pour les API routes
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // Gestion des cookies pour les API routes
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
          'X-Client-Info': 'nutrisensia-api',
          'X-App-Version': process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
          // Transmettre les headers de la requête
          ...Object.fromEntries(headerStore.entries()),
        },
      },
    }
  );
}

/**
 * Crée un client Supabase pour les Server Components
 * Utilise la clé de service pour les opérations administratives
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    isValidSupabaseConfig ? supabaseUrl! : 'https://placeholder.supabase.co',
    supabaseServiceKey || (isValidSupabaseConfig ? supabaseAnonKey! : 'placeholder-key'),
    {
      auth: {
        // Configuration pour les opérations administratives
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'nutrisensia-admin',
          'X-App-Version': process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
        },
      },
    }
  );
}

// Export par défaut
export default createClient;

// Flag pour indiquer si Supabase est configuré correctement
export const isSupabaseConfigured = isValidSupabaseConfig;

// Types d'erreur personnalisés
export interface SupabaseServerError {
  message: string;
  status?: number;
  code?: string;
}

// Fonctions utilitaires pour la gestion d'erreurs côté serveur
export const handleServerError = (error: any): SupabaseServerError => {
  if (!error) {
    return {
      message: 'Erreur inconnue côté serveur',
      code: 'UNKNOWN_SERVER_ERROR',
    };
  }

  // Messages d'erreur traduits en français pour le serveur
  const errorMessages: { [key: string]: string } = {
    'Invalid login credentials': 'Email ou mot de passe incorrect',
    'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
    'Too many requests': 'Trop de tentatives. Veuillez réessayer plus tard',
    'User not found': 'Aucun compte trouvé avec cet email',
    'User already registered': 'Un compte existe déjà avec cet email',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
    'Invalid email': 'Adresse email invalide',
    'Unable to validate email address': "Impossible de valider l'adresse email",
    'JWT expired': 'Session expirée. Veuillez vous reconnecter',
    'JWT malformed': 'Token de session invalide',
    'Service role key not found': 'Clé de service Supabase manquante',
    'Database connection failed': 'Connexion à la base de données échouée',
  };

  return {
    message: errorMessages[error.message] || error.message || 'Erreur côté serveur',
    status: error.status,
    code: error.code || error.name || 'SERVER_ERROR',
  };
};
