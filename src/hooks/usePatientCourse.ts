'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BASE = '/api/protected/content';

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

// ─── Vue complete du cours ───

export interface CourseOverviewData {
  course: any;
  chapters: any[];
  quizzes: any[];
  badge: any | null;
  prerequisites: any[];
  totalSections: number;
  completedSections: number;
  completionPercent: number;
  nextSectionId: string | null;
  canAccess: boolean;
}

export function usePatientCourseOverview(contentId: string | null) {
  return useQuery({
    queryKey: ['patient-course', contentId],
    queryFn: () => apiFetch<CourseOverviewData>(`${BASE}/${contentId}/course`),
    enabled: !!contentId,
  });
}

// ─── Acces section (contenu complet) ───

export interface SectionViewData {
  section: any;
  blocks: any[];
  navigation: {
    prevSectionId: string | null;
    nextSectionId: string | null;
    currentIndex: number;
    totalSections: number;
  };
}

export function usePatientSection(
  contentId: string | null,
  sectionId: string | null
) {
  return useQuery({
    queryKey: ['patient-section', contentId, sectionId],
    queryFn: () =>
      apiFetch<SectionViewData>(`${BASE}/${contentId}/sections/${sectionId}`),
    enabled: !!contentId && !!sectionId,
  });
}

// ─── Marquer section terminee ───

export function useCompleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      contentId,
      sectionId,
    }: {
      contentId: string;
      sectionId: string;
    }) =>
      apiMutate(`${BASE}/${contentId}/sections/${sectionId}/complete`, 'POST'),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['patient-course', v.contentId] });
      qc.invalidateQueries({
        queryKey: ['patient-section', v.contentId, v.sectionId],
      });
    },
  });
}

// ─── Tracker temps passe ───

export function useTrackSectionTime() {
  return useMutation({
    mutationFn: ({
      contentId,
      sectionId,
      seconds,
    }: {
      contentId: string;
      sectionId: string;
      seconds: number;
    }) =>
      apiMutate(`${BASE}/${contentId}/sections/${sectionId}/time`, 'POST', {
        seconds,
      }),
  });
}

// ─── Quizz ───

export function usePatientQuiz(
  contentId: string | null,
  quizId: string | null
) {
  return useQuery({
    queryKey: ['patient-quiz', contentId, quizId],
    queryFn: () =>
      apiFetch<any>(`${BASE}/${contentId}/quizzes/${quizId}/submit`),
    enabled: false, // Only fetched via quiz questions from course overview
  });
}

export interface QuizSubmitResult {
  score: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  results: {
    question_id: string;
    correct: boolean;
    explanation: string | null;
  }[];
}

export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      contentId,
      quizId,
      answers,
    }: {
      contentId: string;
      quizId: string;
      answers: any[];
    }) =>
      apiMutate<QuizSubmitResult>(
        `${BASE}/${contentId}/quizzes/${quizId}/submit`,
        'POST',
        { answers }
      ),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['patient-course', v.contentId] });
    },
  });
}

// ─── Verification prerequis ───

export interface CanAccessResult {
  can_access: boolean;
  unmet_prerequisites: {
    course_id: string;
    course_title: string;
    require_completion: boolean;
    require_quiz_score: boolean;
    current_completion: number;
    current_quiz_score: number;
    min_quiz_score: number;
  }[];
}

export function useCanAccessCourse(contentId: string | null) {
  return useQuery({
    queryKey: ['can-access-course', contentId],
    queryFn: () => apiFetch<CanAccessResult>(`${BASE}/${contentId}/can-access`),
    enabled: !!contentId,
  });
}

// ─── Badges gagnes ───

export function useEarnedBadges() {
  return useQuery({
    queryKey: ['earned-badges'],
    queryFn: () => apiFetch<any[]>(`${BASE}/badges`),
    enabled: true,
  });
}
