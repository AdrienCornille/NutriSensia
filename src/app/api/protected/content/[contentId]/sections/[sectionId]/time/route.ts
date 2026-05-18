import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { trackTimeSchema } from '@/lib/api-schemas';

/**
 * POST /api/protected/content/[contentId]/sections/[sectionId]/time
 * Track time spent on a section. Increments time_spent_seconds in course_progress.
 */
export async function POST(
  req: NextRequest,
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

    // Validate body
    const body = await req.json();
    const parsed = trackTimeSchema.safeParse(body);
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

    // Verify section exists in this course
    const { data: section } = await s
      .from('course_sections')
      .select('id, chapter_id')
      .eq('id', sectionId)
      .single();

    if (!section) {
      return apiResponse.error('Section introuvable', 404);
    }

    // Verify chapter belongs to this course
    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', section.chapter_id)
      .eq('course_id', contentId)
      .single();

    if (!chapter) {
      return apiResponse.error('Section introuvable dans ce cours', 404);
    }

    // Check if progress row already exists
    const { data: existingProgress } = await s
      .from('course_progress')
      .select('id, time_spent_seconds')
      .eq('section_id', sectionId)
      .eq('user_id', auth.user.id)
      .maybeSingle();

    if (existingProgress) {
      // Increment time_spent_seconds
      const newTime =
        (existingProgress.time_spent_seconds || 0) + parsed.data.seconds;

      const { error: updateError } = await s
        .from('course_progress')
        .update({ time_spent_seconds: newTime })
        .eq('id', existingProgress.id);

      if (updateError) {
        console.error('Error updating time:', updateError);
        return apiResponse.serverError(
          'Erreur lors de la mise \u00e0 jour du temps'
        );
      }

      return apiResponse.success({
        section_id: sectionId,
        time_spent_seconds: newTime,
      });
    } else {
      // Create new progress row (not completed yet)
      const { error: insertError } = await s.from('course_progress').insert({
        course_id: contentId,
        section_id: sectionId,
        user_id: auth.user.id,
        time_spent_seconds: parsed.data.seconds,
        completed_at: null,
      });

      if (insertError) {
        console.error('Error inserting time:', insertError);
        return apiResponse.serverError(
          "Erreur lors de l'enregistrement du temps"
        );
      }

      return apiResponse.success({
        section_id: sectionId,
        time_spent_seconds: parsed.data.seconds,
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
