'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  EducationalContent,
  EducationalContentFromDB,
  transformContentFromDB,
  ContentType,
  ContentCategory,
  ContentComment,
} from '@/types/educational-content';

const BASE = '/api/protected/content';

// =====================================================
// PATIENT CONTENT BROWSING
// =====================================================

interface PatientContentListParams {
  type?: ContentType;
  category?: ContentCategory | string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PatientContentListResponse {
  contents: EducationalContent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function usePatientContents(params: PatientContentListParams = {}) {
  return useQuery<PatientContentListResponse>({
    queryKey: ['patient-contents', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.set('type', params.type);
      if (params.category) searchParams.set('category', params.category);
      if (params.search) searchParams.set('search', params.search);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());

      const res = await fetch(`${BASE}?${searchParams}`, {
        credentials: 'include',
      });
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

export function usePatientContent(contentId: string | null) {
  return useQuery<EducationalContent & { isLiked: boolean; isSaved: boolean }>({
    queryKey: ['patient-content', contentId],
    queryFn: async () => {
      const res = await fetch(`${BASE}/${contentId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Contenu introuvable');

      const json = await res.json();
      const content = transformContentFromDB(json.data.content);
      return {
        ...content,
        isLiked: json.data.is_liked || false,
        isSaved: json.data.is_saved || false,
      };
    },
    enabled: !!contentId,
  });
}

// =====================================================
// CATEGORIES (predefined + custom from nutritionist)
// =====================================================

export interface PatientCustomCategory {
  id: string;
  name: string;
  color: string | null;
}

export function usePatientCustomCategories() {
  return useQuery<PatientCustomCategory[]>({
    queryKey: ['patient-custom-categories'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/categories`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des catégories');
      const json = await res.json();
      const items = json.data?.categories || json.data || [];
      return Array.isArray(items) ? items : [];
    },
  });
}

// =====================================================
// FEATURED CONTENT
// =====================================================

export function usePatientFeaturedContents() {
  return useQuery<EducationalContent[]>({
    queryKey: ['patient-featured-contents'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/featured`, {
        credentials: 'include',
      });
      if (!res.ok)
        throw new Error('Erreur lors du chargement des contenus mis en avant');
      const json = await res.json();
      const items = json.data?.featured || json.data || [];
      return (Array.isArray(items) ? items : []).map(
        (c: EducationalContentFromDB) => transformContentFromDB(c)
      );
    },
  });
}

// =====================================================
// LIKES & SAVES (CONTENT-N-012)
// =====================================================

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const res = await fetch(`${BASE}/${contentId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur');
      return (await res.json()).data as { liked: boolean };
    },
    onSuccess: (data, contentId) => {
      queryClient.invalidateQueries({
        queryKey: ['patient-content', contentId],
      });
      queryClient.invalidateQueries({ queryKey: ['patient-contents'] });
    },
  });
}

export function useToggleSave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const res = await fetch(`${BASE}/${contentId}/save`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur');
      return (await res.json()).data as { saved: boolean };
    },
    onSuccess: (data, contentId) => {
      queryClient.invalidateQueries({
        queryKey: ['patient-content', contentId],
      });
      queryClient.invalidateQueries({ queryKey: ['patient-contents'] });
      queryClient.invalidateQueries({ queryKey: ['patient-saved-contents'] });
    },
  });
}

export function usePatientSavedContents() {
  return useQuery<EducationalContent[]>({
    queryKey: ['patient-saved-contents'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/saved`, { credentials: 'include' });
      if (!res.ok) throw new Error('Erreur');
      const json = await res.json();
      return (json.data || []).map((c: EducationalContentFromDB) =>
        transformContentFromDB(c)
      );
    },
  });
}

// =====================================================
// PATIENT COMMENTS (CONTENT-N-013)
// =====================================================

interface PatientCommentsResponse {
  comments: ContentComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function usePatientContentComments(contentId: string | null, page = 1) {
  return useQuery<PatientCommentsResponse>({
    queryKey: ['patient-content-comments', contentId, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString() });
      const res = await fetch(`${BASE}/${contentId}/comments?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur');
      const json = await res.json();
      const comments = (json.data?.comments || []).map(
        (c: Record<string, unknown>) => ({
          id: c.id,
          contentId: c.content_id,
          userId: c.user_id,
          parentId: c.parent_id,
          body: c.body,
          isNutritionist: c.is_nutritionist,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          userName: c.user_name,
        })
      );
      return { comments, pagination: json.data?.pagination };
    },
    enabled: !!contentId,
  });
}

export function usePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      body,
      parentId,
    }: {
      contentId: string;
      body: string;
      parentId?: string;
    }) => {
      const res = await fetch(`${BASE}/${contentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body, parent_id: parentId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Erreur lors de l'envoi");
      }
      return (await res.json()).data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patient-content-comments', variables.contentId],
      });
    },
  });
}
