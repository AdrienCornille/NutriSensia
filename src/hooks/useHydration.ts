/**
 * React Query hooks pour le module Hydratation
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import type {
  HydrationLog,
  HydrationGoal,
  HydrationLogsResponse,
} from '@/lib/hydration-transformers';
import type {
  CreateHydrationLogData,
  UpdateHydrationGoalData,
  UpdateHydrationLogData,
} from '@/lib/api-schemas';

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook pour récupérer les logs d'hydratation pour une plage de dates
 *
 * @param startDate - Date de début (YYYY-MM-DD) (optionnel)
 * @param endDate - Date de fin (YYYY-MM-DD) (optionnel)
 * @returns Query result avec logs et summary
 */
export function useHydrationLogs(
  startDate?: string,
  endDate?: string
): UseQueryResult<HydrationLogsResponse, Error> {
  return useQuery<HydrationLogsResponse, Error>({
    queryKey: ['hydration', 'logs', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(
        `/api/protected/hydration?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération des données'
        );
      }

      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook pour récupérer les logs d'hydratation d'aujourd'hui uniquement
 * Wrapper autour de useHydrationLogs avec date = aujourd'hui
 *
 * @returns Query result avec logs d'aujourd'hui
 */
export function useTodayHydration(): UseQueryResult<
  HydrationLogsResponse,
  Error
> {
  const today = new Date().toISOString().split('T')[0];
  return useHydrationLogs(today, today);
}

/**
 * Hook pour récupérer l'objectif d'hydratation actuel
 *
 * @returns Query result avec l'objectif actuel
 */
export function useHydrationGoal(): UseQueryResult<HydrationGoal, Error> {
  return useQuery<HydrationGoal, Error>({
    queryKey: ['hydration', 'goal'],
    queryFn: async () => {
      const response = await fetch('/api/protected/hydration/goal', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la récupération de l'objectif"
        );
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (rarement modifié)
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook pour créer un nouveau log d'hydratation
 * Invalide automatiquement le cache des logs après succès
 *
 * @returns Mutation avec mutate/mutateAsync
 */
export function useAddWaterLog() {
  const queryClient = useQueryClient();

  return useMutation<HydrationLog, Error, CreateHydrationLogData>({
    mutationFn: async data => {
      const response = await fetch('/api/protected/hydration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'ajout");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider tous les logs et données d'aujourd'hui
      queryClient.invalidateQueries({ queryKey: ['hydration', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['hydration', 'today'] });
    },
  });
}

/**
 * Hook pour mettre à jour l'objectif d'hydratation
 * Invalide automatiquement le cache de l'objectif après succès
 *
 * @returns Mutation avec mutate/mutateAsync
 */
export function useUpdateHydrationGoal() {
  const queryClient = useQueryClient();

  return useMutation<HydrationGoal, Error, UpdateHydrationGoalData>({
    mutationFn: async data => {
      const response = await fetch('/api/protected/hydration/goal', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration', 'goal'] });
    },
  });
}

/**
 * Hook pour modifier un log d'hydratation
 * Invalide automatiquement le cache des logs après succès
 *
 * @returns Mutation avec mutate/mutateAsync
 */
export function useUpdateHydrationLog() {
  const queryClient = useQueryClient();

  return useMutation<
    HydrationLog,
    Error,
    { logId: string; data: UpdateHydrationLogData }
  >({
    mutationFn: async ({ logId, data }) => {
      const response = await fetch(`/api/protected/hydration/${logId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la modification');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider tous les logs et données d'aujourd'hui
      queryClient.invalidateQueries({ queryKey: ['hydration', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['hydration', 'today'] });
    },
  });
}

/**
 * Hook pour supprimer un log d'hydratation
 * Invalide automatiquement le cache des logs après succès
 *
 * @returns Mutation avec mutate/mutateAsync
 */
export function useDeleteHydrationLog() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (logId: string) => {
      const response = await fetch(`/api/protected/hydration/${logId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      // 204 No Content - pas de body
      if (response.status === 204) return;

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['hydration', 'today'] });
    },
  });
}
