import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createChapterSchema, reorderChaptersSchema } from '@/lib/api-schemas';

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
 * GET /api/protected/nutritionist/content/[contentId]/chapters
 * List chapters for a course, ordered by sort_order
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

    // Verify ownership + course type
    const { data: content } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);
    if (content.type !== 'course')
      return apiResponse.error("Ce contenu n'est pas un cours", 400);

    // Fetch chapters with nested sections (admin client to bypass slow RLS - ownership verified above)
    const { data: chapters, error } = await createAdminClient()
      .from('course_chapters')
      .select(
        '*, sections:course_sections(id, title, sort_order, section_type)'
      )
      .eq('course_id', contentId)
      .order('sort_order');

    if (error) {
      console.error('Error fetching chapters:', error);
      return apiResponse.serverError('Erreur lors du chargement des chapitres');
    }

    // Order sections within each chapter
    const chaptersWithOrderedSections = (chapters || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chapter: any) => ({
        ...chapter,
        sections: (chapter.sections || []).sort(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any, b: any) => a.sort_order - b.sort_order
        ),
      })
    );

    return apiResponse.success(chaptersWithOrderedSections);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content/[contentId]/chapters
 * Create a new chapter
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

    // Verify ownership + course type
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
    const parsed = createChapterSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    // Get max sort_order
    const { data: maxOrderRow } = await s
      .from('course_chapters')
      .select('sort_order')
      .eq('course_id', contentId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder =
      parsed.data.sort_order ?? (maxOrderRow?.sort_order ?? -1) + 1;

    const { data: chapter, error } = await createAdminClient()
      .from('course_chapters')
      .insert({
        course_id: contentId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chapter:', error);
      return apiResponse.serverError('Erreur lors de la création du chapitre');
    }

    return apiResponse.success(chapter, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/content/[contentId]/chapters
 * Reorder chapters (accepts { chapter_ids: [...] })
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
    const parsed = reorderChaptersSchema.safeParse(body);
    if (!parsed.success) return apiResponse.error("Liste d'IDs invalide", 400);

    // Update sort_order for each chapter
    const admin = createAdminClient();
    for (let i = 0; i < parsed.data.chapter_ids.length; i++) {
      await admin
        .from('course_chapters')
        .update({ sort_order: i })
        .eq('id', parsed.data.chapter_ids[i])
        .eq('course_id', contentId);
    }

    return apiResponse.success({ reordered: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
