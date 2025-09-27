import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  type ProfileUpdate, 
  type NutritionistProfile, 
  type PatientProfile 
} from '@/lib/schemas';

/**
 * Interface pour l'état du profil
 */
interface ProfileState {
  profile: NutritionistProfile | PatientProfile | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour gérer les profils utilisateur complets
 * VERSION TEMPORAIRE - Accès aux tables nutritionists/patients désactivé
 */
export const useUserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<ProfileState>({
    profile: null,
    loading: true,
    error: null,
  });

  /**
   * Charge le profil complet de l'utilisateur connecté
   */
  const loadProfile = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setState(prev => ({ ...prev, loading: false, error: 'Utilisateur non connecté' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Récupérer le profil de base
      console.log('🔄 Chargement du profil utilisateur:', user.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur chargement profil:', profileError);
        throw new Error(`Erreur lors du chargement du profil: ${profileError.message}`);
      }

      if (!profileData) {
        console.error('❌ Profil non trouvé pour l\'utilisateur:', user.id);
        throw new Error('Profil non trouvé');
      }

      console.log('✅ Profil chargé:', profileData);

      // TEMPORAIRE: Accès aux tables nutritionists/patients désactivé pour éviter l'erreur 406
      console.log('⚠️ Accès aux tables nutritionists/patients temporairement désactivé');
      console.log('   Utilisation des données de base du profil uniquement');
      
      let roleSpecificData = {};

      // Combiner les données
      let completeProfile = {
        ...profileData,
        ...roleSpecificData,
      };

      setState(prev => ({
        ...prev,
        profile: completeProfile as NutritionistProfile | PatientProfile,
        loading: false,
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erreur lors du chargement du profil',
      }));
    }
  }, [user, isAuthenticated]);

  /**
   * Met à jour le profil utilisateur
   */
  const updateProfile = useCallback(async (updates: ProfileUpdate): Promise<boolean> => {
    if (!user || !isAuthenticated) {
      setState(prev => ({ ...prev, error: 'Utilisateur non connecté' }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Séparer les champs communs et spécifiques au rôle
      const commonFields = [
        'first_name', 'last_name', 'phone', 'avatar_url', 
        'locale', 'timezone'
      ];

      const commonUpdates: any = {};
      const roleSpecificUpdates: any = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (commonFields.includes(key)) {
          commonUpdates[key] = value;
        } else {
          roleSpecificUpdates[key] = value;
        }
      });

      // Mettre à jour les champs communs
      if (Object.keys(commonUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            ...commonUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileError) {
          throw new Error(`Erreur lors de la mise à jour du profil: ${profileError.message}`);
        }
      }

      // TEMPORAIRE: Mise à jour des tables nutritionists/patients désactivée
      if (Object.keys(roleSpecificUpdates).length > 0) {
        console.log('⚠️ Mise à jour des données spécifiques au rôle désactivée temporairement');
        console.log('   Données à sauvegarder:', roleSpecificUpdates);
      }

      // Recharger le profil pour avoir les données à jour
      await loadProfile();

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erreur lors de la mise à jour du profil',
      }));
      return false;
    }
  }, [user, isAuthenticated, loadProfile]);

  /**
   * Met à jour l'avatar
   */
  const updateAvatar = useCallback(async (avatarUrl: string): Promise<boolean> => {
    return updateProfile({ avatar_url: avatarUrl });
  }, [updateProfile]);

  /**
   * Supprime l'avatar
   */
  const removeAvatar = useCallback(async (): Promise<boolean> => {
    return updateProfile({ avatar_url: null });
  }, [updateProfile]);

  /**
   * Rafraîchit le profil
   */
  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  // Charger le profil au montage et quand l'authentification change
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
    } else {
      setState(prev => ({ ...prev, profile: null, loading: false }));
    }
  }, [isAuthenticated, user, loadProfile]);

  return {
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    updateProfile,
    updateAvatar,
    removeAvatar,
    refreshProfile,
    loadProfile,
  };
};
