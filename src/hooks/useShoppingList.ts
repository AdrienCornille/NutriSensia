'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BASE_URL = '/api/protected/recipes/shopping-list';

// =====================================================
// TYPES
// =====================================================

export interface ShoppingListItemServer {
  id: string;
  name: string;
  quantity: string;
  quantity_value: number | null;
  unit: string | null;
  is_checked: boolean;
  checked_at: string | null;
  recipe_id: string | null;
  food_id: string | null;
  notes: string | null;
  display_order: number;
}

export interface ShoppingListCategoryServer {
  id: string;
  name: string;
  icon: string | null;
  display_order: number;
  items: ShoppingListItemServer[];
}

export interface ShoppingListServer {
  list: {
    id: string;
    name: string;
    week_start: string | null;
    week_end: string | null;
  } | null;
  categories: ShoppingListCategoryServer[];
  progress: { total: number; checked: number; percentage: number };
}

// =====================================================
// QUERIES
// =====================================================

export function useShoppingList() {
  return useQuery<ShoppingListServer>({
    queryKey: ['shopping-list'],
    queryFn: async () => {
      const res = await fetch(BASE_URL, { credentials: 'include' });
      if (!res.ok) throw new Error('Erreur lors du chargement de la liste');
      const json = await res.json();
      return json.data;
    },
  });
}

// =====================================================
// MUTATIONS
// =====================================================

export function useAddRecipeToShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      servingsMultiplier = 1,
      excludedIngredientIds = [],
    }: {
      recipeId: string;
      servingsMultiplier?: number;
      excludedIngredientIds?: string[];
    }) => {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipe_id: recipeId,
          servings_multiplier: servingsMultiplier,
          excluded_ingredient_ids: excludedIngredientIds,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Erreur lors de l'ajout");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
    },
  });
}

export function useToggleShoppingItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      isChecked,
    }: {
      itemId: string;
      isChecked: boolean;
    }) => {
      const res = await fetch(`${BASE_URL}/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_checked: isChecked }),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
    },
  });
}

export function useDeleteShoppingItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`${BASE_URL}/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
    },
  });
}

export function useClearShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(BASE_URL, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
    },
  });
}
