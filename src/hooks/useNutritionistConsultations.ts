/**
 * React Query Hooks for Nutritionist Consultations (Epic 4)
 * CONSULT-001 to CONSULT-007
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ConsultationDetail } from '@/types/nutritionist-dossier';
import type { CreateConsultationData, UpdateConsultationData } from '@/lib/api-schemas';

// ============================================================================
// TYPES
// ============================================================================

export interface AppointmentSummary {
  id: string;
  user_id: string;
  nutritionist_id: string;
  scheduled_at: string;
  scheduled_end_at: string | null;
  duration: number | null;
  mode: 'visio' | 'cabinet' | 'phone';
  status: string;
  consultation_id: string | null;
  patient_message: string | null;
  consultation_type: {
    id: string;
    code: string;
    name_fr: string;
    default_duration: number;
    icon: string | null;
    color: string | null;
  } | null;
}

export interface ConsultationsWithAppointments {
  consultations: ConsultationDetail[];
  upcoming_appointments: AppointmentSummary[];
  past_without_report: AppointmentSummary[];
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const consultationKeys = {
  all: (patientId: string) => ['nutritionist-consultations', patientId] as const,
  list: (patientId: string) =>
    [...consultationKeys.all(patientId), 'list'] as const,
  detail: (patientId: string, consultationId: string) =>
    [...consultationKeys.all(patientId), 'detail', consultationId] as const,
  preparation: (patientId: string) =>
    [...consultationKeys.all(patientId), 'preparation'] as const,
};

// ============================================================================
// FETCH HELPERS
// ============================================================================

const BASE = '/api/protected/nutritionist/patients';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erreur serveur');
  return json.data;
}

async function mutateJSON<T>(
  url: string,
  method: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erreur serveur');
  return json.data;
}

// ============================================================================
// QUERIES
// ============================================================================

/** List all consultations + appointments for a patient */
export function usePatientConsultations(patientId: string) {
  return useQuery<ConsultationsWithAppointments>({
    queryKey: consultationKeys.list(patientId),
    queryFn: () =>
      fetchJSON(`${BASE}/${patientId}/dossier/consultations`),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** Get a single consultation detail */
export function useConsultationDetail(
  patientId: string,
  consultationId: string | null
) {
  return useQuery<ConsultationDetail>({
    queryKey: consultationKeys.detail(patientId, consultationId || ''),
    queryFn: () =>
      fetchJSON(
        `${BASE}/${patientId}/dossier/consultations/${consultationId}`
      ),
    enabled: !!patientId && !!consultationId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** Fetch pre-consultation preparation data */
export function useConsultationPreparation(patientId: string) {
  return useQuery({
    queryKey: consultationKeys.preparation(patientId),
    queryFn: async () => {
      const [consultData, objectives, changeReports] = await Promise.all([
        fetchJSON<ConsultationsWithAppointments>(
          `${BASE}/${patientId}/dossier/consultations`
        ).catch(() => ({ consultations: [], upcoming_appointments: [], past_without_report: [] })),
        fetchJSON<unknown[]>(
          `${BASE}/${patientId}/dossier/objectives`
        ).catch(() => []),
        fetchJSON<unknown[]>(
          `${BASE}/${patientId}/dossier/change-reports?status=pending`
        ).catch(() => []),
      ]);

      const lastConsultation = consultData.consultations[0] || null;

      return {
        lastConsultation,
        objectives,
        changeReports,
      };
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/** Create a new consultation */
export function useCreateConsultation(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConsultationData) =>
      mutateJSON<ConsultationDetail>(
        `${BASE}/${patientId}/dossier/consultations`,
        'POST',
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.all(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-dossier', patientId, 'summary'],
      });
    },
  });
}

/** Update an existing consultation */
export function useUpdateConsultation(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      consultationId,
      ...data
    }: UpdateConsultationData & { consultationId: string }) =>
      mutateJSON<ConsultationDetail>(
        `${BASE}/${patientId}/dossier/consultations/${consultationId}`,
        'PATCH',
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.all(patientId),
      });
    },
  });
}

/** Delete a consultation */
export function useDeleteConsultation(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (consultationId: string) =>
      mutateJSON<{ deleted: boolean }>(
        `${BASE}/${patientId}/dossier/consultations/${consultationId}`,
        'DELETE'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.all(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-dossier', patientId, 'summary'],
      });
    },
  });
}
