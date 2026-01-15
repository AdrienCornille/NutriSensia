/**
 * Client Supabase Admin (Service Role)
 *
 * Ce client utilise la clé de service (service role) pour bypasser les Row Level Security (RLS)
 * À utiliser UNIQUEMENT pour les opérations administratives côté serveur :
 * - Webhooks
 * - Tâches CRON
 * - Opérations d'administration
 *
 * ⚠️ ATTENTION: Ne jamais exposer ce client côté client !
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Vérification des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Vérifier si les clés sont configurées
export const isAdminConfigured =
  supabaseUrl &&
  supabaseServiceKey &&
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseServiceKey !== 'your_supabase_service_role_key';

/**
 * Crée un client Supabase avec les privilèges admin (service role)
 *
 * Ce client bypass les Row Level Security (RLS) policies
 * À utiliser uniquement dans les contextes serveur sécurisés
 */
export function createAdminClient() {
  if (!isAdminConfigured) {
    console.warn(
      '[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY non configurée. Les opérations admin échoueront.'
    );
  }

  return createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceKey || 'placeholder-key',
    {
      auth: {
        // Pas de session utilisateur pour le client admin
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
export default createAdminClient;

// Types d'erreur personnalisés pour les opérations admin
export interface AdminError {
  message: string;
  status?: number;
  code?: string;
}

// Messages d'erreur traduits en français pour les opérations admin
const errorMessages: { [key: string]: string } = {
  'Service role key not found': 'Clé de service Supabase non configurée',
  'Database connection failed': 'Connexion à la base de données échouée',
  'Permission denied': 'Permission refusée',
  'Invalid service key': 'Clé de service invalide',
  'Rate limit exceeded': 'Limite de requêtes atteinte',
};

// Fonction utilitaire pour la gestion d'erreurs admin
export const handleAdminError = (error: unknown): AdminError => {
  if (!error) {
    return {
      message: 'Erreur admin inconnue',
      code: 'UNKNOWN_ADMIN_ERROR',
    };
  }

  const err = error as { message?: string; status?: number; code?: string };

  return {
    message:
      errorMessages[err.message || ''] || err.message || 'Erreur admin',
    status: err.status,
    code: err.code || 'ADMIN_ERROR',
  };
};
