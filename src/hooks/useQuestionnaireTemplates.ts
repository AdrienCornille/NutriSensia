/**
 * React Query hook — Questionnaire templates (QUEST-TPL-001)
 * Returns templates accessible to the current nutritionist
 * (system templates + their own user-created templates).
 */

import { useQuery } from '@tanstack/react-query';
import type { QuestionnaireTemplate } from '@/types/questionnaire-templates';

export const questionnaireTemplatesKeys = {
  all: ['questionnaire-templates'] as const,
  list: () => [...questionnaireTemplatesKeys.all, 'list'] as const,
};

async function fetchTemplates(): Promise<QuestionnaireTemplate[]> {
  const res = await fetch(
    '/api/protected/nutritionist/questionnaire-templates',
    {
      credentials: 'include',
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Erreur de chargement des templates');
  }
  const json = await res.json();
  return (json.data?.templates ??
    json.templates ??
    []) as QuestionnaireTemplate[];
}

export function useQuestionnaireTemplates() {
  return useQuery({
    queryKey: questionnaireTemplatesKeys.list(),
    queryFn: fetchTemplates,
    // Templates change rarely — keep them cached for the session.
    staleTime: 1000 * 60 * 30,
  });
}
