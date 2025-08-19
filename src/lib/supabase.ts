import { createClient } from '@supabase/supabase-js';

// Types pour les tables Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
          preferences: {
            dietary_restrictions: string[];
            allergies: string[];
            goals: string[];
            activity_level: string;
            age: number;
            weight: number;
            height: number;
            gender?: string;
          } | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          preferences?: {
            dietary_restrictions: string[];
            allergies: string[];
            goals: string[];
            activity_level: string;
            age: number;
            weight: number;
            height: number;
            gender?: string;
          } | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          preferences?: {
            dietary_restrictions: string[];
            allergies: string[];
            goals: string[];
            activity_level: string;
            age: number;
            weight: number;
            height: number;
            gender?: string;
          } | null;
        };
      };
      meals: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          ingredients: {
            name: string;
            quantity: number;
            unit: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
          }[];
          total_calories: number;
          total_protein: number;
          total_carbs: number;
          total_fat: number;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          ingredients: {
            name: string;
            quantity: number;
            unit: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
          }[];
          total_calories: number;
          total_protein: number;
          total_carbs: number;
          total_fat: number;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          ingredients?: {
            name: string;
            quantity: number;
            unit: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
          }[];
          total_calories?: number;
          total_protein?: number;
          total_carbs?: number;
          total_fat?: number;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      meal_plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          meals: string[]; // IDs des repas
          total_calories: number;
          total_protein: number;
          total_carbs: number;
          total_fat: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          meals: string[];
          total_calories: number;
          total_protein: number;
          total_carbs: number;
          total_fat: number;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          meals?: string[];
          total_calories?: number;
          total_protein?: number;
          total_carbs?: number;
          total_fat?: number;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

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
// Utiliser des valeurs par défaut si la configuration n'est pas valide (pour le développement)
export const supabase = createClient<Database>(
  isValidSupabaseConfig ? supabaseUrl! : 'https://placeholder.supabase.co',
  isValidSupabaseConfig ? supabaseAnonKey! : 'placeholder-key',
  {
    auth: {
      // Configuration pour la conformité GDPR
      autoRefreshToken: isValidSupabaseConfig,
      persistSession: isValidSupabaseConfig,
      detectSessionInUrl: isValidSupabaseConfig,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'nutrisensia-web',
      },
    },
  }
);

// Flag pour indiquer si Supabase est configuré correctement
export const isSupabaseConfigured = isValidSupabaseConfig;

// Fonctions utilitaires pour l'authentification
export const auth = {
  // Connexion avec email/mot de passe
  signIn: async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Inscription avec email/mot de passe
  signUp: async (
    email: string,
    password: string,
    metadata?: { name: string }
  ) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },

  // Déconnexion
  signOut: async () => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase not configured' } };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Récupération de l'utilisateur actuel
  getUser: async () => {
    if (!isSupabaseConfigured) {
      return {
        data: { user: null },
        error: { message: 'Supabase not configured' },
      };
    }
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { data: { user }, error };
  },

  // Écoute des changements d'authentification
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Fonctions utilitaires pour les données
export const db = {
  // Utilisateurs
  users: {
    get: async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    create: async (
      userData: Database['public']['Tables']['users']['Insert']
    ) => {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      return { data, error };
    },

    update: async (
      userId: string,
      updates: Database['public']['Tables']['users']['Update']
    ) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    },
  },

  // Repas
  meals: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    create: async (
      mealData: Database['public']['Tables']['meals']['Insert']
    ) => {
      const { data, error } = await supabase
        .from('meals')
        .insert(mealData)
        .select()
        .single();
      return { data, error };
    },

    update: async (
      mealId: string,
      updates: Database['public']['Tables']['meals']['Update']
    ) => {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', mealId)
        .select()
        .single();
      return { data, error };
    },

    delete: async (mealId: string) => {
      const { error } = await supabase.from('meals').delete().eq('id', mealId);
      return { error };
    },
  },

  // Plans de repas
  mealPlans: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    create: async (
      planData: Database['public']['Tables']['meal_plans']['Insert']
    ) => {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert(planData)
        .select()
        .single();
      return { data, error };
    },

    update: async (
      planId: string,
      updates: Database['public']['Tables']['meal_plans']['Update']
    ) => {
      const { data, error } = await supabase
        .from('meal_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single();
      return { data, error };
    },

    delete: async (planId: string) => {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId);
      return { error };
    },
  },
};
