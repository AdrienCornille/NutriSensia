import { supabase } from '@/lib/supabase';

/**
 * Utilitaire pour nettoyer les facteurs MFA orphelins
 */
export class MFACleanupUtil {
  /**
   * Nettoie tous les facteurs MFA non vérifiés pour l'utilisateur actuel
   * @param forceCleanVerified - Force le nettoyage même des facteurs vérifiés (DANGEREUX)
   * @param excludeFactorId - ID du facteur à exclure du nettoyage (pour protéger le facteur en cours)
   */
  static async cleanupUnverifiedFactors(
    forceCleanVerified = false,
    excludeFactorId?: string
  ): Promise<{
    cleaned: number;
    errors: string[];
  }> {
    const result = {
      cleaned: 0,
      errors: [] as string[],
    };

    try {
      console.log('🧹 Début du nettoyage des facteurs MFA non vérifiés...');

      // Lister tous les facteurs
      const { data: factorsData, error: listError } =
        await supabase.auth.mfa.listFactors();

      if (listError) {
        result.errors.push(
          `Erreur lors de la liste des facteurs: ${listError.message}`
        );
        return result;
      }

      if (!factorsData) {
        console.log('ℹ️ Aucune donnée de facteurs reçue');
        return result;
      }

      // Identifier les facteurs à supprimer
      let factorsToClean = [];

      console.log('🔍 Analyse détaillée des facteurs:', {
        allFactors: factorsData.all?.length || 0,
        totpFactors: factorsData.totp?.length || 0,
        phoneFactors: factorsData.phone?.length || 0,
        factorsData,
      });

      if (forceCleanVerified) {
        // Mode DANGEREUX : nettoyer TOUS les facteurs (utiliser 'all' pour capturer tous les types)
        console.warn(
          '⚠️ MODE FORCE ACTIVÉ : Nettoyage de TOUS les facteurs MFA'
        );
        factorsToClean = [
          ...(factorsData.all || []), // Utiliser 'all' au lieu de totp/phone séparément
        ].filter(f => {
          // Protéger le facteur exclu même en mode force
          if (excludeFactorId && f.id === excludeFactorId) {
            console.log(`🛡️ Facteur protégé du nettoyage forcé: ${f.id}`);
            return false;
          }
          return true;
        });
      } else {
        // Mode normal : seulement les non vérifiés (mais utiliser 'all' pour capturer tous les types)
        const allFactors = factorsData.all || [];

        // Filtrer les facteurs non vérifiés mais préserver les récents
        factorsToClean = allFactors.filter(f => {
          if (f.status !== 'unverified') return false;

          // Préserver les facteurs créés dans les 15 dernières minutes (augmenté de 10 à 15)
          const createdAt = new Date(f.created_at);
          const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

          if (createdAt > fifteenMinutesAgo) {
            console.log(
              `🛡️ Facteur récent préservé: ${f.id} (créé il y a ${Math.round((Date.now() - createdAt.getTime()) / 1000 / 60)} minutes)`
            );
            return false;
          }

          // Préserver les facteurs avec un nom (probablement en cours d'utilisation)
          if (f.friendly_name && f.friendly_name.trim() !== '') {
            console.log(
              `🛡️ Facteur avec nom préservé: ${f.id} (${f.friendly_name})`
            );
            return false;
          }

          // Préserver le facteur exclu spécifiquement
          if (excludeFactorId && f.id === excludeFactorId) {
            console.log(`🛡️ Facteur explicitement protégé: ${f.id}`);
            return false;
          }

          return true;
        });

        // Si 'all' est vide, fallback sur totp/phone
        if (factorsToClean.length === 0 && allFactors.length === 0) {
          factorsToClean = [
            ...(factorsData.totp?.filter(f => f.status === 'unverified') || []),
            ...(factorsData.phone?.filter(f => f.status === 'unverified') ||
              []),
          ];
        }
      }

      const unverifiedFactors = factorsToClean;

      console.log(
        `📋 ${unverifiedFactors.length} facteurs non vérifiés trouvés`
      );

      if (unverifiedFactors.length === 0) {
        console.log('✨ Aucun nettoyage nécessaire');
        return result;
      }

      // Supprimer chaque facteur non vérifié
      for (const factor of unverifiedFactors) {
        try {
          console.log(
            `🗑️ Suppression du facteur: ${factor.id} (${factor.factor_type})`
          );

          const { error: unenrollError } = await supabase.auth.mfa.unenroll({
            factorId: factor.id,
          });

          if (unenrollError) {
            result.errors.push(
              `Erreur suppression ${factor.id}: ${unenrollError.message}`
            );
            console.warn(`⚠️ Erreur suppression ${factor.id}:`, unenrollError);
          } else {
            result.cleaned++;
            console.log(`✅ Facteur ${factor.id} supprimé avec succès`);
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : 'Erreur inconnue';
          result.errors.push(`Exception suppression ${factor.id}: ${errorMsg}`);
          console.error(`❌ Exception suppression ${factor.id}:`, error);
        }

        // Petite pause entre les suppressions
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(
        `🎉 Nettoyage terminé: ${result.cleaned} facteurs supprimés, ${result.errors.length} erreurs`
      );

      return result;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Erreur inconnue';
      result.errors.push(`Erreur générale: ${errorMsg}`);
      console.error('❌ Erreur générale lors du nettoyage:', error);
      return result;
    }
  }

  /**
   * Vérifie si l'utilisateur a des facteurs MFA actifs
   */
  static async hasActiveMFA(): Promise<boolean> {
    try {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();

      if (!factorsData) return false;

      const hasVerifiedFactors =
        factorsData.totp?.some(f => f.status === 'verified') ||
        factorsData.phone?.some(f => f.status === 'verified');

      return hasVerifiedFactors;
    } catch (error) {
      console.error('Erreur vérification MFA actif:', error);
      return false;
    }
  }

  /**
   * Compte le nombre de facteurs par statut
   */
  static async getFactorsCount(): Promise<{
    verified: number;
    unverified: number;
    total: number;
  }> {
    try {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();

      if (!factorsData) {
        return { verified: 0, unverified: 0, total: 0 };
      }

      const allFactors = [
        ...(factorsData.totp || []),
        ...(factorsData.phone || []),
      ];

      const verified = allFactors.filter(f => f.status === 'verified').length;
      const unverified = allFactors.filter(
        f => f.status === 'unverified'
      ).length;

      return {
        verified,
        unverified,
        total: allFactors.length,
      };
    } catch (error) {
      console.error('Erreur comptage facteurs:', error);
      return { verified: 0, unverified: 0, total: 0 };
    }
  }
}
