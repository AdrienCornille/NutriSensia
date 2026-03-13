/**
 * React Query Hooks for Nutritionist Patient Management
 * Gestion des patients côté nutritionniste
 *
 * Provides hooks for:
 * - Listing patients with search/filter/sort
 * - Fetching patient detail (synthèse)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPES
// ============================================================================

export type PatientStatusFilter = 'all' | 'active' | 'pending' | 'inactive';
export type PatientSort = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc';

export interface PatientListFilters {
  search?: string;
  status: PatientStatusFilter;
  sort: PatientSort;
  page: number;
  limit: number;
}

export interface PatientListItem {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  status: 'pending' | 'active' | 'inactive';
  consultation_reason: string | null;
  health_goals: string[] | null;
  initial_weight: number | null;
  current_weight: number | null;
  initial_bmi: number | null;
  assigned_at: string | null;
  created_at: string;
  appointments_count: number;
  last_appointment_at: string | null;
  next_appointment_at: string | null;
  alerts: {
    unread_messages: number;
    pending_changes: number;
    days_without_meal: number | null;
    pending_modification_requests: number;
    adherence_percent: number | null;
  } | null;
}

export interface PatientListStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
}

export interface PatientListResponse {
  patients: PatientListItem[];
  total: number;
  stats: PatientListStats;
}

export interface PatientDetailKPIs {
  current_weight: number | null;
  target_weight: number | null;
  current_bmi: number | null;
  adherence_percent: number | null;
  meal_streak: number;
}

export interface PatientDetailPatient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  status: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  initial_weight: number | null;
  initial_height: number | null;
  initial_bmi: number | null;
  consultation_reason: string | null;
  health_goals: string[] | null;
  dietary_restrictions: string[] | null;
  allergies: string[] | null;
  medical_conditions: string[] | null;
  medications: string[] | null;
  activity_level: string | null;
  assigned_at: string | null;
  created_at: string;
  notes_internal: string | null;
}

export interface PatientDetailResponse {
  patient: PatientDetailPatient;
  kpis: PatientDetailKPIs;
  weight_history: { weight_kg: number; date: string }[];
  weekly_objectives: Record<string, unknown> | null;
  recent_meals: {
    id: string;
    name: string;
    meal_type: string;
    total_calories: number | null;
    meal_date: string;
    consumed_at: string;
  }[];
  next_appointment: {
    id: string;
    scheduled_at: string;
    mode: string;
    status: string;
    consultation_type: { name_fr: string; default_duration: number } | null;
  } | null;
  last_appointment: {
    id: string;
    scheduled_at: string;
    mode: string;
    status: string;
    consultation_type: { name_fr: string } | null;
  } | null;
  appointments_count: number;
  active_meal_plan: {
    id: string;
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    daily_calories_target: number | null;
  } | null;
  streaks: {
    streak_type: string;
    current_count: number;
    longest_count: number;
  }[];
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export interface PatientNote {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const nutritionistPatientKeys = {
  all: ['nutritionist-patients'] as const,
  lists: () => [...nutritionistPatientKeys.all, 'list'] as const,
  list: (filters: PatientListFilters) =>
    [...nutritionistPatientKeys.lists(), filters] as const,
  details: () => [...nutritionistPatientKeys.all, 'detail'] as const,
  detail: (id: string) => [...nutritionistPatientKeys.details(), id] as const,
  notes: (id: string) => [...nutritionistPatientKeys.detail(id), 'notes'] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch the list of patients for the authenticated nutritionist
 */
export function useNutritionistPatients(filters: PatientListFilters) {
  const offset = (filters.page - 1) * filters.limit;

  return useQuery<PatientListResponse, Error>({
    queryKey: nutritionistPatientKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams({
        status: filters.status,
        sort: filters.sort,
        limit: String(filters.limit),
        offset: String(offset),
      });

      if (filters.search) {
        params.set('search', filters.search);
      }

      const response = await fetch(
        `/api/protected/nutritionist/patients?${params.toString()}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération des patients'
        );
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch detailed data for a single patient
 */
export function useNutritionistPatientDetail(id: string | null) {
  return useQuery<PatientDetailResponse, Error>({
    queryKey: nutritionistPatientKeys.detail(id || ''),
    queryFn: async () => {
      const response = await fetch(
        `/api/protected/nutritionist/patients/${id}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération du patient'
        );
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to update patient internal notes
 */
export function useUpdatePatientNotes(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; notes_internal: string | null },
    Error,
    { notes_internal: string }
  >({
    mutationFn: async ({ notes_internal }) => {
      const response = await fetch(
        `/api/protected/nutritionist/patients/${patientId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ notes_internal }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la sauvegarde');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionistPatientKeys.detail(patientId),
      });
    },
  });
}

/**
 * Hook to update patient status (pending → active, active → inactive, etc.)
 */
export function useUpdatePatientStatus(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { status: string; status_changed_at: string },
    Error,
    { status: 'active' | 'inactive' | 'pending'; status_reason?: string }
  >({
    mutationFn: async (data) => {
      const response = await fetch(
        `/api/protected/nutritionist/patients/${patientId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour du statut');
      }

      const json = await response.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionistPatientKeys.detail(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: nutritionistPatientKeys.lists(),
      });
    },
  });
}

// ============================================================================
// PATIENT NOTES (PAT-006 - Historique avec horodatage)
// ============================================================================

const NOTES_BASE = '/api/protected/nutritionist/patients';

/**
 * Hook to fetch all notes for a patient
 */
export function usePatientNotes(patientId: string) {
  return useQuery<PatientNote[], Error>({
    queryKey: nutritionistPatientKeys.notes(patientId),
    queryFn: async () => {
      const response = await fetch(
        `${NOTES_BASE}/${patientId}/notes`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des notes');
      }

      const json = await response.json();
      return json.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to create a new patient note
 */
export function useCreatePatientNote(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<PatientNote, Error, { content: string }>({
    mutationFn: async ({ content }) => {
      const response = await fetch(
        `${NOTES_BASE}/${patientId}/notes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de la note');
      }

      const json = await response.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionistPatientKeys.notes(patientId),
      });
    },
  });
}

/**
 * Hook to update an existing patient note
 */
export function useUpdatePatientNote(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<PatientNote, Error, { noteId: string; content: string }>({
    mutationFn: async ({ noteId, content }) => {
      const response = await fetch(
        `${NOTES_BASE}/${patientId}/notes/${noteId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour de la note');
      }

      const json = await response.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionistPatientKeys.notes(patientId),
      });
    },
  });
}

/**
 * Hook to delete a patient note
 */
export function useDeletePatientNote(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: async (noteId) => {
      const response = await fetch(
        `${NOTES_BASE}/${patientId}/notes/${noteId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression de la note');
      }

      const json = await response.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionistPatientKeys.notes(patientId),
      });
    },
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Export patients list to CSV (client-side, RGPD-minimal data)
 */
export function exportPatientsToCSV(patients: PatientListItem[]) {
  const statusLabels: Record<string, string> = {
    active: 'Actif',
    pending: 'Nouveau',
    inactive: 'En pause',
  };
  const headers = ['Nom', 'Prénom', 'Email', 'Statut', 'Date début suivi'];
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

  const lines = [headers.map(escape).join(',')];
  for (const p of patients) {
    lines.push(
      [
        p.last_name,
        p.first_name,
        p.email,
        statusLabels[p.status] || p.status,
        p.assigned_at
          ? new Date(p.assigned_at).toLocaleDateString('fr-FR')
          : '',
      ]
        .map(escape)
        .join(',')
    );
  }

  const csv = lines.join('\n');
  const blob = new Blob(['\ufeff' + csv], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
