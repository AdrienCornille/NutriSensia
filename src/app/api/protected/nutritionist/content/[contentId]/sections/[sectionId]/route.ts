import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { z } from 'zod';

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

const updateSectionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().optional().nullable(),
  referenced_content_id: z.string().uuid().optional().nullable(),
});

/**
 * PATCH /api/protected/nutritionist/content/[contentId]/sections/[sectionId]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string; sectionId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, sectionId } = await params;
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
    const parsed = updateSectionSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    const { data: updated, error } = await s
      .from('course_sections')
      .update(parsed.data)
      .eq('id', sectionId)
      .eq('course_id', contentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating section:', error);
      return apiResponse.serverError('Erreur lors de la mise à jour');
    }

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * DELETE /api/protected/nutritionist/content/[contentId]/sections/[sectionId]
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string; sectionId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, sectionId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    const { error } = await s
      .from('course_sections')
      .delete()
      .eq('id', sectionId)
      .eq('course_id', contentId);

    if (error) {
      console.error('Error deleting section:', error);
      return apiResponse.serverError('Erreur lors de la suppression');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
