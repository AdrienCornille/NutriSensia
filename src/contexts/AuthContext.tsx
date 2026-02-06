'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';

// Types pour l'authentification
export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

// Types pour le contexte d'authentification
interface AuthContextType {
  // État d'authentification
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  initialized: boolean;

  // Fonctions d'authentification
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: AuthError | null }>;
  signInWithGoogle: (
    redirectTo?: string
  ) => Promise<{ data: any; error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: any
  ) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (
    email: string,
    redirectTo?: string
  ) => Promise<{ data: any; error: AuthError | null }>;
  updatePassword: (
    password: string
  ) => Promise<{ data: any; error: AuthError | null }>;

  // Fonctions utilitaires
  clearError: () => void;
  isAuthenticated: boolean;
  getUserRole: () => 'nutritionist' | 'patient' | 'admin' | null;
}

// Création du contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
}

// Hook sécurisé qui ne throw pas d'erreur si AuthProvider n'est pas disponible
// Utile pour les composants qui peuvent être utilisés avec ou sans authentification
export function useAuthSafe() {
  const context = useContext(AuthContext);
  return {
    isAuthenticated: context?.isAuthenticated ?? false,
    user: context?.user ?? null,
    loading: context?.loading ?? false,
    initialized: context?.initialized ?? false,
  };
}

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// Messages d'erreur traduits en français
const errorMessages: { [key: string]: string } = {
  'Invalid login credentials': 'Email ou mot de passe incorrect',
  'Email not confirmed':
    'Veuillez confirmer votre email avant de vous connecter',
  'Too many requests':
    'Trop de tentatives de connexion. Veuillez réessayer plus tard',
  'User not found': 'Aucun compte trouvé avec cet email',
  'User already registered': 'Un compte existe déjà avec cet email',
  'Password should be at least 6 characters':
    'Le mot de passe doit contenir au moins 6 caractères',
  'Invalid email': 'Adresse email invalide',
  'Unable to validate email address': "Impossible de valider l'adresse email",
};

// Fonction pour traduire les erreurs
const translateError = (error: any): AuthError => {
  const message =
    errorMessages[error?.message] ||
    error?.message ||
    'Une erreur est survenue';
  return {
    message,
    status: error?.status,
    code: error?.code || error?.name,
  };
};

// Provider du contexte d'authentification
export function AuthProvider({ children }: AuthProviderProps) {
  // Créer le client Supabase SSR une seule fois
  const supabase = useMemo(() => createClient(), []);

  // État local pour l'authentification
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Store global pour la synchronisation
  const { setUser: setStoreUser, setAuthenticated } = useAppStore();

  // Fonction pour mettre à jour l'utilisateur dans le store global
  const updateStoreUser = (user: User | null) => {
    setStoreUser(
      user
        ? {
            id: user.id,
            email: user.email || '',
            name:
              user.user_metadata?.full_name || user.user_metadata?.name || '',
            preferences: null,
          }
        : null
    );
    setAuthenticated(!!user);
  };

  // Initialisation de l'authentification
  useEffect(() => {
    let mounted = true;

    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (!mounted) return;

        if (sessionError) {
          console.error(
            'Erreur lors de la récupération de la session:',
            sessionError
          );
          setError(translateError(sessionError));
        } else {
          setSession(data?.session || null);
          setUser(data?.session?.user || null);
          updateStoreUser(data?.session?.user || null);
        }
      } catch (error) {
        if (!mounted) return;
        console.error(
          "Erreur lors de l'initialisation de l'authentification:",
          error
        );
        setError({
          message: "Erreur lors de l'initialisation de l'authentification",
          code: 'INIT_ERROR',
        });
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);

      setSession(session);
      setUser(session?.user ?? null);
      updateStoreUser(session?.user || null);
      setLoading(false);
      setError(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, setStoreUser, setAuthenticated]);

  // Fonctions d'authentification
  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) {
        const translatedError = translateError(authError);
        setError(translatedError);
        return { data: null, error: translatedError };
      }
      return { data, error: null };
    } catch (error: any) {
      const errorObj = {
        message: "Une erreur inattendue s'est produite lors de la connexion",
        code: 'UNEXPECTED_ERROR',
      };
      setError(errorObj);
      return { data: null, error: errorObj };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (authError) {
        const translatedError = translateError(authError);
        setError(translatedError);
        return { data: null, error: translatedError };
      }
      return { data, error: null };
    } catch (error: any) {
      const errorObj = {
        message:
          "Une erreur inattendue s'est produite lors de la connexion avec Google",
        code: 'UNEXPECTED_ERROR',
      };
      setError(errorObj);
      return { data: null, error: errorObj };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: {
      full_name?: string;
      role?: 'nutritionist' | 'patient' | 'admin';
      phone?: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        const translatedError = translateError(authError);
        setError(translatedError);
        return { data: null, error: translatedError };
      }
      return { data, error: null };
    } catch (error: any) {
      const errorObj = {
        message: "Une erreur inattendue s'est produite lors de l'inscription",
        code: 'UNEXPECTED_ERROR',
      };
      setError(errorObj);
      return { data: null, error: errorObj };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signOut();

      if (authError) {
        const translatedError = translateError(authError);
        setError(translatedError);
        return { error: translatedError };
      }
      return { error: null };
    } catch (error: any) {
      const errorObj = {
        message: "Une erreur inattendue s'est produite lors de la déconnexion",
        code: 'UNEXPECTED_ERROR',
      };
      setError(errorObj);
      return { error: errorObj };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, redirectTo?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        });

      if (authError) {
        const translatedError = translateError(authError);
        setError(translatedError);
        return { data: null, error: translatedError };
      }
      return { data, error: null };
    } catch (error: any) {
      const errorObj = {
        message:
          "Une erreur inattendue s'est produite lors de la réinitialisation du mot de passe",
        code: 'UNEXPECTED_ERROR',
      };
      setError(errorObj);
      return { data: null, error: errorObj };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.updateUser({
        password,
      });

      if (authError) {
        const translatedError = translateError(authError);
        setError(translatedError);
        return { data: null, error: translatedError };
      }
      return { data, error: null };
    } catch (error: any) {
      const errorObj = {
        message:
          "Une erreur inattendue s'est produite lors de la mise à jour du mot de passe",
        code: 'UNEXPECTED_ERROR',
      };
      setError(errorObj);
      return { data: null, error: errorObj };
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
  const clearError = () => setError(null);

  const isAuthenticated = !!user;

  const getUserRole = (): 'nutritionist' | 'patient' | 'admin' | null => {
    if (!user) return null;
    return user.user_metadata?.role || 'patient';
  };

  // Valeur du contexte
  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    initialized,
    signInWithPassword,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
    isAuthenticated,
    getUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook pour vérifier si l'utilisateur a un rôle spécifique
export function useUserRole() {
  const { getUserRole } = useAuth();
  return getUserRole();
}

// Hook pour vérifier les permissions
export function usePermissions() {
  const { user, getUserRole } = useAuth();

  const hasRole = (role: 'nutritionist' | 'patient' | 'admin') => {
    return getUserRole() === role;
  };

  const hasAnyRole = (roles: ('nutritionist' | 'patient' | 'admin')[]) => {
    const userRole = getUserRole();
    return userRole ? roles.includes(userRole) : false;
  };

  const isAdmin = () => hasRole('admin');
  const isNutritionist = () => hasRole('nutritionist');
  const isPatient = () => hasRole('patient');

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isNutritionist,
    isPatient,
    userRole: getUserRole(),
  };
}
