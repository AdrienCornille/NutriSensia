import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

/**
 * Types de rôles utilisateur
 */
export type UserRole = 'patient' | 'nutritionist' | 'admin' | null;

/**
 * Statuts d'inscription nutritionniste
 */
export type NutritionistStatus =
  | 'pending'
  | 'active'
  | 'rejected'
  | 'info_required'
  | 'suspended'
  | null;

/**
 * Interface pour les données de rôle utilisateur
 */
export interface UserRoleData {
  role: UserRole;
  nutritionistStatus: NutritionistStatus;
  nutritionistId: string | null;
  rejectionReason: string | null;
  infoRequestMessage: string | null;
}

/**
 * État du hook useUserRole
 */
interface UseUserRoleState {
  data: UserRoleData;
  isLoading: boolean;
  error: string | null;
}

/**
 * Retour du hook useUserRole
 */
export interface UseUserRoleReturn {
  // Données
  role: UserRole;
  nutritionistStatus: NutritionistStatus;
  nutritionistId: string | null;
  rejectionReason: string | null;
  infoRequestMessage: string | null;

  // Helpers booléens
  isPatient: boolean;
  isNutritionist: boolean;
  isActiveNutritionist: boolean;
  isPendingNutritionist: boolean;
  isRejectedNutritionist: boolean;
  isInfoRequiredNutritionist: boolean;
  isAdmin: boolean;

  // État
  isLoading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer et gérer le rôle de l'utilisateur connecté
 *
 * @example
 * ```tsx
 * const { role, isPatient, isNutritionist, isAdmin, isLoading } = useUserRole();
 *
 * if (isLoading) return <Spinner />;
 *
 * if (isPatient) {
 *   return <PatientDashboard />;
 * } else if (isActiveNutritionist) {
 *   return <NutritionistDashboard />;
 * } else if (isPendingNutritionist) {
 *   return <PendingValidation />;
 * }
 * ```
 */
export function useUserRole(): UseUserRoleReturn {
  const { setRole, setNutritionistStatus } = useAppStore();

  const [state, setState] = useState<UseUserRoleState>({
    data: {
      role: null,
      nutritionistStatus: null,
      nutritionistId: null,
      rejectionReason: null,
      infoRequestMessage: null,
    },
    isLoading: true,
    error: null,
  });

  /**
   * Charge les données de rôle de l'utilisateur
   */
  const fetchRole = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Récupérer l'utilisateur actuel
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(`Erreur d'authentification: ${authError.message}`);
      }

      if (!user) {
        // Pas d'utilisateur connecté
        setState({
          data: {
            role: null,
            nutritionistStatus: null,
            nutritionistId: null,
            rejectionReason: null,
            infoRequestMessage: null,
          },
          isLoading: false,
          error: null,
        });
        setRole(null);
        setNutritionistStatus(null);
        return;
      }

      // Récupérer le profil avec le rôle
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error(`Erreur de profil: ${profileError.message}`);
      }

      const role = (profile?.role as UserRole) || 'patient';
      let nutritionistStatus: NutritionistStatus = null;
      let nutritionistId: string | null = null;
      let rejectionReason: string | null = null;
      let infoRequestMessage: string | null = null;

      // Si c'est un nutritionniste, récupérer le statut d'inscription
      if (role === 'nutritionist') {
        const { data: nutritionistProfile, error: nutritionistError } =
          await supabase
            .from('nutritionist_profiles')
            .select('id, status, rejection_reason, info_request_message')
            .eq('user_id', user.id)
            .single();

        if (nutritionistError && nutritionistError.code !== 'PGRST116') {
          console.warn(
            'Erreur lors de la récupération du profil nutritionniste:',
            nutritionistError
          );
        }

        if (nutritionistProfile) {
          nutritionistStatus =
            (nutritionistProfile.status as NutritionistStatus) || 'pending';
          nutritionistId = nutritionistProfile.id;
          rejectionReason = nutritionistProfile.rejection_reason;
          infoRequestMessage = nutritionistProfile.info_request_message;
        }
      }

      // Mettre à jour le state local
      setState({
        data: {
          role,
          nutritionistStatus,
          nutritionistId,
          rejectionReason,
          infoRequestMessage,
        },
        isLoading: false,
        error: null,
      });

      // Mettre à jour le store global
      setRole(role);
      setNutritionistStatus(nutritionistStatus);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [setRole, setNutritionistStatus]);

  // Charger les données au montage
  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  // Écouter les changements d'authentification
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchRole();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  // Calculer les helpers
  const {
    role,
    nutritionistStatus,
    nutritionistId,
    rejectionReason,
    infoRequestMessage,
  } = state.data;

  const isPatient = role === 'patient';
  const isNutritionist = role === 'nutritionist';
  const isActiveNutritionist =
    isNutritionist && nutritionistStatus === 'active';
  const isPendingNutritionist =
    isNutritionist && nutritionistStatus === 'pending';
  const isRejectedNutritionist =
    isNutritionist && nutritionistStatus === 'rejected';
  const isInfoRequiredNutritionist =
    isNutritionist && nutritionistStatus === 'info_required';
  const isAdmin = role === 'admin';

  return {
    // Données
    role,
    nutritionistStatus,
    nutritionistId,
    rejectionReason,
    infoRequestMessage,

    // Helpers booléens
    isPatient,
    isNutritionist,
    isActiveNutritionist,
    isPendingNutritionist,
    isRejectedNutritionist,
    isInfoRequiredNutritionist,
    isAdmin,

    // État
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    refetch: fetchRole,
  };
}

export default useUserRole;
