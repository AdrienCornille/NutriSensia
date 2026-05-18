import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateChapterSchema } from '@/lib/api-schemas';

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
 * GET /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]
 * Get a single chapter with its sections and their blocks
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string; chapterId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, chapterId } = await params;
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

    // Fetch chapter with nested sections and blocks
    const { data: chapter, error } = await s
      .from('course_chapters')
      .select('*, sections:course_sections(*, blocks:course_section_blocks(*))')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();

    if (error) {
      console.error('Error fetching chapter:', error);
      return apiResponse.serverError('Erreur lors du chargement du chapitre');
    }
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    // Order sections and blocks by sort_order
    chapter.sections = (chapter.sections || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((section: any) => ({
        ...section,
        blocks: (section.blocks || []).sort(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any, b: any) => a.sort_order - b.sort_order
        ),
      }));

    return apiResponse.success(chapter);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]
 * Update chapter title/description
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string; chapterId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, chapterId } = await params;
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

    const body = await req.json();
    const parsed = updateChapterSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    const { data: updated, error } = await createAdminClient()
      .from('course_chapters')
      .update(parsed.data)
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating chapter:', error);
      return apiResponse.serverError(
        'Erreur lors de la mise à jour du chapitre'
      );
    }

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * DELETE /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]
 * Delete a chapter (cascades to sections and blocks)
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string; chapterId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, chapterId } = await params;
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

    const { error } = await createAdminClient()
      .from('course_chapters')
      .delete()
      .eq('id', chapterId)
      .eq('course_id', contentId);

    if (error) {
      console.error('Error deleting chapter:', error);
      return apiResponse.serverError(
        'Erreur lors de la suppression du chapitre'
      );
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
