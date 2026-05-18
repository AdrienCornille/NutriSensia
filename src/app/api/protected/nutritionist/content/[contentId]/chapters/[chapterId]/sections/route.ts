import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createSectionSchema, reorderSectionsSchema } from '@/lib/api-schemas';

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
 * GET /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections
 * List sections for a chapter, ordered by sort_order.
 * Includes blocks (id, block_type, sort_order) and referenced_content info.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string; chapterId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, chapterId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership of the content (must be a course)
    const { data: content } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);
    if (content.type !== 'course')
      return apiResponse.error("Ce contenu n'est pas un cours", 400);

    // Verify the chapter belongs to this course
    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    // Fetch sections with blocks and referenced content (admin client to bypass slow RLS - ownership verified above)
    const { data: sections, error } = await createAdminClient()
      .from('course_sections')
      .select(
        '*, blocks:course_section_blocks(id, block_type, sort_order), referenced_content:educational_contents!referenced_content_id(id, title, type, thumbnail_url, status)'
      )
      .eq('chapter_id', chapterId)
      .order('sort_order');

    if (error) {
      console.error('Error fetching sections:', error);
      return apiResponse.serverError('Erreur lors du chargement des sections');
    }

    // Sort blocks by sort_order within each section
    const sectionsWithSortedBlocks = (sections || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (section: any) => ({
        ...section,
        blocks: (section.blocks || []).sort(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any, b: any) => a.sort_order - b.sort_order
        ),
      })
    );

    return apiResponse.success(sectionsWithSortedBlocks);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections
 * Create a new section in a chapter.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string; chapterId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, chapterId } = await params;
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

    // Verify chapter belongs to this course
    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    const body = await req.json();
    const parsed = createSectionSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    // Auto-calculate sort_order
    const { data: maxOrderRow } = await s
      .from('course_sections')
      .select('sort_order')
      .eq('chapter_id', chapterId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder =
      parsed.data.sort_order ?? (maxOrderRow?.sort_order ?? -1) + 1;

    const { data: section, error } = await createAdminClient()
      .from('course_sections')
      .insert({
        chapter_id: chapterId,
        title: parsed.data.title,
        section_type: parsed.data.section_type,
        referenced_content_id: parsed.data.referenced_content_id || null,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating section:', error);
      return apiResponse.serverError(
        'Erreur lors de la création de la section'
      );
    }

    return apiResponse.success(section, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections
 * Reorder sections (accepts { section_ids: [...] })
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string; chapterId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, chapterId } = await params;
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

    // Verify chapter belongs to this course
    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    const body = await req.json();
    const parsed = reorderSectionsSchema.safeParse(body);
    if (!parsed.success) return apiResponse.error("Liste d'IDs invalide", 400);

    // Update sort_order for each section
    const admin = createAdminClient();
    for (let i = 0; i < parsed.data.section_ids.length; i++) {
      await admin
        .from('course_sections')
        .update({ sort_order: i })
        .eq('id', parsed.data.section_ids[i])
        .eq('chapter_id', chapterId);
    }

    return apiResponse.success({ reordered: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
