'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  NutriRecipe,
  RecipeDB,
  RecipeDifficulty,
  transformRecipeFromDB,
} from '@/types/recipes';

const BASE_URL = '/api/protected/recipes';

// =====================================================
// QUERIES
// =====================================================

interface PatientRecipeListParams {
  category_id?: string;
  difficulty?: RecipeDifficulty;
  search?: string;
  sort?: 'recent' | 'rating' | 'quick';
  page?: number;
  limit?: number;
}

interface PatientRecipeListResponse {
  recipes: (NutriRecipe & { isFavorite: boolean })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function transformWithFavorite(
  r: RecipeDB & { is_favorite?: boolean }
): NutriRecipe & { isFavorite: boolean } {
  return {
    ...transformRecipeFromDB(r),
    isFavorite: r.is_favorite || false,
  };
}

export function usePatientRecipes(params: PatientRecipeListParams = {}) {
  return useQuery<PatientRecipeListResponse>({
    queryKey: ['patient-recipes', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.category_id)
        searchParams.set('category_id', params.category_id);
      if (params.difficulty) searchParams.set('difficulty', params.difficulty);
      if (params.search) searchParams.set('search', params.search);
      if (params.sort) searchParams.set('sort', params.sort);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());

      const url = `${BASE_URL}?${searchParams.toString()}`;
      const res = await fetch(url, { credentials: 'include' });

      if (!res.ok) throw new Error('Erreur lors du chargement des recettes');

      const json = await res.json();
      return {
        recipes: (json.data?.recipes || []).map(transformWithFavorite),
        pagination: json.data?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
    },
  });
}

export function usePatientRecipeDetail(recipeId: string | null) {
  return useQuery<NutriRecipe & { isFavorite: boolean }>({
    queryKey: ['patient-recipe', recipeId],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/${recipeId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Recette introuvable');
      const json = await res.json();
      return transformWithFavorite(json.data);
    },
    enabled: !!recipeId,
  });
}

export function usePatientFavoriteRecipes() {
  return useQuery<(NutriRecipe & { isFavorite: boolean })[]>({
    queryKey: ['patient-favorite-recipes'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/favorites`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des favoris');
      const json = await res.json();
      return (json.data?.recipes || []).map(transformWithFavorite);
    },
  });
}

export function useCookedRecipes() {
  return useQuery<(NutriRecipe & { isFavorite: boolean; cookedAt: string })[]>({
    queryKey: ['patient-cooked-recipes'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/cooked`, { credentials: 'include' });
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const json = await res.json();
      return (json.data?.recipes || []).map(
        (r: RecipeDB & { is_favorite?: boolean; cooked_at?: string }) => ({
          ...transformWithFavorite(r),
          cookedAt: r.cooked_at || '',
        })
      );
    },
  });
}

export function useRecommendedRecipes() {
  return useQuery<
    (NutriRecipe & {
      isFavorite: boolean;
      assignmentNote?: string | null;
      assignedAt?: string;
    })[]
  >({
    queryKey: ['patient-recommended-recipes'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/recommended`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur');
      const json = await res.json();
      return (json.data?.recipes || []).map(
        (
          r: RecipeDB & {
            is_favorite?: boolean;
            assignment_note?: string;
            assigned_at?: string;
          }
        ) => ({
          ...transformWithFavorite(r),
          assignmentNote: r.assignment_note || null,
          assignedAt: r.assigned_at || null,
        })
      );
    },
  });
}

// =====================================================
// MUTATIONS
// =====================================================

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      const res = await fetch(`${BASE_URL}/${recipeId}/favorite`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors du changement de favori');
      }
      const json = await res.json();
      return json.data as { is_favorite: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['patient-favorite-recipes'] });
    },
  });
}

// Rating
export function useRecipeRating(recipeId: string | null) {
  return useQuery<{ rating: number; comment: string | null } | null>({
    queryKey: ['recipe-rating', recipeId],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/${recipeId}/rating`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data?.rating || null;
    },
    enabled: !!recipeId,
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      rating,
      comment,
    }: {
      recipeId: string;
      rating: number;
      comment: string | null;
    }) => {
      const res = await fetch(`${BASE_URL}/${recipeId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Erreur lors de l'envoi");
      }
      return res.json();
    },
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipe-rating', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['recipe-reviews', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['patient-recipe', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['patient-recipes'] });
    },
  });
}

// Reviews
export interface RecipeReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  isOwn: boolean;
  author: string;
}

export function useRecipeReviews(recipeId: string | null) {
  return useQuery<RecipeReview[]>({
    queryKey: ['recipe-reviews', recipeId],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/${recipeId}/reviews`, {
        credentials: 'include',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.reviews || [];
    },
    enabled: !!recipeId,
  });
}

// Log as meal
export function useLogRecipeAsMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      mealType,
      date,
      servingsMultiplier,
    }: {
      recipeId: string;
      mealType: string;
      date: string;
      servingsMultiplier: number;
    }) => {
      const res = await fetch(`${BASE_URL}/${recipeId}/log-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          meal_type: mealType,
          date,
          servings_multiplier: servingsMultiplier,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Erreur lors de l'enregistrement");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-meals'] });
      queryClient.invalidateQueries({ queryKey: ['patient-cooked-recipes'] });
    },
  });
}
