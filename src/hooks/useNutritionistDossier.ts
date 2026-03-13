/**
 * React Query Hooks for Nutritionist Dossier Management (Epic 3)
 * DOSSIER-001 to DOSSIER-010
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  DossierSummary,
  AnamneseResponse,
  ChangeReport,
  QuestionnaireDetail,
  DocumentDetail,
  PatientObjectiveDetail,
} from '@/types/nutritionist-dossier';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const dossierKeys = {
  all: (patientId: string) => ['nutritionist-dossier', patientId] as const,
  summary: (patientId: string) =>
    [...dossierKeys.all(patientId), 'summary'] as const,
  anamnese: (patientId: string) =>
    [...dossierKeys.all(patientId), 'anamnese'] as const,
  anamneseWithHistory: (patientId: string) =>
    [...dossierKeys.all(patientId), 'anamnese', 'history'] as const,
  anamneseVersion: (patientId: string, anamneseId: string) =>
    [...dossierKeys.all(patientId), 'anamnese', 'version', anamneseId] as const,
  changeReports: (patientId: string, status?: string) =>
    [...dossierKeys.all(patientId), 'change-reports', status] as const,
  questionnaires: (patientId: string) =>
    [...dossierKeys.all(patientId), 'questionnaires'] as const,
  questionnaire: (patientId: string, questionnaireId: string) =>
    [...dossierKeys.all(patientId), 'questionnaire', questionnaireId] as const,
  documents: (patientId: string) =>
    [...dossierKeys.all(patientId), 'documents'] as const,
  objectives: (patientId: string) =>
    [...dossierKeys.all(patientId), 'objectives'] as const,
  objective: (patientId: string, objectiveId: string) =>
    [...dossierKeys.all(patientId), 'objective', objectiveId] as const,
};

// ============================================================================
// BASE URL HELPER
// ============================================================================

function dossierUrl(patientId: string, path = '') {
  return `/api/protected/nutritionist/patients/${patientId}/dossier${path}`;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur serveur');
  }

  const json = await response.json();
  return json.data as T;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * DOSSIER-001: Fetch dossier summary (aggregated stats)
 */
export function useDossierSummary(patientId: string | null) {
  return useQuery<DossierSummary, Error>({
    queryKey: dossierKeys.summary(patientId || ''),
    queryFn: () =>
      fetchJson<DossierSummary>(dossierUrl(patientId!, '/summary')),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * DOSSIER-001: Fetch current anamnesis with optional history
 */
export function usePatientAnamnese(
  patientId: string | null,
  includeHistory = false
) {
  return useQuery<AnamneseResponse, Error>({
    queryKey: includeHistory
      ? dossierKeys.anamneseWithHistory(patientId || '')
      : dossierKeys.anamnese(patientId || ''),
    queryFn: () =>
      fetchJson<AnamneseResponse>(
        dossierUrl(
          patientId!,
          `/anamnese${includeHistory ? '?include_history=true' : ''}`
        )
      ),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * DOSSIER-002: Create new anamnesis version
 */
export function useCreateAnamnese(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; version: number; status: string },
    Error,
    { prefill_from_version?: number }
  >({
    mutationFn: body =>
      fetchJson(dossierUrl(patientId, '/anamnese'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.anamnese(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: dossierKeys.summary(patientId),
      });
    },
  });
}

/**
 * DOSSIER-003: Update anamnesis status
 */
export function useUpdateAnamneseStatus(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; status: string },
    Error,
    { anamneseId: string; status: string }
  >({
    mutationFn: ({ anamneseId, status }) =>
      fetchJson(dossierUrl(patientId, `/anamnese/${anamneseId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.anamnese(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: dossierKeys.summary(patientId),
      });
    },
  });
}

/**
 * DOSSIER-002/003: Upsert anamnesis section
 */
export function useUpsertAnamneseSection(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { anamnesis_id: string; section_id: string; action: string },
    Error,
    {
      anamneseId: string;
      section_id: string;
      section_label: string;
      section_icon: string;
      field_data: Record<string, string>;
      display_order: number;
    }
  >({
    mutationFn: ({ anamneseId, ...body }) =>
      fetchJson(dossierUrl(patientId, `/anamnese/${anamneseId}/sections`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.anamnese(patientId),
      });
    },
  });
}

/**
 * Fetch a specific anamnesis version with full section data
 */
export function useAnamneseVersion(
  patientId: string | null,
  anamneseId: string | null
) {
  return useQuery<{
    id: string;
    version: number;
    status: string;
    is_current: boolean;
    created_at: string;
    updated_at: string;
    sections: { id: string; label: string; icon: string; fields: { label: string; value: string }[] }[];
  }, Error>({
    queryKey: dossierKeys.anamneseVersion(patientId || '', anamneseId || ''),
    queryFn: () =>
      fetchJson(dossierUrl(patientId!, `/anamnese/${anamneseId!}`)),
    enabled: !!patientId && !!anamneseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Delete a non-current anamnesis version
 */
export function useDeleteAnamnese(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean; id: string }, Error, string>({
    mutationFn: anamneseId =>
      fetchJson(dossierUrl(patientId, `/anamnese/${anamneseId}`), {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.anamnese(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: dossierKeys.anamneseWithHistory(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: dossierKeys.summary(patientId),
      });
    },
  });
}

// ============================================================================
// CHANGE REPORTS (DOSSIER-004)
// ============================================================================

export function useChangeReports(patientId: string | null, status = 'all') {
  return useQuery<ChangeReport[], Error>({
    queryKey: dossierKeys.changeReports(patientId || '', status),
    queryFn: () =>
      fetchJson<ChangeReport[]>(
        dossierUrl(patientId!, `/change-reports?status=${status}`)
      ),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useReviewChangeReport(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; status: string },
    Error,
    { report_id: string; status: string; reviewer_notes?: string }
  >({
    mutationFn: body =>
      fetchJson(dossierUrl(patientId, '/change-reports'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.changeReports(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: dossierKeys.summary(patientId),
      });
      // When integrating, the anamnesis field is auto-updated – refetch it
      if (variables.status === 'integrated') {
        queryClient.invalidateQueries({
          queryKey: dossierKeys.anamnese(patientId),
        });
      }
    },
  });
}

// ============================================================================
// QUESTIONNAIRES (DOSSIER-005, 006)
// ============================================================================

export function usePatientQuestionnaires(patientId: string | null) {
  return useQuery<QuestionnaireDetail[], Error>({
    queryKey: dossierKeys.questionnaires(patientId || ''),
    queryFn: () =>
      fetchJson<QuestionnaireDetail[]>(
        dossierUrl(patientId!, '/questionnaires')
      ),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateQuestionnaire(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; title: string; status: string },
    Error,
    {
      title: string;
      questionnaire_type: string;
      due_date?: string;
      questions: {
        question: string;
        type: string;
        options?: string[];
        required?: boolean;
      }[];
    }
  >({
    mutationFn: body =>
      fetchJson(dossierUrl(patientId, '/questionnaires'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.questionnaires(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: dossierKeys.summary(patientId),
      });
    },
  });
}

export function useDeleteQuestionnaire(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: questionnaireId =>
      fetchJson(dossierUrl(patientId, `/questionnaires/${questionnaireId}`), {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.questionnaires(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: dossierKeys.summary(patientId),
      });
    },
  });
}

// ============================================================================
// OBJECTIVE PROGRESS (DOSSIER-009)
// ============================================================================

export function useLogObjectiveProgress(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; progress: number },
    Error,
    { objectiveId: string; progress: number; value?: string; notes?: string }
  >({
    mutationFn: ({ objectiveId, ...body }) =>
      fetchJson(dossierUrl(patientId, `/objectives/${objectiveId}/progress`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.objectives(patientId),
      });
    },
  });
}

// ============================================================================
// DOCUMENTS (DOSSIER-007)
// ============================================================================

export function usePatientDocuments(patientId: string | null) {
  return useQuery<DocumentDetail[], Error>({
    queryKey: dossierKeys.documents(patientId || ''),
    queryFn: () =>
      fetchJson<DocumentDetail[]>(dossierUrl(patientId!, '/documents')),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUploadDocument(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; name: string; category: string },
    Error,
    {
      name: string;
      category: string;
      description?: string;
      file_type?: string;
      mime_type?: string;
      file_url: string;
      file_size?: number;
    }
  >({
    mutationFn: body =>
      fetchJson(dossierUrl(patientId, '/documents'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.documents(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: dossierKeys.summary(patientId),
      });
    },
  });
}

export function useDeleteDocument(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: documentId =>
      fetchJson(dossierUrl(patientId, `/documents/${documentId}`), {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.documents(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: dossierKeys.summary(patientId),
      });
    },
  });
}

// ============================================================================
// OBJECTIVES (DOSSIER-008)
// ============================================================================

export function usePatientObjectives(patientId: string | null) {
  return useQuery<PatientObjectiveDetail[], Error>({
    queryKey: dossierKeys.objectives(patientId || ''),
    queryFn: () =>
      fetchJson<PatientObjectiveDetail[]>(
        dossierUrl(patientId!, '/objectives')
      ),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateObjective(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; title: string; category: string; status: string },
    Error,
    {
      title: string;
      description?: string;
      category: string;
      target_value?: string;
      target_unit?: string;
      start_value?: string;
      start_date?: string;
      deadline?: string;
      priority?: number;
    }
  >({
    mutationFn: body =>
      fetchJson(dossierUrl(patientId, '/objectives'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.objectives(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: dossierKeys.summary(patientId),
      });
    },
  });
}

export function useUpdateObjective(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string },
    Error,
    {
      objectiveId: string;
      title?: string;
      description?: string;
      status?: string;
      target_value?: string;
      deadline?: string;
      priority?: number;
      notes?: string;
    }
  >({
    mutationFn: ({ objectiveId, ...body }) =>
      fetchJson(dossierUrl(patientId, `/objectives/${objectiveId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dossierKeys.objectives(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: dossierKeys.summary(patientId),
      });
    },
  });
}
