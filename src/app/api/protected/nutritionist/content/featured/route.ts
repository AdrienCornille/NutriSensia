import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { z } from 'zod';

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

const updateFeaturedSchema = z.object({
  content_ids: z
    .array(z.string().uuid())
    .max(3, 'Maximum 3 contenus mis en avant'),
});

/**
 * GET /api/protected/nutritionist/content/featured
 * List featured contents (is_featured = true) ordered by featured_order
 */
export async function GET() {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const { data: featured, error: fetchError } = await s
      .from('educational_contents')
      .select('*')
      .eq('nutritionist_id', nutritionistId)
      .eq('is_featured', true)
      .order('featured_order', { ascending: true });

    if (fetchError) {
      console.error('Error fetching featured content:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la recuperation des contenus mis en avant'
      );
    }

    return apiResponse.success({ featured: featured || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/content/featured
 * Update featured contents.
 * Body: { content_ids: string[] } - order of IDs determines featured_order.
 * Max 3 items. Sets is_featured=true for given IDs, false for all others.
 */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const body = await req.json();
    const parsed = updateFeaturedSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const { content_ids } = parsed.data;

    // Verify all provided content IDs belong to this nutritionist
    if (content_ids.length > 0) {
      const { data: ownedContents, error: verifyError } = await s
        .from('educational_contents')
        .select('id')
        .eq('nutritionist_id', nutritionistId)
        .in('id', content_ids);

      if (verifyError) {
        console.error('Error verifying content ownership:', verifyError);
        return apiResponse.serverError('Erreur serveur');
      }

      const ownedIds = new Set(
        (ownedContents || []).map((c: { id: string }) => c.id)
      );
      const notOwned = content_ids.filter(id => !ownedIds.has(id));

      if (notOwned.length > 0) {
        return apiResponse.error(
          'Certains contenus sont introuvables ou ne vous appartiennent pas',
          400
        );
      }
    }

    // Step 1: Unfeature all current featured contents for this nutritionist
    const { error: unfeaturedError } = await s
      .from('educational_contents')
      .update({ is_featured: false, featured_order: 0 })
      .eq('nutritionist_id', nutritionistId)
      .eq('is_featured', true);

    if (unfeaturedError) {
      console.error('Error unfeaturing contents:', unfeaturedError);
      return apiResponse.serverError(
        'Erreur lors de la mise a jour des contenus'
      );
    }

    // Step 2: Feature the new ones with their order
    for (let i = 0; i < content_ids.length; i++) {
      const { error: featureError } = await s
        .from('educational_contents')
        .update({ is_featured: true, featured_order: i + 1 })
        .eq('id', content_ids[i])
        .eq('nutritionist_id', nutritionistId);

      if (featureError) {
        console.error(
          `Error featuring content ${content_ids[i]}:`,
          featureError
        );
        return apiResponse.serverError(
          'Erreur lors de la mise en avant du contenu'
        );
      }
    }

    // Return updated featured list
    const { data: updatedFeatured, error: fetchError } = await s
      .from('educational_contents')
      .select('*')
      .eq('nutritionist_id', nutritionistId)
      .eq('is_featured', true)
      .order('featured_order', { ascending: true });

    if (fetchError) {
      console.error('Error fetching updated featured:', fetchError);
      return apiResponse.serverError('Erreur serveur');
    }

    return apiResponse.success({ featured: updatedFeatured || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
