import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface MFAAssuranceLevel {
  currentLevel: 'aal1' | 'aal2';
  nextLevel: 'aal1' | 'aal2';
}

interface MFAFactor {
  id: string;
  type: 'totp' | 'phone';
  status: 'verified' | 'unverified';
  friendly_name?: string;
  created_at: string;
}

interface MFAManagement {
  factors: MFAFactor[];
  isLoading: boolean;
  error: string | null;
  assuranceLevel: MFAAssuranceLevel | null;
  needsMFA: boolean;
  isMFAVerified: boolean;
}

/**
 * Hook personnalisé pour gérer l'authentification à deux facteurs (2FA)
 * Fournit des fonctions pour gérer les facteurs MFA et vérifier les niveaux d'assurance
 */
export function useMFA() {
  // États pour gérer les données MFA
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [assuranceLevel, setAssuranceLevel] =
    useState<MFAAssuranceLevel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge les facteurs MFA de l'utilisateur
   */
  const loadFactors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        throw error;
      }

      // Combiner les facteurs TOTP et téléphone
      const allFactors: MFAFactor[] = [
        ...(data.totp || []).map(factor => ({
          ...factor,
          type: 'totp' as const,
        })),
        ...(data.phone || []).map(factor => ({
          ...factor,
          type: 'phone' as const,
        })),
      ];

      setFactors(allFactors);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des facteurs MFA');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Vérifie le niveau d'assurance d'authentification de l'utilisateur
   */
  const checkAssuranceLevel = useCallback(async () => {
    try {
      const { data, error } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) {
        throw error;
      }

      setAssuranceLevel(data);
    } catch (err: any) {
      console.error(
        "Erreur lors de la vérification du niveau d'assurance:",
        err
      );
      // Ne pas définir d'erreur ici car ce n'est pas critique
    }
  }, []);

  /**
   * Initialise l'enrôlement d'un nouveau facteur TOTP
   */
  const enrollTOTP = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) {
        throw error;
      }

      return {
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      };
    } catch (err: any) {
      throw new Error(err.message || "Erreur lors de l'enrôlement TOTP");
    }
  }, []);

  /**
   * Crée un défi pour la vérification MFA
   */
  const createChallenge = useCallback(async (factorId: string) => {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({ factorId });
      if (error) {
        throw error;
      }

      return data.id;
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création du défi');
    }
  }, []);

  /**
   * Vérifie un code TOTP
   */
  const verifyCode = useCallback(
    async (factorId: string, challengeId: string, code: string) => {
      try {
        const { error } = await supabase.auth.mfa.verify({
          factorId,
          challengeId,
          code: code.trim(),
        });

        if (error) {
          throw error;
        }

        // Rafraîchir les données après vérification réussie
        await Promise.all([loadFactors(), checkAssuranceLevel()]);

        return true;
      } catch (err: any) {
        throw new Error(err.message || 'Code de vérification incorrect');
      }
    },
    [loadFactors, checkAssuranceLevel]
  );

  /**
   * Supprime un facteur MFA
   */
  const removeFactor = useCallback(
    async (factorId: string) => {
      try {
        const { error } = await supabase.auth.mfa.unenroll({ factorId });
        if (error) {
          throw error;
        }

        // Rafraîchir les données après suppression
        await Promise.all([loadFactors(), checkAssuranceLevel()]);

        return true;
      } catch (err: any) {
        throw new Error(
          err.message || 'Erreur lors de la suppression du facteur'
        );
      }
    },
    [loadFactors, checkAssuranceLevel]
  );

  /**
   * Rafraîchit la session pour mettre à jour le niveau d'assurance
   */
  const refreshSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        throw error;
      }

      // Vérifier le nouveau niveau d'assurance
      await checkAssuranceLevel();
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement de session:', err);
    }
  }, [checkAssuranceLevel]);

  // Charger les données au montage du hook
  useEffect(() => {
    const initializeMFA = async () => {
      await Promise.all([loadFactors(), checkAssuranceLevel()]);
    };

    initializeMFA();
  }, [loadFactors, checkAssuranceLevel]);

  // Calculer les propriétés dérivées
  const needsMFA =
    assuranceLevel?.nextLevel === 'aal2' &&
    assuranceLevel?.currentLevel === 'aal1';
  const isMFAVerified = assuranceLevel?.currentLevel === 'aal2';
  const hasVerifiedFactors = factors.some(
    factor => factor.status === 'verified'
  );
  const hasUnverifiedFactors = factors.some(
    factor => factor.status === 'unverified'
  );

  return {
    // Données
    factors,
    assuranceLevel,
    isLoading,
    error,

    // États calculés
    needsMFA,
    isMFAVerified,
    hasVerifiedFactors,
    hasUnverifiedFactors,

    // Fonctions
    loadFactors,
    checkAssuranceLevel,
    enrollTOTP,
    createChallenge,
    verifyCode,
    removeFactor,
    refreshSession,

    // Fonction utilitaire pour réinitialiser l'erreur
    clearError: () => setError(null),
  };
}
