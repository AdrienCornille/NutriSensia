import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateSectionSchema } from '@/lib/api-schemas';

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
 * GET /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections/[sectionId]
 * Get a single section with all its blocks ordered by sort_order.
 */
export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      contentId: string;
      chapterId: string;
      sectionId: string;
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

    const { contentId, chapterId, sectionId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership
    const { data: content } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);
    if (content.type !== 'course')
      return apiResponse.error("Ce contenu n'est pas un cours", 400);

    // Verify chapter belongs to this course
    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    // Fetch section with blocks and referenced content
    const { data: section, error } = await s
      .from('course_sections')
      .select(
        '*, blocks:course_section_blocks(id, block_type, sort_order, body, media_url, media_type, file_url, file_name, file_size, created_at, updated_at), referenced_content:educational_contents!referenced_content_id(id, title, type, thumbnail_url, status)'
      )
      .eq('id', sectionId)
      .eq('chapter_id', chapterId)
      .single();

    if (error || !section) {
      if (!section) return apiResponse.error('Section introuvable', 404);
      console.error('Error fetching section:', error);
      return apiResponse.serverError('Erreur lors du chargement de la section');
    }

    // Sort blocks by sort_order
    section.blocks = (section.blocks || []).sort(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any, b: any) => a.sort_order - b.sort_order
    );

    return apiResponse.success(section);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections/[sectionId]
 * Update a section.
 */
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      contentId: string;
      chapterId: string;
      sectionId: string;
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

    const { contentId, chapterId, sectionId } = await params;
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

    // Verify chapter belongs to this course
    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    const body = await req.json();
    const parsed = updateSectionSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    const { data: updated, error } = await createAdminClient()
      .from('course_sections')
      .update(parsed.data)
      .eq('id', sectionId)
      .eq('chapter_id', chapterId)
      .select()
      .single();

    if (error) {
      console.error('Error updating section:', error);
      return apiResponse.serverError(
        'Erreur lors de la mise à jour de la section'
      );
    }

    if (!updated) return apiResponse.error('Section introuvable', 404);

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * DELETE /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections/[sectionId]
 * Delete a section.
 */
export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      contentId: string;
      chapterId: string;
      sectionId: string;
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

    const { contentId, chapterId, sectionId } = await params;
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

    // Verify chapter belongs to this course
    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    const { error } = await createAdminClient()
      .from('course_sections')
      .delete()
      .eq('id', sectionId)
      .eq('chapter_id', chapterId);

    if (error) {
      console.error('Error deleting section:', error);
      return apiResponse.serverError(
        'Erreur lors de la suppression de la section'
      );
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
