import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AnamneseData } from '@/types/dossier';

// ============================================================================
// Types
// ============================================================================

interface PatientAnamneseResponse {
  anamnese: AnamneseData | null;
}

export interface PatientChangeReport {
  id: string;
  patient_id: string;
  anamnesis_section_id: string;
  change_type: 'health' | 'medication' | 'allergy' | 'lifestyle' | 'other';
  title: string;
  description: string;
  old_value: string | null;
  new_value: string | null;
  status: 'pending' | 'reviewed' | 'integrated';
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  created_at: string;
}

// ============================================================================
// Helpers
// ============================================================================

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur serveur');
  }
  const json = await res.json();
  return json.data as T;
}

// ============================================================================
// Anamnese
// ============================================================================

export function usePatientAnamnese() {
  return useQuery<PatientAnamneseResponse, Error>({
    queryKey: ['patient-dossier', 'anamnese'],
    queryFn: () => fetchJson<PatientAnamneseResponse>('/api/protected/dossier/anamnese'),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Change Reports (FILE-002)
// ============================================================================

export function usePatientChangeReports() {
  return useQuery<PatientChangeReport[], Error>({
    queryKey: ['patient-dossier', 'change-reports'],
    queryFn: () => fetchJson<PatientChangeReport[]>('/api/protected/dossier/change-reports'),
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// Consultations (patient-side, read-only)
// ============================================================================

export interface PatientConsultation {
  id: string;
  date: string;
  start_time: string | null;
  duration_minutes: number | null;
  consultation_type: string | null;
  mode: string;
  summary: string | null;
  key_points: string[] | null;
  next_steps: string | null;
  created_at: string;
}

export function usePatientConsultations() {
  return useQuery<PatientConsultation[], Error>({
    queryKey: ['patient-dossier', 'consultations'],
    queryFn: () =>
      fetchJson<PatientConsultation[]>('/api/protected/dossier/consultations'),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Change Reports (FILE-002)
// ============================================================================

export function useCreateChangeReport() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; change_type: string; title: string; status: string },
    Error,
    {
      change_type: string;
      title: string;
      description: string;
      anamnesis_section_id?: string;
      old_value?: string;
      new_value?: string;
    }
  >({
    mutationFn: body =>
      fetchJson('/api/protected/dossier/change-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient-dossier', 'change-reports'],
      });
    },
  });
}
