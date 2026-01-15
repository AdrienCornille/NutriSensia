/**
 * Client Supabase pour le serveur (Server Components, Server Actions, Route Handlers)
 *
 * Utilise @supabase/ssr pour une gestion correcte des cookies côté serveur
 * Compatible avec Next.js App Router
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
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
 * Crée un client Supabase pour les Server Components et Server Actions
 *
 * Utilise les cookies de la requête pour l'authentification
 * IMPORTANT: Le rafraîchissement de session se fait dans le middleware
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // La méthode setAll a été appelée depuis un Server Component
            // Cela peut être ignoré si on a un middleware qui rafraîchit
            // les sessions de l'utilisateur
          }
        },
      },
    }
  );
}

// Export par défaut
export default createClient;

// Types d'erreur personnalisés
export interface SupabaseServerError {
  message: string;
  status?: number;
  code?: string;
}

// Messages d'erreur traduits en français pour le serveur
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
  'Service role key not found': 'Clé de service Supabase manquante',
  'Database connection failed': 'Connexion à la base de données échouée',
};

// Fonction utilitaire pour la gestion d'erreurs côté serveur
export const handleServerError = (error: unknown): SupabaseServerError => {
  if (!error) {
    return {
      message: 'Erreur inconnue côté serveur',
      code: 'UNKNOWN_SERVER_ERROR',
    };
  }

  const err = error as { message?: string; status?: number; code?: string };

  return {
    message:
      errorMessages[err.message || ''] || err.message || 'Erreur côté serveur',
    status: err.status,
    code: err.code || 'SERVER_ERROR',
  };
};
