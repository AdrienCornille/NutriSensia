import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Interface pour les données de profil utilisateur
 */
export interface UserProfile {
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
}

/**
 * Interface pour les mises à jour de profil
 */
export interface ProfileUpdate {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

/**
 * État du hook useProfile
 */
interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour gérer les opérations de profil utilisateur
 *
 * @example
 * ```tsx
 * const { profile, loading, error, updateProfile, updateAvatar } = useProfile();
 *
 * // Mettre à jour le profil
 * await updateProfile({ full_name: 'John Doe' });
 *
 * // Mettre à jour l'avatar
 * await updateAvatar('https://example.com/avatar.jpg');
 * ```
 */
export const useProfile = () => {
  const [state, setState] = useState<ProfileState>({
    profile: null,
    loading: true,
    error: null,
  });

  /**
   * Charge le profil de l'utilisateur actuel
   */
  const loadProfile = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Récupérer l'utilisateur actuel
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Utilisateur non connecté');
      }

      // Récupérer le profil depuis la table profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // Si le profil n'existe pas, le créer
        if (profileError.code === 'PGRST116') {
          const newProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            role: user.user_metadata?.role || 'patient',
            avatar_url: user.user_metadata?.avatar_url || null,
            phone: user.user_metadata?.phone || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email_verified: user.email_confirmed_at ? true : false,
            two_factor_enabled: false,
            last_sign_in_at: user.last_sign_in_at,
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) {
            throw new Error(
              `Erreur lors de la création du profil: ${createError.message}`
            );
          }

          setState({
            profile: createdProfile,
            loading: false,
            error: null,
          });
        } else {
          throw new Error(
            `Erreur lors du chargement du profil: ${profileError.message}`
          );
        }
      } else {
        setState({
          profile,
          loading: false,
          error: null,
        });
      }
    } catch (error: any) {
      setState({
        profile: null,
        loading: false,
        error: error.message || 'Erreur lors du chargement du profil',
      });
    }
  }, []);

  /**
   * Met à jour le profil utilisateur
   */
  const updateProfile = useCallback(
    async (updates: ProfileUpdate): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        if (!state.profile) {
          throw new Error('Aucun profil à mettre à jour');
        }

        const { data: updatedProfile, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', state.profile.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
        }

        setState(prev => ({
          ...prev,
          profile: updatedProfile,
          loading: false,
        }));

        return true;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Erreur lors de la mise à jour du profil',
        }));
        return false;
      }
    },
    [state.profile]
  );

  /**
   * Met à jour l'URL de l'avatar
   */
  const updateAvatar = useCallback(
    async (avatarUrl: string): Promise<boolean> => {
      return updateProfile({ avatar_url: avatarUrl });
    },
    [updateProfile]
  );

  /**
   * Supprime l'avatar actuel
   */
  const removeAvatar = useCallback(async (): Promise<boolean> => {
    return updateProfile({ avatar_url: null });
  }, [updateProfile]);

  /**
   * Supprime un fichier du bucket de stockage
   */
  const deleteStorageFile = useCallback(
    async (bucketName: string, filePath: string): Promise<boolean> => {
      try {
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);

        if (error) {
          throw new Error(`Erreur lors de la suppression: ${error.message}`);
        }

        return true;
      } catch (error: any) {
        console.error('Erreur lors de la suppression du fichier:', error);
        return false;
      }
    },
    []
  );

  /**
   * Rafraîchit le profil
   */
  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Charge le profil au montage du composant
   */
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    // État
    profile: state.profile,
    loading: state.loading,
    error: state.error,

    // Actions
    updateProfile,
    updateAvatar,
    removeAvatar,
    deleteStorageFile,
    refreshProfile,
    loadProfile,
  };
};

export default useProfile;
