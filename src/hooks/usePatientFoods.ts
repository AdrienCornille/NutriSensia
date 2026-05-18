'use client';

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

const BASE_URL = '/api/protected/foods';

// =====================================================
// TYPES
// =====================================================

export interface PatientFood {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  categoryLabel: string;
  categoryEmoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  image: string;
  per: string;
  source: string | null;
  isFavorite: boolean;
}

export interface FoodCategoryChild {
  slug: string;
  label: string;
  emoji: string;
}

export interface FoodCategoryGroup {
  slug: string;
  label: string;
  emoji: string;
  children: FoodCategoryChild[];
}

interface PatientFoodsParams {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

interface PatientFoodsResponse {
  foods: PatientFood[];
  categories: FoodCategoryGroup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =====================================================
// QUERIES
// =====================================================

export function usePatientFoods(params: PatientFoodsParams = {}) {
  return useQuery<PatientFoodsResponse>({
    queryKey: ['patient-foods', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.category) searchParams.set('category', params.category);
      if (params.sort) searchParams.set('sort', params.sort);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());

      const res = await fetch(`${BASE_URL}?${searchParams.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des aliments');
      const json = await res.json();
      return json.data;
    },
  });
}

interface InfinitePatientFoodsParams {
  search?: string;
  category?: string;
  sort?: string;
  limit?: number;
}

export function useInfinitePatientFoods(
  params: InfinitePatientFoodsParams = {}
) {
  const limit = params.limit || 50;

  return useInfiniteQuery<PatientFoodsResponse>({
    queryKey: ['patient-foods-infinite', params],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.category) searchParams.set('category', params.category);
      if (params.sort) searchParams.set('sort', params.sort);
      searchParams.set('page', String(pageParam));
      searchParams.set('limit', String(limit));

      const res = await fetch(`${BASE_URL}?${searchParams.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des aliments');
      const json = await res.json();
      return json.data;
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
}

// =====================================================
// MUTATIONS
// =====================================================

export function useToggleFoodFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foodId: string) => {
      const res = await fetch(`${BASE_URL}/${foodId}/favorite`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-foods'] });
    },
  });
}
