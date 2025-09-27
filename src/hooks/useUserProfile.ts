import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook optimisé avec les découvertes Context7
 * SOLUTION DÉFINITIVE basée sur la documentation officielle Supabase JS
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

      console.log('🔄 [Context7] Chargement du profil utilisateur:', user.id);

      // Charger le profil de base
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Charger les données nutritionniste avec configuration Context7
      let nutritionistData = {};
      if (profileData.role === 'nutritionist') {
        try {
          console.log('🔄 [Context7] Chargement données nutritionniste...');
          
          const { data: nutritionist, error: nutritionistError } = await supabase
            .from('nutritionists')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!nutritionistError) {
            nutritionistData = nutritionist || {};
            console.log('✅ [Context7] Données nutritionniste chargées:', nutritionistData);
          } else {
            console.warn('⚠️ [Context7] Erreur nutritionniste:', nutritionistError.message);
          }
        } catch (error) {
          console.warn('⚠️ [Context7] Exception nutritionniste:', error);
        }
      }

      // Combiner les données
      const completeProfile = { ...profileData, ...nutritionistData };
      setProfile(completeProfile);

    } catch (error) {
      console.error('❌ [Context7] Erreur chargement profil:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Mettre à jour le profil avec configuration Context7 optimale
  const updateProfile = useCallback(async (updates) => {
    if (!user || !isAuthenticated) {
      console.error('❌ [Context7] Utilisateur non connecté');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [Context7] Démarrage mise à jour profil');
      console.log('📊 [Context7] Updates reçues:', updates);

      // Séparer les champs communs et spécifiques
      const commonFields = ['first_name', 'last_name', 'phone', 'avatar_url', 'locale', 'timezone'];
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

      console.log('📊 [Context7] Champs communs:', commonUpdates);
      console.log('📊 [Context7] Champs spécifiques:', roleSpecificUpdates);

      // Mettre à jour le profil de base
      if (Object.keys(commonUpdates).length > 0) {
        console.log('🔄 [Context7] Mise à jour profil de base...');
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            ...commonUpdates, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', user.id);

        if (profileError) {
          console.error('❌ [Context7] Erreur profil de base:', profileError);
          throw profileError;
        }
        console.log('✅ [Context7] Profil de base mis à jour');
      }

      // SOLUTION CONTEXT7: UPDATE avec configuration optimale
      if (Object.keys(roleSpecificUpdates).length > 0) {
        const tableName = profile?.role === 'nutritionist' ? 'nutritionists' : 'patients';
        
        console.log(`🔄 [Context7] Mise à jour ${tableName} avec configuration optimisée`);
        console.log('📊 [Context7] Données à sauvegarder:', roleSpecificUpdates);

        // Configuration Context7 recommandée
        const updateData = {
          ...roleSpecificUpdates,
          updated_at: new Date().toISOString(),
        };

        console.log('📤 [Context7] Envoi UPDATE...');

        const { data: updateResult, error: roleError } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', user.id)
          .select(); // IMPORTANT: .select() pour avoir les données retournées

        if (roleError) {
          console.error('❌ [Context7] Erreur UPDATE:', roleError);
          console.error('📊 [Context7] Code erreur:', roleError.code);
          console.error('📊 [Context7] Message:', roleError.message);
          console.error('📊 [Context7] Détails:', roleError.details);
          throw roleError;
        }

        console.log('✅ [Context7] UPDATE réussi !');
        console.log('📊 [Context7] Résultat:', updateResult);
        console.log(`📊 [Context7] Lignes affectées: ${updateResult?.length || 0}`);

        // Vérification de persistance Context7
        if (updateResult && updateResult.length > 0) {
          console.log('✅ [Context7] Données retournées - UPDATE confirmé');
          console.log('📊 [Context7] Nouvelles données:', updateResult[0]);
        } else {
          console.warn('⚠️ [Context7] Aucune donnée retournée - Vérification nécessaire');
        }
      }

      // Recharger le profil pour confirmation
      console.log('🔄 [Context7] Rechargement du profil...');
      await loadProfile();
      
      console.log('🎉 [Context7] Mise à jour complète réussie !');
      return true;

    } catch (error) {
      console.error('❌ [Context7] Erreur mise à jour:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, profile, loadProfile]);

  // Effet de chargement
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 [Context7] Initialisation du profil');
      loadProfile();
    } else {
      console.log('⚠️ [Context7] Utilisateur non authentifié');
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
