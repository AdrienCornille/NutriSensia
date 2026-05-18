'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  NutriRecipe,
  RecipeDB,
  RecipeCategoryDB,
  RecipeTagDB,
  RecipeDifficulty,
  RecipeStatus,
  transformRecipeFromDB,
} from '@/types/recipes';
import {
  CreateRecipeData,
  UpdateRecipeData,
  UpsertRecipeIngredientsData,
  UpsertRecipeStepsData,
  DuplicateRecipeData,
  AssignRecipeData,
} from '@/lib/api-schemas';

const BASE_URL = '/api/protected/nutritionist/recipes';

// =====================================================
// QUERIES
// =====================================================

interface RecipeListParams {
  /** @deprecated Use tags instead */
  category_id?: string;
  tags?: string[];
  autoTags?: string[];
  status?: RecipeStatus;
  difficulty?: RecipeDifficulty;
  search?: string;
  page?: number;
  limit?: number;
}

interface RecipeListResponse {
  recipes: NutriRecipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useNutritionistRecipes(params: RecipeListParams = {}) {
  return useQuery<RecipeListResponse>({
    queryKey: ['nutritionist-recipes', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.tags?.length) searchParams.set('tags', params.tags.join(','));
      if (params.autoTags?.length)
        searchParams.set('auto_tags', params.autoTags.join(','));
      if (params.status) searchParams.set('status', params.status);
      if (params.difficulty) searchParams.set('difficulty', params.difficulty);
      if (params.search) searchParams.set('search', params.search);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());

      const url = `${BASE_URL}?${searchParams.toString()}`;
      const res = await fetch(url, { credentials: 'include' });

      if (!res.ok) throw new Error('Erreur lors du chargement des recettes');

      const json = await res.json();
      return {
        recipes: (json.data?.recipes || []).map((r: RecipeDB) =>
          transformRecipeFromDB(r)
        ),
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

export function useNutritionistRecipe(recipeId: string | null) {
  return useQuery<NutriRecipe>({
    queryKey: ['nutritionist-recipe', recipeId],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/${recipeId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Recette introuvable');
      const json = await res.json();
      return transformRecipeFromDB(json.data);
    },
    enabled: !!recipeId,
  });
}

// ---- Tag groups (new system) ----

export interface TagGroupResponse {
  groups: {
    slug: string;
    label: string;
    color: string;
    tags: {
      id: string;
      slug: string;
      name_fr: string;
      color: string | null;
      icon: string | null;
    }[];
  }[];
  autoGroups: {
    slug: string;
    label: string;
    color: string;
    values: { value: string; label: string; count: number }[];
  }[];
}

export function useRecipeTagGroups() {
  return useQuery<TagGroupResponse>({
    queryKey: ['recipe-tag-groups'],
    queryFn: async () => {
      const res = await fetch('/api/protected/recipes/tags', {
        credentials: 'include',
      });
      if (!res.ok) return { groups: [], autoGroups: [] };
      const json = await res.json();
      return json.data || { groups: [], autoGroups: [] };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Flat list of all tags (from all groups)
export function useRecipeTags() {
  return useQuery<RecipeTagDB[]>({
    queryKey: ['recipe-tags'],
    queryFn: async () => {
      const res = await fetch('/api/protected/recipes/tags', {
        credentials: 'include',
      });
      if (!res.ok) return [];
      const json = await res.json();
      // Flatten all tags from all groups
      const groups = json.data?.groups || [];
      return groups.flatMap((g: { tags: RecipeTagDB[] }) => g.tags);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** @deprecated Use useRecipeTagGroups instead */
export function useRecipeCategories() {
  return useQuery<RecipeCategoryDB[]>({
    queryKey: ['recipe-categories'],
    queryFn: async () => [],
    staleTime: Infinity,
  });
}

// =====================================================
// MUTATIONS
// =====================================================

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRecipeData) => {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la création');
      }
      const json = await res.json();
      return transformRecipeFromDB(json.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionist-recipes'] });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      data,
    }: {
      recipeId: string;
      data: UpdateRecipeData;
    }) => {
      const res = await fetch(`${BASE_URL}/${recipeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la mise à jour');
      }
      const json = await res.json();
      return transformRecipeFromDB(json.data);
    },
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['nutritionist-recipes'] });
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-recipe', recipeId],
      });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      const res = await fetch(`${BASE_URL}/${recipeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionist-recipes'] });
    },
  });
}

export function useUpsertRecipeIngredients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      data,
    }: {
      recipeId: string;
      data: UpsertRecipeIngredientsData;
    }) => {
      const res = await fetch(`${BASE_URL}/${recipeId}/ingredients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(
          json.error || "Erreur lors de l'enregistrement des ingrédients"
        );
      }
      return res.json();
    },
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-recipe', recipeId],
      });
      queryClient.invalidateQueries({ queryKey: ['nutritionist-recipes'] });
    },
  });
}

export function useUpsertRecipeSteps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      data,
    }: {
      recipeId: string;
      data: UpsertRecipeStepsData;
    }) => {
      const res = await fetch(`${BASE_URL}/${recipeId}/steps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(
          json.error || "Erreur lors de l'enregistrement des étapes"
        );
      }
      return res.json();
    },
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-recipe', recipeId],
      });
    },
  });
}

export function usePublishRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      const res = await fetch(`${BASE_URL}/${recipeId}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la publication');
      }
      const json = await res.json();
      return transformRecipeFromDB(json.data);
    },
    onSuccess: (_, recipeId) => {
      queryClient.invalidateQueries({ queryKey: ['nutritionist-recipes'] });
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-recipe', recipeId],
      });
    },
  });
}

export function useDuplicateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      data,
    }: {
      recipeId: string;
      data: DuplicateRecipeData;
    }) => {
      const res = await fetch(`${BASE_URL}/${recipeId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la duplication');
      }
      const json = await res.json();
      return transformRecipeFromDB(json.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionist-recipes'] });
    },
  });
}

// =====================================================
// PHASE 4: ASSIGNMENTS + STATS
// =====================================================

export function useAssignRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      data,
    }: {
      recipeId: string;
      data: AssignRecipeData;
    }) => {
      const res = await fetch(`${BASE_URL}/${recipeId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la recommandation');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe-assignments'] });
    },
  });
}

export function useRecipeAssignments(recipeId: string | null) {
  return useQuery({
    queryKey: ['recipe-assignments', recipeId],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/${recipeId}/assignments`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur');
      const json = await res.json();
      return json.data?.assignments || [];
    },
    enabled: !!recipeId,
  });
}

interface RecipeStats {
  totalRecipes: number;
  publishedRecipes: number;
  totalViews: number;
  totalFavorites: number;
  averageRating: number;
  totalRatings: number;
  totalCooked: number;
  mostPopular: {
    id: string;
    title: string;
    views: number;
    favorites: number;
    image_url: string | null;
  }[];
  bestRated: {
    id: string;
    title: string;
    rating: number;
    ratingCount: number;
    image_url: string | null;
  }[];
}

export function useRecipeStats() {
  return useQuery<RecipeStats>({
    queryKey: ['nutritionist-recipe-stats'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/stats`, { credentials: 'include' });
      if (!res.ok) throw new Error('Erreur');
      const json = await res.json();
      return json.data;
    },
  });
}

// =====================================================
// REVIEWS
// =====================================================

export interface NutritionistRecipeReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: string;
}

export interface NutritionistRecipeReviewsSummary {
  average: number;
  count: number;
}

export function useNutritionistRecipeReviews(recipeId: string | null) {
  return useQuery<{
    reviews: NutritionistRecipeReview[];
    summary: NutritionistRecipeReviewsSummary;
  }>({
    queryKey: ['nutritionist-recipe-reviews', recipeId],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/${recipeId}/reviews`, {
        credentials: 'include',
      });
      if (!res.ok) return { reviews: [], summary: { average: 0, count: 0 } };
      const json = await res.json();
      return json.data;
    },
    enabled: !!recipeId,
  });
}
