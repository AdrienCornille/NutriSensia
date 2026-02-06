/**
 * React Query Hooks for Nutritionist Consultation Types Management
 * Module: Gestion des types de consultation par nutritionniste
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateConsultationTypeData,
  UpdateConsultationTypeData,
} from '@/lib/api-schemas';

// ============================================================================
// TYPES
// ============================================================================

export interface NutritionistConsultationType {
  id: string;
  nutritionist_id: string;
  code: string;
  name_fr: string;
  name_en: string | null;
  description_fr: string | null;
  description_en: string | null;
  default_duration: number;
  default_price: number;
  visio_available: boolean;
  cabinet_available: boolean;
  phone_available: boolean;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsultationTypesResponse {
  consultationTypes: NutritionistConsultationType[];
  total: number;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const consultationTypeKeys = {
  all: ['nutritionist-consultation-types'] as const,
  list: () => [...consultationTypeKeys.all, 'list'] as const,
  detail: (id: string) => [...consultationTypeKeys.all, 'detail', id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch all consultation types for the connected nutritionist
 */
export function useNutritionistConsultationTypes() {
  return useQuery<ConsultationTypesResponse, Error>({
    queryKey: consultationTypeKeys.list(),
    queryFn: async () => {
      const response = await fetch(
        '/api/protected/nutritionist/consultation-types',
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error ||
            'Erreur lors de la récupération des types de consultation'
        );
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single consultation type
 */
export function useConsultationTypeDetail(id: string) {
  return useQuery<{ consultationType: NutritionistConsultationType }, Error>({
    queryKey: consultationTypeKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(
        `/api/protected/nutritionist/consultation-types/${id}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération');
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to create a new consultation type
 */
export function useCreateConsultationType() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; consultationType: NutritionistConsultationType },
    Error,
    CreateConsultationTypeData
  >({
    mutationFn: async data => {
      const response = await fetch(
        '/api/protected/nutritionist/consultation-types',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la création du type de consultation'
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationTypeKeys.all });
    },
  });
}

/**
 * Hook to update a consultation type
 */
export function useUpdateConsultationType() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; consultationType: NutritionistConsultationType },
    Error,
    { id: string; data: UpdateConsultationTypeData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(
        `/api/protected/nutritionist/consultation-types/${id}`,
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
          error.error || 'Erreur lors de la mise à jour du type de consultation'
        );
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: consultationTypeKeys.all });
      queryClient.invalidateQueries({
        queryKey: consultationTypeKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Hook to delete a consultation type
 */
export function useDeleteConsultationType() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; softDeleted?: boolean }, Error, string>(
    {
      mutationFn: async id => {
        const response = await fetch(
          `/api/protected/nutritionist/consultation-types/${id}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.error ||
              'Erreur lors de la suppression du type de consultation'
          );
        }

        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: consultationTypeKeys.all });
      },
    }
  );
}

/**
 * Hook to reorder consultation types
 */
export function useReorderConsultationTypes() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; updatedCount: number },
    Error,
    string[]
  >({
    mutationFn: async (orderedIds: string[]) => {
      const response = await fetch(
        '/api/protected/nutritionist/consultation-types/reorder',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ orderedIds }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la mise à jour de l\'ordre'
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationTypeKeys.all });
    },
  });
}
