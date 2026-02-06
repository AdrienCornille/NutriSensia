import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPES
// ============================================================================

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  is_favorite: boolean;
}

export interface FoodSearchResponse {
  foods: FoodSearchResult[];
  total: number;
}

export interface FoodDetail {
  id: string;
  name: string;
  name_en?: string;
  brand?: string;
  barcode?: string;
  description?: string;
  category?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  saturated_fat_per_100g?: number;
  sodium_per_100mg?: number;
  image_url?: string;
  tags: string[];
  allergens: string[];
  common_portions: {
    name: string;
    grams: number;
    is_default: boolean;
  }[];
  is_favorite: boolean;
  last_used_at?: string;
}

export interface FoodFavorite {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  last_used_at?: string;
  usage_count: number;
}

export interface FavoritesResponse {
  favorites: FoodFavorite[];
  total: number;
}

export interface BarcodeScanResult {
  found: boolean;
  barcode?: string;
  message?: string;
  food?: {
    id: string;
    name: string;
    brand?: string;
    barcode: string;
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fat_per_100g: number;
    fiber_per_100g?: number;
    image_url?: string;
  };
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook pour rechercher des aliments
 * @param query - Terme de recherche (min 2 caractères)
 * @param category - Catégorie optionnelle
 * @param limit - Nombre de résultats (défaut: 20)
 */
export function useFoodSearch(
  query: string,
  category?: string,
  limit: number = 20
) {
  return useQuery<FoodSearchResponse, Error>({
    queryKey: ['foods', 'search', query, category, limit],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return { foods: [], total: 0 };
      }

      const params = new URLSearchParams();
      params.append('q', query.trim());
      if (category) params.append('category', category);
      params.append('limit', limit.toString());

      const response = await fetch(
        `/api/protected/foods/search?${params.toString()}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la recherche d'aliments"
        );
      }

      return response.json();
    },
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour récupérer le détail d'un aliment
 * @param foodId - ID de l'aliment
 */
export function useFoodDetail(foodId?: string) {
  return useQuery<FoodDetail, Error>({
    queryKey: ['foods', foodId],
    queryFn: async () => {
      if (!foodId) throw new Error('Food ID is required');

      const response = await fetch(`/api/protected/foods/${foodId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la récupération de l'aliment"
        );
      }

      return response.json();
    },
    enabled: !!foodId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook pour scanner un code-barres
 * @param barcode - Code-barres EAN-8 ou EAN-13
 */
export function useBarcodeScan(barcode?: string) {
  return useQuery<BarcodeScanResult, Error>({
    queryKey: ['foods', 'barcode', barcode],
    queryFn: async () => {
      if (!barcode) throw new Error('Barcode is required');

      const response = await fetch(`/api/protected/foods/barcode/${barcode}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors du scan du code-barres');
      }

      return response.json();
    },
    enabled: !!barcode && barcode.length >= 8,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook pour récupérer les aliments favoris
 */
export function useFoodFavorites() {
  return useQuery<FavoritesResponse, Error>({
    queryKey: ['foods', 'favorites'],
    queryFn: async () => {
      const response = await fetch('/api/protected/foods/favorites', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération des favoris'
        );
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour ajouter/retirer un favori
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation<
    { is_favorite: boolean },
    Error,
    { foodId: string; isFavorite: boolean }
  >({
    mutationFn: async ({ foodId, isFavorite }) => {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`/api/protected/foods/${foodId}/favorite`, {
        method,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la modification du favori'
        );
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les favoris et les résultats de recherche
      queryClient.invalidateQueries({ queryKey: ['foods', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['foods', 'search'] });
    },
  });
}
