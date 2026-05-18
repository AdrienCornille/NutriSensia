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
 * GET /api/protected/nutritionist/content/[contentId]/versions/[versionId]
 * Get a single version by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string; versionId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { contentId, versionId } = await params;
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

    // Fetch the specific version
    const { data: version, error: fetchError } = await s
      .from('content_versions')
      .select('*')
      .eq('id', versionId)
      .eq('content_id', contentId)
      .single();

    if (fetchError || !version) {
      return apiResponse.error('Version introuvable', 404);
    }

    return apiResponse.success(version);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content/[contentId]/versions/[versionId]
 * Restore a version — copies version data back to the content
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string; versionId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { contentId, versionId } = await params;
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

    // Fetch the version to restore
    const { data: version, error: versionError } = await s
      .from('content_versions')
      .select('title, summary, body, tags, key_points, version_number')
      .eq('id', versionId)
      .eq('content_id', contentId)
      .single();

    if (versionError || !version) {
      return apiResponse.error('Version introuvable', 404);
    }

    // Copy version data back to the content
    const { data: updated, error: updateError } = await s
      .from('educational_contents')
      .update({
        title: version.title,
        summary: version.summary,
        body: version.body,
        tags: version.tags,
        key_points: version.key_points,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error restoring version:', updateError);
      return apiResponse.serverError(
        'Erreur lors de la restauration de la version'
      );
    }

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
