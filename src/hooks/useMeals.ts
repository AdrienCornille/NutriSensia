import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

export interface MealFood {
  food_id: string;
  quantity: number;
  unit: 'g' | 'ml' | 'portion';
}

export interface CreateMealData {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  consumed_at: string; // ISO datetime
  notes?: string;
  location?: 'home' | 'work' | 'restaurant' | 'other';
  photo_url?: string;
  foods: MealFood[];
}

export interface Meal {
  id: string;
  user_id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  consumed_at: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  notes?: string;
  location?: string;
  photo_url?: string;
  created_at: string;
  foods: {
    id: string;
    food_id: string;
    food_name: string;
    brand?: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

export interface MealListItem {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  consumed_at: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  food_count: number;
  has_photo: boolean;
  location?: string;
}

export interface MealsResponse {
  meals: MealListItem[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook pour récupérer la liste des repas
 * @param date - Date au format YYYY-MM-DD (optionnel)
 * @param type - Type de repas (optionnel)
 * @param limit - Nombre de résultats (défaut: 50)
 * @param offset - Décalage pour pagination (défaut: 0)
 */
export function useMeals(
  date?: string,
  type?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  limit: number = 50,
  offset: number = 0
) {
  return useQuery<MealsResponse, Error>({
    queryKey: ['meals', date, type, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (type) params.append('type', type);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(
        `/api/protected/meals?${params.toString()}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération des repas'
        );
      }

      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook pour récupérer le détail d'un repas
 * @param mealId - ID du repas
 */
export function useMeal(mealId?: string) {
  return useQuery<Meal, Error>({
    queryKey: ['meals', mealId],
    queryFn: async () => {
      if (!mealId) throw new Error('Meal ID is required');

      const response = await fetch(`/api/protected/meals/${mealId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération du repas'
        );
      }

      return response.json();
    },
    enabled: !!mealId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour créer un repas
 */
export function useCreateMeal() {
  const queryClient = useQueryClient();

  return useMutation<Meal, Error, CreateMealData>({
    mutationFn: async (data: CreateMealData) => {
      const response = await fetch('/api/protected/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création du repas');
      }

      return response.json();
    },
    onSuccess: data => {
      // Invalider les queries des repas pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: ['meals'] });

      // Invalider le résumé quotidien (sera implémenté plus tard)
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });

      // Invalider le check des repas (sera implémenté plus tard)
      queryClient.invalidateQueries({ queryKey: ['meals-check'] });
    },
  });
}

/**
 * Hook pour modifier un repas
 */
export function useUpdateMeal(mealId: string) {
  const queryClient = useQueryClient();

  return useMutation<Meal, Error, Partial<CreateMealData>>({
    mutationFn: async (data: Partial<CreateMealData>) => {
      const response = await fetch(`/api/protected/meals/${mealId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la modification du repas'
        );
      }

      return response.json();
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['meals', mealId] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['meals-check'] });
    },
  });
}

/**
 * Hook pour supprimer un repas
 */
export function useDeleteMeal() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (mealId: string) => {
      const response = await fetch(`/api/protected/meals/${mealId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la suppression du repas'
        );
      }

      // 204 No Content n'a pas de body, pas besoin de parser
      if (response.status === 204) {
        return;
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['meals-check'] });
    },
  });
}

/**
 * Hook pour récupérer les repas du jour par date
 * Utile pour afficher les repas d'une date spécifique
 */
export function useMealsByDate(date: string) {
  return useMeals(date, undefined, 50, 0);
}

/**
 * Hook pour récupérer les repas d'aujourd'hui
 */
export function useTodayMeals() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return useMealsByDate(today);
}

/**
 * Hook pour récupérer le résumé nutritionnel quotidien
 */
export function useDailySummary(date?: string) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['daily-summary', targetDate],
    queryFn: async () => {
      const response = await fetch(
        `/api/protected/meals/daily-summary?date=${targetDate}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération du résumé'
        );
      }

      return response.json();
    },
  });
}

/**
 * Hook pour vérifier l'état des repas du jour
 */
export function useMealsCheck(date?: string) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['meals-check', targetDate],
    queryFn: async () => {
      const response = await fetch(
        `/api/protected/meals/check?date=${targetDate}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la vérification des repas'
        );
      }

      return response.json();
    },
  });
}
