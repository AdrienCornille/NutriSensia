import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { submitQuizSchema } from '@/lib/api-schemas';

/**
 * POST /api/protected/content/[contentId]/quizzes/[quizId]/submit
 * Submit quiz answers, grade them, and record the attempt.
 */
export async function POST(
  req: NextRequest,
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

    // Validate body
    const body = await req.json();
    const parsed = submitQuizSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Get patient profile
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('id, nutritionist_id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile || !patientProfile.nutritionist_id) {
      return apiResponse.error('Profil patient introuvable', 404);
    }

    // Verify content exists, is published, is type 'course'
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', patientProfile.nutritionist_id)
      .eq('status', 'published')
      .eq('type', 'course')
      .single();

    if (!content) {
      return apiResponse.error('Cours introuvable', 404);
    }

    // Verify quiz belongs to this course
    const { data: quiz } = await s
      .from('course_quizzes')
      .select('id, title, passing_score, chapter_id')
      .eq('id', quizId)
      .eq('course_id', contentId)
      .single();

    if (!quiz) {
      return apiResponse.error('Quiz introuvable', 404);
    }

    // Fetch all questions for this quiz
    const { data: questions, error: questionsError } = await s
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('sort_order');

    if (questionsError || !questions || questions.length === 0) {
      return apiResponse.error(
        'Aucune question trouv\u00e9e pour ce quiz',
        404
      );
    }

    // Build question map for grading
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questionMap = new Map<string, any>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions.map((q: any) => [q.id, q])
    );

    // Grade each answer
    let correctAnswers = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = [];

    for (const answer of parsed.data.answers) {
      const question = questionMap.get(answer.question_id);
      if (!question) {
        results.push({
          question_id: answer.question_id,
          correct: false,
          error: 'Question introuvable',
        });
        continue;
      }

      let isCorrect = false;

      if (question.question_type === 'mcq') {
        // MCQ: compare selected_options against options[].is_correct
        const selectedOptions = answer.selected_options || [];
        const correctOptionIndices = (question.options || [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((opt: any, idx: number) => (opt.is_correct ? idx : -1))
          .filter((idx: number) => idx !== -1);

        // Correct if selected exactly the correct options
        isCorrect =
          selectedOptions.length === correctOptionIndices.length &&
          selectedOptions.every((idx: number) =>
            correctOptionIndices.includes(idx)
          ) &&
          correctOptionIndices.every((idx: number) =>
            selectedOptions.includes(idx)
          );
      } else if (question.question_type === 'true_false') {
        // True/False: compare answer against correct_answer
        isCorrect = answer.answer === question.correct_answer;
      }

      if (isCorrect) correctAnswers++;

      results.push({
        question_id: answer.question_id,
        correct: isCorrect,
        question_text: question.question_text,
        explanation: question.explanation || null,
        correct_answer:
          question.question_type === 'mcq'
            ? (question.options || [])
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((opt: any, idx: number) => (opt.is_correct ? idx : -1))
                .filter((idx: number) => idx !== -1)
            : question.correct_answer,
      });
    }

    const totalQuestions = questions.length;
    const score =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const passed = score >= quiz.passing_score;

    // Insert quiz attempt
    const { error: attemptError } = await s.from('quiz_attempts').insert({
      quiz_id: quizId,
      user_id: auth.user.id,
      answers: parsed.data.answers,
      score,
      passed,
    });

    if (attemptError) {
      console.error('Error inserting quiz attempt:', attemptError);
      return apiResponse.serverError(
        "Erreur lors de l'enregistrement de la tentative"
      );
    }

    return apiResponse.success({
      score,
      passed,
      passing_score: quiz.passing_score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      results,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
