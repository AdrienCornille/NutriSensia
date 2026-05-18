import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateContentSchema } from '@/lib/api-schemas';

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

// Estimate reading time from HTML body
function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * GET /api/protected/nutritionist/content/[contentId]
 * Get a single content by ID
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

    const { data: content, error: fetchError } = await s
      .from('educational_contents')
      .select('*')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();

    if (fetchError || !content) {
      return apiResponse.error('Contenu introuvable', 404);
    }

    return apiResponse.success(content);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/content/[contentId]
 * Update content (title, body, status, etc.)
 */
export async function PATCH(
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

    // Verify ownership
    const { data: existing } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();

    if (!existing) {
      return apiResponse.error('Contenu introuvable', 404);
    }

    const body = await req.json();
    const parsed = updateContentSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    // Auto-update reading time if body changed for articles
    if (
      updateData.body &&
      typeof updateData.body === 'string' &&
      (existing.type === 'article' || updateData.type === 'article')
    ) {
      updateData.reading_time_minutes = estimateReadingTime(
        updateData.body as string
      );
    }

    // Set published_at when publishing for the first time
    if (updateData.status === 'published') {
      const { data: current } = await s
        .from('educational_contents')
        .select('published_at')
        .eq('id', contentId)
        .single();

      if (current && !current.published_at) {
        updateData.published_at = new Date().toISOString();
      }
      // Clear scheduled date on immediate publish
      updateData.scheduled_publish_at = null;
    }

    // Handle scheduled publication
    if (updateData.status === 'scheduled') {
      if (!updateData.scheduled_publish_at) {
        return apiResponse.error(
          'Une date de publication est requise pour planifier',
          400
        );
      }
      const scheduledDate = new Date(updateData.scheduled_publish_at as string);
      if (scheduledDate <= new Date()) {
        return apiResponse.error(
          'La date de publication planifiée doit être dans le futur',
          400
        );
      }
    }

    // Handle unpublish (Published → Draft)
    if (updateData.status === 'draft') {
      updateData.scheduled_publish_at = null;
    }

    const { data: updated, error: updateError } = await s
      .from('educational_contents')
      .update(updateData)
      .eq('id', contentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating content:', updateError);
      return apiResponse.serverError(
        'Erreur lors de la mise a jour du contenu'
      );
    }

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * DELETE /api/protected/nutritionist/content/[contentId]
 * Delete content permanently
 */
export async function DELETE(
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

    // Verify ownership
    const { data: existing } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();

    if (!existing) {
      return apiResponse.error('Contenu introuvable', 404);
    }

    const { error: deleteError } = await s
      .from('educational_contents')
      .delete()
      .eq('id', contentId);

    if (deleteError) {
      console.error('Error deleting content:', deleteError);
      return apiResponse.serverError(
        'Erreur lors de la suppression du contenu'
      );
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
