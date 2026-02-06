/**
 * React Query Hooks for Nutritionist Availability Management
 * Module: Gestion des disponibilités nutritionniste
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateAvailabilityData,
  UpdateAvailabilityData,
} from '@/lib/api-schemas';

// ============================================================================
// TYPES
// ============================================================================

export type AvailabilityType = 'recurring' | 'exception' | 'blocked';

export interface AvailabilityItem {
  id: string;
  nutritionist_id: string;
  availability_type: AvailabilityType;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  specific_date: string | null;
  consultation_type_id: string | null;
  visio_available: boolean;
  cabinet_available: boolean;
  max_appointments: number;
  valid_from: string | null;
  valid_until: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityResponse {
  availabilities: AvailabilityItem[];
  grouped: {
    recurring: AvailabilityItem[];
    exceptions: AvailabilityItem[];
    blocked: AvailabilityItem[];
  };
  total: number;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const availabilityKeys = {
  all: ['nutritionist-availability'] as const,
  list: (type?: AvailabilityType, includeInactive?: boolean) =>
    [...availabilityKeys.all, 'list', type, includeInactive] as const,
  detail: (id: string) => [...availabilityKeys.all, 'detail', id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch all nutritionist availability settings
 */
export function useNutritionistAvailability(options?: {
  type?: AvailabilityType;
  includeInactive?: boolean;
}) {
  const { type, includeInactive } = options || {};

  return useQuery<AvailabilityResponse, Error>({
    queryKey: availabilityKeys.list(type, includeInactive),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (includeInactive) params.append('include_inactive', 'true');

      const response = await fetch(
        `/api/protected/nutritionist/availability?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération des disponibilités'
        );
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single availability item
 */
export function useAvailabilityDetail(id: string) {
  return useQuery<{ availability: AvailabilityItem }, Error>({
    queryKey: availabilityKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(
        `/api/protected/nutritionist/availability/${id}`,
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
 * Hook to create a new availability setting
 */
export function useCreateAvailability() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; availability: AvailabilityItem },
    Error,
    CreateAvailabilityData
  >({
    mutationFn: async data => {
      const response = await fetch('/api/protected/nutritionist/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la création de la disponibilité'
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}

/**
 * Hook to update an existing availability setting
 */
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; availability: AvailabilityItem },
    Error,
    { id: string; data: UpdateAvailabilityData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(
        `/api/protected/nutritionist/availability/${id}`,
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
          error.error || 'Erreur lors de la mise à jour de la disponibilité'
        );
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Hook to delete an availability setting
 */
export function useDeleteAvailability() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async id => {
      const response = await fetch(
        `/api/protected/nutritionist/availability/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la suppression de la disponibilité'
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get French day name from day number (0 = Dimanche)
 */
export function getDayName(dayOfWeek: number): string {
  const days = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ];
  return days[dayOfWeek] || '';
}

/**
 * Get short French day name from day number
 */
export function getShortDayName(dayOfWeek: number): string {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return days[dayOfWeek] || '';
}

/**
 * Format time for display (remove seconds if present)
 */
export function formatTime(time: string): string {
  return time.substring(0, 5);
}

/**
 * Get availability type label in French
 */
export function getAvailabilityTypeLabel(type: AvailabilityType): string {
  const labels: Record<AvailabilityType, string> = {
    recurring: 'Récurrente',
    exception: 'Exception',
    blocked: 'Bloqué',
  };
  return labels[type];
}
