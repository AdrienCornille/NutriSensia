// =============================================================================
// Types — Questionnaire templates (QUEST-TPL-001)
// Mirrors the DB schema in database/migrations/add_questionnaire_templates.sql
// =============================================================================

export type QuestionnaireCategory =
  | 'regular_followup'
  | 'around_consultation'
  | 'deep_dive';

export type QuestionnaireDispatchMode =
  | 'recurring'
  | 'event_triggered'
  | 'manual_only';

export type QuestionnaireQuestionType =
  | 'scale'
  | 'percent'
  | 'single_choice'
  | 'multi_choice'
  | 'free_text'
  | 'number'
  | 'time'
  | 'bristol';

export type QuestionnaireDisplayOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'greater_than'
  | 'less_than'
  | 'is_answered';

export interface QuestionnaireQuestionOption {
  id: string;
  value: string;
  label: string;
  position: number;
  score_value: number | null;
  is_exclusive: boolean;
}

export interface QuestionnaireDisplayRule {
  id: string;
  depends_on_question_id: string;
  operator: QuestionnaireDisplayOperator;
  expected_value: unknown;
}

export interface QuestionnaireQuestion {
  id: string;
  key: string;
  position: number;
  label: string;
  help_text: string | null;
  type: QuestionnaireQuestionType;
  is_required: boolean;
  is_scored: boolean;
  scale_min: number | null;
  scale_max: number | null;
  scale_min_label: string | null;
  scale_max_label: string | null;
  number_min: number | null;
  number_max: number | null;
  options: QuestionnaireQuestionOption[];
  display_rules: QuestionnaireDisplayRule[];
}

export interface QuestionnaireTemplateScoringRule {
  id: string;
  method: string;
  match_value: string;
  threshold: number;
  is_patient_visible: boolean;
}

export interface QuestionnaireTemplateVersion {
  id: string;
  version: number;
  is_published: boolean;
  published_at: string | null;
  notes: string | null;
  questions: QuestionnaireQuestion[];
  scoring_rule: QuestionnaireTemplateScoringRule | null;
}

export interface QuestionnaireTemplate {
  id: string;
  key: string;
  category: QuestionnaireCategory;
  title: string;
  description: string | null;
  dispatch_mode: QuestionnaireDispatchMode;
  is_sensitive: boolean;
  is_clinical_screening: boolean;
  estimated_minutes: number | null;
  active: boolean;
  is_system: boolean;
  created_by: string | null;
  current_version: QuestionnaireTemplateVersion;
}

export const CATEGORY_LABELS: Record<QuestionnaireCategory, string> = {
  regular_followup: 'Suivi régulier',
  around_consultation: 'Autour de la consultation',
  deep_dive: 'Approfondissement',
};

export const CATEGORY_ORDER: QuestionnaireCategory[] = [
  'regular_followup',
  'around_consultation',
  'deep_dive',
];
