/**
 * React Query hooks for Patient Nutritional Profile (FILE-008 to FILE-014)
 * Read-only access to nutritional profiles.
 */
import { useQuery } from '@tanstack/react-query';
import type {
  NutritionalProfilePatient,
  ProfileComparison,
} from '@/types/nutritional-profile';

// ============================================================================
// Helpers
// ============================================================================

const BASE_URL = '/api/protected/dossier/nutritional-profile';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur serveur');
  }

  return (await response.json()).data as T;
}

// ============================================================================
// Query Keys
// ============================================================================

export const patientProfileKeys = {
  all: ['patient-nutritional-profile'] as const,
  active: () => [...patientProfileKeys.all, 'active'] as const,
  history: () => [...patientProfileKeys.all, 'history'] as const,
  detail: (profileId: string) =>
    [...patientProfileKeys.all, 'detail', profileId] as const,
  compare: (aId: string, bId: string) =>
    [...patientProfileKeys.all, 'compare', aId, bId] as const,
};

// ============================================================================
// Queries
// ============================================================================

/** Get the active nutritional profile (may be null if none exists) */
export function usePatientActiveProfile() {
  return useQuery<NutritionalProfilePatient | null, Error>({
    queryKey: patientProfileKeys.active(),
    queryFn: () => fetchJson<NutritionalProfilePatient | null>(BASE_URL),
    staleTime: 5 * 60 * 1000,
  });
}

/** Get all profiles (history) */
export function usePatientProfileHistory() {
  return useQuery<NutritionalProfilePatient[], Error>({
    queryKey: patientProfileKeys.history(),
    queryFn: () =>
      fetchJson<NutritionalProfilePatient[]>(`${BASE_URL}?history=true`),
    staleTime: 5 * 60 * 1000,
  });
}

/** Get a specific profile detail */
export function usePatientProfileDetail(profileId: string | null) {
  return useQuery<NutritionalProfilePatient, Error>({
    queryKey: patientProfileKeys.detail(profileId || ''),
    queryFn: () =>
      fetchJson<NutritionalProfilePatient>(`${BASE_URL}/${profileId}`),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

/** Compare two profiles */
export function useComparePatientProfiles(
  aId: string | null,
  bId: string | null
) {
  return useQuery<ProfileComparison, Error>({
    queryKey: patientProfileKeys.compare(aId || '', bId || ''),
    queryFn: () =>
      fetchJson<ProfileComparison>(
        `${BASE_URL}/compare?profile_a=${aId}&profile_b=${bId}`
      ),
    enabled: !!aId && !!bId,
    staleTime: 10 * 60 * 1000,
  });
}

