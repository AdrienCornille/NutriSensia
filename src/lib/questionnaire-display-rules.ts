/**
 * Display-rule evaluator — shared between the patient form (P2.C.2 client)
 * and the submit endpoint (P2.C.1 server). A question is "visible" when
 * ALL of its display_rules are satisfied (AND-conjunction); a question
 * with no rules is always visible.
 *
 * The evaluator pulls a "comparable value" from each answer — what counts
 * depends on the question type:
 *   - scale/percent/number/bristol → numeric value
 *   - free_text → text
 *   - time → text
 *   - single_choice → the option's value (slug), not the option_id
 *   - multi_choice → array of option values
 */

import type {
  PatientQuestion,
  PatientAnswer,
} from '@/types/patient-questionnaires';

function comparableValue(
  question: PatientQuestion,
  answer: PatientAnswer | undefined
): string | number | string[] | null {
  if (!answer) return null;
  switch (question.type) {
    case 'scale':
    case 'percent':
    case 'number':
    case 'bristol':
      return answer.value_numeric ?? null;
    case 'free_text':
      return answer.value_text ?? null;
    case 'time':
      return answer.value_time ?? null;
    case 'single_choice': {
      const optId = answer.value_option_id;
      if (!optId) return null;
      const opt = question.options.find(o => o.id === optId);
      return opt?.value ?? null;
    }
    case 'multi_choice': {
      const ids = answer.selected_option_ids || [];
      return question.options.filter(o => ids.includes(o.id)).map(o => o.value);
    }
  }
}

function isAnswered(
  question: PatientQuestion,
  answer: PatientAnswer | undefined
): boolean {
  const v = comparableValue(question, answer);
  if (v === null || v === undefined) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.length > 0;
  // numbers (including 0) count as answered
  return true;
}

/**
 * Returns true if a question should be displayed given the current state of
 * answers. Caller passes the full question list (needed to resolve options
 * on dependency questions) and a map of question_id → answer.
 */
export function isQuestionVisible(
  question: PatientQuestion,
  allQuestions: PatientQuestion[],
  answersByQuestionId: Map<string, PatientAnswer>
): boolean {
  if (!question.display_rules || question.display_rules.length === 0) {
    return true;
  }
  const questionsById = new Map<string, PatientQuestion>();
  for (const q of allQuestions) questionsById.set(q.id, q);

  return question.display_rules.every(rule => {
    const dep = questionsById.get(rule.depends_on_question_id);
    if (!dep) return false;

    const depAnswer = answersByQuestionId.get(rule.depends_on_question_id);

    if (rule.operator === 'is_answered') {
      return isAnswered(dep, depAnswer);
    }

    const depValue = comparableValue(dep, depAnswer);
    if (depValue === null) return false;

    // Defensive: PostgREST normally returns JSONB as parsed JS values, but
    // some configurations return raw JSON strings. Normalize here so we
    // compare apples to apples regardless of the upstream behaviour.
    const expected = normalizeJsonbValue(rule.expected_value);

    return evaluateRule(rule.operator, depValue, expected);
  });
}

function evaluateRule(
  operator: string,
  depValue: string | number | string[],
  expected: unknown
): boolean {
  switch (operator) {
    case 'equals':
      return Array.isArray(depValue)
        ? depValue.includes(String(expected))
        : depValue === expected;
    case 'not_equals':
      return Array.isArray(depValue)
        ? !depValue.includes(String(expected))
        : depValue !== expected;
    case 'in': {
      if (!Array.isArray(expected)) return false;
      if (Array.isArray(depValue)) {
        return depValue.some(v => (expected as unknown[]).includes(v));
      }
      return (expected as unknown[]).includes(depValue);
    }
    case 'greater_than':
      return (
        typeof depValue === 'number' &&
        typeof expected === 'number' &&
        depValue > expected
      );
    case 'less_than':
      return (
        typeof depValue === 'number' &&
        typeof expected === 'number' &&
        depValue < expected
      );
    default:
      return false;
  }
}

/**
 * PostgREST usually returns JSONB as parsed JS values, but if a particular
 * stack returns the raw JSON string (e.g. `'"oui"'` or `'["a","b"]'`), this
 * helper recovers the underlying value so the evaluator works either way.
 */
function normalizeJsonbValue(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  const trimmed = raw.trim();
  if (
    trimmed.startsWith('"') ||
    trimmed.startsWith('[') ||
    trimmed.startsWith('{') ||
    trimmed === 'true' ||
    trimmed === 'false' ||
    trimmed === 'null' ||
    /^-?\d/.test(trimmed)
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return raw;
    }
  }
  return raw;
}

/** Convenience: list of visible questions in render order. */
export function visibleQuestions(
  questions: PatientQuestion[],
  answersByQuestionId: Map<string, PatientAnswer>
): PatientQuestion[] {
  return questions
    .slice()
    .sort((a, b) => a.position - b.position)
    .filter(q => isQuestionVisible(q, questions, answersByQuestionId));
}

/** Server-side: list visible required questions that have no answer yet. */
export function missingRequiredAnswers(
  questions: PatientQuestion[],
  answers: PatientAnswer[]
): { question_id: string; label: string }[] {
  const answersByQuestionId = new Map<string, PatientAnswer>();
  for (const a of answers) answersByQuestionId.set(a.question_id, a);

  const visible = visibleQuestions(questions, answersByQuestionId);
  return visible
    .filter(q => q.is_required && !isAnswered(q, answersByQuestionId.get(q.id)))
    .map(q => ({ question_id: q.id, label: q.label }));
}
