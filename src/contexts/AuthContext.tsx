'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, auth, AuthError } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

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
  requires2FA: () => boolean;
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

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte d'authentification
export function AuthProvider({ children }: AuthProviderProps) {
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
        const { data, error: sessionError } = await auth.getSession();

        if (!mounted) return;

        if (sessionError) {
          console.error(
            'Erreur lors de la récupération de la session:',
            sessionError
          );
          setError(sessionError);
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
    } = auth.onAuthStateChange(async (event, session) => {
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
  }, [setStoreUser, setAuthenticated]);

  // Fonctions d'authentification
  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await auth.signInWithPassword(
        email,
        password
      );
      if (authError) {
        setError(authError);
        return { data: null, error: authError };
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
      const { data, error: authError } =
        await auth.signInWithGoogle(redirectTo);
      if (authError) {
        setError(authError);
        return { data: null, error: authError };
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
      const { data, error: authError } = await auth.signUp(
        email,
        password,
        metadata
      );
      if (authError) {
        setError(authError);
        return { data: null, error: authError };
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
      const { data, error: authError } = await auth.signOut();
      if (authError) {
        setError(authError);
        return { error: authError };
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
      const { data, error: authError } = await auth.resetPasswordForEmail(
        email,
        redirectTo
      );
      if (authError) {
        setError(authError);
        return { data: null, error: authError };
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
      const { data, error: authError } = await auth.updatePassword(password);
      if (authError) {
        setError(authError);
        return { data: null, error: authError };
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

  const requires2FA = (): boolean => {
    const role = getUserRole();
    return role === 'nutritionist' || role === 'admin';
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
    requires2FA,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook pour vérifier si l'utilisateur a un rôle spécifique
export function useUserRole() {
  const { getUserRole } = useAuth();
  return getUserRole();
}

// Hook pour vérifier si l'utilisateur nécessite 2FA
export function useRequires2FA() {
  const { requires2FA } = useAuth();
  return requires2FA();
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
