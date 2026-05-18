/**
 * Types — Patient-side questionnaire flow (P2.C)
 * Mirrors the rich schema introduced in P2.A so the patient UI can render
 * all question types (scale anchored, percent, bristol, multi-choice with
 * exclusive options, time, branching display rules).
 */

import type {
  QuestionnaireCategory,
  QuestionnaireQuestionType,
  QuestionnaireDisplayOperator,
} from './questionnaire-templates';

// ── Inbox (list) ─────────────────────────────────────────────────────────

export type PatientResponseStatus = 'in_progress' | 'submitted';

export interface PatientInboxItem {
  // assignment id — the patient-visible identifier
  id: string;
  title: string;
  description: string | null;
  category: QuestionnaireCategory;
  estimated_minutes: number | null;
  is_sensitive: boolean;
  is_clinical_screening: boolean;
  // status as seen by the patient (derived from response.status, not assignment.status)
  status: PatientResponseStatus;
  sent_at: string | null;
  due_at: string | null;
  submitted_at: string | null;
  question_count: number;
  answered_count: number;
}

// ── Detail (full questionnaire with current answers) ─────────────────────

export interface PatientQuestionOption {
  id: string;
  value: string;
  label: string;
  position: number;
  is_exclusive: boolean;
}

export interface PatientDisplayRule {
  id: string;
  depends_on_question_id: string;
  operator: QuestionnaireDisplayOperator;
  expected_value: unknown;
}

export interface PatientQuestion {
  id: string;
  key: string;
  position: number;
  label: string;
  help_text: string | null;
  type: QuestionnaireQuestionType;
  is_required: boolean;
  scale_min: number | null;
  scale_max: number | null;
  scale_min_label: string | null;
  scale_max_label: string | null;
  number_min: number | null;
  number_max: number | null;
  options: PatientQuestionOption[];
  display_rules: PatientDisplayRule[];
}

export interface PatientAnswer {
  question_id: string;
  value_numeric: number | null;
  value_text: string | null;
  value_time: string | null;
  value_option_id: string | null;
  // For multi_choice: ids of all currently-selected options.
  selected_option_ids: string[];
}

export interface PatientQuestionnaireDetail {
  id: string;
  title: string;
  description: string | null;
  category: QuestionnaireCategory;
  is_sensitive: boolean;
  is_clinical_screening: boolean;
  estimated_minutes: number | null;
  sent_at: string | null;
  due_at: string | null;
  submitted_at: string | null;
  response_id: string;
  status: PatientResponseStatus;
  questions: PatientQuestion[];
  answers: PatientAnswer[];
}

// ── Save / submit payloads ───────────────────────────────────────────────

export interface SaveAnswerPayload {
  value_numeric?: number | null;
  value_text?: string | null;
  value_time?: string | null;
  value_option_id?: string | null;
  // For multi_choice — full replacement set.
  selected_option_ids?: string[] | null;
}

export interface SubmitResult {
  ok: true;
  submitted_at: string;
}

export interface SubmitValidationError {
  ok: false;
  missing_required: { question_id: string; label: string }[];
}
