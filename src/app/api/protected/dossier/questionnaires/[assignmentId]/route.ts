import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import type {
  PatientQuestionnaireDetail,
  PatientQuestion,
  PatientAnswer,
} from '@/types/patient-questionnaires';

// =============================================================================
// GET /api/protected/dossier/questionnaires/[assignmentId]
// Full detail of a single questionnaire (questions + display rules + current
// answers). The patient form (P2.C.2) renders from this payload.
// =============================================================================
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { assignmentId } = await params;
    if (!assignmentId) {
      return apiResponse.error('ID requis', 400);
    }

    const supabase = await createClient();

    // We fetch the assignment + everything that joins cleanly via single-FK
    // embeds. display_rules has TWO FKs to questionnaire_questions
    // (question_id + depends_on_question_id) and the PostgREST disambiguation
    // proved unreliable across versions, so we pull display_rules in a
    // separate query below and merge them in.
    const { data, error } = await (supabase as any)
      .from('questionnaire_assignments')
      .select(
        `
        id, sent_at, due_at, completed_at,
        template_version:questionnaire_template_versions!template_version_id (
          template:questionnaire_templates!template_id (
            title, description, category,
            is_sensitive, is_clinical_screening, estimated_minutes
          ),
          questions:questionnaire_questions!template_version_id (
            id, key, position, label, help_text, type, is_required,
            scale_min, scale_max, scale_min_label, scale_max_label,
            number_min, number_max,
            options:questionnaire_question_options!question_id (
              id, value, label, position, is_exclusive
            )
          )
        ),
        response:questionnaire_responses!assignment_id (
          id, status, submitted_at,
          answers:response_answers!response_id (
            id, question_id,
            value_numeric, value_text, value_time, value_option_id,
            selected_options:response_answer_options!response_answer_id (
              option:questionnaire_question_options!option_id ( id )
            )
          )
        )
      `
      )
      .eq('id', assignmentId)
      .eq('patient_id', auth.user.id)
      .single();

    if (error || !data) {
      return apiResponse.notFound('Questionnaire introuvable');
    }

    const version = Array.isArray(data.template_version)
      ? data.template_version[0]
      : data.template_version;
    const template = Array.isArray(version?.template)
      ? version.template[0]
      : version?.template;
    const response = Array.isArray(data.response)
      ? data.response[0]
      : data.response;

    if (!template || !version || !response) {
      return apiResponse.serverError('Questionnaire corrompu');
    }

    // 2nd query: display_rules for every question in this version.
    // We pull them separately because the table has two FKs to
    // questionnaire_questions (question_id + depends_on_question_id) and the
    // PostgREST disambiguation proved unreliable across versions.
    const questionIds = (version.questions || []).map((q: any) => q.id);
    const rulesByQuestionId = new Map<string, any[]>();
    if (questionIds.length > 0) {
      const { data: rules } = await (supabase as any)
        .from('questionnaire_question_display_rules')
        .select(
          'id, question_id, depends_on_question_id, operator, expected_value'
        )
        .in('question_id', questionIds);
      for (const r of rules || []) {
        const list = rulesByQuestionId.get(r.question_id) || [];
        list.push(r);
        rulesByQuestionId.set(r.question_id, list);
      }
    }

    const questions: PatientQuestion[] = (version.questions || [])
      .slice()
      .sort((a: any, b: any) => a.position - b.position)
      .map(
        (q: any): PatientQuestion => ({
          id: q.id,
          key: q.key,
          position: q.position,
          label: q.label,
          help_text: q.help_text,
          type: q.type,
          is_required: q.is_required,
          scale_min: q.scale_min,
          scale_max: q.scale_max,
          scale_min_label: q.scale_min_label,
          scale_max_label: q.scale_max_label,
          number_min: q.number_min,
          number_max: q.number_max,
          options: (q.options || [])
            .slice()
            .sort((a: any, b: any) => a.position - b.position),
          display_rules: rulesByQuestionId.get(q.id) || [],
        })
      );

    const answers: PatientAnswer[] = (response.answers || []).map(
      (a: any): PatientAnswer => ({
        question_id: a.question_id,
        value_numeric: a.value_numeric,
        value_text: a.value_text,
        value_time: a.value_time,
        value_option_id: a.value_option_id,
        selected_option_ids: (a.selected_options || [])
          .map((s: any) =>
            Array.isArray(s.option) ? s.option[0]?.id : s.option?.id
          )
          .filter(Boolean),
      })
    );

    const detail: PatientQuestionnaireDetail = {
      id: data.id,
      title: template.title,
      description: template.description ?? null,
      category: template.category,
      is_sensitive: template.is_sensitive ?? false,
      is_clinical_screening: template.is_clinical_screening ?? false,
      estimated_minutes: template.estimated_minutes ?? null,
      sent_at: data.sent_at,
      due_at: data.due_at,
      submitted_at: response.submitted_at ?? null,
      response_id: response.id,
      status: response.status,
      questions,
      answers,
    };

    return apiResponse.success(detail);
  } catch (err) {
    console.error('Unexpected error in patient questionnaire detail:', err);
    return apiResponse.serverError('Erreur serveur');
  }
}
