import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// Permissive body: each value type is independently optional. The caller
// sets exactly one (or selected_option_ids for multi_choice).
const saveAnswerSchema = z.object({
  value_numeric: z.number().nullable().optional(),
  value_text: z.string().nullable().optional(),
  value_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Heure invalide (HH:MM)')
    .nullable()
    .optional(),
  value_option_id: z.string().uuid().nullable().optional(),
  selected_option_ids: z.array(z.string().uuid()).nullable().optional(),
});

// =============================================================================
// PUT /api/protected/dossier/questionnaires/[assignmentId]/answers/[questionId]
// Upserts the patient's answer for one question. Used by the auto-save flow
// (debounced 800ms). Refuses the write if the response is already submitted.
// =============================================================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string; questionId: string }> }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { assignmentId, questionId } = await params;
    if (!assignmentId || !questionId) {
      return apiResponse.error('Paramètres requis', 400);
    }

    const body = await req.json();
    const parsed = saveAnswerSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return apiResponse.error(
        `${issue.message}${issue.path.length ? ` (${issue.path.join('.')})` : ''}`,
        400
      );
    }

    const supabase = await createClient();

    // Resolve the response from the assignment + ensure ownership + status.
    const { data: assignment, error: aErr } = await (supabase as any)
      .from('questionnaire_assignments')
      .select(
        `id, patient_id,
         response:questionnaire_responses!assignment_id ( id, status )`
      )
      .eq('id', assignmentId)
      .eq('patient_id', auth.user.id)
      .single();

    if (aErr || !assignment) {
      return apiResponse.notFound('Questionnaire introuvable');
    }

    const response = Array.isArray(assignment.response)
      ? assignment.response[0]
      : assignment.response;

    if (!response) {
      return apiResponse.serverError('Réponse introuvable');
    }
    if (response.status === 'submitted') {
      return apiResponse.error(
        'Ce questionnaire a déjà été soumis et ne peut plus être modifié',
        409
      );
    }

    // Upsert response_answers (one row per question).
    const {
      value_numeric,
      value_text,
      value_time,
      value_option_id,
      selected_option_ids,
    } = parsed.data;

    const { data: upserted, error: upErr } = await (supabase as any)
      .from('response_answers')
      .upsert(
        {
          response_id: response.id,
          question_id: questionId,
          value_numeric: value_numeric ?? null,
          value_text: value_text ?? null,
          value_time: value_time ?? null,
          value_option_id: value_option_id ?? null,
          answered_at: new Date().toISOString(),
        },
        { onConflict: 'response_id,question_id' }
      )
      .select('id')
      .single();

    if (upErr || !upserted) {
      console.error('Upsert answer error:', upErr);
      return apiResponse.serverError(
        'Erreur lors de la sauvegarde de la réponse'
      );
    }

    // For multi_choice : replace the full set of selected options.
    if (selected_option_ids !== undefined) {
      // Wipe and re-insert. The list is short (a few options) so this is fine.
      const { error: delErr } = await (supabase as any)
        .from('response_answer_options')
        .delete()
        .eq('response_answer_id', upserted.id);
      if (delErr) {
        console.error('Reset answer options error:', delErr);
        return apiResponse.serverError(
          'Erreur lors de la sauvegarde des options'
        );
      }
      if (selected_option_ids && selected_option_ids.length > 0) {
        const rows = selected_option_ids.map(option_id => ({
          response_answer_id: upserted.id,
          option_id,
        }));
        const { error: insErr } = await (supabase as any)
          .from('response_answer_options')
          .insert(rows);
        if (insErr) {
          console.error('Insert answer options error:', insErr);
          return apiResponse.serverError(
            'Erreur lors de la sauvegarde des options'
          );
        }
      }
    }

    return apiResponse.success({ id: upserted.id });
  } catch (err) {
    console.error('Unexpected error in save answer:', err);
    return apiResponse.serverError('Erreur serveur');
  }
}
