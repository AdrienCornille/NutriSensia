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
 * GET /api/protected/nutritionist/content/[contentId]/versions
 * List all versions for a content (ordered by version_number DESC)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { contentId } = await params;
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

    // Fetch all versions ordered by version_number DESC
    const { data: versions, error: fetchError } = await s
      .from('content_versions')
      .select('*')
      .eq('content_id', contentId)
      .order('version_number', { ascending: false });

    if (fetchError) {
      console.error('Error fetching versions:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des versions'
      );
    }

    return apiResponse.success(versions || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content/[contentId]/versions
 * Create a new version snapshot (called when publishing)
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
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify ownership and read current content
    const { data: content, error: contentError } = await s
      .from('educational_contents')
      .select('id, title, summary, body, tags, key_points')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();

    if (contentError || !content) {
      return apiResponse.error('Contenu introuvable', 404);
    }

    // Parse optional body
    let changeSummary: string | null = null;
    try {
      const body = await req.json();
      if (body.change_summary && typeof body.change_summary === 'string') {
        changeSummary = body.change_summary;
      }
    } catch {
      // No body or invalid JSON — that's fine, change_summary is optional
    }

    // Get max version_number for this content
    const { data: maxVersionRow } = await s
      .from('content_versions')
      .select('version_number')
      .eq('content_id', contentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (maxVersionRow?.version_number || 0) + 1;

    // Insert new version
    const { data: newVersion, error: insertError } = await s
      .from('content_versions')
      .insert({
        content_id: contentId,
        version_number: nextVersionNumber,
        title: content.title,
        summary: content.summary,
        body: content.body,
        tags: content.tags,
        key_points: content.key_points,
        change_summary: changeSummary,
        created_by: auth.user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating version:', insertError);
      return apiResponse.serverError(
        'Erreur lors de la création de la version'
      );
    }

    // Update current_version on the content
    const { error: updateError } = await s
      .from('educational_contents')
      .update({
        current_version: nextVersionNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contentId);

    if (updateError) {
      console.error('Error updating current_version:', updateError);
      // Version was created but current_version not updated — non-fatal
    }

    return apiResponse.success(newVersion, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
