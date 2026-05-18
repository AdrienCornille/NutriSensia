import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/content/[contentId]/course
 * Full course view for a patient: chapters, sections (titles + completion), quizzes, badge, prerequisites, stats.
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

    // Get patient profile to find their nutritionist
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('id, nutritionist_id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile || !patientProfile.nutritionist_id) {
      return apiResponse.error('Profil patient introuvable', 404);
    }

    // Verify content exists, is published, is type 'course', and belongs to patient's nutritionist
    const { data: content, error: contentError } = await s
      .from('educational_contents')
      .select(
        'id, title, summary, type, status, thumbnail_url, tags, key_points'
      )
      .eq('id', contentId)
      .eq('nutritionist_id', patientProfile.nutritionist_id)
      .eq('status', 'published')
      .eq('type', 'course')
      .single();

    if (contentError || !content) {
      return apiResponse.error('Cours introuvable', 404);
    }

    // Fetch chapters with sections (titles only, no block content)
    const { data: chapters, error: chaptersError } = await s
      .from('course_chapters')
      .select(
        '*, sections:course_sections(id, title, sort_order, section_type, referenced_content_id)'
      )
      .eq('course_id', contentId)
      .order('sort_order');

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      return apiResponse.serverError('Erreur lors du chargement des chapitres');
    }

    // Fetch course progress for this user
    const { data: progress } = await s
      .from('course_progress')
      .select('section_id, completed_at, time_spent_seconds')
      .eq('course_id', contentId)
      .eq('user_id', auth.user.id);

    const progressMap = new Map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (progress || []).map((p: any) => [p.section_id, p])
    );

    // Fetch quizzes (metadata only)
    const { data: quizzes } = await s
      .from('course_quizzes')
      .select('id, title, chapter_id, passing_score, description')
      .eq('course_id', contentId)
      .order('sort_order');

    // Fetch best quiz attempts for this user
    const { data: quizAttempts } = await s
      .from('quiz_attempts')
      .select('quiz_id, score, passed')
      .eq('user_id', auth.user.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quizAttemptsMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (quizAttempts || []).forEach((a: any) => {
      const existing = quizAttemptsMap.get(a.quiz_id);
      if (!existing || a.score > existing.score) {
        quizAttemptsMap.set(a.quiz_id, a);
      }
    });

    // Fetch badge
    const { data: badge } = await s
      .from('course_badges')
      .select('id, badge_name, badge_icon, points_awarded')
      .eq('course_id', contentId)
      .maybeSingle();

    // Check if badge already earned
    let badgeEarned = false;
    if (badge) {
      const { data: earnedBadge } = await s
        .from('earned_badges')
        .select('id')
        .eq('badge_id', badge.id)
        .eq('user_id', auth.user.id)
        .maybeSingle();
      badgeEarned = !!earnedBadge;
    }

    // Check prerequisites
    const { data: prerequisitesMet } = await s.rpc(
      'check_course_prerequisites',
      {
        p_course_id: contentId,
        p_user_id: auth.user.id,
      }
    );

    // Fetch prerequisite details for display
    const { data: prerequisites } = await s
      .from('course_prerequisites')
      .select(
        'id, prerequisite_course_id, require_completion, require_quiz_score, min_quiz_score'
      )
      .eq('course_id', contentId);

    // Enrich prerequisites with course titles and completion status
    const enrichedPrerequisites = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prerequisites || []).map(async (prereq: any) => {
        const { data: prereqCourse } = await s
          .from('educational_contents')
          .select('id, title')
          .eq('id', prereq.prerequisite_course_id)
          .single();

        const { data: completion } = await s.rpc('get_course_completion', {
          p_course_id: prereq.prerequisite_course_id,
          p_user_id: auth.user.id,
        });

        let quizScore = 0;
        if (prereq.require_quiz_score) {
          const { data: score } = await s.rpc('get_course_final_quiz_score', {
            p_course_id: prereq.prerequisite_course_id,
            p_user_id: auth.user.id,
          });
          quizScore = score || 0;
        }

        return {
          ...prereq,
          course_title: prereqCourse?.title || 'Cours inconnu',
          completion_percent: completion || 0,
          best_quiz_score: quizScore,
        };
      })
    );

    // Merge progress into sections and compute totals
    let totalSections = 0;
    let completedSections = 0;
    let nextSectionId: string | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chaptersWithProgress = (chapters || []).map((chapter: any) => {
      const sortedSections = (chapter.sections || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((section: any) => {
          totalSections++;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sectionProgress = progressMap.get(section.id) as any;
          const completed = !!sectionProgress?.completed_at;
          if (completed) completedSections++;
          if (!completed && !nextSectionId) nextSectionId = section.id;

          return {
            id: section.id,
            title: section.title,
            sort_order: section.sort_order,
            section_type: section.section_type,
            referenced_content_id: section.referenced_content_id,
            completed,
            completed_at: sectionProgress?.completed_at || null,
            time_spent_seconds: sectionProgress?.time_spent_seconds || 0,
          };
        });

      // Attach chapter quizzes
      const chapterQuizzes = (quizzes || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((q: any) => q.chapter_id === chapter.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((q: any) => {
          const attempt = quizAttemptsMap.get(q.id);
          return {
            ...q,
            best_score: attempt?.score ?? null,
            passed: attempt?.passed ?? false,
          };
        });

      return {
        ...chapter,
        sections: sortedSections,
        quizzes: chapterQuizzes,
      };
    });

    // Final quiz info
    const finalQuizzes = (quizzes || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((q: any) => q.chapter_id === null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((q: any) => {
        const attempt = quizAttemptsMap.get(q.id);
        return {
          ...q,
          best_score: attempt?.score ?? null,
          passed: attempt?.passed ?? false,
        };
      });

    const completionPercent =
      totalSections > 0
        ? Math.round((completedSections / totalSections) * 100)
        : 0;

    return apiResponse.success({
      course: content,
      chapters: chaptersWithProgress,
      final_quizzes: finalQuizzes,
      badge: badge ? { ...badge, earned: badgeEarned } : null,
      prerequisites_met: prerequisitesMet ?? true,
      prerequisites: enrichedPrerequisites,
      stats: {
        totalSections,
        completedSections,
        completionPercent,
        nextSectionId,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
