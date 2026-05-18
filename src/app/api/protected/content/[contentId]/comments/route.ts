import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/content/[contentId]/comments
 * Patient can list comments on published content from their nutritionist
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

    // Verify the content is published and belongs to the patient's nutritionist
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('nutritionist_id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile?.nutritionist_id) {
      return apiResponse.error('Profil patient introuvable', 404);
    }

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

    // Pagination params
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
    );
    const offset = (page - 1) * limit;

    // Fetch top-level comments with user info
    const { data: comments, error: fetchError } = await s
      .from('content_comments')
      .select('*, profiles:user_id(id, full_name, avatar_url)', {
        count: 'exact',
      })
      .eq('content_id', contentId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('Error fetching comments:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la recuperation des commentaires'
      );
    }

    // Get total count separately for pagination
    const { count } = await s
      .from('content_comments')
      .select('id', { count: 'exact', head: true })
      .eq('content_id', contentId)
      .is('parent_id', null);

    const totalCount = count || 0;

    return apiResponse.success({
      comments: comments || [],
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/content/[contentId]/comments
 * Patient creates a comment (is_nutritionist = false)
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

    // Verify the content is published and belongs to the patient's nutritionist
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('nutritionist_id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile?.nutritionist_id) {
      return apiResponse.error('Profil patient introuvable', 404);
    }

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

    const body = await req.json();

    if (!body.body || typeof body.body !== 'string' || !body.body.trim()) {
      return apiResponse.error('Le contenu du commentaire est requis', 400);
    }

    if (body.body.trim().length > 2000) {
      return apiResponse.error(
        'Le commentaire ne peut pas depasser 2000 caracteres',
        400
      );
    }

    // If parent_id is provided, verify it exists and belongs to this content
    if (body.parent_id) {
      const { data: parentComment } = await s
        .from('content_comments')
        .select('id')
        .eq('id', body.parent_id)
        .eq('content_id', contentId)
        .single();

      if (!parentComment) {
        return apiResponse.error('Commentaire parent introuvable', 404);
      }
    }

    const { data: comment, error: insertError } = await s
      .from('content_comments')
      .insert({
        content_id: contentId,
        user_id: auth.user.id,
        body: body.body.trim(),
        parent_id: body.parent_id || null,
        is_nutritionist: false,
      })
      .select('*, profiles:user_id(id, full_name, avatar_url)')
      .single();

    if (insertError) {
      console.error('Error creating comment:', insertError);
      return apiResponse.serverError(
        'Erreur lors de la creation du commentaire'
      );
    }

    return apiResponse.success(comment, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
