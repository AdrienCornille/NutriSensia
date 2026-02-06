/**
 * React Query hooks pour le suivi des mensurations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MeasurementType } from '@/types/suivi';
import type {
  MeasurementEntryAPI,
  MeasurementsResponse,
} from '@/lib/measurements-transformers';
import type {
  CreateMeasurementEntryData,
  UpdateMeasurementEntryData,
} from '@/lib/api-schemas';

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook pour récupérer les mesures avec filtres optionnels
 */
export function useMeasurements(
  measurementType?: MeasurementType,
  startDate?: string,
  endDate?: string
) {
  return useQuery<MeasurementsResponse, Error>({
    queryKey: ['measurements', measurementType, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (measurementType) params.append('measurement_type', measurementType);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(
        `/api/protected/biometrics/measurements?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération des mesures'
        );
      }

      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook pour récupérer toutes les mesures
 */
export function useAllMeasurements() {
  return useMeasurements();
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook pour ajouter une mesure
 */
export function useAddMeasurement() {
  const queryClient = useQueryClient();

  return useMutation<MeasurementEntryAPI, Error, CreateMeasurementEntryData>({
    mutationFn: async data => {
      const response = await fetch('/api/protected/biometrics/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'ajout de la mesure");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
    },
  });
}

/**
 * Hook pour modifier une mesure
 */
export function useUpdateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation<
    MeasurementEntryAPI,
    Error,
    { id: string; data: UpdateMeasurementEntryData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(
        `/api/protected/biometrics/measurements/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la modification de la mesure'
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
    },
  });
}

/**
 * Hook pour supprimer une mesure
 */
export function useDeleteMeasurement() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `/api/protected/biometrics/measurements/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la suppression de la mesure'
        );
      }

      // 204 No Content - pas de body
      if (response.status === 204) return;

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
    },
  });
}
