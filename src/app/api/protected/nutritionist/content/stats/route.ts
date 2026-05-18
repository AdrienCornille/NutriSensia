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
 * GET /api/protected/nutritionist/content/stats
 * Returns engagement statistics for the authenticated nutritionist's content:
 * - Total views, likes, saves, comments
 * - Top 5 most viewed contents
 * - Views over the last 30 days grouped by day
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

    // 1. Aggregate totals from educational_contents
    const { data: allContents, error: contentsError } = await s
      .from('educational_contents')
      .select('id, title, view_count, save_count')
      .eq('nutritionist_id', nutritionistId);

    if (contentsError) {
      console.error('Error fetching contents for stats:', contentsError);
      return apiResponse.serverError(
        'Erreur lors de la recuperation des statistiques'
      );
    }

    const contents = allContents || [];
    const contentIds = contents.map((c: { id: string }) => c.id);

    let totalViews = 0;
    let totalSaves = 0;

    for (const c of contents) {
      totalViews += c.view_count || 0;
      totalSaves += c.save_count || 0;
    }

    // likes and comments are not yet stored in DB columns;
    // default to 0 for forward compatibility
    const totalLikes = 0;
    const totalComments = 0;

    // 2. Top 5 most viewed contents
    const topContents = [...contents]
      .sort(
        (a: { view_count: number }, b: { view_count: number }) =>
          (b.view_count || 0) - (a.view_count || 0)
      )
      .slice(0, 5)
      .map((c: { id: string; title: string; view_count: number }) => ({
        id: c.id,
        title: c.title,
        view_count: c.view_count || 0,
      }));

    // 3. Views over the last 30 days from content_views table
    let viewsOverTime: { date: string; views: number }[] = [];

    if (contentIds.length > 0) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sinceDate = thirtyDaysAgo.toISOString().split('T')[0];

      const { data: viewRows, error: viewsError } = await s
        .from('content_views')
        .select('view_date')
        .in('content_id', contentIds)
        .gte('view_date', sinceDate)
        .order('view_date', { ascending: true });

      if (viewsError) {
        console.error('Error fetching content views:', viewsError);
        // Non-blocking: return empty views over time
      } else {
        // Group by view_date
        const dateMap: Record<string, number> = {};
        for (const row of viewRows || []) {
          const d = row.view_date;
          dateMap[d] = (dateMap[d] || 0) + 1;
        }

        // Fill in all 30 days (including days with 0 views)
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          viewsOverTime.push({
            date: dateStr,
            views: dateMap[dateStr] || 0,
          });
        }
      }
    }

    return apiResponse.success({
      totalViews,
      totalLikes,
      totalSaves,
      totalComments,
      mostPopular: topContents,
      viewsOverTime,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
