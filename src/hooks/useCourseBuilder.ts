'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BASE = '/api/protected/nutritionist/content';

// Helper fetch
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Erreur');
  return json.data as T;
}

async function apiMutate<T>(
  url: string,
  method: string,
  data?: unknown
): Promise<T> {
  return apiFetch<T>(url, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
}

// ─── Chapitres ───

export function useCourseChapters(courseId: string | null) {
  return useQuery({
    queryKey: ['course-chapters', courseId],
    queryFn: () => apiFetch<any[]>(`${BASE}/${courseId}/chapters`),
    enabled: !!courseId,
  });
}

export function useCourseChapter(
  courseId: string | null,
  chapterId: string | null
) {
  return useQuery({
    queryKey: ['course-chapter', courseId, chapterId],
    queryFn: () => apiFetch<any>(`${BASE}/${courseId}/chapters/${chapterId}`),
    enabled: !!courseId && !!chapterId,
  });
}

export function useCreateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: { title: string; description?: string | null };
    }) => apiMutate(`${BASE}/${courseId}/chapters`, 'POST', data),
    onSuccess: (_, v) =>
      qc.invalidateQueries({ queryKey: ['course-chapters', v.courseId] }),
  });
}

export function useUpdateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      chapterId,
      data,
    }: {
      courseId: string;
      chapterId: string;
      data: { title?: string; description?: string | null };
    }) => apiMutate(`${BASE}/${courseId}/chapters/${chapterId}`, 'PATCH', data),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['course-chapters', v.courseId] });
      qc.invalidateQueries({
        queryKey: ['course-chapter', v.courseId, v.chapterId],
      });
    },
  });
}

export function useDeleteChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      chapterId,
    }: {
      courseId: string;
      chapterId: string;
    }) =>
      apiFetch(`${BASE}/${courseId}/chapters/${chapterId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, v) =>
      qc.invalidateQueries({ queryKey: ['course-chapters', v.courseId] }),
  });
}

export function useReorderChapters() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      chapterIds,
    }: {
      courseId: string;
      chapterIds: string[];
    }) =>
      apiMutate(`${BASE}/${courseId}/chapters`, 'PATCH', {
        chapter_ids: chapterIds,
      }),
    onSuccess: (_, v) =>
      qc.invalidateQueries({ queryKey: ['course-chapters', v.courseId] }),
  });
}

// ─── Sections ───

export function useChapterSections(
  courseId: string | null,
  chapterId: string | null
) {
  return useQuery({
    queryKey: ['chapter-sections', courseId, chapterId],
    queryFn: () =>
      apiFetch<any[]>(`${BASE}/${courseId}/chapters/${chapterId}/sections`),
    enabled: !!courseId && !!chapterId,
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      chapterId,
      data,
    }: {
      courseId: string;
      chapterId: string;
      data: {
        title: string;
        section_type: 'blocks' | 'reference';
        referenced_content_id?: string | null;
      };
    }) =>
      apiMutate(
        `${BASE}/${courseId}/chapters/${chapterId}/sections`,
        'POST',
        data
      ),
    onSuccess: (_, v) => {
      qc.invalidateQueries({
        queryKey: ['chapter-sections', v.courseId, v.chapterId],
      });
      qc.invalidateQueries({ queryKey: ['course-chapters', v.courseId] });
    },
  });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      chapterId,
      sectionId,
      data,
    }: {
      courseId: string;
      chapterId: string;
      sectionId: string;
      data: any;
    }) =>
      apiMutate(
        `${BASE}/${courseId}/chapters/${chapterId}/sections/${sectionId}`,
        'PATCH',
        data
      ),
    onSuccess: (_, v) => {
      qc.invalidateQueries({
        queryKey: ['chapter-sections', v.courseId, v.chapterId],
      });
      qc.invalidateQueries({
        queryKey: ['section-blocks', v.courseId, v.chapterId, v.sectionId],
      });
    },
  });
}

export function useDeleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      chapterId,
      sectionId,
    }: {
      courseId: string;
      chapterId: string;
      sectionId: string;
    }) =>
      apiFetch(
        `${BASE}/${courseId}/chapters/${chapterId}/sections/${sectionId}`,
        { method: 'DELETE' }
      ),
    onSuccess: (_, v) => {
      qc.invalidateQueries({
        queryKey: ['chapter-sections', v.courseId, v.chapterId],
      });
      qc.invalidateQueries({ queryKey: ['course-chapters', v.courseId] });
    },
  });
}

export function useReorderSections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      chapterId,
      sectionIds,
    }: {
      courseId: string;
      chapterId: string;
      sectionIds: string[];
    }) =>
      apiMutate(`${BASE}/${courseId}/chapters/${chapterId}/sections`, 'PATCH', {
        section_ids: sectionIds,
      }),
    onSuccess: (_, v) =>
      qc.invalidateQueries({
        queryKey: ['chapter-sections', v.courseId, v.chapterId],
      }),
  });
}

// ─── Blocs ───

export function useSectionBlocks(
  courseId: string | null,
  chapterId: string | null,
  sectionId: string | null
) {
  return useQuery({
    queryKey: ['section-blocks', courseId, chapterId, sectionId],
    queryFn: () =>
      apiFetch<any[]>(
        `${BASE}/${courseId}/chapters/${chapterId}/sections/${sectionId}/blocks`
      ),
    enabled: !!courseId && !!chapterId && !!sectionId,
  });
}

export function useCreateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      chapterId,
      sectionId,
      data,
    }: {
      courseId: string;
      chapterId: string;
      sectionId: string;
      data: any;
    }) =>
      apiMutate(
        `${BASE}/${courseId}/chapters/${chapterId}/sections/${sectionId}/blocks`,
        'POST',
        data
      ),
    onSuccess: (_, v) =>
      qc.invalidateQueries({
        queryKey: ['section-blocks', v.courseId, v.chapterId, v.sectionId],
      }),
  });
}

export function useUpdateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      chapterId,
      sectionId,
      blockId,
      data,
    }: {
      courseId: string;
      chapterId: string;
      sectionId: string;
      blockId: string;
      data: any;
    }) =>
      apiMutate(
        `${BASE}/${courseId}/chapters/${chapterId}/sections/${sectionId}/blocks/${blockId}`,
        'PATCH',
        data
      ),
    onSuccess: (_, v) =>
      qc.invalidateQueries({
        queryKey: ['section-blocks', v.courseId, v.chapterId, v.sectionId],
      }),
  });
}

export function useDeleteBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      chapterId,
      sectionId,
      blockId,
    }: {
      courseId: string;
      chapterId: string;
      sectionId: string;
      blockId: string;
    }) =>
      apiFetch(
        `${BASE}/${courseId}/chapters/${chapterId}/sections/${sectionId}/blocks/${blockId}`,
        { method: 'DELETE' }
      ),
    onSuccess: (_, v) =>
      qc.invalidateQueries({
        queryKey: ['section-blocks', v.courseId, v.chapterId, v.sectionId],
      }),
  });
}

export function useReorderBlocks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      chapterId,
      sectionId,
      blockIds,
    }: {
      courseId: string;
      chapterId: string;
      sectionId: string;
      blockIds: string[];
    }) =>
      apiMutate(
        `${BASE}/${courseId}/chapters/${chapterId}/sections/${sectionId}/blocks`,
        'PATCH',
        { block_ids: blockIds }
      ),
    onMutate: async v => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      const key = ['section-blocks', v.courseId, v.chapterId, v.sectionId];
      await qc.cancelQueries({ queryKey: key });

      const previous = qc.getQueryData(key);

      // Optimistic update: reorder blocks locally
      qc.setQueryData(key, (old: any[] | undefined) => {
        if (!old) return old;
        const idToBlock = new Map(old.map((b: any) => [b.id, b]));
        return v.blockIds
          .map((id, i) => {
            const block = idToBlock.get(id);
            return block ? { ...block, sort_order: i } : null;
          })
          .filter(Boolean);
      });

      return { previous, key };
    },
    onError: (_err, _v, context) => {
      // Rollback on error
      if (context?.previous) {
        qc.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_, __, v) => {
      qc.invalidateQueries({
        queryKey: ['section-blocks', v.courseId, v.chapterId, v.sectionId],
      });
    },
  });
}

// ─── Quizz ───

export function useCourseQuizzes(courseId: string | null) {
  return useQuery({
    queryKey: ['course-quizzes', courseId],
    queryFn: () => apiFetch<any[]>(`${BASE}/${courseId}/quizzes`),
    enabled: !!courseId,
  });
}

export function useCourseQuiz(courseId: string | null, quizId: string | null) {
  return useQuery({
    queryKey: ['course-quiz', courseId, quizId],
    queryFn: () => apiFetch<any>(`${BASE}/${courseId}/quizzes/${quizId}`),
    enabled: !!courseId && !!quizId,
  });
}

export function useCreateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: {
        chapter_id?: string | null;
        title: string;
        description?: string | null;
        passing_score?: number;
      };
    }) => apiMutate(`${BASE}/${courseId}/quizzes`, 'POST', data),
    onSuccess: (_, v) =>
      qc.invalidateQueries({ queryKey: ['course-quizzes', v.courseId] }),
  });
}

export function useUpdateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      quizId,
      data,
    }: {
      courseId: string;
      quizId: string;
      data: any;
    }) => apiMutate(`${BASE}/${courseId}/quizzes/${quizId}`, 'PATCH', data),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['course-quizzes', v.courseId] });
      qc.invalidateQueries({ queryKey: ['course-quiz', v.courseId, v.quizId] });
    },
  });
}

export function useDeleteQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, quizId }: { courseId: string; quizId: string }) =>
      apiFetch(`${BASE}/${courseId}/quizzes/${quizId}`, { method: 'DELETE' }),
    onSuccess: (_, v) =>
      qc.invalidateQueries({ queryKey: ['course-quizzes', v.courseId] }),
  });
}

// ─── Questions ───

export function useQuizQuestions(
  courseId: string | null,
  quizId: string | null
) {
  return useQuery({
    queryKey: ['quiz-questions', courseId, quizId],
    queryFn: () =>
      apiFetch<any[]>(`${BASE}/${courseId}/quizzes/${quizId}/questions`),
    enabled: !!courseId && !!quizId,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      quizId,
      data,
    }: {
      courseId: string;
      quizId: string;
      data: any;
    }) =>
      apiMutate(
        `${BASE}/${courseId}/quizzes/${quizId}/questions`,
        'POST',
        data
      ),
    onSuccess: (_, v) => {
      qc.invalidateQueries({
        queryKey: ['quiz-questions', v.courseId, v.quizId],
      });
      qc.invalidateQueries({ queryKey: ['course-quiz', v.courseId, v.quizId] });
    },
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      quizId,
      questionId,
      data,
    }: {
      courseId: string;
      quizId: string;
      questionId: string;
      data: any;
    }) =>
      apiMutate(
        `${BASE}/${courseId}/quizzes/${quizId}/questions/${questionId}`,
        'PATCH',
        data
      ),
    onSuccess: (result, v) => {
      // Update cache in-place instead of refetching (avoids re-render flicker)
      qc.setQueryData(
        ['quiz-questions', v.courseId, v.quizId],
        (old: any[] | undefined) => {
          if (!old) return old;
          return old.map((q: any) =>
            q.id === v.questionId ? { ...q, ...result } : q
          );
        }
      );
    },
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      quizId,
      questionId,
    }: {
      courseId: string;
      quizId: string;
      questionId: string;
    }) =>
      apiFetch(
        `${BASE}/${courseId}/quizzes/${quizId}/questions/${questionId}`,
        { method: 'DELETE' }
      ),
    onSuccess: (_, v) => {
      qc.invalidateQueries({
        queryKey: ['quiz-questions', v.courseId, v.quizId],
      });
      qc.invalidateQueries({ queryKey: ['course-quiz', v.courseId, v.quizId] });
    },
  });
}

export function useReorderQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      quizId,
      questionIds,
    }: {
      courseId: string;
      quizId: string;
      questionIds: string[];
    }) =>
      apiMutate(`${BASE}/${courseId}/quizzes/${quizId}/questions`, 'PATCH', {
        question_ids: questionIds,
      }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({
        queryKey: ['quiz-questions', v.courseId, v.quizId],
      });
    },
  });
}

// ─── Prerequis ───

export function useCoursePrerequisites(courseId: string | null) {
  return useQuery({
    queryKey: ['course-prerequisites', courseId],
    queryFn: () => apiFetch<any[]>(`${BASE}/${courseId}/prerequisites`),
    enabled: !!courseId,
  });
}

export function useAddPrerequisite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: {
        prerequisite_course_id: string;
        require_completion?: boolean;
        require_quiz_score?: boolean;
        min_quiz_score?: number;
      };
    }) => apiMutate(`${BASE}/${courseId}/prerequisites`, 'POST', data),
    onSuccess: (_, v) =>
      qc.invalidateQueries({ queryKey: ['course-prerequisites', v.courseId] }),
  });
}

export function useRemovePrerequisite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      prerequisiteCourseId,
    }: {
      courseId: string;
      prerequisiteCourseId: string;
    }) =>
      apiMutate(`${BASE}/${courseId}/prerequisites`, 'DELETE', {
        prerequisite_course_id: prerequisiteCourseId,
      }),
    onSuccess: (_, v) =>
      qc.invalidateQueries({ queryKey: ['course-prerequisites', v.courseId] }),
  });
}

// ─── Badge ───

export function useCourseBadge(courseId: string | null) {
  return useQuery({
    queryKey: ['course-badge', courseId],
    queryFn: () => apiFetch<any>(`${BASE}/${courseId}/badge`),
    enabled: !!courseId,
  });
}

export function useUpsertBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: { badge_name: string; badge_icon: string; points_awarded?: number };
    }) => apiMutate(`${BASE}/${courseId}/badge`, 'POST', data),
    onSuccess: (_, v) =>
      qc.invalidateQueries({ queryKey: ['course-badge', v.courseId] }),
  });
}

// ─── Duplication ───

export function useDuplicateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      newTitle,
    }: {
      courseId: string;
      newTitle: string;
    }) =>
      apiMutate<{ new_course_id: string }>(
        `${BASE}/${courseId}/duplicate`,
        'POST',
        { new_title: newTitle }
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['nutritionist-contents'] }),
  });
}

// ─── Progress (nutritionist view) ───

export function useCourseProgressOverview(courseId: string | null) {
  return useQuery({
    queryKey: ['course-progress-overview', courseId],
    queryFn: () => apiFetch<any[]>(`${BASE}/${courseId}/progress`),
    enabled: !!courseId,
  });
}

export function usePatientCourseProgressDetail(
  courseId: string | null,
  patientId: string | null
) {
  return useQuery({
    queryKey: ['course-progress-detail', courseId, patientId],
    queryFn: () =>
      apiFetch<any>(`${BASE}/${courseId}/progress?patient_id=${patientId}`),
    enabled: !!courseId && !!patientId,
  });
}
