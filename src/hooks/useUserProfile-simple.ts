import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook simplifié pour les tests - Tous les champs optionnels
 * SOLUTION CONTEXT7: UPDATE au lieu d'UPSERT
 */
export const useUserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger le profil
  const loadProfile = useCallback(async () => {
    if (!user || !isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      // Charger le profil de base
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Charger les données nutritionniste
      let nutritionistData = {};
      if (profileData.role === 'nutritionist') {
        try {
          const { data: nutritionist, error: nutritionistError } =
            await supabase
              .from('nutritionists')
              .select('*')
              .eq('id', user.id)
              .single();

          if (!nutritionistError) {
            nutritionistData = nutritionist || {};
            console.log('✅ Données nutritionniste chargées');
          }
        } catch (error) {
          console.warn('⚠️ Erreur nutritionniste:', error);
        }
      }

      // Combiner les données
      const completeProfile = { ...profileData, ...nutritionistData };
      setProfile(completeProfile);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Mettre à jour le profil
  const updateProfile = useCallback(
    async updates => {
      if (!user || !isAuthenticated) return false;

      try {
        setLoading(true);
        setError(null);

        // Séparer les champs communs et spécifiques
        const commonFields = [
          'first_name',
          'last_name',
          'phone',
          'avatar_url',
          'locale',
          'timezone',
        ];
        const commonUpdates = {};
        const roleSpecificUpdates = {};

        Object.entries(updates).forEach(([key, value]) => {
          // Ignorer les valeurs undefined ou null
          if (value !== undefined && value !== null) {
            if (commonFields.includes(key)) {
              commonUpdates[key] = value;
            } else {
              roleSpecificUpdates[key] = value;
            }
          }
        });

        // Mettre à jour le profil de base
        if (Object.keys(commonUpdates).length > 0) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ ...commonUpdates, updated_at: new Date().toISOString() })
            .eq('id', user.id);

          if (profileError) throw profileError;
          console.log('✅ Profil de base mis à jour');
        }

        // SOLUTION CONTEXT7: Utiliser UPDATE au lieu d'UPSERT
        if (Object.keys(roleSpecificUpdates).length > 0) {
          const tableName =
            profile?.role === 'nutritionist' ? 'nutritionists' : 'patients';

          console.log(
            `🔄 Mise à jour ${tableName} avec UPDATE (solution Context7)`
          );
          console.log('📊 Données à sauvegarder:', roleSpecificUpdates);

          const { error: roleError } = await supabase
            .from(tableName)
            .update({
              ...roleSpecificUpdates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (roleError) {
            console.error(`❌ Erreur ${tableName}:`, roleError);
            throw roleError;
          }

          console.log(`✅ ${tableName} mis à jour avec succès`);
        }

        // Recharger le profil
        await loadProfile();
        return true;
      } catch (error) {
        setError(error.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, isAuthenticated, profile, loadProfile]
  );

  // Effet de chargement
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
    }
  }, [isAuthenticated, user, loadProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    loadProfile,
  };
};
