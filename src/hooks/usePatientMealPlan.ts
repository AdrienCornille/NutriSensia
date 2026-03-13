import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PatientPlanResponse, DBModificationRequest } from '@/lib/meal-plan-adapters';
import type { MealPlanDay } from '@/types/nutritionist-dossier';

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
// Query keys
// ============================================================================

const patientMealPlanKeys = {
  all: ['patient-meal-plan'] as const,
  plan: () => [...patientMealPlanKeys.all, 'plan'] as const,
  days: () => [...patientMealPlanKeys.all, 'days'] as const,
  modRequests: () => [...patientMealPlanKeys.all, 'modification-requests'] as const,
  shoppingList: () => [...patientMealPlanKeys.all, 'shopping-list'] as const,
  adherence: () => [...patientMealPlanKeys.all, 'adherence'] as const,
};

// ============================================================================
// Active plan metadata
// ============================================================================

interface ActivePlanResponse {
  plan: PatientPlanResponse | null;
}

export function usePatientActivePlan() {
  return useQuery<ActivePlanResponse, Error>({
    queryKey: patientMealPlanKeys.plan(),
    queryFn: () => fetchJson<ActivePlanResponse>('/api/protected/dossier/meal-plan'),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Plan days with meals, foods, micronutrients
// ============================================================================

export function usePatientPlanDays(enabled = true) {
  return useQuery<MealPlanDay[], Error>({
    queryKey: patientMealPlanKeys.days(),
    queryFn: () => fetchJson<MealPlanDay[]>('/api/protected/dossier/meal-plan/days'),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

// ============================================================================
// Modification requests
// ============================================================================

export function usePatientModificationRequests(enabled = true) {
  return useQuery<DBModificationRequest[], Error>({
    queryKey: patientMealPlanKeys.modRequests(),
    queryFn: () =>
      fetchJson<DBModificationRequest[]>('/api/protected/dossier/meal-plan/modification-requests'),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
}

export function useCreateModificationRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; title: string; status: string },
    Error,
    {
      request_type: string;
      title: string;
      description: string;
      suggested_alternative?: string;
    }
  >({
    mutationFn: body =>
      fetchJson('/api/protected/dossier/meal-plan/modification-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: patientMealPlanKeys.modRequests(),
      });
    },
  });
}

// ============================================================================
// Shopping list (on-demand)
// ============================================================================

interface ShoppingListResponse {
  items: {
    food_id: string | null;
    name: string;
    total_quantity: number;
    unit: string;
    category: string | null;
  }[];
  categories: string[];
}

// ============================================================================
// Adherence
// ============================================================================

export interface AdherenceSummary {
  total_meals: number;
  followed_meals: number;
  partial_meals: number;
  skipped_meals: number;
  not_tracked_meals: number;
  adherence_rate: number | null;
}

export interface AdherenceDay {
  date: string;
  followed: number;
  partial: number;
  skipped: number;
  not_tracked: number;
  total: number;
  adherence_rate: number | null;
}

export interface AdherenceData {
  summary: AdherenceSummary;
  daily: AdherenceDay[];
}

export function usePatientPlanAdherence(enabled = true) {
  return useQuery<AdherenceData, Error>({
    queryKey: patientMealPlanKeys.adherence(),
    queryFn: () => fetchJson<AdherenceData>('/api/protected/dossier/meal-plan/adherence'),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

// ============================================================================
// Shopping list (on-demand)
// ============================================================================

export function usePatientShoppingList(enabled = false) {
  return useQuery<ShoppingListResponse, Error>({
    queryKey: patientMealPlanKeys.shoppingList(),
    queryFn: () =>
      fetchJson<ShoppingListResponse>('/api/protected/dossier/meal-plan/shopping-list'),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
