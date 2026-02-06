/**
 * React Query Hooks for Appointments
 * Module 3.1 - Agenda (Rendez-vous)
 *
 * Provides hooks for:
 * - Listing appointments (upcoming/past/all)
 * - Getting next appointment (Dashboard DASH-005)
 * - Getting available slots for booking
 * - Creating, updating, and cancelling appointments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateAppointmentData,
  UpdateAppointmentData,
} from '@/lib/api-schemas';
import type { AppointmentAPI } from '@/lib/appointments-transformers';
import type { ConsultationTypeDB } from '@/types/agenda';

// ============================================================================
// TYPES
// ============================================================================

export type AppointmentFilter = 'upcoming' | 'past' | 'cancelled' | 'all';

// Re-export AppointmentAPI for convenience
export type { AppointmentAPI } from '@/lib/appointments-transformers';

export interface AppointmentsResponse {
  appointments: AppointmentAPI[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface NextAppointmentResponse {
  appointment: AppointmentAPI | null;
  countdown_days: number | null;
}

export interface JoinAppointmentResponse {
  can_join: boolean;
  video_link?: string;
  room_id?: string;
  message: string;
  scheduled_at?: string;
  scheduled_end_at?: string;
  window_opens_at?: string;
  window_closed_at?: string;
  mode?: string;
  status?: string;
  nutritionist?: {
    id: string;
    title: string;
    cabinet_name: string;
  };
}

export interface TimeSlot {
  time: string;
  available: boolean;
  visio_available: boolean;
  cabinet_available: boolean;
}

export interface DaySlots {
  date: string;
  dayNumber: number;
  dayName: string;
  monthName: string;
  isAvailable: boolean;
  slots: TimeSlot[];
  slotsCount: number;
}

export interface AvailableSlotsResponse {
  days: DaySlots[];
  total_days: number;
  days_with_availability: number;
  consultation_duration: number;
}

export interface SingleDaySlotsResponse {
  date: string;
  slots: TimeSlot[];
  total_available: number;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filter: AppointmentFilter, page?: number) =>
    [...appointmentKeys.lists(), filter, page] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  next: () => [...appointmentKeys.all, 'next'] as const,
  join: (id: string) => [...appointmentKeys.all, 'join', id] as const,
  slots: () => [...appointmentKeys.all, 'slots'] as const,
  slotsFor: (
    nutritionistId: string,
    consultationTypeId?: string,
    startDate?: string,
    endDate?: string
  ) =>
    [
      ...appointmentKeys.slots(),
      nutritionistId,
      consultationTypeId,
      startDate,
      endDate,
    ] as const,
  consultationTypes: () =>
    [...appointmentKeys.all, 'consultation-types'] as const,
};

// ============================================================================
// CONSULTATION TYPES
// ============================================================================

// Re-export ConsultationTypeDB for backward compatibility
export type { ConsultationTypeDB as ConsultationType } from '@/types/agenda';

/**
 * Hook to fetch available consultation types
 */
export function useConsultationTypes() {
  return useQuery<ConsultationTypeDB[], Error>({
    queryKey: appointmentKeys.consultationTypes(),
    queryFn: async () => {
      const response = await fetch(
        '/api/protected/appointments/consultation-types',
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
    staleTime: 10 * 60 * 1000, // 10 minutes (données rarement modifiées)
  });
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch appointments list with optional filter
 */
export function useAppointments(
  filter: AppointmentFilter = 'upcoming',
  page: number = 1,
  limit: number = 50
) {
  return useQuery<AppointmentsResponse, Error>({
    queryKey: appointmentKeys.list(filter, page),
    queryFn: async () => {
      // L'API attend 'offset', pas 'page'
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        filter,
        offset: offset.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `/api/protected/appointments?${params.toString()}`,
        {
          credentials: 'include',
        }
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
 * Hook to fetch upcoming appointments only
 */
export function useUpcomingAppointments(page: number = 1, limit: number = 10) {
  return useAppointments('upcoming', page, limit);
}

/**
 * Hook to fetch past appointments only
 */
export function usePastAppointments(page: number = 1, limit: number = 10) {
  return useAppointments('past', page, limit);
}

/**
 * Hook to fetch cancelled appointments only
 */
export function useCancelledAppointments(page: number = 1, limit: number = 10) {
  return useAppointments('cancelled', page, limit);
}

/**
 * Hook to fetch a single appointment by ID
 */
export function useAppointment(id: string) {
  return useQuery<AppointmentAPI, Error>({
    queryKey: appointmentKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/protected/appointments/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération du rendez-vous'
        );
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch the next upcoming appointment (Dashboard DASH-005)
 */
export function useNextAppointment() {
  return useQuery<NextAppointmentResponse, Error>({
    queryKey: appointmentKeys.next(),
    queryFn: async () => {
      const response = await fetch('/api/protected/appointments/next', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error ||
            'Erreur lors de la récupération du prochain rendez-vous'
        );
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for dashboard
  });
}

/**
 * Hook to join a video consultation (AGENDA-009)
 * Checks if the user can join and returns the video link
 */
export function useJoinAppointment(
  id: string,
  options?: { enabled?: boolean }
) {
  return useQuery<JoinAppointmentResponse, Error>({
    queryKey: appointmentKeys.join(id),
    queryFn: async () => {
      const response = await fetch(`/api/protected/appointments/${id}/join`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la vérification de la visio'
        );
      }

      return response.json();
    },
    enabled: !!id && options?.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds - recheck frequently near appointment time
    refetchInterval: query => {
      // Auto-refresh every 30s if can_join is false (waiting for window to open)
      const data = query.state.data;
      if (data && !data.can_join && data.window_opens_at) {
        const windowOpens = new Date(data.window_opens_at).getTime();
        const now = Date.now();
        // If window opens in less than 5 minutes, refresh every 30s
        if (windowOpens - now < 5 * 60 * 1000) {
          return 30 * 1000;
        }
      }
      return false; // Don't auto-refresh otherwise
    },
  });
}

/**
 * Hook to fetch available slots for booking
 */
export function useAvailableSlots(
  nutritionistId?: string,
  options?: {
    consultationTypeId?: string;
    startDate?: string;
    endDate?: string;
    specificDate?: string;
    enabled?: boolean;
  }
) {
  const { consultationTypeId, startDate, endDate, specificDate, enabled } =
    options || {};

  return useQuery<AvailableSlotsResponse | SingleDaySlotsResponse, Error>({
    queryKey: appointmentKeys.slotsFor(
      nutritionistId || 'auto',
      consultationTypeId,
      specificDate || startDate,
      endDate
    ),
    queryFn: async () => {
      const params = new URLSearchParams();

      // nutritionistId is optional - API will fetch from patient profile if not provided
      if (nutritionistId) {
        params.append('nutritionist_id', nutritionistId);
      }

      if (consultationTypeId) {
        params.append('consultation_type_id', consultationTypeId);
      }
      if (specificDate) {
        params.append('date', specificDate);
      } else {
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
      }

      const response = await fetch(
        `/api/protected/appointments/available-slots?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error ||
            'Erreur lors de la récupération des créneaux disponibles'
        );
      }

      return response.json();
    },
    enabled: enabled !== false, // default true, can be disabled explicitly
    staleTime: 1 * 60 * 1000, // 1 minute - slots can change quickly
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to create a new appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation<AppointmentAPI, Error, CreateAppointmentData>({
    mutationFn: async data => {
      const response = await fetch('/api/protected/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la création du rendez-vous'
        );
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all appointment lists and next appointment
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.next() });
      // Invalidate slots as they may have changed
      queryClient.invalidateQueries({ queryKey: appointmentKeys.slots() });
    },
  });
}

/**
 * Hook to update an existing appointment
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation<
    AppointmentAPI,
    Error,
    { id: string; data: UpdateAppointmentData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/protected/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la modification du rendez-vous'
        );
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate specific appointment
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables.id),
      });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      // Invalidate next appointment if it might have changed
      queryClient.invalidateQueries({ queryKey: appointmentKeys.next() });
      // Invalidate slots
      queryClient.invalidateQueries({ queryKey: appointmentKeys.slots() });
    },
  });
}

/**
 * Hook to cancel an appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string; cancellation_policy: string | null },
    Error,
    { id: string; reason?: string }
  >({
    mutationFn: async ({ id, reason }) => {
      const response = await fetch(`/api/protected/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: reason ? JSON.stringify({ reason }) : undefined,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de l'annulation du rendez-vous"
        );
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate specific appointment
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables.id),
      });
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      // Invalidate next appointment
      queryClient.invalidateQueries({ queryKey: appointmentKeys.next() });
      // Invalidate slots - the cancelled slot is now available
      queryClient.invalidateQueries({ queryKey: appointmentKeys.slots() });
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to check if a specific slot is available
 * Useful for real-time validation in booking form
 */
export function useCheckSlotAvailability(
  nutritionistId: string,
  date: string,
  time: string,
  consultationTypeId?: string
) {
  const { data: slotsData, isLoading } = useAvailableSlots(nutritionistId, {
    specificDate: date,
    consultationTypeId,
  });

  const isAvailable =
    slotsData && 'slots' in slotsData
      ? (slotsData.slots.find(slot => slot.time === time)?.available ?? false)
      : false;

  return {
    isAvailable,
    isLoading,
  };
}
