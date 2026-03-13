/**
 * React Query hooks for Nutritionist Nutritional Profiles (Phase 2.5)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  NutritionalProfile,
  NutritionalProfileSummary,
  ProfileComparison,
  CreateNutritionalProfilePayload,
  UpdateNutritionalProfilePayload,
} from '@/types/nutritional-profile';

// ============================================================================
// Helpers
// ============================================================================

function profileUrl(patientId: string, path = '') {
  return `/api/protected/nutritionist/patients/${patientId}/nutritional-profiles${path}`;
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

  return (await response.json()).data as T;
}

// ============================================================================
// Query Keys
// ============================================================================

export const nutritionalProfileKeys = {
  all: (patientId: string) =>
    ['nutritionist-nutritional-profiles', patientId] as const,
  list: (patientId: string) =>
    [...nutritionalProfileKeys.all(patientId), 'list'] as const,
  detail: (patientId: string, profileId: string) =>
    [...nutritionalProfileKeys.all(patientId), 'detail', profileId] as const,
  compare: (patientId: string, profileAId: string, profileBId: string) =>
    [...nutritionalProfileKeys.all(patientId), 'compare', profileAId, profileBId] as const,
  prefill: (patientId: string) =>
    [...nutritionalProfileKeys.all(patientId), 'prefill'] as const,
};

// ============================================================================
// Queries
// ============================================================================

/** List all profiles for a patient */
export function useNutritionalProfiles(patientId: string | null) {
  return useQuery<NutritionalProfileSummary[], Error>({
    queryKey: nutritionalProfileKeys.list(patientId || ''),
    queryFn: () => fetchJson<NutritionalProfileSummary[]>(profileUrl(patientId!)),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

/** Get a single profile detail */
export function useNutritionalProfile(
  patientId: string | null,
  profileId: string | null
) {
  return useQuery<NutritionalProfile, Error>({
    queryKey: nutritionalProfileKeys.detail(patientId || '', profileId || ''),
    queryFn: () =>
      fetchJson<NutritionalProfile>(profileUrl(patientId!, `/${profileId}`)),
    enabled: !!patientId && !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

/** Compare two profiles */
export function useCompareProfiles(
  patientId: string | null,
  profileAId: string | null,
  profileBId: string | null
) {
  return useQuery<ProfileComparison, Error>({
    queryKey: nutritionalProfileKeys.compare(
      patientId || '',
      profileAId || '',
      profileBId || ''
    ),
    queryFn: () =>
      fetchJson<ProfileComparison>(
        profileUrl(
          patientId!,
          `/compare?profile_a=${profileAId}&profile_b=${profileBId}`
        )
      ),
    enabled: !!patientId && !!profileAId && !!profileBId,
    staleTime: 10 * 60 * 1000,
  });
}

/** Prefill data for creating a new profile (aggregated from patient sources) */
export interface PrefillData {
  prefill: {
    weight_kg?: number;
    height_cm?: number;
    age?: number;
    gender?: 'male' | 'female';
    body_fat_pct?: number;
    activity_level?: string;
    goal?: 'lose' | 'maintain' | 'gain';
  };
  sources: Record<string, string>;
  referenceWeights?: {
    target_weight_kg?: number;
    comfort_weight_kg?: number;
    ideal_lorentz_kg?: number;
    ideal_devine_kg?: number;
    ideal_creff_kg?: number;
  };
}

export function useNutritionalProfilePrefill(patientId: string | null) {
  return useQuery<PrefillData, Error>({
    queryKey: nutritionalProfileKeys.prefill(patientId || ''),
    queryFn: () => fetchJson<PrefillData>(profileUrl(patientId!, '/prefill')),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/** Create a new nutritional profile */
export function useCreateNutritionalProfile(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<NutritionalProfile, Error, CreateNutritionalProfilePayload>({
    mutationFn: (body) =>
      fetchJson<NutritionalProfile>(profileUrl(patientId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionalProfileKeys.all(patientId),
      });
    },
  });
}

/** Update a nutritional profile */
export function useUpdateNutritionalProfile(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    NutritionalProfile,
    Error,
    { profileId: string; data: UpdateNutritionalProfilePayload }
  >({
    mutationFn: ({ profileId, data }) =>
      fetchJson<NutritionalProfile>(profileUrl(patientId, `/${profileId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({
        queryKey: nutritionalProfileKeys.detail(patientId, profileId),
      });
      queryClient.invalidateQueries({
        queryKey: nutritionalProfileKeys.list(patientId),
      });
    },
  });
}

/** Activate a profile */
export function useActivateProfile(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (profileId) =>
      fetchJson<void>(profileUrl(patientId, `/${profileId}/activate`), {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionalProfileKeys.all(patientId),
      });
    },
  });
}

/** Archive a profile (soft delete) */
export function useArchiveProfile(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (profileId) =>
      fetchJson<void>(profileUrl(patientId, `/${profileId}`), {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionalProfileKeys.all(patientId),
      });
    },
  });
}

/** Permanently delete a profile (hard delete) */
export function useDeleteProfile(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (profileId) =>
      fetchJson<void>(profileUrl(patientId, `/${profileId}?permanent=true`), {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionalProfileKeys.all(patientId),
      });
    },
  });
}

/**
 * Fetch the active nutritional profile for a patient (nutritionist-side).
 * Chains useNutritionalProfiles (list) + useNutritionalProfile (detail).
 */
export function useActiveNutritionalProfileForPatient(patientId: string | null) {
  const { data: profiles, isLoading: listLoading } = useNutritionalProfiles(patientId);

  const activeProfileId = profiles?.find((p) => p.status === 'active')?.id ?? null;

  const {
    data: activeProfile,
    isLoading: detailLoading,
  } = useNutritionalProfile(patientId, activeProfileId);

  return {
    data: activeProfile ?? null,
    isLoading: listLoading || (!!activeProfileId && detailLoading),
    hasActiveProfile: !!activeProfileId,
  };
}

