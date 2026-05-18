import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { duplicateCourseSchema } from '@/lib/api-schemas';

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
 * POST /api/protected/nutritionist/content/[contentId]/duplicate
 * Duplicate a course with a new title
 */
export async function POST(
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

    // Verify ownership
    const { data: content } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);
    if (content.type !== 'course')
      return apiResponse.error('Seuls les cours peuvent être dupliqués', 400);

    const body = await req.json();
    const parsed = duplicateCourseSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.validationError(parsed.error);
    }
    const data = parsed.data;

    // Call the DB function to duplicate the course
    const { data: newCourseId, error } = await s.rpc('duplicate_course', {
      p_course_id: contentId,
      p_new_title: data.new_title,
    });

    if (error) {
      console.error('Error duplicating course:', error);
      return apiResponse.serverError('Erreur lors de la duplication du cours');
    }

    if (!newCourseId) {
      return apiResponse.serverError(
        'La duplication a échoué, aucun ID retourné'
      );
    }

    return apiResponse.created({
      id: newCourseId,
      message: 'Cours dupliqué avec succès',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
