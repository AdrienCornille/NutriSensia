import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { upsertBadgeSchema } from '@/lib/api-schemas';

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
 * GET /api/protected/nutritionist/content/[contentId]/badge
 * Get the badge for this course (single result or null)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    // Fetch badge (single or null)
    const { data: badge, error } = await s
      .from('course_badges')
      .select('*')
      .eq('course_id', contentId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching badge:', error);
      return apiResponse.serverError('Erreur lors du chargement du badge');
    }

    return apiResponse.success(badge);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content/[contentId]/badge
 * Create or update (upsert) the badge for this course
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
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    const body = await req.json();
    const parsed = upsertBadgeSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.validationError(parsed.error);
    }
    const data = parsed.data;

    // Upsert badge
    const { data: badge, error } = await s
      .from('course_badges')
      .upsert(
        {
          course_id: contentId,
          badge_name: data.badge_name,
          badge_icon: data.badge_icon,
          points_awarded: data.points_awarded ?? 50,
          badge_description: data.badge_description || null,
        },
        { onConflict: 'course_id' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('Error upserting badge:', error);
      return apiResponse.serverError(
        'Erreur lors de la création/mise à jour du badge'
      );
    }

    return apiResponse.success(badge);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/content/[contentId]/badge
 * Update (upsert) the badge for this course
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
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    const body = await req.json();
    const parsed = upsertBadgeSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.validationError(parsed.error);
    }
    const data = parsed.data;

    // Upsert badge
    const { data: badge, error } = await s
      .from('course_badges')
      .upsert(
        {
          course_id: contentId,
          badge_name: data.badge_name,
          badge_icon: data.badge_icon,
          points_awarded: data.points_awarded ?? 50,
          badge_description: data.badge_description || null,
        },
        { onConflict: 'course_id' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('Error upserting badge:', error);
      return apiResponse.serverError('Erreur lors de la mise à jour du badge');
    }

    return apiResponse.success(badge);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
