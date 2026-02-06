import { createClient } from '@supabase/supabase-js';

// Types pour les tables Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'nutritionist' | 'patient' | 'admin';
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
          email_verified: boolean;
          two_factor_enabled: boolean;
          last_sign_in_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          role?: 'nutritionist' | 'patient' | 'admin';
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
          email_verified?: boolean;
          two_factor_enabled?: boolean;
          last_sign_in_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'nutritionist' | 'patient' | 'admin';
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
          email_verified?: boolean;
          two_factor_enabled?: boolean;
          last_sign_in_at?: string | null;
        };
      };
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
      // Configuration pour la conformité GDPR et la sécurité
      autoRefreshToken: isValidSupabaseConfig,
      persistSession: isValidSupabaseConfig,
      detectSessionInUrl: isValidSupabaseConfig,
      // Configuration pour la gestion des cookies
      // IMPORTANT: Utiliser le même nom que @/lib/supabase/client.ts pour la cohérence
      cookieOptions: {
        name: 'nutrisensia-auth',
        lifetime: 60 * 60 * 24 * 7, // 7 jours
        domain:
          process.env.NODE_ENV === 'production' ? '.nutrisensia.ch' : undefined,
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

// Flag pour indiquer si Supabase est configuré correctement
export const isSupabaseConfigured = isValidSupabaseConfig;

// Types pour l'authentification
export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export interface AuthResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

export interface SignUpData {
  user: any;
  session: any;
}

export interface SignInData {
  user: any;
  session: any;
}

// Fonctions utilitaires pour l'authentification avec gestion d'erreurs améliorée
export const auth = {
  // Connexion avec email/mot de passe
  signInWithPassword: async (
    email: string,
    password: string
  ): Promise<AuthResponse<SignInData>> => {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: {
          message:
            "Supabase n'est pas configuré. Veuillez configurer les variables d'environnement.",
          code: 'SUPABASE_NOT_CONFIGURED',
        },
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Traduction des erreurs Supabase en français
        const errorMessages: { [key: string]: string } = {
          'Invalid login credentials': 'Email ou mot de passe incorrect',
          'Email not confirmed':
            'Veuillez confirmer votre email avant de vous connecter',
          'Too many requests':
            'Trop de tentatives de connexion. Veuillez réessayer plus tard',
          'User not found': 'Aucun compte trouvé avec cet email',
        };

        return {
          data: null,
          error: {
            message: errorMessages[error.message] || error.message,
            status: error.status,
            code: error.name,
          },
        };
      }

      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: "Une erreur inattendue s'est produite lors de la connexion",
          code: 'UNEXPECTED_ERROR',
        },
      };
    }
  },

  // Inscription avec email/mot de passe
  signUp: async (
    email: string,
    password: string,
    metadata?: {
      full_name?: string;
      role?: 'nutritionist' | 'patient' | 'admin';
      phone?: string;
    }
  ): Promise<AuthResponse<SignUpData>> => {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: {
          message:
            "Supabase n'est pas configuré. Veuillez configurer les variables d'environnement.",
          code: 'SUPABASE_NOT_CONFIGURED',
        },
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const errorMessages: { [key: string]: string } = {
          'User already registered': 'Un compte existe déjà avec cet email',
          'Password should be at least 6 characters':
            'Le mot de passe doit contenir au moins 6 caractères',
          'Invalid email': 'Adresse email invalide',
          'Unable to validate email address':
            "Impossible de valider l'adresse email",
        };

        return {
          data: null,
          error: {
            message: errorMessages[error.message] || error.message,
            status: error.status,
            code: error.name,
          },
        };
      }

      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: "Une erreur inattendue s'est produite lors de l'inscription",
          code: 'UNEXPECTED_ERROR',
        },
      };
    }
  },

  // Connexion avec Google OAuth
  signInWithGoogle: async (redirectTo?: string): Promise<AuthResponse> => {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: {
          message:
            "Supabase n'est pas configuré. Veuillez configurer les variables d'environnement.",
          code: 'SUPABASE_NOT_CONFIGURED',
        },
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return {
          data: null,
          error: {
            message: 'Erreur lors de la connexion avec Google',
            status: error.status,
            code: error.name,
          },
        };
      }

      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message:
            "Une erreur inattendue s'est produite lors de la connexion avec Google",
          code: 'UNEXPECTED_ERROR',
        },
      };
    }
  },

  // Déconnexion
  signOut: async (): Promise<AuthResponse> => {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: {
          message: "Supabase n'est pas configuré",
          code: 'SUPABASE_NOT_CONFIGURED',
        },
      };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return {
          data: null,
          error: {
            message: 'Erreur lors de la déconnexion',
            status: error.status,
            code: error.name,
          },
        };
      }
      return { data: { success: true }, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message:
            "Une erreur inattendue s'est produite lors de la déconnexion",
          code: 'UNEXPECTED_ERROR',
        },
      };
    }
  },

  // Récupération de l'utilisateur actuel
  getUser: async (): Promise<AuthResponse<{ user: any }>> => {
    if (!isSupabaseConfigured) {
      return {
        data: { user: null },
        error: {
          message: "Supabase n'est pas configuré",
          code: 'SUPABASE_NOT_CONFIGURED',
        },
      };
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        // Gestion spécifique des erreurs d'authentification
        if (error.message.includes('JWT')) {
          return {
            data: { user: null },
            error: {
              message:
                "Aucun utilisateur connecté. Veuillez vous connecter d'abord.",
              status: error.status,
              code: 'NOT_AUTHENTICATED',
            },
          };
        }

        return {
          data: { user: null },
          error: {
            message: "Erreur lors de la récupération de l'utilisateur",
            status: error.status,
            code: error.name,
          },
        };
      }

      // Si pas d'erreur mais pas d'utilisateur non plus
      if (!user) {
        return {
          data: { user: null },
          error: {
            message:
              "Aucun utilisateur connecté. Veuillez vous connecter d'abord.",
            code: 'NO_USER',
          },
        };
      }

      return { data: { user }, error: null };
    } catch (error: any) {
      return {
        data: { user: null },
        error: {
          message: "Une erreur inattendue s'est produite",
          code: 'UNEXPECTED_ERROR',
        },
      };
    }
  },

  // Récupération de la session actuelle
  getSession: async (): Promise<AuthResponse<{ session: any }>> => {
    if (!isSupabaseConfigured) {
      return {
        data: { session: null },
        error: {
          message: "Supabase n'est pas configuré",
          code: 'SUPABASE_NOT_CONFIGURED',
        },
      };
    }

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        return {
          data: { session: null },
          error: {
            message: 'Erreur lors de la récupération de la session',
            status: error.status,
            code: error.name,
          },
        };
      }

      return { data: { session }, error: null };
    } catch (error: any) {
      return {
        data: { session: null },
        error: {
          message: "Une erreur inattendue s'est produite",
          code: 'UNEXPECTED_ERROR',
        },
      };
    }
  },

  // Réinitialisation du mot de passe
  resetPasswordForEmail: async (
    email: string,
    redirectTo?: string
  ): Promise<AuthResponse> => {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: {
          message: "Supabase n'est pas configuré",
          code: 'SUPABASE_NOT_CONFIGURED',
        },
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          redirectTo || `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        const errorMessages: { [key: string]: string } = {
          'User not found': 'Aucun compte trouvé avec cet email',
          'Too many requests': 'Trop de demandes. Veuillez réessayer plus tard',
        };

        return {
          data: null,
          error: {
            message: errorMessages[error.message] || error.message,
            status: error.status,
            code: error.name,
          },
        };
      }

      return { data: { success: true }, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: "Une erreur inattendue s'est produite",
          code: 'UNEXPECTED_ERROR',
        },
      };
    }
  },

  // Mise à jour du mot de passe
  updatePassword: async (password: string): Promise<AuthResponse> => {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: {
          message: "Supabase n'est pas configuré",
          code: 'SUPABASE_NOT_CONFIGURED',
        },
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return {
          data: null,
          error: {
            message: 'Erreur lors de la mise à jour du mot de passe',
            status: error.status,
            code: error.name,
          },
        };
      }

      return { data: { success: true }, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: "Une erreur inattendue s'est produite",
          code: 'UNEXPECTED_ERROR',
        },
      };
    }
  },

  // Écoute des changements d'authentification
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Méthodes de compatibilité (pour maintenir l'API existante)
  signIn: async (email: string, password: string) => {
    return auth.signInWithPassword(email, password);
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
