'use client';

import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { auth, AuthError } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const { setUser: setStoreUser, setAuthenticated } = useAppStore();

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data, error: sessionError } = await auth.getSession();
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
        console.error(
          "Erreur lors de l'initialisation de l'authentification:",
          error
        );
        setError({
          message: "Erreur lors de l'initialisation de l'authentification",
          code: 'INIT_ERROR',
        });
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      setSession(session);
      setUser(session?.user ?? null);
      updateStoreUser(session?.user || null);
      setLoading(false);
      setError(null);
    });

    return () => subscription.unsubscribe();
  }, [setStoreUser, setAuthenticated]);

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

  const getUser = async () => {
    try {
      const { data, error: authError } = await auth.getUser();
      if (authError) {
        setError(authError);
        return { data: null, error: authError };
      }
      return { data, error: null };
    } catch (error: any) {
      const errorObj = {
        message:
          "Une erreur inattendue s'est produite lors de la récupération de l'utilisateur",
        code: 'UNEXPECTED_ERROR',
      };
      setError(errorObj);
      return { data: null, error: errorObj };
    }
  };

  // Méthodes de compatibilité (pour maintenir l'API existante)
  const signIn = signInWithPassword;

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signInWithPassword,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    getUser,
    isAuthenticated: !!user,
    clearError: () => setError(null),
  };
}
