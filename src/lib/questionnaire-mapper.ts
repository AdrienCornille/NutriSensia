/**
 * Bridge between the new assignment/response model (P2.A) and the legacy
 * QuestionnaireDetail shape consumed by the existing UI components.
 *
 * The UI was built for follow_up_questionnaires (single row with
 * questions/answers as JSONB). The new model splits the data across
 * 5 tables, so the API flattens it back to the legacy shape so we
 * don't have to touch any component in P2.B. The richer model becomes
 * fully visible to the UI in P2.C (patient response flow).
 */

import type {
  QuestionnaireDetail,
  QuestionnaireQuestion,
  QuestionnaireAnswer,
} from '@/types/nutritionist-dossier';

// ── Type aliases for the new schema ──────────────────────────────────────

type NewQuestionType =
  | 'scale'
  | 'percent'
  | 'single_choice'
  | 'multi_choice'
  | 'free_text'
  | 'number'
  | 'time'
  | 'bristol';

type LegacyQuestionType = 'text' | 'scale' | 'choice' | 'boolean' | 'number';

interface NewOption {
  id: string;
  value: string;
  label: string;
  position: number;
}

interface NewQuestion {
  id: string;
  key: string;
  position: number;
  label: string;
  type: NewQuestionType;
  is_required: boolean;
  options?: NewOption[] | null;
}

interface NewAnswer {
  id: string;
  question_id: string;
  value_numeric: number | null;
  value_text: string | null;
  value_time: string | null;
  value_option_id: string | null;
  selected_options?: { option: NewOption | null }[] | null;
}

interface NewResponse {
  id: string;
  status: 'in_progress' | 'submitted';
  answers?: NewAnswer[] | null;
}

interface NewTemplate {
  category: string;
  title: string;
}

interface NewTemplateVersion {
  template: NewTemplate | NewTemplate[] | null;
  questions: NewQuestion[] | null;
}

interface AssignmentRow {
  id: string;
  patient_id: string;
  consultation_id: string | null;
  status: string;
  sent_at: string | null;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  template_version: NewTemplateVersion | NewTemplateVersion[] | null;
  response: NewResponse | NewResponse[] | null;
}

// ── Mapping helpers ──────────────────────────────────────────────────────

const CATEGORY_TO_TYPE: Record<string, string> = {
  regular_followup: 'Suivi',
  around_consultation: 'Feedback',
  deep_dive: 'Approfondissement',
};

/**
 * Maps the rich new question type to the legacy 5-value enum used by the
 * existing card / preview components. Lossy by design (multi_choice and
 * single_choice both collapse to 'choice'; percent/bristol fall back to
 * 'scale'; time falls back to 'text').
 */
function mapTypeToLegacy(t: NewQuestionType): LegacyQuestionType {
  switch (t) {
    case 'free_text':
      return 'text';
    case 'time':
      return 'text';
    case 'scale':
    case 'percent':
    case 'bristol':
      return 'scale';
    case 'single_choice':
    case 'multi_choice':
      return 'choice';
    case 'number':
      return 'number';
  }
}

function mapStatusToLegacy(assignmentStatus: string): string {
  if (assignmentStatus === 'completed') return 'completed';
  // sent / in_progress / scheduled / expired / cancelled all collapse to "pending"
  // for the legacy card's display logic. "expired" → still considered pending
  // (the card derives an "overdue" badge on its own from due_date).
  return 'pending';
}

/** Supabase returns hasOne relations as either a single object or a 1-element array. */
function unwrap<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function questionTypeOf(q: NewQuestion): {
  legacy: LegacyQuestionType;
  original: NewQuestionType;
} {
  return { legacy: mapTypeToLegacy(q.type), original: q.type };
}

function answerScalar(
  answer: NewAnswer,
  originalType: NewQuestionType,
  optionsById: Map<string, NewOption>
): string | number | boolean {
  switch (originalType) {
    case 'scale':
    case 'percent':
    case 'bristol':
    case 'number':
      return answer.value_numeric ?? 0;
    case 'free_text':
      return answer.value_text ?? '';
    case 'time':
      return answer.value_time ?? '';
    case 'single_choice': {
      if (!answer.value_option_id) return '';
      const opt = optionsById.get(answer.value_option_id);
      return opt?.label ?? '';
    }
    case 'multi_choice': {
      const selected = answer.selected_options || [];
      const labels = selected
        .map(s => s.option?.label)
        .filter(Boolean) as string[];
      return labels.join(', ');
    }
  }
}

/**
 * Flattens an assignment + its joined template/version/questions/options
 * + its response/answers/selected_options into a QuestionnaireDetail
 * matching what the legacy UI expects.
 */
export function assignmentToQuestionnaireDetail(
  row: AssignmentRow
): QuestionnaireDetail {
  const version = unwrap(row.template_version);
  const template = unwrap(version?.template);
  const response = unwrap(row.response);

  const rawQuestions = (version?.questions ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);

  // Index for O(1) option lookups while mapping answers.
  const optionsById = new Map<string, NewOption>();
  for (const q of rawQuestions) {
    for (const opt of q.options || []) optionsById.set(opt.id, opt);
  }

  const questions: QuestionnaireQuestion[] = rawQuestions.map(q => {
    const { legacy } = questionTypeOf(q);
    const opts = (q.options ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(o => o.label);
    return {
      id: q.id,
      question: q.label,
      type: legacy,
      options: opts.length > 0 ? opts : undefined,
      required: q.is_required,
    };
  });

  // Index questions by id so we can resolve original type when mapping answers.
  const questionsById = new Map<string, NewQuestion>();
  for (const q of rawQuestions) questionsById.set(q.id, q);

  const answers: QuestionnaireAnswer[] = (response?.answers ?? []).map(a => {
    const originalType = questionsById.get(a.question_id)?.type ?? 'free_text';
    return {
      question_id: a.question_id,
      answer: answerScalar(a, originalType, optionsById),
    };
  });

  return {
    id: row.id,
    patient_id: row.patient_id,
    title: template?.title ?? '(sans titre)',
    questionnaire_type: CATEGORY_TO_TYPE[template?.category ?? ''] ?? 'Suivi',
    status: mapStatusToLegacy(row.status),
    due_date: row.due_at,
    completed_at: row.completed_at,
    questions,
    answers: answers.length > 0 ? answers : null,
    consultation_id: row.consultation_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ── Legacy → new type mapping (for POST creation) ────────────────────────

export function mapLegacyTypeToNew(t: LegacyQuestionType): NewQuestionType {
  switch (t) {
    case 'text':
      return 'free_text';
    case 'scale':
      return 'scale';
    case 'choice':
      return 'single_choice';
    case 'boolean':
      return 'single_choice';
    case 'number':
      return 'number';
  }
}

/**
 * Builds a stable enough key for ad-hoc draft templates. The key column is
 * UNIQUE so we prefix with `draft_` + a random suffix to avoid collisions
 * with system templates and with each other.
 */
export function makeDraftTemplateKey(): string {
  // 8 hex chars from a UUID is plenty for collision-resistance across one
  // nutritionist's catalog. Full UUID would work but is verbose in logs.
  const suffix = (
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16)
  )
    .replace(/-/g, '')
    .slice(0, 12);
  return `draft_${suffix}`;
}

/**
 * Pre-shaped Supabase select for fetching an assignment row with everything
 * the mapper needs in one query. Centralised so list and detail routes stay
 * in sync.
 */
export const ASSIGNMENT_SELECT = `
  id, patient_id, consultation_id, status,
  sent_at, due_at, completed_at, created_at, updated_at,
  template_version:questionnaire_template_versions!template_version_id (
    template:questionnaire_templates!template_id ( category, title ),
    questions:questionnaire_questions!template_version_id (
      id, key, position, label, type, is_required,
      options:questionnaire_question_options!question_id (
        id, value, label, position
      )
    )
  ),
  response:questionnaire_responses!assignment_id (
    id, status,
    answers:response_answers!response_id (
      id, question_id,
      value_numeric, value_text, value_time, value_option_id,
      selected_options:response_answer_options!response_answer_id (
        option:questionnaire_question_options!option_id (
          id, value, label, position
        )
      )
    )
  )
` as const;
