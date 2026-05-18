import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * POST /api/protected/content/[contentId]/like
 * Toggle like on a published content for the authenticated patient.
 * If already liked, removes the like. If not liked, adds a like.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Get patient profile to verify nutritionist relationship
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('id, nutritionist_id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile || !patientProfile.nutritionist_id) {
      return apiResponse.error('Profil patient introuvable', 404);
    }

    // Verify content exists, is published, and belongs to patient's nutritionist
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', patientProfile.nutritionist_id)
      .eq('status', 'published')
      .single();

    if (!content) {
      return apiResponse.error('Contenu introuvable', 404);
    }

    // Check if already liked
    const { data: existingLike } = await s
      .from('content_likes')
      .select('id')
      .eq('content_id', contentId)
      .eq('user_id', auth.user.id)
      .maybeSingle();

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await s
        .from('content_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        return apiResponse.serverError('Erreur lors du retrait du like');
      }

      return apiResponse.success({ liked: false });
    } else {
      // Like
      const { error: insertError } = await s.from('content_likes').insert({
        content_id: contentId,
        user_id: auth.user.id,
      });

      if (insertError) {
        console.error('Error adding like:', insertError);
        return apiResponse.serverError("Erreur lors de l'ajout du like");
      }

      return apiResponse.success({ liked: true });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
