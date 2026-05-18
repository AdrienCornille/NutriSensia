import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/content/[contentId]/quizzes/[quizId]
 * Patient: Get quiz with questions for taking
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string; quizId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, quizId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Verify content is published and accessible
    const { data: content } = await s
      .from('educational_contents')
      .select('id, type, status, nutritionist_id')
      .eq('id', contentId)
      .eq('status', 'published')
      .eq('type', 'course')
      .single();

    if (!content) return apiResponse.notFound('Cours introuvable');

    // Verify patient belongs to this nutritionist
    const { data: patient } = await s
      .from('patient_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('nutritionist_id', content.nutritionist_id)
      .single();

    if (!patient) return apiResponse.forbidden('Accès non autorisé');

    // Fetch quiz with questions (exclude correct answers for security)
    const { data: quiz, error } = await s
      .from('course_quizzes')
      .select(
        'id, course_id, chapter_id, title, description, passing_score, questions:quiz_questions(id, sort_order, question_type, question_text, options)'
      )
      .eq('id', quizId)
      .eq('course_id', contentId)
      .single();

    if (error || !quiz) return apiResponse.notFound('Quizz introuvable');

    // Strip is_correct from options to prevent cheating
    if (quiz.questions) {
      quiz.questions = quiz.questions
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((q: any) => ({
          ...q,
          options: (q.options || []).map((opt: any) => ({
            text: opt.text,
            // Don't send is_correct to the client
          })),
        }));
    }

    return apiResponse.success(quiz);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
