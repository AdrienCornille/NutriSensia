/**
 * API Route: /api/protected/nutritionist/statistics/consultations
 * CONSULT-007: Statistiques de consultation du nutritionniste
 *
 * GET - Statistiques agrégées (par mois, par type, modes, no-show, tendance)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { consultationStatsQuerySchema } from '@/lib/api-schemas';

// ============================================================================
// GET - Statistiques de consultations
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Auth
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parse query params
    const { searchParams } = new URL(req.url);
    const parsed = consultationStatsQuerySchema.safeParse({
      month: searchParams.get('month') || undefined,
    });

    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // 3. Resolve target month
    const now = new Date();
    const targetMonth = parsed.data.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number);

    // Month boundaries
    const monthStart = new Date(targetYear, targetMonthNum - 1, 1).toISOString();
    const monthEnd = new Date(targetYear, targetMonthNum, 1).toISOString();

    // 6 months ago for trend
    const sixMonthsAgo = new Date(targetYear, targetMonthNum - 6, 1).toISOString();

    // 4. Supabase client + nutritionist profile
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileError } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !profile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const nutritionistId = profile.id;

    // 5. Parallel queries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const [monthResult, trendResult, typesResult] = await Promise.all([
      // A: Appointments for the target month
      s
        .from('appointments')
        .select('id, user_id, scheduled_at, duration, mode, status, consultation_type_id')
        .eq('nutritionist_id', nutritionistId)
        .gte('scheduled_at', monthStart)
        .lt('scheduled_at', monthEnd),

      // B: Appointments for last 6 months (for trend)
      s
        .from('appointments')
        .select('id, scheduled_at, status')
        .eq('nutritionist_id', nutritionistId)
        .gte('scheduled_at', sixMonthsAgo)
        .lt('scheduled_at', monthEnd),

      // C: Consultation types for labels
      s
        .from('consultation_types')
        .select('id, code, name_fr')
        .eq('nutritionist_id', nutritionistId),
    ]);

    const monthAppointments = (monthResult.data || []) as Array<{
      id: string;
      user_id: string;
      scheduled_at: string;
      duration: number | null;
      mode: string;
      status: string;
      consultation_type_id: string | null;
    }>;

    const trendAppointments = (trendResult.data || []) as Array<{
      id: string;
      scheduled_at: string;
      status: string;
    }>;

    const consultationTypes = (typesResult.data || []) as Array<{
      id: string;
      code: string;
      name_fr: string;
    }>;

    // Type lookup map
    const typeLookup = new Map(consultationTypes.map(t => [t.id, t]));

    // 6. Compute statistics

    // Filter: only relevant statuses (exclude cancelled variants)
    const cancelledStatuses = ['cancelled', 'cancelled_by_patient', 'cancelled_by_nutritionist'];
    const validAppointments = monthAppointments.filter(a => !cancelledStatuses.includes(a.status));

    // Completed/confirmed (actual consultations, excluding no-shows)
    const completedOrConfirmed = validAppointments.filter(a => a.status !== 'no_show');

    // Total consultations
    const totalConsultations = completedOrConfirmed.length;

    // By type
    const byTypeMap = new Map<string, number>();
    completedOrConfirmed.forEach(a => {
      const typeId = a.consultation_type_id || 'unknown';
      byTypeMap.set(typeId, (byTypeMap.get(typeId) || 0) + 1);
    });
    const byType = [...byTypeMap.entries()]
      .map(([typeId, count]) => ({
        type: typeId,
        count,
        label: typeLookup.get(typeId)?.name_fr || 'Autre',
      }))
      .sort((a, b) => b.count - a.count);

    // Average duration
    const durations = completedOrConfirmed
      .map(a => a.duration)
      .filter((d): d is number => d != null && d > 0);
    const averageDuration = durations.length > 0
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : null;

    // Mode distribution
    const modeDistribution = { visio: 0, cabinet: 0, phone: 0 };
    completedOrConfirmed.forEach(a => {
      if (a.mode in modeDistribution) {
        modeDistribution[a.mode as keyof typeof modeDistribution]++;
      }
    });

    // Unique patients
    const uniquePatients = new Set(completedOrConfirmed.map(a => a.user_id)).size;

    // No-show
    const noShowCount = validAppointments.filter(a => a.status === 'no_show').length;
    const noShowRate = validAppointments.length > 0
      ? Math.round((noShowCount / validAppointments.length) * 100)
      : 0;

    // Monthly trend (last 6 months)
    const trendMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(targetYear, targetMonthNum - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trendMap.set(key, 0);
    }
    const trendValid = trendAppointments.filter(a => !cancelledStatuses.includes(a.status) && a.status !== 'no_show');
    trendValid.forEach(a => {
      const d = new Date(a.scheduled_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (trendMap.has(key)) {
        trendMap.set(key, trendMap.get(key)! + 1);
      }
    });
    const monthlyTrend = [...trendMap.entries()].map(([month, count]) => ({
      month,
      label: new Date(month + '-01T00:00:00').toLocaleDateString('fr-FR', { month: 'short' }),
      count,
    }));

    // Period label
    const periodLabel = new Date(targetYear, targetMonthNum - 1, 1)
      .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    // 7. Response
    return apiResponse.success({
      period: { month: targetMonth, label: periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1) },
      total_consultations: totalConsultations,
      by_type: byType,
      average_duration_minutes: averageDuration,
      mode_distribution: modeDistribution,
      unique_patients: uniquePatients,
      no_show_count: noShowCount,
      no_show_rate: noShowRate,
      monthly_trend: monthlyTrend,
    });
  } catch (error) {
    console.error('Unexpected error in consultation statistics GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
