import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createQuestionSchema } from '@/lib/api-schemas';

async function resolveNutritionistId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('nutritionist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

/**
 * GET /api/protected/nutritionist/content/[contentId]/quizzes/[quizId]/questions
 * List questions for a quiz
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string; quizId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, quizId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    // Verify quiz belongs to this course
    const { data: quiz } = await s
      .from('course_quizzes')
      .select('id')
      .eq('id', quizId)
      .eq('course_id', contentId)
      .single();
    if (!quiz) return apiResponse.error('Quiz introuvable', 404);

    const { data: questions, error } = await s
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('sort_order');

    if (error) {
      console.error('Error fetching questions:', error);
      return apiResponse.serverError('Erreur lors du chargement des questions');
    }

    return apiResponse.success(questions || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content/[contentId]/quizzes/[quizId]/questions
 * Create a question for a quiz
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string; quizId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, quizId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    // Verify quiz belongs to this course
    const { data: quiz } = await s
      .from('course_quizzes')
      .select('id')
      .eq('id', quizId)
      .eq('course_id', contentId)
      .single();
    if (!quiz) return apiResponse.error('Quiz introuvable', 404);

    const body = await req.json();
    const parsed = createQuestionSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    // Auto-calculate sort_order
    const { data: maxOrderRow } = await s
      .from('quiz_questions')
      .select('sort_order')
      .eq('quiz_id', quizId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder =
      parsed.data.sort_order ?? (maxOrderRow?.sort_order ?? -1) + 1;

    // Use admin client to bypass slow RLS policies (ownership already verified above)
    const { data: question, error } = await createAdminClient()
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        question_type: parsed.data.question_type,
        question_text: parsed.data.question_text,
        options: parsed.data.options,
        correct_answer: parsed.data.correct_answer ?? null,
        explanation: parsed.data.explanation || null,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      return apiResponse.serverError(
        'Erreur lors de la création de la question'
      );
    }

    return apiResponse.success(question, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/content/[contentId]/quizzes/[quizId]/questions
 * Reorder questions (accepts { question_ids: [...] })
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string; quizId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, quizId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    const { data: quiz } = await s
      .from('course_quizzes')
      .select('id')
      .eq('id', quizId)
      .eq('course_id', contentId)
      .single();
    if (!quiz) return apiResponse.error('Quiz introuvable', 404);

    const body = await req.json();
    const questionIds = body?.question_ids;
    if (!Array.isArray(questionIds))
      return apiResponse.error("Liste d'IDs invalide", 400);

    const admin = createAdminClient();
    for (let i = 0; i < questionIds.length; i++) {
      await admin
        .from('quiz_questions')
        .update({ sort_order: i })
        .eq('id', questionIds[i])
        .eq('quiz_id', quizId);
    }

    return apiResponse.success({ reordered: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
