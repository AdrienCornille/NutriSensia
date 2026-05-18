import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * POST /api/protected/content/[contentId]/sections/[sectionId]/complete
 * Mark a section as completed. Checks sequential access. Awards badge if course is fully complete.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string; sectionId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, sectionId } = await params;
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
      .select('id, type, status')
      .eq('id', contentId)
      .eq('nutritionist_id', patientProfile.nutritionist_id)
      .eq('status', 'published')
      .eq('type', 'course')
      .single();

    if (!content) {
      return apiResponse.error('Cours introuvable', 404);
    }

    // Get all sections in order for sequential check
    const { data: chapters } = await s
      .from('course_chapters')
      .select('id, sort_order, sections:course_sections(id, sort_order)')
      .eq('course_id', contentId)
      .order('sort_order');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allSections: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (chapters || []).forEach((chapter: any) => {
      const sorted = (chapter.sections || []).sort(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any, b: any) => a.sort_order - b.sort_order
      );
      sorted.forEach((section: { id: string }) => {
        allSections.push(section);
      });
    });

    const sectionIndex = allSections.findIndex(
      (sec: { id: string }) => sec.id === sectionId
    );
    if (sectionIndex === -1) {
      return apiResponse.error('Section introuvable', 404);
    }

    // Check sequential access
    if (sectionIndex > 0) {
      const previousSectionIds = allSections
        .slice(0, sectionIndex)
        .map((sec: { id: string }) => sec.id);

      const { data: completedProgress } = await s
        .from('course_progress')
        .select('section_id')
        .eq('course_id', contentId)
        .eq('user_id', auth.user.id)
        .not('completed_at', 'is', null)
        .in('section_id', previousSectionIds);

      const completedIds = new Set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (completedProgress || []).map((p: any) => p.section_id)
      );

      const allPreviousCompleted = previousSectionIds.every((id: string) =>
        completedIds.has(id)
      );

      if (!allPreviousCompleted) {
        return apiResponse.error(
          'Section verrouill\u00e9e - compl\u00e9tez les sections pr\u00e9c\u00e9dentes',
          403
        );
      }
    }

    // Upsert course_progress with completed_at
    const { error: upsertError } = await s.from('course_progress').upsert(
      {
        course_id: contentId,
        section_id: sectionId,
        user_id: auth.user.id,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'section_id,user_id' }
    );

    if (upsertError) {
      console.error('Error upserting progress:', upsertError);
      return apiResponse.serverError(
        'Erreur lors de la mise \u00e0 jour de la progression'
      );
    }

    // Check if all sections are now complete
    const { data: allProgress } = await s
      .from('course_progress')
      .select('section_id, completed_at')
      .eq('course_id', contentId)
      .eq('user_id', auth.user.id)
      .not('completed_at', 'is', null);

    const completedSectionIds = new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (allProgress || []).map((p: any) => p.section_id)
    );

    const allSectionsComplete = allSections.every((sec: { id: string }) =>
      completedSectionIds.has(sec.id)
    );

    let badgeAwarded = false;

    if (allSectionsComplete) {
      // Check if final quiz passed (if there is one)
      const { data: finalQuiz } = await s
        .from('course_quizzes')
        .select('id, passing_score')
        .eq('course_id', contentId)
        .is('chapter_id', null)
        .maybeSingle();

      let finalQuizPassed = true; // No final quiz means auto-pass
      if (finalQuiz) {
        const { data: bestAttempt } = await s
          .from('quiz_attempts')
          .select('score, passed')
          .eq('quiz_id', finalQuiz.id)
          .eq('user_id', auth.user.id)
          .order('score', { ascending: false })
          .limit(1)
          .maybeSingle();

        finalQuizPassed = !!bestAttempt?.passed;
      }

      if (finalQuizPassed) {
        // Award badge if exists and not already earned
        const { data: badge } = await s
          .from('course_badges')
          .select('id, points_awarded')
          .eq('course_id', contentId)
          .maybeSingle();

        if (badge) {
          const { data: alreadyEarned } = await s
            .from('earned_badges')
            .select('id')
            .eq('badge_id', badge.id)
            .eq('user_id', auth.user.id)
            .maybeSingle();

          if (!alreadyEarned) {
            const { error: badgeError } = await s.from('earned_badges').insert({
              badge_id: badge.id,
              user_id: auth.user.id,
            });

            if (!badgeError) {
              badgeAwarded = true;

              // Award points if add_points rpc is available
              if (badge.points_awarded > 0) {
                try {
                  await s.rpc('add_points', {
                    p_user_id: auth.user.id,
                    p_points: badge.points_awarded,
                    p_reason: 'Cours termin\u00e9 - badge obtenu',
                  });
                } catch {
                  // Points system may not be available, non-blocking
                  console.warn('add_points rpc non disponible');
                }
              }
            }
          }
        }
      }
    }

    return apiResponse.success({
      completed: true,
      section_id: sectionId,
      all_sections_complete: allSectionsComplete,
      badge_awarded: badgeAwarded,
      completion_percent: Math.round(
        (completedSectionIds.size / allSections.length) * 100
      ),
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
