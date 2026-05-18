import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import type { PatientInboxItem } from '@/types/patient-questionnaires';

// =============================================================================
// GET /api/protected/dossier/questionnaires
// Returns the patient's inbox of questionnaire assignments. RLS already
// filters to the current user, but we still scope explicitly for clarity.
// =============================================================================
export async function GET(_req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from('questionnaire_assignments')
      .select(
        `
        id, sent_at, due_at,
        template_version:questionnaire_template_versions!template_version_id (
          template:questionnaire_templates!template_id (
            title, description, category,
            estimated_minutes, is_sensitive, is_clinical_screening
          ),
          questions:questionnaire_questions!template_version_id ( id )
        ),
        response:questionnaire_responses!assignment_id (
          id, status, submitted_at,
          answers:response_answers!response_id ( id )
        )
      `
      )
      .eq('patient_id', auth.user.id)
      .order('sent_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Patient inbox error:', JSON.stringify(error, null, 2));
      // Surface the Postgres error so the UI shows actionable info while we
      // iterate. Safe to leak in this internal app — patients only see their
      // own data anyway.
      return NextResponse.json(
        {
          success: false,
          error: `Erreur lors de la récupération : ${error.message || 'inconnue'}`,
          details: {
            code: (error as { code?: string }).code,
            hint: (error as { hint?: string }).hint,
            details: (error as { details?: string }).details,
          },
        },
        { status: 500 }
      );
    }

    const items: PatientInboxItem[] = (data || [])
      .map((row: any) => {
        const version = Array.isArray(row.template_version)
          ? row.template_version[0]
          : row.template_version;
        const template = Array.isArray(version?.template)
          ? version.template[0]
          : version?.template;
        const response = Array.isArray(row.response)
          ? row.response[0]
          : row.response;
        if (!template || !response) return null;
        return {
          id: row.id,
          title: template.title,
          description: template.description ?? null,
          category: template.category,
          estimated_minutes: template.estimated_minutes ?? null,
          is_sensitive: template.is_sensitive ?? false,
          is_clinical_screening: template.is_clinical_screening ?? false,
          status: response.status,
          sent_at: row.sent_at,
          due_at: row.due_at,
          submitted_at: response.submitted_at ?? null,
          question_count: version?.questions?.length ?? 0,
          answered_count: response.answers?.length ?? 0,
        } satisfies PatientInboxItem;
      })
      .filter(Boolean) as PatientInboxItem[];

    return apiResponse.success({ assignments: items });
  } catch (err) {
    console.error('Unexpected error in patient questionnaire inbox:', err);
    return apiResponse.serverError('Erreur serveur');
  }
}
