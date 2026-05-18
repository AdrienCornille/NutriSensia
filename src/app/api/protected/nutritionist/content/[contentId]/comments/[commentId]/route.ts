import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

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
 * DELETE /api/protected/nutritionist/content/[contentId]/comments/[commentId]
 * Nutritionist can delete any comment on their content
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string; commentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { contentId, commentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify ownership of the content
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();

    if (!content) {
      return apiResponse.error('Contenu introuvable', 404);
    }

    // Verify comment exists and belongs to this content
    const { data: comment } = await s
      .from('content_comments')
      .select('id')
      .eq('id', commentId)
      .eq('content_id', contentId)
      .single();

    if (!comment) {
      return apiResponse.error('Commentaire introuvable', 404);
    }

    // Delete the comment (and child replies will be handled by DB cascade or remain orphaned)
    const { error: deleteError } = await s
      .from('content_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return apiResponse.serverError(
        'Erreur lors de la suppression du commentaire'
      );
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
