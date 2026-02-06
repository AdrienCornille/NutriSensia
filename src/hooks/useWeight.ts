/**
 * Hooks React Query pour le suivi du poids
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  WeightEntryAPI,
  WeightGoalAPI,
  WeightEntriesResponse,
} from '@/lib/weight-transformers';
import type {
  CreateWeightEntryData,
  UpdateWeightGoalData,
} from '@/lib/api-schemas';

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook pour récupérer l'historique des pesées
 */
export function useWeightEntries(options?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return useQuery<WeightEntriesResponse, Error>({
    queryKey: [
      'weight',
      'entries',
      options?.startDate,
      options?.endDate,
      options?.limit,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.startDate) params.append('start_date', options.startDate);
      if (options?.endDate) params.append('end_date', options.endDate);
      if (options?.limit) params.append('limit', options.limit.toString());

      const response = await fetch(
        `/api/protected/biometrics/weight?${params.toString()}`,
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
 * Hook pour récupérer toutes les pesées (sans limite)
 */
export function useAllWeightEntries() {
  return useWeightEntries({ limit: 100 });
}

/**
 * Hook pour récupérer l'objectif de poids
 */
export function useWeightGoal() {
  return useQuery<WeightGoalAPI | null, Error>({
    queryKey: ['weight', 'goal'],
    queryFn: async () => {
      const response = await fetch('/api/protected/biometrics/weight/goal', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'objectif");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook pour ajouter une pesée
 */
export function useAddWeightEntry() {
  const queryClient = useQueryClient();

  return useMutation<WeightEntryAPI, Error, CreateWeightEntryData>({
    mutationFn: async data => {
      const response = await fetch('/api/protected/biometrics/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'ajout de la pesée");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider toutes les queries de poids
      queryClient.invalidateQueries({ queryKey: ['weight', 'entries'] });
    },
  });
}

/**
 * Hook pour mettre à jour une pesée
 */
export function useUpdateWeightEntry() {
  const queryClient = useQueryClient();

  return useMutation<
    WeightEntryAPI,
    Error,
    {
      entryId: string;
      data: {
        weight_kg?: number;
        measured_at?: string;
        notes?: string;
      };
    }
  >({
    mutationFn: async ({ entryId, data }) => {
      const response = await fetch(
        `/api/protected/biometrics/weight/${entryId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la modification');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight', 'entries'] });
    },
  });
}

/**
 * Hook pour supprimer une pesée
 */
export function useDeleteWeightEntry() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (entryId: string) => {
      const response = await fetch(
        `/api/protected/biometrics/weight/${entryId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      // 204 No Content - pas de body
      if (response.status === 204) return;

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight', 'entries'] });
    },
  });
}

/**
 * Hook pour mettre à jour l'objectif de poids
 */
export function useUpdateWeightGoal() {
  const queryClient = useQueryClient();

  return useMutation<WeightGoalAPI, Error, UpdateWeightGoalData>({
    mutationFn: async data => {
      const response = await fetch('/api/protected/biometrics/weight/goal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la mise à jour de l'objectif"
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight', 'goal'] });
      // Aussi invalider les entrées car l'objectif peut affecter les calculs
      queryClient.invalidateQueries({ queryKey: ['weight', 'entries'] });
    },
  });
}
