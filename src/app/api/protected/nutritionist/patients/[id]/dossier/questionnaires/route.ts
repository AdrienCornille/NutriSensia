import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createQuestionnaireSchema } from '@/lib/api-schemas';
import {
  ASSIGNMENT_SELECT,
  assignmentToQuestionnaireDetail,
  mapLegacyTypeToNew,
  makeDraftTemplateKey,
} from '@/lib/questionnaire-mapper';
import { notifyQuestionnaireReceived } from '@/lib/notifications';

// =============================================================================
// GET /api/protected/nutritionist/patients/[id]/dossier/questionnaires
// Lists all assignments for a patient, flattened to the legacy
// QuestionnaireDetail shape so the existing UI doesn't change.
// =============================================================================
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId } = await params;
    if (!patientProfileId) {
      return apiResponse.error('ID patient requis', 400);
    }

    const supabase = await createClient();

    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    const { data: assignments, error: qError } = await (supabase as any)
      .from('questionnaire_assignments')
      .select(ASSIGNMENT_SELECT)
      .eq('patient_id', patient.user_id)
      .order('created_at', { ascending: false });

    if (qError) {
      console.error('Error fetching assignments:', qError);
      return apiResponse.serverError('Erreur lors de la récupération');
    }

    const flattened = (assignments || []).map(assignmentToQuestionnaireDetail);
    return apiResponse.success(flattened);
  } catch (error) {
    console.error('Unexpected error in questionnaires GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// =============================================================================
// POST /api/protected/nutritionist/patients/[id]/dossier/questionnaires
// Creates a NEW assignment. The flow is:
//   1. Draft template (is_system=false, is_draft=true) owned by the nutritionist
//   2. Version 1 published
//   3. Questions + options (with legacy → new type mapping)
//   4. Assignment (status='sent', sent_at=now())
//   5. Response (status='in_progress', empty)
//
// Rationale: every assignment must point to a template_version_id (FK NOT NULL).
// Ad-hoc creations get a private draft template that is hidden from the
// template picker (is_draft=true filter). The nutritionist can later promote
// it to a reusable template — that UI is out of scope for P2.B.
// =============================================================================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId } = await params;
    if (!patientProfileId) {
      return apiResponse.error('ID patient requis', 400);
    }

    const supabase = await createClient();

    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    const body = await req.json();
    const parsed = createQuestionnaireSchema.safeParse(body);
    if (!parsed.success) {
      console.error('Questionnaire POST validation failed:', {
        body,
        issues: parsed.error.issues,
      });
      const firstIssue = parsed.error.issues[0];
      const path = firstIssue.path.join('.');
      const message = path
        ? `${firstIssue.message} (${path})`
        : firstIssue.message;
      return apiResponse.error(message, 400);
    }

    const {
      title,
      questionnaire_type,
      due_date,
      questions,
      consultation_id,
      template_version_id: pickedVersionId,
    } = parsed.data;

    // <input type="date"> sends YYYY-MM-DD; we treat the due date as end-of-day
    // local time so a "due 2026-05-17" is honored until 23:59 on that date.
    const dueAtIso = (() => {
      if (!due_date) return null;
      if (due_date.includes('T')) return due_date; // already a datetime
      return `${due_date}T23:59:59`;
    })();

    // The legacy `questionnaire_type` ('Suivi'/'Feedback'/'Anamnèse') maps to
    // a category for the new schema. The category drives picker grouping and
    // is what shows up in the card via mapStatusToLegacy.
    const category =
      questionnaire_type === 'Feedback'
        ? 'around_consultation'
        : questionnaire_type === 'Anamnèse'
          ? 'deep_dive'
          : 'regular_followup';

    // ── Two branches ──────────────────────────────────────────────────
    // (A) `pickedVersionId` set → use that template version directly. The
    //     assignment points at the original, which preserves display_rules,
    //     option slugs, exclusivity flags, scale anchors, etc.
    // (B) `pickedVersionId` not set (true ad-hoc) → create a draft template
    //     from the `questions` payload. Display_rules are not preserved in
    //     this case because the modal doesn't expose them.
    // ──────────────────────────────────────────────────────────────────

    let versionId: string;
    let draftTemplateIdForCleanup: string | null = null;

    if (pickedVersionId) {
      // Sanity check: make sure the picked version exists and the current
      // nutritionist can read it (RLS handles the visibility — if the row
      // can't be fetched, the user has no right to use it).
      const { data: existingVersion } = await (supabase as any)
        .from('questionnaire_template_versions')
        .select('id')
        .eq('id', pickedVersionId)
        .single();
      if (!existingVersion) {
        return apiResponse.error(
          'Template version introuvable ou inaccessible',
          400
        );
      }
      versionId = pickedVersionId;
    } else {
      // 1. Draft template
      const { data: template, error: tmplErr } = await (supabase as any)
        .from('questionnaire_templates')
        .insert({
          key: makeDraftTemplateKey(),
          category,
          title,
          description: null,
          dispatch_mode: 'manual_only',
          is_system: false,
          is_draft: true,
          active: true,
          created_by: auth.user.id,
        })
        .select('id')
        .single();

      if (tmplErr || !template) {
        console.error('Error creating draft template:', tmplErr);
        return apiResponse.serverError(
          'Erreur lors de la création du template'
        );
      }
      draftTemplateIdForCleanup = template.id;

      // 2. Version 1 published
      const { data: version, error: verErr } = await (supabase as any)
        .from('questionnaire_template_versions')
        .insert({
          template_id: template.id,
          version: 1,
          is_published: true,
          published_at: new Date().toISOString(),
          notes: null,
        })
        .select('id')
        .single();

      if (verErr || !version) {
        console.error('Error creating template version:', verErr);
        await (supabase as any)
          .from('questionnaire_templates')
          .delete()
          .eq('id', template.id);
        return apiResponse.serverError(
          'Erreur lors de la création de la version'
        );
      }
      versionId = version.id;

      // 3. Questions + options (only for draft; existing templates already
      // have these populated).
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const newType = mapLegacyTypeToNew(q.type);

        const { data: insertedQ, error: qErr } = await (supabase as any)
          .from('questionnaire_questions')
          .insert({
            template_version_id: versionId,
            key: `q_${i + 1}`,
            position: i + 1,
            label: q.question,
            type: newType,
            is_required: q.required ?? true,
            scale_min: newType === 'scale' ? 1 : null,
            scale_max: newType === 'scale' ? 10 : null,
          })
          .select('id')
          .single();

        if (qErr || !insertedQ) {
          console.error('Error inserting question:', qErr);
          await (supabase as any)
            .from('questionnaire_templates')
            .delete()
            .eq('id', template.id);
          return apiResponse.serverError(
            'Erreur lors de la création des questions'
          );
        }

        if (newType === 'single_choice') {
          const optionRows =
            q.type === 'boolean'
              ? [
                  {
                    question_id: insertedQ.id,
                    value: 'oui',
                    label: 'Oui',
                    position: 1,
                  },
                  {
                    question_id: insertedQ.id,
                    value: 'non',
                    label: 'Non',
                    position: 2,
                  },
                ]
              : (q.options || []).filter(Boolean).map((opt, oi) => ({
                  question_id: insertedQ.id,
                  value: `opt_${oi + 1}`,
                  label: opt,
                  position: oi + 1,
                }));

          if (optionRows.length > 0) {
            const { error: optErr } = await (supabase as any)
              .from('questionnaire_question_options')
              .insert(optionRows);
            if (optErr) {
              console.error('Error inserting options:', optErr);
              await (supabase as any)
                .from('questionnaire_templates')
                .delete()
                .eq('id', template.id);
              return apiResponse.serverError(
                'Erreur lors de la création des options'
              );
            }
          }
        }
      }
    }

    // 4. Assignment (common path)
    const nowIso = new Date().toISOString();
    const { data: assignment, error: aErr } = await (supabase as any)
      .from('questionnaire_assignments')
      .insert({
        template_version_id: versionId,
        patient_id: patient.user_id,
        nutritionist_id: auth.user.id,
        assigned_by: auth.user.id,
        consultation_id: consultation_id || null,
        status: 'sent',
        sent_at: nowIso,
        due_at: dueAtIso,
      })
      .select('id')
      .single();

    if (aErr || !assignment) {
      console.error('Error creating assignment:', aErr);
      if (draftTemplateIdForCleanup) {
        await (supabase as any)
          .from('questionnaire_templates')
          .delete()
          .eq('id', draftTemplateIdForCleanup);
      }
      return apiResponse.serverError('Erreur lors de la création de l’envoi');
    }

    // 5. Empty response (waiting for the patient to fill it in P2.C)
    const { error: rErr } = await (supabase as any)
      .from('questionnaire_responses')
      .insert({
        assignment_id: assignment.id,
        patient_id: patient.user_id,
        template_version_id: versionId,
        status: 'in_progress',
      });

    if (rErr) {
      console.error('Error creating empty response:', rErr);
      await (supabase as any)
        .from('questionnaire_assignments')
        .delete()
        .eq('id', assignment.id);
      if (draftTemplateIdForCleanup) {
        await (supabase as any)
          .from('questionnaire_templates')
          .delete()
          .eq('id', draftTemplateIdForCleanup);
      }
      return apiResponse.serverError(
        'Erreur lors de la création de la réponse'
      );
    }

    // 6. Notification patient. Non-bloquant : si la création échoue, on log
    // mais on ne casse pas l'envoi (l'assignment + response sont déjà en DB
    // et le badge sidebar du patient se basera dessus indépendamment).
    //
    // ⚠️ On passe par le client admin (service role) car la RLS de
    // `notifications` est `user_id = auth.uid()` : avec la session du
    // nutritionniste, un INSERT pour `patient.user_id` est rejeté
    // silencieusement par PostgREST (0 rows). Même pattern que
    // notifyNewMessage dans conversations/[id]/messages/route.ts.
    try {
      const adminClient = createAdminClient();
      await notifyQuestionnaireReceived(adminClient, patient.user_id, {
        assignment_id: assignment.id,
        title,
        due_at: dueAtIso,
      });
    } catch (notifError) {
      console.error(
        'Error sending questionnaire_received notification:',
        notifError
      );
    }

    return apiResponse.success(
      { id: assignment.id, title, status: 'pending' },
      201
    );
  } catch (error) {
    console.error('Unexpected error in questionnaires POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
