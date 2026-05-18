import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { z } from 'zod';

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

const createSectionSchema = z.object({
  title: z.string().min(1).max(200),
  section_type: z.enum(['original', 'reference']),
  body: z.string().optional().nullable(),
  referenced_content_id: z.string().uuid().optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
});

const reorderSchema = z.object({
  section_ids: z.array(z.string().uuid()),
});

/**
 * GET /api/protected/nutritionist/content/[contentId]/sections
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

    // Fetch sections with referenced content info
    const { data: sections, error } = await s
      .from('course_sections')
      .select(
        '*, referenced_content:educational_contents!referenced_content_id(id, title, type, thumbnail_url, status)'
      )
      .eq('course_id', contentId)
      .order('sort_order');

    if (error) {
      console.error('Error fetching sections:', error);
      return apiResponse.serverError('Erreur lors du chargement');
    }

    return apiResponse.success(sections || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content/[contentId]/sections
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

    const { data: content } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);
    if (content.type !== 'course')
      return apiResponse.error("Ce contenu n'est pas un cours", 400);

    const body = await req.json();
    const parsed = createSectionSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    // Get max sort_order
    const { data: maxOrderRow } = await s
      .from('course_sections')
      .select('sort_order')
      .eq('course_id', contentId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder =
      parsed.data.sort_order ?? (maxOrderRow?.sort_order ?? -1) + 1;

    const { data: section, error } = await s
      .from('course_sections')
      .insert({
        course_id: contentId,
        title: parsed.data.title,
        section_type: parsed.data.section_type,
        body: parsed.data.body || null,
        referenced_content_id: parsed.data.referenced_content_id || null,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating section:', error);
      return apiResponse.serverError('Erreur lors de la création');
    }

    return apiResponse.success(section, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/content/[contentId]/sections
 * Reorder sections (accepts { section_ids: [...] })
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

    const body = await req.json();
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) return apiResponse.error("Liste d'IDs invalide", 400);

    // Update sort_order for each section
    for (let i = 0; i < parsed.data.section_ids.length; i++) {
      await s
        .from('course_sections')
        .update({ sort_order: i })
        .eq('id', parsed.data.section_ids[i])
        .eq('course_id', contentId);
    }

    return apiResponse.success({ reordered: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
