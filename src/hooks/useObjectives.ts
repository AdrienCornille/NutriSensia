/**
 * React Query hooks pour le module Objectifs hebdomadaires
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

// ============================================================================
// TYPES
// ============================================================================

export interface ObjectiveDefinedBy {
  name: string;
  initials: string;
  role: 'nutritionist' | 'system' | 'user';
}

export interface WeeklyObjectiveItem {
  id: string;
  category: 'nutrition' | 'hydration' | 'activity' | 'recipes' | 'tracking' | 'custom';
  label: string;
  description?: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: string | null;
  definedBy: ObjectiveDefinedBy;
}

export interface WeeklyObjectivesResponse {
  id: string | null;
  week_start: string;
  week_end: string;
  objectives: WeeklyObjectiveItem[];
  total_objectives: number;
  completed_objectives: number;
  overall_progress: number;
  points_earned: number;
  time_remaining: {
    days: number;
    label: string;
  };
}

export interface ObjectivesHistoryWeek {
  id: string;
  week_start: string;
  week_end: string;
  total_objectives: number;
  completed_objectives: number;
  progress_percent: number;
  points_earned: number;
}

export interface ObjectivesHistoryResponse {
  weeks: ObjectivesHistoryWeek[];
}

export interface CreateObjectiveInput {
  id?: string;
  category: string;
  label: string;
  description?: string;
  target: number;
  unit: string;
  definedBy: ObjectiveDefinedBy;
}

export interface CreateWeeklyObjectivesInput {
  week_start: string;
  objectives: CreateObjectiveInput[];
}

export interface UpdateObjectiveInput {
  objective_id: string;
  current?: number;
  isCompleted?: boolean;
  completedAt?: string | null;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook pour récupérer les objectifs de la semaine courante
 * Inclut le calcul dynamique de la progression
 */
export function useWeeklyObjectives(
  weekStart?: string
): UseQueryResult<WeeklyObjectivesResponse, Error> {
  return useQuery<WeeklyObjectivesResponse, Error>({
    queryKey: ['objectives', 'weekly', weekStart],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (weekStart) params.append('week', weekStart);

      const response = await fetch(
        `/api/protected/objectives?${params.toString()}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des objectifs');
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook pour récupérer l'historique des objectifs
 */
export function useObjectivesHistory(
  limit = 12
): UseQueryResult<ObjectivesHistoryResponse, Error> {
  return useQuery<ObjectivesHistoryResponse, Error>({
    queryKey: ['objectives', 'history', limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/protected/objectives/history?limit=${limit}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la récupération de l'historique");
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
 * Hook pour créer des objectifs hebdomadaires
 */
export function useCreateWeeklyObjectives() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWeeklyObjectivesInput) => {
      const response = await fetch('/api/protected/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création des objectifs');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
}

/**
 * Hook pour mettre à jour un objectif individuel
 */
export function useUpdateObjective(weeklyObjectiveId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateObjectiveInput) => {
      const response = await fetch(
        `/api/protected/objectives/${weeklyObjectiveId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la mise à jour de l'objectif");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
}
