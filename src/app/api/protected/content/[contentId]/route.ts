import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/content/[contentId]
 * Get a single published content by ID for the authenticated patient.
 * Also records a view (one per user per day via upsert).
 */
export async function GET(
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

    // Get patient profile to find their nutritionist
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('id, nutritionist_id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile || !patientProfile.nutritionist_id) {
      return apiResponse.error('Profil patient introuvable', 404);
    }

    // Fetch content - must be published and from patient's nutritionist
    const { data: content, error: fetchError } = await s
      .from('educational_contents')
      .select('*')
      .eq('id', contentId)
      .eq('nutritionist_id', patientProfile.nutritionist_id)
      .eq('status', 'published')
      .single();

    if (fetchError || !content) {
      return apiResponse.error('Contenu introuvable', 404);
    }

    // Record view (upsert - one per user per day)
    // The unique constraint (content_id, user_id, view_date) prevents duplicates
    await s.from('content_views').upsert(
      {
        content_id: contentId,
        user_id: auth.user.id,
        view_date: new Date().toISOString().split('T')[0],
        viewed_at: new Date().toISOString(),
      },
      {
        onConflict: 'content_id,user_id,view_date',
      }
    );

    // Check if patient has liked/saved this content
    const [likeResult, saveResult] = await Promise.all([
      s
        .from('content_likes')
        .select('id')
        .eq('content_id', contentId)
        .eq('user_id', auth.user.id)
        .maybeSingle(),
      s
        .from('content_saves')
        .select('id')
        .eq('content_id', contentId)
        .eq('user_id', auth.user.id)
        .maybeSingle(),
    ]);

    return apiResponse.success({
      ...content,
      liked: !!likeResult.data,
      saved: !!saveResult.data,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
