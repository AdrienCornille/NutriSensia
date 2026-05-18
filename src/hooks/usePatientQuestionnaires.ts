/**
 * React Query hooks — Patient-side questionnaires (P2.C)
 *
 * - usePatientQuestionnaireInbox(): list view
 * - usePatientQuestionnaireDetail(assignmentId): full form payload
 * - useSavePatientAnswer(assignmentId): granular auto-save (debounced caller-side)
 * - useSubmitPatientQuestionnaire(assignmentId): final submission
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type {
  PatientInboxItem,
  PatientQuestionnaireDetail,
  SaveAnswerPayload,
  SubmitResult,
} from '@/types/patient-questionnaires';

export const patientQuestionnaireKeys = {
  all: ['patient-questionnaires'] as const,
  inbox: () => [...patientQuestionnaireKeys.all, 'inbox'] as const,
  detail: (assignmentId: string) =>
    [...patientQuestionnaireKeys.all, 'detail', assignmentId] as const,
};

const BASE = '/api/protected/dossier/questionnaires';

async function readJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (json as { error?: string }).error || `HTTP ${res.status}`;
    const err = new Error(message) as Error & { payload?: unknown };
    err.payload = json;
    throw err;
  }
  // apiResponse.success wraps payload under `data`.
  return ((json as { data?: T }).data ?? (json as T)) as T;
}

// ── Inbox ────────────────────────────────────────────────────────────────

export function usePatientQuestionnaireInbox() {
  return useQuery<PatientInboxItem[], Error>({
    queryKey: patientQuestionnaireKeys.inbox(),
    queryFn: async () => {
      const res = await fetch(BASE, { credentials: 'include' });
      const data = await readJson<{ assignments: PatientInboxItem[] }>(res);
      return data.assignments;
    },
    staleTime: 30 * 1000,
  });
}

// ── Detail ───────────────────────────────────────────────────────────────

export function usePatientQuestionnaireDetail(assignmentId: string | null) {
  return useQuery<PatientQuestionnaireDetail, Error>({
    queryKey: patientQuestionnaireKeys.detail(assignmentId || ''),
    queryFn: async () => {
      const res = await fetch(`${BASE}/${assignmentId}`, {
        credentials: 'include',
      });
      return readJson<PatientQuestionnaireDetail>(res);
    },
    enabled: !!assignmentId,
    // Form payload — we don't want it to silently refetch under the user.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ── Save one answer (debounce handled by the calling component) ─────────

interface SaveAnswerVars {
  questionId: string;
  payload: SaveAnswerPayload;
}

export function useSavePatientAnswer(
  assignmentId: string
): UseMutationResult<{ id: string }, Error, SaveAnswerVars> {
  return useMutation<{ id: string }, Error, SaveAnswerVars>({
    mutationFn: async ({ questionId, payload }) => {
      const res = await fetch(`${BASE}/${assignmentId}/answers/${questionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return readJson<{ id: string }>(res);
    },
    // Optimistic strategy lives in the form component itself (we update the
    // local "answers" state immediately and just persist in the background).
  });
}

// ── Submit ───────────────────────────────────────────────────────────────

export function useSubmitPatientQuestionnaire(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation<SubmitResult, Error, void>({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/${assignmentId}/submit`, {
        method: 'POST',
        credentials: 'include',
      });
      return readJson<SubmitResult>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: patientQuestionnaireKeys.inbox(),
      });
      queryClient.invalidateQueries({
        queryKey: patientQuestionnaireKeys.detail(assignmentId),
      });
    },
  });
}
