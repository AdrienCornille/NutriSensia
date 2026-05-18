import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/content/saved
 * List all saved (bookmarked) content for the authenticated patient.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Get patient profile
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('id, nutritionist_id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile || !patientProfile.nutritionist_id) {
      return apiResponse.error('Profil patient introuvable', 404);
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const offset = (page - 1) * limit;

    // Query saved content joined with educational_contents
    const {
      data: saves,
      error: fetchError,
      count,
    } = await s
      .from('content_saves')
      .select(
        'id, saved_at, content_id, educational_contents!inner(id, nutritionist_id, type, category, status, title, slug, summary, thumbnail_url, reading_time_minutes, duration_seconds, tags, key_points, is_featured, published_at, view_count, save_count, like_count, created_at, updated_at)',
        { count: 'exact' }
      )
      .eq('user_id', auth.user.id)
      .eq('educational_contents.status', 'published')
      .eq(
        'educational_contents.nutritionist_id',
        patientProfile.nutritionist_id
      )
      .order('saved_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('Error fetching saved content:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la recuperation des contenus sauvegardes'
      );
    }

    // Get liked status for all saved content
    const contentIds = (saves || []).map(
      (sv: { content_id: string }) => sv.content_id
    );

    let likedIds: string[] = [];
    if (contentIds.length > 0) {
      const { data: likes } = await s
        .from('content_likes')
        .select('content_id')
        .eq('user_id', auth.user.id)
        .in('content_id', contentIds);

      likedIds = (likes || []).map((l: { content_id: string }) => l.content_id);
    }

    // Flatten the joined data
    const contents = (saves || []).map(
      (save: {
        saved_at: string;
        content_id: string;
        educational_contents: Record<string, unknown>;
      }) => ({
        ...save.educational_contents,
        saved_at: save.saved_at,
        saved: true,
        liked: likedIds.includes(save.content_id),
      })
    );

    return apiResponse.success({
      contents,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
