import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateBlockSchema } from '@/lib/api-schemas';

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
 * PATCH /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections/[sectionId]/blocks/[blockId]
 * Update a block.
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
      blockId: string;
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

    const { contentId, chapterId, sectionId, blockId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify full ownership chain: content → chapter → section → block
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    const { data: section } = await s
      .from('course_sections')
      .select('id')
      .eq('id', sectionId)
      .eq('chapter_id', chapterId)
      .single();
    if (!section) return apiResponse.error('Section introuvable', 404);

    const body = await req.json();
    const parsed = updateBlockSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    // Use admin client to bypass slow RLS policies (ownership already verified above)
    const admin = createAdminClient();
    const { data: updated, error } = await admin
      .from('course_section_blocks')
      .update(parsed.data)
      .eq('id', blockId)
      .eq('section_id', sectionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating block:', error);
      return apiResponse.serverError('Erreur lors de la mise à jour du bloc');
    }

    if (!updated) return apiResponse.error('Bloc introuvable', 404);

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * DELETE /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections/[sectionId]/blocks/[blockId]
 * Delete a block.
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
      blockId: string;
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

    const { contentId, chapterId, sectionId, blockId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify full ownership chain
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    const { data: section } = await s
      .from('course_sections')
      .select('id')
      .eq('id', sectionId)
      .eq('chapter_id', chapterId)
      .single();
    if (!section) return apiResponse.error('Section introuvable', 404);

    // Use admin client to bypass slow RLS policies (ownership already verified above)
    const admin = createAdminClient();
    const { error } = await admin
      .from('course_section_blocks')
      .delete()
      .eq('id', blockId)
      .eq('section_id', sectionId);

    if (error) {
      console.error('Error deleting block:', error);
      return apiResponse.serverError('Erreur lors de la suppression du bloc');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
