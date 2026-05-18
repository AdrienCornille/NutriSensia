import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// Helper: resolve nutritionist profile ID from auth user
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
 * GET /api/protected/nutritionist/content/[contentId]/progress
 * Get progress of all patients (or a single patient) for this course
 * Optional query param: ?patient_id=xxx
 */
export async function GET(
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

    // Verify ownership of the course
    const { data: content } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    const { searchParams } = new URL(req.url);
    const filterPatientId = searchParams.get('patient_id');

    // Step 1: Get total sections count for the course
    const { data: sections, error: sectionsError } = await s
      .from('course_sections')
      .select('id, chapter:course_chapters!inner(course_id)')
      .eq('chapter.course_id', contentId);

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return apiResponse.serverError('Erreur lors du chargement des sections');
    }

    const totalSections = sections?.length || 0;

    // Step 2: Get all patients of this nutritionist
    let patientsQuery = s
      .from('patient_profiles')
      .select('id, user_id, profiles:profiles!inner(full_name, email)')
      .eq('nutritionist_id', nutritionistId);

    if (filterPatientId) {
      patientsQuery = patientsQuery.eq('id', filterPatientId);
    }

    const { data: patients, error: patientsError } = await patientsQuery;

    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
      return apiResponse.serverError('Erreur lors du chargement des patients');
    }

    if (!patients || patients.length === 0) {
      return apiResponse.success([]);
    }

    // Step 3: Get quizzes for this course
    const { data: quizzes } = await s
      .from('course_quizzes')
      .select('id, title')
      .eq('course_id', contentId);

    const quizIds = (quizzes || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q: any) => q.id
    );

    // Step 4: For each patient, gather progress data
    const patientUserIds = patients.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p.user_id
    );

    // Batch fetch course_progress for all patients
    const { data: allProgress } = await s
      .from('course_progress')
      .select('*')
      .eq('course_id', contentId)
      .in('user_id', patientUserIds);

    // Batch fetch quiz_attempts for all patients
    let allAttempts: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any[] = [];
    if (quizIds.length > 0) {
      const { data: attempts } = await s
        .from('quiz_attempts')
        .select('*')
        .in('quiz_id', quizIds)
        .in('user_id', patientUserIds);
      allAttempts = attempts || [];
    }

    // Batch fetch earned_badges for all patients
    const { data: allBadges } = await s
      .from('earned_badges')
      .select('*')
      .eq('course_id', contentId)
      .in('user_id', patientUserIds);

    // Step 5: Build progress summaries
    const progressSummaries = patients.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patient: any) => {
        const patientUserId = patient.user_id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profileData = patient.profiles as any;

        // Course progress for this patient
        const patientProgress = (allProgress || []).filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p: any) => p.user_id === patientUserId
        );

        const completedSections = patientProgress.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p: any) => p.completed
        );

        const sectionsCompleted = completedSections.length;
        const completionPercent =
          totalSections > 0
            ? Math.round((sectionsCompleted / totalSections) * 100)
            : 0;

        const totalTimeSpentSeconds = patientProgress.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (sum: number, p: any) => sum + (p.time_spent_seconds || 0),
          0
        );

        // Last activity
        const completedDates = completedSections
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => p.completed_at)
          .filter(Boolean);
        const lastActivityAt =
          completedDates.length > 0 ? completedDates.sort().reverse()[0] : null;

        // Quiz scores
        const quizScores = (quizzes || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (quiz: any) => {
            const attempts = allAttempts.filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (a: any) => a.quiz_id === quiz.id && a.user_id === patientUserId
            );

            const bestScore =
              attempts.length > 0
                ? Math.max(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...attempts.map((a: any) => a.score || 0)
                  )
                : null;

            const passed = attempts.some(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (a: any) => a.passed === true
            );

            return {
              quiz_id: quiz.id,
              quiz_title: quiz.title,
              best_score: bestScore,
              passed,
              attempts: attempts.length,
            };
          }
        );

        // Badge earned
        const badgeEarned = (allBadges || []).some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (b: any) => b.user_id === patientUserId
        );

        return {
          patient_id: patient.id,
          patient_name: profileData?.full_name || profileData?.email || 'N/A',
          completion_percent: completionPercent,
          total_time_spent_seconds: totalTimeSpentSeconds,
          sections_completed: sectionsCompleted,
          total_sections: totalSections,
          last_activity_at: lastActivityAt,
          quiz_scores: quizScores,
          badge_earned: badgeEarned,
        };
      }
    );

    return apiResponse.success(progressSummaries);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
