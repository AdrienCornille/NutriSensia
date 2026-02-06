/**
 * React Query hooks pour le suivi du bien-être (Module 2.4)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  WellbeingLogAPI,
  WellbeingLogsResponse,
} from '@/lib/wellbeing-transformers';
import type {
  CreateWellbeingLogData,
  UpdateWellbeingLogData,
} from '@/lib/api-schemas';

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook pour récupérer les logs de bien-être avec filtres optionnels
 */
export function useWellbeingLogs(startDate?: string, endDate?: string) {
  return useQuery<WellbeingLogsResponse, Error>({
    queryKey: ['wellbeing', 'logs', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(
        `/api/protected/wellbeing?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error ||
            'Erreur lors de la récupération des données de bien-être'
        );
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook pour récupérer tous les logs (30 derniers jours par défaut côté API)
 */
export function useAllWellbeingLogs() {
  return useWellbeingLogs();
}

/**
 * Hook pour récupérer le log d'aujourd'hui
 */
export function useTodayWellbeing() {
  const today = new Date().toISOString().split('T')[0];
  return useWellbeingLogs(today, today);
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook pour ajouter un log de bien-être
 */
export function useAddWellbeingLog() {
  const queryClient = useQueryClient();

  return useMutation<WellbeingLogAPI, Error, CreateWellbeingLogData>({
    mutationFn: async data => {
      const response = await fetch('/api/protected/wellbeing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de l'ajout du log de bien-être"
        );
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider tous les logs pour refetch
      queryClient.invalidateQueries({ queryKey: ['wellbeing', 'logs'] });
    },
  });
}

/**
 * Hook pour mettre à jour un log de bien-être
 */
export function useUpdateWellbeingLog() {
  const queryClient = useQueryClient();

  return useMutation<
    WellbeingLogAPI,
    Error,
    { id: string; data: UpdateWellbeingLogData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/protected/wellbeing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la mise à jour du log de bien-être'
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellbeing', 'logs'] });
    },
  });
}

/**
 * Hook pour supprimer un log de bien-être
 */
export function useDeleteWellbeingLog() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/protected/wellbeing/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la suppression du log de bien-être'
        );
      }

      // 204 No Content - pas de body
      if (response.status === 204) return;

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellbeing', 'logs'] });
    },
  });
}
