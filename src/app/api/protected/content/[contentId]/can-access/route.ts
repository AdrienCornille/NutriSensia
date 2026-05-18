import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/content/[contentId]/can-access
 * Check if patient can access this course (prerequisites met).
 * Returns { can_access: boolean, unmet_prerequisites: [...] }
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

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

    // Check prerequisites via rpc
    const { data: prerequisitesMet } = await s.rpc(
      'check_course_prerequisites',
      {
        p_course_id: contentId,
        p_user_id: auth.user.id,
      }
    );

    // Fetch prerequisite details to identify unmet ones
    const { data: prerequisites } = await s
      .from('course_prerequisites')
      .select(
        'id, prerequisite_course_id, require_completion, require_quiz_score, min_quiz_score'
      )
      .eq('course_id', contentId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unmetPrerequisites: any[] = [];

    for (const prereq of prerequisites || []) {
      let isMet = true;
      let completionPercent = 0;
      let bestQuizScore = 0;

      // Get prerequisite course title
      const { data: prereqCourse } = await s
        .from('educational_contents')
        .select('id, title')
        .eq('id', prereq.prerequisite_course_id)
        .single();

      if (prereq.require_completion) {
        const { data: completion } = await s.rpc('get_course_completion', {
          p_course_id: prereq.prerequisite_course_id,
          p_user_id: auth.user.id,
        });
        completionPercent = completion || 0;
        if (completionPercent < 100) isMet = false;
      }

      if (prereq.require_quiz_score) {
        const { data: score } = await s.rpc('get_course_final_quiz_score', {
          p_course_id: prereq.prerequisite_course_id,
          p_user_id: auth.user.id,
        });
        bestQuizScore = score || 0;
        if (bestQuizScore < prereq.min_quiz_score) isMet = false;
      }

      if (!isMet) {
        unmetPrerequisites.push({
          prerequisite_course_id: prereq.prerequisite_course_id,
          course_title: prereqCourse?.title || 'Cours inconnu',
          require_completion: prereq.require_completion,
          require_quiz_score: prereq.require_quiz_score,
          min_quiz_score: prereq.min_quiz_score,
          current_completion: completionPercent,
          current_quiz_score: bestQuizScore,
        });
      }
    }

    return apiResponse.success({
      can_access: prerequisitesMet ?? true,
      unmet_prerequisites: unmetPrerequisites,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
