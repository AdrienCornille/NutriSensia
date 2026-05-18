'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  EducationalContent,
  EducationalContentFromDB,
  transformContentFromDB,
  ContentType,
  ContentCategory,
  ContentStatus,
} from '@/types/educational-content';
import { CreateContentData, UpdateContentData } from '@/lib/api-schemas';

const BASE_URL = '/api/protected/nutritionist/content';

// =====================================================
// QUERIES
// =====================================================

interface ContentListParams {
  type?: ContentType;
  category?: ContentCategory | string;
  status?: ContentStatus;
  search?: string;
  page?: number;
  limit?: number;
}

interface ContentListResponse {
  contents: EducationalContent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useNutritionistContents(params: ContentListParams = {}) {
  return useQuery<ContentListResponse>({
    queryKey: ['nutritionist-contents', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.set('type', params.type);
      if (params.category) searchParams.set('category', params.category);
      if (params.status) searchParams.set('status', params.status);
      if (params.search) searchParams.set('search', params.search);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());

      const url = `${BASE_URL}?${searchParams.toString()}`;
      const res = await fetch(url, { credentials: 'include' });

      if (!res.ok) throw new Error('Erreur lors du chargement des contenus');

      const json = await res.json();
      return {
        contents: (json.data?.contents || []).map(
          (c: EducationalContentFromDB) => transformContentFromDB(c)
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

export function useNutritionistContent(contentId: string | null) {
  return useQuery<EducationalContent>({
    queryKey: ['nutritionist-content', contentId],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/${contentId}`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Contenu introuvable');

      const json = await res.json();
      return transformContentFromDB(json.data);
    },
    enabled: !!contentId,
  });
}

// =====================================================
// MUTATIONS
// =====================================================

export function useCreateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateContentData) => {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la creation');
      }

      const json = await res.json();
      return transformContentFromDB(json.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-contents'],
      });
    },
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      data,
    }: {
      contentId: string;
      data: UpdateContentData;
    }) => {
      const res = await fetch(`${BASE_URL}/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la mise a jour');
      }

      const json = await res.json();
      return transformContentFromDB(json.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-contents'],
      });
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-content', variables.contentId],
      });
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const res = await fetch(`${BASE_URL}/${contentId}`, {
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
        queryKey: ['nutritionist-contents'],
      });
    },
  });
}

export function usePublishContent() {
  const updateMutation = useUpdateContent();

  return useMutation({
    mutationFn: async (contentId: string) => {
      return updateMutation.mutateAsync({
        contentId,
        data: { status: 'published' },
      });
    },
  });
}

export function useArchiveContent() {
  const updateMutation = useUpdateContent();

  return useMutation({
    mutationFn: async (contentId: string) => {
      return updateMutation.mutateAsync({
        contentId,
        data: { status: 'archived' },
      });
    },
  });
}

export function useUnpublishContent() {
  const updateMutation = useUpdateContent();

  return useMutation({
    mutationFn: async (contentId: string) => {
      return updateMutation.mutateAsync({
        contentId,
        data: { status: 'draft' },
      });
    },
  });
}

export function useScheduleContent() {
  const updateMutation = useUpdateContent();

  return useMutation({
    mutationFn: async ({
      contentId,
      scheduledAt,
    }: {
      contentId: string;
      scheduledAt: string;
    }) => {
      return updateMutation.mutateAsync({
        contentId,
        data: { status: 'scheduled', scheduled_publish_at: scheduledAt },
      });
    },
  });
}

export function useAutoSaveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      data,
    }: {
      contentId: string;
      data: UpdateContentData;
    }) => {
      const res = await fetch(`${BASE_URL}/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(
          json.error || 'Erreur lors de la sauvegarde automatique'
        );
      }

      const json = await res.json();
      return transformContentFromDB(json.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-contents'],
      });
    },
  });
}
