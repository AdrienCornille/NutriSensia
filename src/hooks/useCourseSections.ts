'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BASE = '/api/protected/nutritionist/content';

export interface CourseSection {
  id: string;
  course_id: string;
  sort_order: number;
  title: string;
  section_type: 'original' | 'reference';
  body: string | null;
  referenced_content_id: string | null;
  referenced_content?: {
    id: string;
    title: string;
    type: string;
    thumbnail_url: string | null;
    status: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export function useCourseSections(courseId: string | null) {
  return useQuery<CourseSection[]>({
    queryKey: ['course-sections', courseId],
    queryFn: async () => {
      const res = await fetch(`${BASE}/${courseId}/sections`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des sections');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!courseId,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      data,
    }: {
      courseId: string;
      data: {
        title: string;
        section_type: 'original' | 'reference';
        body?: string;
        referenced_content_id?: string;
      };
    }) => {
      const res = await fetch(`${BASE}/${courseId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur');
      }
      return (await res.json()).data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['course-sections', variables.courseId],
      });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      sectionId,
      data,
    }: {
      courseId: string;
      sectionId: string;
      data: { title?: string; body?: string; referenced_content_id?: string };
    }) => {
      const res = await fetch(`${BASE}/${courseId}/sections/${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur');
      }
      return (await res.json()).data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['course-sections', variables.courseId],
      });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      sectionId,
    }: {
      courseId: string;
      sectionId: string;
    }) => {
      const res = await fetch(`${BASE}/${courseId}/sections/${sectionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['course-sections', variables.courseId],
      });
    },
  });
}

export function useReorderSections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      sectionIds,
    }: {
      courseId: string;
      sectionIds: string[];
    }) => {
      const res = await fetch(`${BASE}/${courseId}/sections`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ section_ids: sectionIds }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['course-sections', variables.courseId],
      });
    },
  });
}
