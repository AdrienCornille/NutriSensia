import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/content/[contentId]/sections/[sectionId]
 * Full section content for reading. Checks sequential lock (all previous sections must be completed).
 */
export async function GET(
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

    // Get patient profile to find their nutritionist
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

    // Get all sections for this course, ordered by chapter sort_order then section sort_order
    const { data: chapters } = await s
      .from('course_chapters')
      .select(
        'id, sort_order, sections:course_sections(id, title, sort_order, section_type, referenced_content_id, chapter_id)'
      )
      .eq('course_id', contentId)
      .order('sort_order');

    // Flatten all sections in order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allSections: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (chapters || []).forEach((chapter: any) => {
      const sorted = (chapter.sections || []).sort(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any, b: any) => a.sort_order - b.sort_order
      );
      sorted.forEach((section: { id: string }) => {
        allSections.push({ ...section, chapter_id: chapter.id });
      });
    });

    // Find requested section position
    const sectionIndex = allSections.findIndex(
      (sec: { id: string }) => sec.id === sectionId
    );
    if (sectionIndex === -1) {
      return apiResponse.error('Section introuvable', 404);
    }

    // Check sequential access: all previous sections must be completed
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

    // Fetch the section with its blocks
    const currentSection = allSections[sectionIndex];

    const { data: blocks, error: blocksError } = await s
      .from('course_section_blocks')
      .select('*')
      .eq('section_id', sectionId)
      .order('sort_order');

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError);
      return apiResponse.serverError(
        'Erreur lors du chargement du contenu de la section'
      );
    }

    // Fetch progress for this section
    const { data: sectionProgress } = await s
      .from('course_progress')
      .select('completed_at, time_spent_seconds')
      .eq('section_id', sectionId)
      .eq('user_id', auth.user.id)
      .maybeSingle();

    // Determine next and previous section IDs
    const prevSectionId =
      sectionIndex > 0 ? allSections[sectionIndex - 1].id : null;
    const nextSectionId =
      sectionIndex < allSections.length - 1
        ? allSections[sectionIndex + 1].id
        : null;

    return apiResponse.success({
      section: {
        id: currentSection.id,
        title: currentSection.title,
        sort_order: currentSection.sort_order,
        section_type: currentSection.section_type,
        referenced_content_id: currentSection.referenced_content_id,
        chapter_id: currentSection.chapter_id,
        completed: !!sectionProgress?.completed_at,
        completed_at: sectionProgress?.completed_at || null,
        time_spent_seconds: sectionProgress?.time_spent_seconds || 0,
      },
      blocks: blocks || [],
      navigation: {
        prevSectionId,
        nextSectionId,
        currentIndex: sectionIndex,
        totalSections: allSections.length,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
