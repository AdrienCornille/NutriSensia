/**
 * React Query hooks pour le suivi de l'activité physique (Module 2.5 - BIO-007)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ActivityLogAPI,
  ActivityLogsResponse,
  WeeklyActivityStatsAPI,
} from '@/lib/activity-transformers';
import type {
  CreateActivityLogData,
  UpdateActivityLogData,
} from '@/lib/api-schemas';

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook pour récupérer les activités avec filtres optionnels
 */
export function useActivityLogs(startDate?: string, endDate?: string) {
  return useQuery<ActivityLogsResponse, Error>({
    queryKey: ['activity', 'logs', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(
        `/api/protected/biometrics/activity?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération des activités'
        );
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook pour récupérer toutes les activités (30 derniers jours par défaut)
 */
export function useAllActivityLogs() {
  return useActivityLogs();
}

/**
 * Hook pour récupérer les activités de la semaine en cours
 */
export function useWeekActivityLogs() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Lundi
  const startDate = weekStart.toISOString().split('T')[0];
  const endDate = now.toISOString().split('T')[0];

  return useActivityLogs(startDate, endDate);
}

/**
 * Hook pour récupérer les statistiques hebdomadaires
 */
export function useWeeklyActivityStats() {
  return useQuery<WeeklyActivityStatsAPI, Error>({
    queryKey: ['activity', 'weekly-stats'],
    queryFn: async () => {
      const response = await fetch(
        '/api/protected/biometrics/activity/weekly-stats',
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération des statistiques'
        );
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
 * Hook pour ajouter une activité
 */
export function useAddActivityLog() {
  const queryClient = useQueryClient();

  return useMutation<ActivityLogAPI, Error, CreateActivityLogData>({
    mutationFn: async data => {
      const response = await fetch('/api/protected/biometrics/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'ajout de l'activité");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les logs et les stats pour refetch
      queryClient.invalidateQueries({ queryKey: ['activity', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['activity', 'weekly-stats'] });
    },
  });
}

/**
 * Hook pour mettre à jour une activité
 */
export function useUpdateActivityLog() {
  const queryClient = useQueryClient();

  return useMutation<
    ActivityLogAPI,
    Error,
    { id: string; data: UpdateActivityLogData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/protected/biometrics/activity/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la mise à jour de l'activité"
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['activity', 'weekly-stats'] });
    },
  });
}

/**
 * Hook pour supprimer une activité
 */
export function useDeleteActivityLog() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/protected/biometrics/activity/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la suppression de l'activité"
        );
      }

      // 204 No Content - pas de body
      if (response.status === 204) return;

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['activity', 'weekly-stats'] });
    },
  });
}
