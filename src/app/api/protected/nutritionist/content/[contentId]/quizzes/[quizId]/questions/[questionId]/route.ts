import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateQuestionSchema } from '@/lib/api-schemas';

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
 * PATCH /api/protected/nutritionist/content/[contentId]/quizzes/[quizId]/questions/[questionId]
 * Update a question
 */
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      contentId: string;
      quizId: string;
      questionId: string;
    }>;
  }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, quizId, questionId } = await params;
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

    // Verify question belongs to this quiz
    const { data: existingQuestion } = await s
      .from('quiz_questions')
      .select('id')
      .eq('id', questionId)
      .eq('quiz_id', quizId)
      .single();
    if (!existingQuestion)
      return apiResponse.error('Question introuvable', 404);

    const body = await req.json();
    const parsed = updateQuestionSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    // Use admin client to bypass slow RLS policies (ownership already verified above)
    const { data: question, error } = await createAdminClient()
      .from('quiz_questions')
      .update(parsed.data)
      .eq('id', questionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating question:', error);
      return apiResponse.serverError(
        'Erreur lors de la mise à jour de la question'
      );
    }

    return apiResponse.success(question);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * DELETE /api/protected/nutritionist/content/[contentId]/quizzes/[quizId]/questions/[questionId]
 * Delete a question
 */
export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      contentId: string;
      quizId: string;
      questionId: string;
    }>;
  }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, quizId, questionId } = await params;
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

    // Verify question belongs to this quiz
    const { data: existingQuestion } = await s
      .from('quiz_questions')
      .select('id')
      .eq('id', questionId)
      .eq('quiz_id', quizId)
      .single();
    if (!existingQuestion)
      return apiResponse.error('Question introuvable', 404);

    // Use admin client to bypass slow RLS policies (ownership already verified above)
    const { error } = await createAdminClient()
      .from('quiz_questions')
      .delete()
      .eq('id', questionId);

    if (error) {
      console.error('Error deleting question:', error);
      return apiResponse.serverError(
        'Erreur lors de la suppression de la question'
      );
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
