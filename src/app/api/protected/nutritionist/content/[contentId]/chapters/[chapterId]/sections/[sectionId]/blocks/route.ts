import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createBlockSchema, reorderBlocksSchema } from '@/lib/api-schemas';

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
 * GET /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections/[sectionId]/blocks
 * List blocks for a section, ordered by sort_order.
 */
export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      contentId: string;
      chapterId: string;
      sectionId: string;
    }>;
  }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, chapterId, sectionId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership (content → chapter → section chain)
    const { data: content } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);
    if (content.type !== 'course')
      return apiResponse.error("Ce contenu n'est pas un cours", 400);

    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    const { data: section } = await s
      .from('course_sections')
      .select('id')
      .eq('id', sectionId)
      .eq('chapter_id', chapterId)
      .single();
    if (!section) return apiResponse.error('Section introuvable', 404);

    // Fetch blocks (use admin client to bypass slow RLS policies - ownership already verified above)
    const { data: blocks, error } = await createAdminClient()
      .from('course_section_blocks')
      .select('*')
      .eq('section_id', sectionId)
      .order('sort_order');

    if (error) {
      console.error('Error fetching blocks:', error);
      return apiResponse.serverError('Erreur lors du chargement des blocs');
    }

    return apiResponse.success(blocks || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections/[sectionId]/blocks
 * Create a new block in a section.
 */
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      contentId: string;
      chapterId: string;
      sectionId: string;
    }>;
  }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, chapterId, sectionId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify full ownership chain
    const { data: content } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);
    if (content.type !== 'course')
      return apiResponse.error("Ce contenu n'est pas un cours", 400);

    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    const { data: section } = await s
      .from('course_sections')
      .select('id')
      .eq('id', sectionId)
      .eq('chapter_id', chapterId)
      .single();
    if (!section) return apiResponse.error('Section introuvable', 404);

    const body = await req.json();
    const parsed = createBlockSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse.error(parsed.error.issues[0].message, 400);

    // Use admin client to bypass slow RLS policies (ownership already verified above)
    const admin = createAdminClient();

    // Auto-calculate sort_order
    const { data: maxOrderRow } = await admin
      .from('course_section_blocks')
      .select('sort_order')
      .eq('section_id', sectionId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder =
      parsed.data.sort_order ?? (maxOrderRow?.sort_order ?? -1) + 1;

    const { data: block, error } = await admin
      .from('course_section_blocks')
      .insert({
        section_id: sectionId,
        block_type: parsed.data.block_type,
        body: parsed.data.body || null,
        media_url: parsed.data.media_url || null,
        media_type: parsed.data.media_type || null,
        file_url: parsed.data.file_url || null,
        file_name: parsed.data.file_name || null,
        file_size: parsed.data.file_size || null,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating block:', error);
      return apiResponse.serverError('Erreur lors de la création du bloc');
    }

    return apiResponse.success(block, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * PATCH /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections/[sectionId]/blocks
 * Reorder blocks (accepts { block_ids: [...] })
 */
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      contentId: string;
      chapterId: string;
      sectionId: string;
    }>;
  }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId, chapterId, sectionId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership chain
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    const { data: chapter } = await s
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .eq('course_id', contentId)
      .single();
    if (!chapter) return apiResponse.error('Chapitre introuvable', 404);

    const { data: section } = await s
      .from('course_sections')
      .select('id')
      .eq('id', sectionId)
      .eq('chapter_id', chapterId)
      .single();
    if (!section) return apiResponse.error('Section introuvable', 404);

    const body = await req.json();
    const parsed = reorderBlocksSchema.safeParse(body);
    if (!parsed.success) return apiResponse.error("Liste d'IDs invalide", 400);

    // Use admin client to bypass slow RLS policies (ownership already verified above)
    const adminReorder = createAdminClient();
    for (let i = 0; i < parsed.data.block_ids.length; i++) {
      await adminReorder
        .from('course_section_blocks')
        .update({ sort_order: i })
        .eq('id', parsed.data.block_ids[i])
        .eq('section_id', sectionId);
    }

    return apiResponse.success({ reordered: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
