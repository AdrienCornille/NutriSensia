'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CustomCategory {
  id: string;
  nutritionist_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

const BASE_URL = '/api/protected/nutritionist/content/categories';

export function useCustomCategories() {
  return useQuery<CustomCategory[]>({
    queryKey: ['custom-content-categories'],
    queryFn: async () => {
      const res = await fetch(BASE_URL, { credentials: 'include' });
      if (!res.ok) throw new Error('Erreur lors du chargement des catégories');
      const json = await res.json();
      return json.data || [];
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; color?: string | null }) => {
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
      return json.data as CustomCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['custom-content-categories'],
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: { name?: string; color?: string | null };
    }) => {
      const res = await fetch(`${BASE_URL}/${categoryId}`, {
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
      return json.data as CustomCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['custom-content-categories'],
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const res = await fetch(`${BASE_URL}/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['custom-content-categories'],
      });
    },
  });
}
