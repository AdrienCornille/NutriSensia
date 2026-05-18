'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ContentVersion,
  ContentComment,
  ContentAssignment,
  ContentStats,
  EducationalContent,
  EducationalContentFromDB,
  transformContentFromDB,
} from '@/types/educational-content';

const BASE = '/api/protected/nutritionist/content';

// =====================================================
// VERSIONS (CONTENT-N-007)
// =====================================================

export function useContentVersions(contentId: string | null) {
  return useQuery<ContentVersion[]>({
    queryKey: ['content-versions', contentId],
    queryFn: async () => {
      const res = await fetch(`${BASE}/${contentId}/versions`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des versions');
      const json = await res.json();
      return (json.data || []).map((v: Record<string, unknown>) => ({
        id: v.id,
        contentId: v.content_id,
        versionNumber: v.version_number,
        title: v.title,
        summary: v.summary,
        body: v.body,
        tags: v.tags || [],
        keyPoints: v.key_points || [],
        changeSummary: v.change_summary,
        createdAt: v.created_at,
        createdBy: v.created_by,
      }));
    },
    enabled: !!contentId,
  });
}

export function useCreateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      changeSummary,
    }: {
      contentId: string;
      changeSummary?: string;
    }) => {
      const res = await fetch(`${BASE}/${contentId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ change_summary: changeSummary }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la création de version');
      }
      return (await res.json()).data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['content-versions', variables.contentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-content', variables.contentId],
      });
    },
  });
}

export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      versionId,
    }: {
      contentId: string;
      versionId: string;
    }) => {
      const res = await fetch(`${BASE}/${contentId}/versions/${versionId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la restauration');
      }
      return (await res.json()).data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['content-versions', variables.contentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-content', variables.contentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['nutritionist-contents'],
      });
    },
  });
}

// =====================================================
// ASSIGNMENTS (CONTENT-N-010)
// =====================================================

export function useContentAssignments(contentId: string | null) {
  return useQuery<ContentAssignment[]>({
    queryKey: ['content-assignments', contentId],
    queryFn: async () => {
      const res = await fetch(`${BASE}/${contentId}/assignments`, {
        credentials: 'include',
      });
      if (!res.ok)
        throw new Error('Erreur lors du chargement des assignations');
      const json = await res.json();
      return (json.data || []).map((a: Record<string, unknown>) => ({
        id: a.id,
        contentId: a.content_id,
        patientId: a.patient_id,
        assignedBy: a.assigned_by,
        note: a.note,
        assignedAt: a.assigned_at,
        patientName: a.patient_name,
      }));
    },
    enabled: !!contentId,
  });
}

export function useAssignContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      patientIds,
      note,
    }: {
      contentId: string;
      patientIds: string[];
      note?: string;
    }) => {
      const res = await fetch(`${BASE}/${contentId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ patient_ids: patientIds, note }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Erreur lors de l'assignation");
      }
      return (await res.json()).data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['content-assignments', variables.contentId],
      });
    },
  });
}

export function useRemoveAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      assignmentId,
    }: {
      contentId: string;
      assignmentId: string;
    }) => {
      const res = await fetch(
        `${BASE}/${contentId}/assignments/${assignmentId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la suppression');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['content-assignments', variables.contentId],
      });
    },
  });
}

// =====================================================
// COMMENTS (CONTENT-N-013) - Nutritionist side
// =====================================================

interface CommentsResponse {
  comments: ContentComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useContentComments(
  contentId: string | null,
  page = 1,
  limit = 20
) {
  return useQuery<CommentsResponse>({
    queryKey: ['content-comments', contentId, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`${BASE}/${contentId}/comments?${params}`, {
        credentials: 'include',
      });
      if (!res.ok)
        throw new Error('Erreur lors du chargement des commentaires');
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

export function useReplyToComment() {
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
        queryKey: ['content-comments', variables.contentId],
      });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      commentId,
    }: {
      contentId: string;
      commentId: string;
    }) => {
      const res = await fetch(`${BASE}/${contentId}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la suppression');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['content-comments', variables.contentId],
      });
    },
  });
}

// =====================================================
// STATISTICS (CONTENT-N-011)
// =====================================================

export function useContentStats() {
  return useQuery<ContentStats>({
    queryKey: ['content-stats'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/stats`, { credentials: 'include' });
      if (!res.ok)
        throw new Error('Erreur lors du chargement des statistiques');
      const json = await res.json();
      return json.data;
    },
  });
}

// =====================================================
// FEATURED (CONTENT-N-009)
// =====================================================

export function useFeaturedContents() {
  return useQuery<EducationalContent[]>({
    queryKey: ['featured-contents'],
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

export function useUpdateFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentIds: string[]) => {
      const res = await fetch(`${BASE}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content_ids: contentIds }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur lors de la mise à jour');
      }
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-contents'] });
      queryClient.invalidateQueries({ queryKey: ['nutritionist-contents'] });
    },
  });
}
