/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]/adherence
 * PLAN-N-008: Suivi de l'adherence au plan alimentaire
 *
 * GET - Statistiques d'adherence (via get_plan_adherence_stats + detail par jour)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveNutritionistId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('nutritionist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyPlanAccess(supabase: any, planId: string, nutritionistUserId: string, patientProfileId: string, nutritionistId: string): Promise<boolean> {
  const { data: patient } = await supabase
    .from('patient_profiles')
    .select('user_id')
    .eq('id', patientProfileId)
    .eq('nutritionist_id', nutritionistId)
    .single();
  if (!patient) return false;

  const { data: plan } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('id', planId)
    .eq('patient_id', patient.user_id)
    .eq('nutritionist_id', nutritionistUserId)
    .is('deleted_at', null)
    .single();
  return !!plan;
}

type RouteParams = { params: Promise<{ id: string; planId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) return apiResponse.unauthorized();

    const { id: patientProfileId, planId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) return apiResponse.error('Profil nutritionniste introuvable', 404);

    const hasAccess = await verifyPlanAccess(s, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!hasAccess) return apiResponse.error('Plan introuvable ou acces non autorise', 403);

    // Parse optional date range from query
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start_date') || null;
    const endDate = url.searchParams.get('end_date') || null;

    // 1. Get overall stats via RPC
    const { data: stats, error: statsError } = await s.rpc('get_plan_adherence_stats', {
      p_plan_id: planId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (statsError) {
      console.error('Error fetching adherence stats:', statsError);
      // Fallback: return empty stats if function doesn't exist
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
    let query = s
      .from('plan_adherence')
      .select('id, date, status, plan_meal_id, notes, created_at')
      .eq('meal_plan_id', planId)
      .order('date', { ascending: true });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data: dailyData, error: dailyError } = await query;

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

    return apiResponse.success({
      summary,
      daily,
    });
  } catch (error) {
    console.error('Unexpected error in adherence GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
