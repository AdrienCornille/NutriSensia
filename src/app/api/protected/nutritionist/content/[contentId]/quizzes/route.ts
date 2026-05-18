import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createQuizSchema } from '@/lib/api-schemas';

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
 * GET /api/protected/nutritionist/content/[contentId]/quizzes
 * List all quizzes for a course (chapter quizzes + final quiz)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId } = await params;
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

    const { data: quizzes, error } = await s
      .from('course_quizzes')
      .select('*, questions:quiz_questions(id, question_type, sort_order)')
      .eq('course_id', contentId)
      .order('sort_order');

    if (error) {
      console.error('Error fetching quizzes:', error);
      return apiResponse.serverError('Erreur lors du chargement des quiz');
    }

    return apiResponse.success(quizzes || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content/[contentId]/quizzes
 * Create a quiz for a course
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    const { data: content } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);
    if (content.type !== 'course')
      return apiResponse.error("Ce contenu n'est pas un cours", 400);

    const body = await req.json();
    const parsed = createQuizSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    // If chapter_id is provided, verify it belongs to this course
    if (parsed.data.chapter_id) {
      const { data: chapter } = await s
        .from('course_chapters')
        .select('id')
        .eq('id', parsed.data.chapter_id)
        .eq('course_id', contentId)
        .single();
      if (!chapter)
        return apiResponse.error(
          "Ce chapitre n'appartient pas à ce cours",
          400
        );
    }

    // Auto-calculate sort_order
    const { data: maxOrderRow } = await s
      .from('course_quizzes')
      .select('sort_order')
      .eq('course_id', contentId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder =
      parsed.data.sort_order ?? (maxOrderRow?.sort_order ?? -1) + 1;

    const { data: quiz, error } = await createAdminClient()
      .from('course_quizzes')
      .insert({
        course_id: contentId,
        chapter_id: parsed.data.chapter_id || null,
        title: parsed.data.title,
        description: parsed.data.description || null,
        passing_score: parsed.data.passing_score,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz:', error);
      return apiResponse.serverError('Erreur lors de la création du quiz');
    }

    return apiResponse.success(quiz, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
