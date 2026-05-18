import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateQuizSchema } from '@/lib/api-schemas';

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
 * GET /api/protected/nutritionist/content/[contentId]/quizzes/[quizId]
 * Get a quiz with all its questions
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

    // Fetch quiz with questions, verify it belongs to the course
    const { data: quiz, error } = await s
      .from('course_quizzes')
      .select('*, questions:quiz_questions(*)')
      .eq('id', quizId)
      .eq('course_id', contentId)
      .single();

    if (error || !quiz) {
      console.error('Error fetching quiz:', error);
      return apiResponse.error('Quiz introuvable', 404);
    }

    // Sort questions by sort_order
    if (quiz.questions) {
      quiz.questions.sort(
        (a: { sort_order: number }, b: { sort_order: number }) =>
          a.sort_order - b.sort_order
      );
    }

    return apiResponse.success(quiz);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/content/[contentId]/quizzes/[quizId]
 * Update a quiz
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

    // Verify ownership
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    // Verify quiz belongs to this course
    const { data: existingQuiz } = await s
      .from('course_quizzes')
      .select('id')
      .eq('id', quizId)
      .eq('course_id', contentId)
      .single();
    if (!existingQuiz) return apiResponse.error('Quiz introuvable', 404);

    const body = await req.json();
    const parsed = updateQuizSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    const { data: quiz, error } = await createAdminClient()
      .from('course_quizzes')
      .update(parsed.data)
      .eq('id', quizId)
      .select()
      .single();

    if (error) {
      console.error('Error updating quiz:', error);
      return apiResponse.serverError('Erreur lors de la mise à jour du quiz');
    }

    return apiResponse.success(quiz);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * DELETE /api/protected/nutritionist/content/[contentId]/quizzes/[quizId]
 * Delete a quiz (cascades to questions and attempts)
 */
export async function DELETE(
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
    const { data: existingQuiz } = await s
      .from('course_quizzes')
      .select('id')
      .eq('id', quizId)
      .eq('course_id', contentId)
      .single();
    if (!existingQuiz) return apiResponse.error('Quiz introuvable', 404);

    const { error } = await createAdminClient()
      .from('course_quizzes')
      .delete()
      .eq('id', quizId);

    if (error) {
      console.error('Error deleting quiz:', error);
      return apiResponse.serverError('Erreur lors de la suppression du quiz');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
