/**
 * API Route: /api/protected/dossier/meal-plan/adherence
 * Patient-side: returns adherence stats for the active plan
 *
 * GET - Statistiques d'adhérence (via get_plan_adherence_stats + détail par jour)
 */

import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

export async function GET() {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;
    const userId = auth.user.id;

    // Find active plan
    const { data: plan } = await s
      .from('meal_plans')
      .select('id')
      .eq('patient_id', userId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!plan) {
      return apiResponse.success({
        summary: {
          total_meals: 0,
          followed_meals: 0,
          partial_meals: 0,
          skipped_meals: 0,
          not_tracked_meals: 0,
          adherence_rate: null,
        },
        daily: [],
      });
    }

    // 1. Get overall stats via RPC
    const { data: stats, error: statsError } = await s.rpc('get_plan_adherence_stats', {
      p_plan_id: plan.id,
      p_start_date: null,
      p_end_date: null,
    });

    if (statsError) {
      console.error('Error fetching adherence stats:', statsError);
      return apiResponse.success({
        summary: {
          total_meals: 0,
          followed_meals: 0,
          partial_meals: 0,
          skipped_meals: 0,
          not_tracked_meals: 0,
          adherence_rate: null,
        },
        daily: [],
      });
    }

    const summary = stats && stats.length > 0
      ? stats[0]
      : {
          total_meals: 0,
          followed_meals: 0,
          partial_meals: 0,
          skipped_meals: 0,
          not_tracked_meals: 0,
          adherence_rate: null,
        };

    // 2. Get daily breakdown
    const { data: dailyData, error: dailyError } = await s
      .from('plan_adherence')
      .select('id, date, status, plan_meal_id, notes, created_at')
      .eq('meal_plan_id', plan.id)
      .eq('patient_id', userId)
      .order('date', { ascending: true });

    if (dailyError) {
      console.error('Error fetching daily adherence:', dailyError);
    }

    // Group by date
    const dailyMap: Record<string, { date: string; followed: number; partial: number; skipped: number; not_tracked: number; total: number }> = {};
    for (const entry of dailyData || []) {
      const d = entry.date;
      if (!dailyMap[d]) {
        dailyMap[d] = { date: d, followed: 0, partial: 0, skipped: 0, not_tracked: 0, total: 0 };
      }
      dailyMap[d].total++;
      if (entry.status === 'followed') dailyMap[d].followed++;
      else if (entry.status === 'partial') dailyMap[d].partial++;
      else if (entry.status === 'skipped') dailyMap[d].skipped++;
      else dailyMap[d].not_tracked++;
    }

    const daily = Object.values(dailyMap).map(d => ({
      ...d,
      adherence_rate: d.total > 0
        ? Math.round(((d.followed + d.partial * 0.5) / d.total) * 100)
        : null,
    }));

    return apiResponse.success({ summary, daily });
  } catch (error) {
    console.error('Unexpected error in patient adherence GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
