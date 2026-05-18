import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import type {
  QuestionnaireTemplate,
  QuestionnaireQuestion,
} from '@/types/questionnaire-templates';

// =============================================================================
// GET /api/protected/nutritionist/questionnaire-templates
// Returns templates accessible to the current nutritionist
// (system templates + their own), with the published version's full content.
// =============================================================================
export async function GET(_req: NextRequest) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();

    // RLS filters automatically: is_system=true OR created_by=auth.uid()
    const { data: templates, error: tmplError } = await (supabase as any)
      .from('questionnaire_templates')
      .select(
        `
        id, key, category, title, description, dispatch_mode,
        is_sensitive, is_clinical_screening, estimated_minutes,
        active, is_system, created_by,
        versions:questionnaire_template_versions!template_id (
          id, version, is_published, published_at, notes,
          questions:questionnaire_questions!template_version_id (
            id, key, position, label, help_text, type,
            is_required, is_scored,
            scale_min, scale_max, scale_min_label, scale_max_label,
            number_min, number_max,
            options:questionnaire_question_options!question_id (
              id, value, label, position, score_value, is_exclusive
            ),
            display_rules:questionnaire_question_display_rules!question_id (
              id, depends_on_question_id, operator, expected_value
            )
          ),
          scoring_rule:questionnaire_template_scoring_rules!template_version_id (
            id, method, match_value, threshold, is_patient_visible
          )
        )
      `
      )
      .eq('active', true)
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (tmplError) {
      return apiResponse.error(
        `Erreur de chargement des templates : ${tmplError.message}`,
        500
      );
    }

    // Shape the response: pick the published version, sort children by position.
    const shaped: QuestionnaireTemplate[] = (templates || [])
      .map((t: any) => {
        const published = (t.versions || []).find((v: any) => v.is_published);
        if (!published) return null;

        const questions: QuestionnaireQuestion[] = (published.questions || [])
          .slice()
          .sort((a: any, b: any) => a.position - b.position)
          .map((q: any) => ({
            id: q.id,
            key: q.key,
            position: q.position,
            label: q.label,
            help_text: q.help_text,
            type: q.type,
            is_required: q.is_required,
            is_scored: q.is_scored,
            scale_min: q.scale_min,
            scale_max: q.scale_max,
            scale_min_label: q.scale_min_label,
            scale_max_label: q.scale_max_label,
            number_min: q.number_min,
            number_max: q.number_max,
            options: (q.options || [])
              .slice()
              .sort((a: any, b: any) => a.position - b.position),
            display_rules: q.display_rules || [],
          }));

        // Supabase returns hasOne relations as arrays; normalize.
        const scoring_rule = Array.isArray(published.scoring_rule)
          ? (published.scoring_rule[0] ?? null)
          : (published.scoring_rule ?? null);

        return {
          id: t.id,
          key: t.key,
          category: t.category,
          title: t.title,
          description: t.description,
          dispatch_mode: t.dispatch_mode,
          is_sensitive: t.is_sensitive,
          is_clinical_screening: t.is_clinical_screening,
          estimated_minutes: t.estimated_minutes,
          active: t.active,
          is_system: t.is_system,
          created_by: t.created_by,
          current_version: {
            id: published.id,
            version: published.version,
            is_published: published.is_published,
            published_at: published.published_at,
            notes: published.notes,
            questions,
            scoring_rule,
          },
        } satisfies QuestionnaireTemplate;
      })
      .filter(Boolean) as QuestionnaireTemplate[];

    return apiResponse.success({ templates: shaped });
  } catch (err) {
    return apiResponse.error(
      err instanceof Error ? err.message : 'Erreur serveur',
      500
    );
  }
}
