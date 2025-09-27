/**
 * Hook personnalisé pour gérer la complétude du profil
 * 
 * Ce hook utilise TanStack Query pour optimiser les performances
 * et fournit une interface simple pour accéder aux données de complétude
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { 
  calculateProfileCompletion, 
  getRequiredFieldsForLevel,
  estimateCompletionTime,
  type ProfileCompletion,
  type UserRole,
  type ProfileData
} from '@/lib/profile-completion';

/**
 * Options pour le hook useProfileCompletion
 */
interface UseProfileCompletionOptions {
  /** Données du profil à analyser */
  profileData?: Partial<ProfileData>;
  /** Rôle de l'utilisateur */
  role: UserRole;
  /** Activer le cache automatique */
  enableCache?: boolean;
  /** Intervalle de rafraîchissement en ms */
  refetchInterval?: number;
}

/**
 * Résultat du hook useProfileCompletion
 */
interface UseProfileCompletionResult {
  /** Données de complétude calculées */
  completion: ProfileCompletion | null;
  /** État de chargement */
  isLoading: boolean;
  /** Erreur éventuelle */
  error: Error | null;
  /** Fonction pour recalculer manuellement */
  refetch: () => void;
  /** Fonction pour invalider le cache */
  invalidate: () => void;
  /** Champs requis pour un niveau donné */
  getFieldsForLevel: (level: 'basic' | 'good' | 'excellent') => any[];
  /** Temps estimé pour compléter */
  estimatedTime: number;
  /** Progression par rapport au niveau précédent */
  progressToNextLevel: {
    current: number;
    target: number;
    remaining: number;
    percentage: number;
  };
}

/**
 * Clé de cache pour les données de complétude
 */
const getCompletionCacheKey = (profileData: any, role: UserRole) => [
  'profile-completion', 
  role, 
  JSON.stringify(profileData)
];

/**
 * Hook pour gérer la complétude du profil
 */
export const useProfileCompletion = ({
  profileData = {},
  role,
  enableCache = true,
  refetchInterval
}: UseProfileCompletionOptions): UseProfileCompletionResult => {
  const queryClient = useQueryClient();

  // Calculer la complétude avec TanStack Query
  const {
    data: completion,
    isLoading,
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey: getCompletionCacheKey(profileData, role),
    queryFn: () => calculateProfileCompletion(profileData, role),
    enabled: enableCache && Object.keys(profileData).length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval,
    refetchOnWindowFocus: false,
  });

  // Calculer sans cache si désactivé
  const directCompletion = useMemo(() => {
    if (enableCache || Object.keys(profileData).length === 0) return null;
    return calculateProfileCompletion(profileData, role);
  }, [profileData, role, enableCache]);

  const finalCompletion = enableCache ? completion : directCompletion;

  // Temps estimé pour compléter
  const estimatedTime = useMemo(() => {
    if (!finalCompletion) return 0;
    return estimateCompletionTime(finalCompletion.missingFields);
  }, [finalCompletion]);

  // Progression vers le niveau suivant
  const progressToNextLevel = useMemo(() => {
    if (!finalCompletion) {
      return { current: 0, target: 40, remaining: 40, percentage: 0 };
    }

    const { percentage, level } = finalCompletion;
    let target: number;

    switch (level) {
      case 'incomplete':
        target = 40;
        break;
      case 'basic':
        target = 70;
        break;
      case 'good':
        target = 90;
        break;
      case 'excellent':
        target = 100;
        break;
      default:
        target = 100;
    }

    const remaining = Math.max(0, target - percentage);
    const progressPercentage = target > 0 ? Math.round((percentage / target) * 100) : 100;

    return {
      current: percentage,
      target,
      remaining,
      percentage: Math.min(progressPercentage, 100)
    };
  }, [finalCompletion]);

  // Fonction pour obtenir les champs requis pour un niveau
  const getFieldsForLevel = (level: 'basic' | 'good' | 'excellent') => {
    return getRequiredFieldsForLevel(role, level);
  };

  // Fonction pour invalider le cache
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['profile-completion', role]
    });
  };

  // Fonction pour rafraîchir
  const refetch = () => {
    if (enableCache) {
      queryRefetch();
    } else {
      // Forcer un nouveau calcul en invalidant le cache memoized
      // Ceci va déclencher un nouveau rendu avec les nouvelles données
    }
  };

  return {
    completion: finalCompletion,
    isLoading: enableCache ? isLoading : false,
    error: enableCache ? error : null,
    refetch,
    invalidate,
    getFieldsForLevel,
    estimatedTime,
    progressToNextLevel
  };
};

/**
 * Hook simplifié pour obtenir seulement le pourcentage de complétude
 */
export const useProfileCompletionPercentage = (
  profileData: Partial<ProfileData>,
  role: UserRole
): number => {
  const { completion } = useProfileCompletion({ profileData, role });
  return completion?.percentage ?? 0;
};

/**
 * Hook pour obtenir les champs manquants critiques
 */
export const useCriticalMissingFields = (
  profileData: Partial<ProfileData>,
  role: UserRole
) => {
  const { completion } = useProfileCompletion({ profileData, role });
  return completion?.missingFields.critical ?? [];
};

/**
 * Hook pour vérifier si le profil est à un niveau minimum
 */
export const useProfileLevelCheck = (
  profileData: Partial<ProfileData>,
  role: UserRole,
  minimumLevel: 'incomplete' | 'basic' | 'good' | 'excellent' = 'basic'
): boolean => {
  const { completion } = useProfileCompletion({ profileData, role });
  
  if (!completion) return false;
  
  const levelHierarchy = {
    'incomplete': 0,
    'basic': 1,
    'good': 2,
    'excellent': 3
  };
  
  return levelHierarchy[completion.level] >= levelHierarchy[minimumLevel];
};

