/**
 * React Query hooks for Nutritionist Meal Plans (PLAN-N-001 to PLAN-N-003)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  MealPlanSummary,
  MealPlanDetail,
  MealPlanDay,
  MealPlanMeal,
  MealPlanFood,
  MealPlanAlternative,
} from '@/types/nutritionist-dossier';
import type {
  CreateMealPlanNutriData,
  UpdateMealPlanNutriData,
  CreatePlanMealData,
  UpdatePlanMealData,
  AddPlanFoodData,
  UpdatePlanFoodData,
  RespondModificationRequestData,
  DuplicateFromTemplateData,
  FoodUnit,
} from '@/lib/api-schemas';

// ============================================================================
// Types for Modification Requests (PLAN-N-007)
// ============================================================================

export interface ModificationRequest {
  id: string;
  meal_plan_id: string;
  patient_id: string;
  nutritionist_id: string;
  plan_meal_id: string | null;
  plan_day_id: string | null;
  request_type: string;
  title: string;
  description: string;
  suggested_alternative: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Helpers
// ============================================================================

function mealPlanUrl(patientId: string, path = '') {
  return `/api/protected/nutritionist/patients/${patientId}/meal-plans${path}`;
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

export const mealPlanKeys = {
  all: (patientId: string) => ['nutritionist-meal-plans', patientId] as const,
  list: (patientId: string) =>
    [...mealPlanKeys.all(patientId), 'list'] as const,
  detail: (patientId: string, planId: string) =>
    [...mealPlanKeys.all(patientId), 'detail', planId] as const,
  days: (patientId: string, planId: string) =>
    [...mealPlanKeys.all(patientId), 'days', planId] as const,
  modificationRequests: (patientId: string, planId: string) =>
    [...mealPlanKeys.all(patientId), 'modification-requests', planId] as const,
  alternatives: (patientId: string, planId: string, mealId: string, foodItemId: string) =>
    [...mealPlanKeys.all(patientId), 'alternatives', planId, mealId, foodItemId] as const,
};

// ============================================================================
// Queries
// ============================================================================

export function usePatientMealPlans(patientId: string | null) {
  return useQuery<MealPlanSummary[], Error>({
    queryKey: mealPlanKeys.list(patientId || ''),
    queryFn: () => fetchJson<MealPlanSummary[]>(mealPlanUrl(patientId!)),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePatientMealPlan(
  patientId: string | null,
  planId: string | null
) {
  return useQuery<MealPlanDetail, Error>({
    queryKey: mealPlanKeys.detail(patientId || '', planId || ''),
    queryFn: () =>
      fetchJson<MealPlanDetail>(mealPlanUrl(patientId!, `/${planId}`)),
    enabled: !!patientId && !!planId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useCreateMealPlan(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<MealPlanDetail, Error, CreateMealPlanNutriData>({
    mutationFn: body =>
      fetchJson<MealPlanDetail>(mealPlanUrl(patientId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.list(patientId),
      });
    },
  });
}

export function useUpdateMealPlan(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    MealPlanDetail,
    Error,
    { planId: string; data: UpdateMealPlanNutriData }
  >({
    mutationFn: ({ planId, data }) =>
      fetchJson<MealPlanDetail>(mealPlanUrl(patientId, `/${planId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, { planId }) => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.list(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.detail(patientId, planId),
      });
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.days(patientId, planId),
      });
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-meal-plan-templates'],
      });
    },
  });
}

export function useDeleteMealPlan(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: planId =>
      fetchJson<{ deleted: boolean }>(mealPlanUrl(patientId, `/${planId}`), {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.list(patientId),
      });
    },
  });
}

// ============================================================================
// PLAN-N-002: Days & Meals
// ============================================================================

export function usePlanDays(patientId: string | null, planId: string | null) {
  return useQuery<MealPlanDay[], Error>({
    queryKey: mealPlanKeys.days(patientId || '', planId || ''),
    queryFn: () =>
      fetchJson<MealPlanDay[]>(mealPlanUrl(patientId!, `/${planId}/days`)),
    enabled: !!patientId && !!planId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreatePlanMeal(patientId: string, planId: string) {
  const queryClient = useQueryClient();

  return useMutation<MealPlanMeal, Error, CreatePlanMealData>({
    mutationFn: body =>
      fetchJson<MealPlanMeal>(mealPlanUrl(patientId, `/${planId}/meals`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.days(patientId, planId),
      });
    },
  });
}

export function useUpdatePlanMeal(patientId: string, planId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    MealPlanMeal,
    Error,
    { mealId: string; data: UpdatePlanMealData }
  >({
    mutationFn: ({ mealId, data }) =>
      fetchJson<MealPlanMeal>(
        mealPlanUrl(patientId, `/${planId}/meals/${mealId}`),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.days(patientId, planId),
      });
    },
  });
}

export function useDeletePlanMeal(patientId: string, planId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: mealId =>
      fetchJson<{ deleted: boolean }>(
        mealPlanUrl(patientId, `/${planId}/meals/${mealId}`),
        { method: 'DELETE' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.days(patientId, planId),
      });
    },
  });
}

// ============================================================================
// PLAN-N-003: Foods within Meals
// ============================================================================

export interface AddFoodToMealInput extends AddPlanFoodData {
  mealId: string;
  // Extra data for optimistic UI
  _foodName?: string;
  _calories_per_100g?: number;
  _protein_per_100g?: number;
  _carbs_per_100g?: number;
  _fat_per_100g?: number;
  _gram_equivalent?: number;
}

export function useAddFoodToMeal(patientId: string, planId: string) {
  const queryClient = useQueryClient();
  const daysKey = mealPlanKeys.days(patientId, planId);

  return useMutation<MealPlanFood, Error, AddFoodToMealInput, { previousDays?: MealPlanDay[] }>({
    mutationFn: ({ mealId, _foodName, _calories_per_100g, _protein_per_100g, _carbs_per_100g, _fat_per_100g, _gram_equivalent, ...body }) =>
      fetchJson<MealPlanFood>(
        mealPlanUrl(patientId, `/${planId}/meals/${mealId}/foods`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      ),
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: daysKey });

      // Snapshot previous data
      const previousDays = queryClient.getQueryData<MealPlanDay[]>(daysKey);

      // Optimistic update: add the food item immediately
      if (previousDays && variables._foodName) {
        const qty = variables.quantity || 100;
        const gramEq = variables._gram_equivalent || 1;
        const gramQty = qty * gramEq;
        const cal100 = variables._calories_per_100g || 0;
        const prot100 = variables._protein_per_100g || 0;
        const carb100 = variables._carbs_per_100g || 0;
        const fat100 = variables._fat_per_100g || 0;

        const optimisticFood: MealPlanFood = {
          id: `optimistic-${Date.now()}`,
          food_id: variables.food_id || null,
          custom_name: variables._foodName,
          quantity: qty,
          unit: variables.unit || 'g',
          calories: Math.round((cal100 * gramQty) / 100),
          protein_g: Math.round(((prot100 * gramQty) / 100) * 10) / 10,
          carbs_g: Math.round(((carb100 * gramQty) / 100) * 10) / 10,
          fat_g: Math.round(((fat100 * gramQty) / 100) * 10) / 10,
          display_order: 999,
        };

        queryClient.setQueryData<MealPlanDay[]>(daysKey, (old) => {
          if (!old) return old;
          return old.map(day => ({
            ...day,
            meals: day.meals.map(meal => {
              if (meal.id === variables.mealId) {
                return {
                  ...meal,
                  foods: [...meal.foods, optimisticFood],
                };
              }
              return meal;
            }),
          }));
        });
      }

      return { previousDays };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousDays) {
        queryClient.setQueryData(daysKey, context.previousDays);
      }
    },
    onSettled: () => {
      // Refetch to reconcile with server
      queryClient.invalidateQueries({ queryKey: daysKey });
    },
  });
}

export function useUpdateMealFood(patientId: string, planId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    MealPlanFood,
    Error,
    { mealId: string; foodItemId: string; data: UpdatePlanFoodData }
  >({
    mutationFn: ({ mealId, foodItemId, data }) =>
      fetchJson<MealPlanFood>(
        mealPlanUrl(patientId, `/${planId}/meals/${mealId}/foods/${foodItemId}`),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.days(patientId, planId),
      });
    },
  });
}

export function useDeleteMealFood(patientId: string, planId: string) {
  const queryClient = useQueryClient();
  const daysKey = mealPlanKeys.days(patientId, planId);

  return useMutation<
    { deleted: boolean },
    Error,
    { mealId: string; foodItemId: string },
    { previousDays?: MealPlanDay[] }
  >({
    mutationFn: ({ mealId, foodItemId }) =>
      fetchJson<{ deleted: boolean }>(
        mealPlanUrl(patientId, `/${planId}/meals/${mealId}/foods/${foodItemId}`),
        { method: 'DELETE' }
      ),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: daysKey });
      const previousDays = queryClient.getQueryData<MealPlanDay[]>(daysKey);

      // Optimistic: remove the food item immediately
      if (previousDays) {
        queryClient.setQueryData<MealPlanDay[]>(daysKey, (old) => {
          if (!old) return old;
          return old.map(day => ({
            ...day,
            meals: day.meals.map(meal => {
              if (meal.id === variables.mealId) {
                return {
                  ...meal,
                  foods: meal.foods.filter(f => f.id !== variables.foodItemId),
                };
              }
              return meal;
            }),
          }));
        });
      }

      return { previousDays };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDays) {
        queryClient.setQueryData(daysKey, context.previousDays);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: daysKey });
    },
  });
}

// ============================================================================
// PLAN-N-003: Reorder foods within a meal (drag-and-drop)
// ============================================================================

export function useReorderMealFoods(patientId: string, planId: string) {
  const queryClient = useQueryClient();
  const daysKey = mealPlanKeys.days(patientId, planId);

  return useMutation<
    { reordered: boolean },
    Error,
    { mealId: string; items: { id: string; display_order: number }[] },
    { previousDays?: MealPlanDay[] }
  >({
    mutationFn: ({ mealId, items }) =>
      fetchJson<{ reordered: boolean }>(
        mealPlanUrl(patientId, `/${planId}/meals/${mealId}/foods/reorder`),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        }
      ),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: daysKey });
      const previousDays = queryClient.getQueryData<MealPlanDay[]>(daysKey);

      // Optimistic: reorder foods in cache
      if (previousDays) {
        const orderMap = new Map(variables.items.map(i => [i.id, i.display_order]));
        queryClient.setQueryData<MealPlanDay[]>(daysKey, (old) => {
          if (!old) return old;
          return old.map(day => ({
            ...day,
            meals: day.meals.map(meal => {
              if (meal.id !== variables.mealId) return meal;
              const reordered = [...meal.foods].map(f => ({
                ...f,
                display_order: orderMap.get(f.id) ?? f.display_order,
              }));
              reordered.sort((a, b) => a.display_order - b.display_order);
              return { ...meal, foods: reordered };
            }),
          }));
        });
      }

      return { previousDays };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDays) {
        queryClient.setQueryData(daysKey, context.previousDays);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: daysKey });
    },
  });
}

// ============================================================================
// PLAN-N-007: Modification Requests
// ============================================================================

export function useModificationRequests(patientId: string | null, planId: string | null) {
  return useQuery<ModificationRequest[], Error>({
    queryKey: mealPlanKeys.modificationRequests(patientId || '', planId || ''),
    queryFn: () =>
      fetchJson<ModificationRequest[]>(
        mealPlanUrl(patientId!, `/${planId}/modification-requests`)
      ),
    enabled: !!patientId && !!planId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useRespondModificationRequest(patientId: string, planId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ModificationRequest,
    Error,
    { requestId: string; data: RespondModificationRequestData }
  >({
    mutationFn: ({ requestId, data }) =>
      fetchJson<ModificationRequest>(
        mealPlanUrl(patientId, `/${planId}/modification-requests/${requestId}`),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.modificationRequests(patientId, planId),
      });
    },
  });
}

// ============================================================================
// PLAN-N-004: Food Alternatives
// ============================================================================

export function useAlternatives(
  patientId: string | null,
  planId: string | null,
  mealId: string | null,
  foodItemId: string | null
) {
  return useQuery<MealPlanAlternative[], Error>({
    queryKey: mealPlanKeys.alternatives(
      patientId || '',
      planId || '',
      mealId || '',
      foodItemId || ''
    ),
    queryFn: () =>
      fetchJson<MealPlanAlternative[]>(
        mealPlanUrl(
          patientId!,
          `/${planId}/meals/${mealId}/foods/${foodItemId}/alternatives`
        )
      ),
    enabled: !!patientId && !!planId && !!mealId && !!foodItemId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAddAlternative(patientId: string, planId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    MealPlanAlternative,
    Error,
    {
      mealId: string;
      foodItemId: string;
      alternative_food_id?: string;
      alternative_name?: string;
      reason?: string;
      quantity?: number;
    }
  >({
    mutationFn: ({ mealId, foodItemId, ...body }) =>
      fetchJson<MealPlanAlternative>(
        mealPlanUrl(
          patientId,
          `/${planId}/meals/${mealId}/foods/${foodItemId}/alternatives`
        ),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      ),
    onSuccess: (_data, { mealId, foodItemId }) => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.alternatives(patientId, planId, mealId, foodItemId),
      });
    },
  });
}

export function useDeleteAlternative(patientId: string, planId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { deleted: boolean },
    Error,
    { mealId: string; foodItemId: string; alternativeId: string }
  >({
    mutationFn: ({ mealId, foodItemId, alternativeId }) =>
      fetchJson<{ deleted: boolean }>(
        mealPlanUrl(
          patientId,
          `/${planId}/meals/${mealId}/foods/${foodItemId}/alternatives/${alternativeId}`
        ),
        { method: 'DELETE' }
      ),
    onSuccess: (_data, { mealId, foodItemId }) => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.alternatives(patientId, planId, mealId, foodItemId),
      });
    },
  });
}

// ============================================================================
// PLAN-N-005: Templates
// ============================================================================

export function useNutritionistTemplates() {
  return useQuery<MealPlanSummary[], Error>({
    queryKey: ['nutritionist-meal-plan-templates'],
    queryFn: () =>
      fetchJson<MealPlanSummary[]>(
        '/api/protected/nutritionist/meal-plan-templates'
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDuplicateFromTemplate(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<MealPlanDetail, Error, DuplicateFromTemplateData>({
    mutationFn: body =>
      fetchJson<MealPlanDetail>(
        mealPlanUrl(patientId, '/from-template'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.list(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-meal-plan-templates'],
      });
    },
  });
}

// ============================================================================
// PLAN-N-008: Adherence Stats
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

export function usePlanAdherence(
  patientId: string | null,
  planId: string | null,
  startDate?: string,
  endDate?: string
) {
  const params = new URLSearchParams();
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery<AdherenceData, Error>({
    queryKey: ['nutritionist-adherence', patientId, planId, startDate, endDate],
    queryFn: () =>
      fetchJson<AdherenceData>(
        mealPlanUrl(patientId!, `/${planId}/adherence${qs}`)
      ),
    enabled: !!patientId && !!planId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// PLAN-N-009: Shopping List
// ============================================================================

export interface ShoppingListItem {
  food_id: string | null;
  name: string;
  total_quantity: number;
  unit: string;
  category: string | null;
}

export interface ShoppingListData {
  items: ShoppingListItem[];
  categories: string[];
}

export function usePlanShoppingList(
  patientId: string | null,
  planId: string | null,
  enabled = false
) {
  return useQuery<ShoppingListData, Error>({
    queryKey: ['nutritionist-shopping-list', patientId, planId],
    queryFn: () =>
      fetchJson<ShoppingListData>(
        mealPlanUrl(patientId!, `/${planId}/shopping-list`)
      ),
    enabled: enabled && !!patientId && !!planId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSendShoppingList(patientId: string, planId: string) {
  return useMutation<
    { sent: boolean; message_id: string; conversation_id: string },
    Error,
    { message: string }
  >({
    mutationFn: (data) =>
      fetchJson<{ sent: boolean; message_id: string; conversation_id: string }>(
        mealPlanUrl(patientId, `/${planId}/shopping-list`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      ),
  });
}

// ============================================================================
// Copy Day Meals (Multi-week UX)
// ============================================================================

export function useCopyDayMeals(patientId: string, planId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ copied_to: number }, Error, { source_day_id: string; target_day_ids: string[] }>({
    mutationFn: (data) =>
      fetchJson<{ copied_to: number }>(
        mealPlanUrl(patientId, `/${planId}/days/copy`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.days(patientId, planId),
      });
    },
  });
}

// ============================================================================
// FOOD UNITS (unit conversions)
// ============================================================================

export interface FoodUnitOption {
  unit: FoodUnit;
  label: string;
  gram_equivalent: number;
}

export function useFoodUnits(foodId: string | null) {
  return useQuery<FoodUnitOption[], Error>({
    queryKey: ['food-units', foodId],
    queryFn: async () => {
      const res = await fetch(`/api/protected/foods/${foodId}/units`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur chargement unités');
      const json = await res.json();
      return json.data?.units || json.units || [{ unit: 'g', label: 'grammes', gram_equivalent: 1 }];
    },
    enabled: !!foodId,
    staleTime: 30 * 60 * 1000, // 30 min cache - conversions don't change often
  });
}
