import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createContentSchema } from '@/lib/api-schemas';

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

// Estimate reading time from HTML body (words / 200 wpm)
function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * GET /api/protected/nutritionist/content
 * List all content for the authenticated nutritionist
 * Query params: type, category, status, search, page, limit
 */
export async function GET(req: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const offset = (page - 1) * limit;

    // Build query - join custom categories
    let query = s
      .from('educational_contents')
      .select('*, custom_content_categories(name, color)', { count: 'exact' })
      .eq('nutritionist_id', nutritionistId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);
    if (category) {
      if (category.startsWith('custom:')) {
        query = query.eq('custom_category_id', category.replace('custom:', ''));
      } else {
        query = query.eq('category', category);
      }
    }
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data: contents, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Error fetching content:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la recuperation des contenus'
      );
    }

    // Flatten custom category fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flatContents = (contents || []).map((c: any) => {
      const customCat = c.custom_content_categories;
      const { custom_content_categories, ...rest } = c;
      return {
        ...rest,
        custom_category_name: customCat?.name || null,
        custom_category_color: customCat?.color || null,
      };
    });

    return apiResponse.success({
      contents: flatContents,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content
 * Create new educational content
 */
export async function POST(req: NextRequest) {
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
    const parsed = createContentSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;

    // Generate slug
    let slug = generateSlug(data.title);

    // Ensure unique slug
    const { data: existing } = await s
      .from('educational_contents')
      .select('id')
      .eq('nutritionist_id', nutritionistId)
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Auto-calculate reading time for articles
    let readingTime = data.reading_time_minutes;
    if (data.type === 'article' && data.body && !readingTime) {
      readingTime = estimateReadingTime(data.body);
    }

    const insertData = {
      nutritionist_id: nutritionistId,
      type: data.type,
      category: data.category,
      status: 'draft' as const,
      title: data.title,
      slug,
      summary: data.summary || null,
      body: data.body || null,
      media_url: data.media_url || null,
      media_type: data.media_type || null,
      thumbnail_url: data.thumbnail_url || null,
      tags: data.tags,
      key_points: data.key_points,
      reading_time_minutes: readingTime || null,
      duration_seconds: data.duration_seconds || null,
      file_size_bytes: data.file_size_bytes || null,
      page_count: data.page_count || null,
      scheduled_publish_at: data.scheduled_publish_at || null,
    };

    const { data: created, error: createError } = await s
      .from('educational_contents')
      .insert(insertData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating content:', createError);
      return apiResponse.serverError('Erreur lors de la creation du contenu');
    }

    return apiResponse.success(created, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
