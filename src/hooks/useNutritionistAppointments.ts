/**
 * React Query Hooks for Nutritionist Appointments
 * Gestion des rendez-vous côté nutritionniste
 *
 * Provides hooks for:
 * - Listing appointments (pending/upcoming/past)
 * - Responding to appointment requests (accept/decline/propose new time)
 * - Patient responding to counter-proposals
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentKeys } from './useAppointments';
import type {
  NutritionistAppointmentResponseData,
  NutritionistUpdateAppointmentData,
  PatientCounterProposalResponseData,
} from '@/lib/api-schemas';

// ============================================================================
// TYPES
// ============================================================================

export type NutritionistAppointmentFilter = 'pending' | 'upcoming' | 'past' | 'cancelled' | 'all';

export interface NutritionistAppointment {
  id: string;
  user_id: string;
  nutritionist_id: string;
  consultation_type_id: string;
  consultation_type_code: string;
  scheduled_at: string;
  scheduled_end_at: string;
  duration: number;
  mode: string;
  status: string;
  status_reason: string | null;
  patient_message: string | null;
  nutritionist_notes_internal: string | null;
  visio_link: string | null;
  price: number;
  currency: string;
  created_at: string;
  updated_at: string;
  consultation_type: {
    id: string;
    code: string;
    name_fr: string;
    name_en: string;
    default_duration: number;
    default_price: number;
    icon: string | null;
    color: string | null;
  } | null;
  patient: {
    first_name: string;
    last_name: string;
  };
}

export interface NutritionistAppointmentsResponse {
  appointments: NutritionistAppointment[];
  total: number;
  pending_count: number;
  upcoming_count: number;
  past_count: number;
  cancelled_count: number;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const nutritionistAppointmentKeys = {
  all: ['nutritionist-appointments'] as const,
  lists: () => [...nutritionistAppointmentKeys.all, 'list'] as const,
  list: (filter: NutritionistAppointmentFilter, page?: number) =>
    [...nutritionistAppointmentKeys.lists(), filter, page] as const,
  pendingCount: () =>
    [...nutritionistAppointmentKeys.all, 'pending-count'] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch nutritionist appointments with filters
 */
export function useNutritionistAppointments(
  filter: NutritionistAppointmentFilter = 'pending',
  page = 1,
  limit = 50
) {
  const offset = (page - 1) * limit;

  return useQuery<NutritionistAppointmentsResponse, Error>({
    queryKey: nutritionistAppointmentKeys.list(filter, page),
    queryFn: async () => {
      const params = new URLSearchParams({
        filter,
        limit: String(limit),
        offset: String(offset),
      });

      const response = await fetch(
        `/api/protected/nutritionist/appointments?${params.toString()}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération des rendez-vous'
        );
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Convenience hook for pending appointments
 */
export function useNutritionistPendingAppointments(page = 1, limit = 50) {
  return useNutritionistAppointments('pending', page, limit);
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook for nutritionist to respond to an appointment request
 * Actions: accept, decline, propose_new_time
 */
export function useRespondToAppointment() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; appointment: NutritionistAppointment },
    Error,
    { id: string; data: NutritionistAppointmentResponseData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(
        `/api/protected/nutritionist/appointments/${id}/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la réponse');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate nutritionist appointment lists
      queryClient.invalidateQueries({
        queryKey: nutritionistAppointmentKeys.all,
      });
      // Also invalidate patient-side caches (status changed)
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
      });
    },
  });
}

/**
 * Hook for nutritionist to update an existing appointment
 * (change date/time, mode, notes)
 */
export function useNutritionistUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation<
    NutritionistAppointment,
    Error,
    { id: string; data: NutritionistUpdateAppointmentData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(
        `/api/protected/nutritionist/appointments/${id}`,
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
          error.error || 'Erreur lors de la modification du rendez-vous'
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionistAppointmentKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
      });
    },
  });
}

/**
 * Hook for nutritionist to cancel an appointment
 */
export function useNutritionistCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    Error,
    { id: string; reason: string }
  >({
    mutationFn: async ({ id, reason }) => {
      const response = await fetch(
        `/api/protected/nutritionist/appointments/${id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de l'annulation du rendez-vous"
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionistAppointmentKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
      });
    },
  });
}

/**
 * Hook for patient to respond to a counter-proposal
 * Actions: accept, decline
 */
export function usePatientRespondToCounterProposal() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; appointment: unknown },
    Error,
    { id: string; data: PatientCounterProposalResponseData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(
        `/api/protected/appointments/${id}/accept`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la réponse');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate patient appointment caches
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
      });
      // Also invalidate nutritionist caches
      queryClient.invalidateQueries({
        queryKey: nutritionistAppointmentKeys.all,
      });
    },
  });
}
