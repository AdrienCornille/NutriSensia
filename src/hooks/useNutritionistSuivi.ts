/**
 * React Query Hooks for Nutritionist Suivi & Progression (Epic 8)
 * SUIVI-001 to SUIVI-007
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  NutriWeightData,
  NutriMeasurementsData,
  NutriWellbeingData,
  NutriActivityData,
  NutriHydrationData,
  NutriMealsData,
  MealFeedback,
} from '@/types/nutritionist-suivi';
import type { TimeRange } from '@/types/suivi';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const suiviKeys = {
  all: (patientId: string) => ['nutritionist-suivi', patientId] as const,
  weight: (patientId: string, range?: string) =>
    [...suiviKeys.all(patientId), 'weight', range] as const,
  measurements: (patientId: string, type?: string, range?: string) =>
    [...suiviKeys.all(patientId), 'measurements', type, range] as const,
  wellbeing: (patientId: string, range?: string) =>
    [...suiviKeys.all(patientId), 'wellbeing', range] as const,
  activity: (patientId: string, range?: string) =>
    [...suiviKeys.all(patientId), 'activity', range] as const,
  hydration: (patientId: string, range?: string) =>
    [...suiviKeys.all(patientId), 'hydration', range] as const,
  meals: (patientId: string, date?: string) =>
    [...suiviKeys.all(patientId), 'meals', date] as const,
};

// ============================================================================
// BASE URL HELPER
// ============================================================================

function suiviUrl(patientId: string, path = '') {
  return `/api/protected/nutritionist/patients/${patientId}/suivi${path}`;
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
// DATE RANGE UTILITY
// ============================================================================

export function buildDateRangeParams(range: TimeRange): string {
  if (range === 'Tout') return '';

  const now = new Date();
  const daysMap: Record<string, number> = {
    '1S': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1A': 365,
  };
  const days = daysMap[range] || 30;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const start = startDate.toISOString().split('T')[0];
  const end = now.toISOString().split('T')[0];
  return `?start_date=${start}&end_date=${end}`;
}

// ============================================================================
// SUIVI-001: WEIGHT
// ============================================================================

export function usePatientWeight(patientId: string | null, range: TimeRange = '3M') {
  const params = buildDateRangeParams(range);
  return useQuery<NutriWeightData, Error>({
    queryKey: suiviKeys.weight(patientId || '', range),
    queryFn: () => fetchJson<NutriWeightData>(suiviUrl(patientId!, `/weight${params}`)),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// SUIVI-002: MEASUREMENTS
// ============================================================================

export function usePatientMeasurements(
  patientId: string | null,
  measurementType?: string,
  range: TimeRange = '3M'
) {
  const dateParams = buildDateRangeParams(range);
  const typeParam = measurementType ? `${dateParams ? '&' : '?'}measurement_type=${measurementType}` : '';
  const fullParams = `${dateParams}${typeParam}`;

  return useQuery<NutriMeasurementsData, Error>({
    queryKey: suiviKeys.measurements(patientId || '', measurementType, range),
    queryFn: () =>
      fetchJson<NutriMeasurementsData>(suiviUrl(patientId!, `/measurements${fullParams}`)),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// SUIVI-003: WELLBEING
// ============================================================================

export function usePatientWellbeing(patientId: string | null, range: TimeRange = '1M') {
  const params = buildDateRangeParams(range);
  return useQuery<NutriWellbeingData, Error>({
    queryKey: suiviKeys.wellbeing(patientId || '', range),
    queryFn: () => fetchJson<NutriWellbeingData>(suiviUrl(patientId!, `/wellbeing${params}`)),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// SUIVI-004: ACTIVITY
// ============================================================================

export function usePatientActivity(patientId: string | null, range: TimeRange = '1M') {
  const params = buildDateRangeParams(range);
  return useQuery<NutriActivityData, Error>({
    queryKey: suiviKeys.activity(patientId || '', range),
    queryFn: () => fetchJson<NutriActivityData>(suiviUrl(patientId!, `/activity${params}`)),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// SUIVI-005: HYDRATION
// ============================================================================

export function usePatientHydration(patientId: string | null, range: TimeRange = '1M') {
  const params = buildDateRangeParams(range);
  return useQuery<NutriHydrationData, Error>({
    queryKey: suiviKeys.hydration(patientId || '', range),
    queryFn: () => fetchJson<NutriHydrationData>(suiviUrl(patientId!, `/hydration${params}`)),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// SUIVI-007: MEALS
// ============================================================================

export function usePatientMeals(
  patientId: string | null,
  date?: string,
  limit = 50,
  offset = 0
) {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  const qs = params.toString();

  return useQuery<NutriMealsData, Error>({
    queryKey: suiviKeys.meals(patientId || '', date),
    queryFn: () => fetchJson<NutriMealsData>(suiviUrl(patientId!, `/meals?${qs}`)),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// SUIVI-007: MEAL FEEDBACK MUTATIONS
// ============================================================================

export function useAddMealFeedback(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    MealFeedback,
    Error,
    { mealId: string; comment: string; feedback_type?: string }
  >({
    mutationFn: ({ mealId, comment, feedback_type }) =>
      fetchJson<MealFeedback>(suiviUrl(patientId, `/meals/${mealId}/feedback`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, feedback_type: feedback_type || 'general' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviKeys.meals(patientId),
      });
    },
  });
}

export function useDeleteMealFeedback(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { mealId: string; feedbackId: string }>({
    mutationFn: ({ mealId, feedbackId }) =>
      fetchJson<void>(
        suiviUrl(patientId, `/meals/${mealId}/feedback?feedbackId=${feedbackId}`),
        { method: 'DELETE' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviKeys.meals(patientId),
      });
    },
  });
}
