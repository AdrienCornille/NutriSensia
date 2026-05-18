import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/content
 * List published educational content for the authenticated patient
 * Query params: type, category, search, page, limit
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

    // Get patient profile to find their nutritionist
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
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const offset = (page - 1) * limit;

    // Build query - only published content from patient's nutritionist
    // Join custom_content_categories to get the custom category name
    let query = s
      .from('educational_contents')
      .select('*, custom_content_categories(name, color)', { count: 'exact' })
      .eq('nutritionist_id', patientProfile.nutritionist_id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);
    if (category) {
      if (category.startsWith('custom:')) {
        // Custom category filter by UUID
        query = query.eq('custom_category_id', category.replace('custom:', ''));
      } else {
        query = query.eq('category', category);
      }
    }
    if (search) query = query.ilike('title', `%${search}%`);

    const { data: contents, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Error fetching content:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la recuperation des contenus'
      );
    }

    // Check which contents the patient has liked/saved
    const contentIds = (contents || []).map((c: { id: string }) => c.id);

    let likedIds: string[] = [];
    let savedIds: string[] = [];

    if (contentIds.length > 0) {
      const [likesResult, savesResult] = await Promise.all([
        s
          .from('content_likes')
          .select('content_id')
          .eq('user_id', auth.user.id)
          .in('content_id', contentIds),
        s
          .from('content_saves')
          .select('content_id')
          .eq('user_id', auth.user.id)
          .in('content_id', contentIds),
      ]);

      likedIds = (likesResult.data || []).map(
        (l: { content_id: string }) => l.content_id
      );
      savedIds = (savesResult.data || []).map(
        (sv: { content_id: string }) => sv.content_id
      );
    }

    // Enrich contents with liked/saved flags + flatten custom category
    const enrichedContents = (contents || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (content: any) => {
        const customCat = content.custom_content_categories;
        const { custom_content_categories, ...rest } = content;
        return {
          ...rest,
          custom_category_name: customCat?.name || null,
          custom_category_color: customCat?.color || null,
          liked: likedIds.includes(content.id),
          saved: savedIds.includes(content.id),
        };
      }
    );

    return apiResponse.success({
      contents: enrichedContents,
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
