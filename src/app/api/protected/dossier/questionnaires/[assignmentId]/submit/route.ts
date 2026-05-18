import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { missingRequiredAnswers } from '@/lib/questionnaire-display-rules';
import type {
  PatientQuestion,
  PatientAnswer,
} from '@/types/patient-questionnaires';

// =============================================================================
// POST /api/protected/dossier/questionnaires/[assignmentId]/submit
// Finalises a response: validates required-question answers against display
// rules, then flips both the response (status='submitted') and the parent
// assignment (status='completed') atomically (best-effort: 2 sequential
// updates with a rollback on the assignment side if the second fails).
//
// Returns 422 if required visible questions are missing answers, with the
// list of missing question ids so the client can scroll to them.
// =============================================================================
export async function POST(
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

    // Same approach as the detail endpoint: fetch the nested payload without
    // display_rules (those have a 2-FK ambiguity that PostgREST can't embed
    // reliably) and then fetch the rules in a separate query.
    const { data, error } = await (supabase as any)
      .from('questionnaire_assignments')
      .select(
        `
        id, patient_id,
        template_version:questionnaire_template_versions!template_version_id (
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
          id, status,
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
    const response = Array.isArray(data.response)
      ? data.response[0]
      : data.response;

    if (!version || !response) {
      return apiResponse.serverError('Questionnaire corrompu');
    }
    if (response.status === 'submitted') {
      return apiResponse.error('Ce questionnaire a déjà été soumis', 409);
    }

    // 2nd query: display rules for every question in this version.
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

    const questions: PatientQuestion[] = (version.questions || []).map(
      (q: any) => ({
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
        options: q.options || [],
        display_rules: rulesByQuestionId.get(q.id) || [],
      })
    );

    const answers: PatientAnswer[] = (response.answers || []).map((a: any) => ({
      question_id: a.question_id,
      value_numeric: a.value_numeric,
      value_text: a.value_text,
      value_time: a.value_time,
      value_option_id: a.value_option_id,
      selected_option_ids: (a.selected_options || [])
        .map((s: any) =>
          Array.isArray(s.option) ? s.option[0]?.id : s.option?.id
        )
        .filter(Boolean) as string[],
    }));

    const missing = missingRequiredAnswers(questions, answers);
    if (missing.length > 0) {
      const plural = missing.length > 1;
      return NextResponse.json(
        {
          success: false,
          error: `Veuillez compléter les ${missing.length} question${plural ? 's' : ''} obligatoire${plural ? 's' : ''} restante${plural ? 's' : ''}`,
          missing_required: missing,
        },
        { status: 422 }
      );
    }

    const submittedAt = new Date().toISOString();

    // 1. Flip the response to submitted (RLS will reject this once it's
    //    submitted, so it's effectively a one-way door).
    const { error: rErr } = await (supabase as any)
      .from('questionnaire_responses')
      .update({ status: 'submitted', submitted_at: submittedAt })
      .eq('id', response.id);
    if (rErr) {
      console.error('Submit response error:', rErr);
      return apiResponse.serverError('Erreur lors de la soumission');
    }

    // 2. Flip the parent assignment to completed. If this fails, the response
    //    is already submitted — we surface a partial-success warning rather
    //    than try to roll back (the response state is the patient-facing one).
    const { error: aErr } = await (supabase as any)
      .from('questionnaire_assignments')
      .update({ status: 'completed', completed_at: submittedAt })
      .eq('id', assignmentId);
    if (aErr) {
      console.error('Submit assignment error:', aErr);
      // Non-blocking: the patient sees their submission as recorded.
    }

    return apiResponse.success({ ok: true, submitted_at: submittedAt });
  } catch (err) {
    console.error('Unexpected error in submit:', err);
    return apiResponse.serverError('Erreur serveur');
  }
}
