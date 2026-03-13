import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId } = await params;
    if (!patientProfileId) {
      return apiResponse.error('ID patient requis', 400);
    }

    const supabase = await createClient();

    // Get nutritionist profile
    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify patient belongs to nutritionist
    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Fetch hydration logs
    let logsQuery = (supabase as any)
      .from('hydration_logs')
      .select('id, amount_ml, beverage_type, date, created_at')
      .eq('patient_id', patient.user_id)
      .order('date', { ascending: false });

    if (startDate) {
      logsQuery = logsQuery.gte('date', startDate);
    }
    if (endDate) {
      logsQuery = logsQuery.lte('date', endDate);
    }

    const { data: logs, error: logsError } = await logsQuery;

    if (logsError) {
      console.error('Error fetching hydration logs:', logsError);
      return apiResponse.serverError("Erreur lors de la recuperation de l'hydratation");
    }

    // Fetch current hydration goal (latest valid one)
    const today = new Date().toISOString().split('T')[0];
    const { data: goals } = await (supabase as any)
      .from('hydration_goals')
      .select('id, daily_goal_ml, valid_from, valid_until')
      .eq('patient_id', patient.user_id)
      .lte('valid_from', today)
      .or(`valid_until.is.null,valid_until.gte.${today}`)
      .order('valid_from', { ascending: false })
      .limit(1);

    const currentGoal = goals && goals.length > 0 ? goals[0] : null;
    const goalMl = currentGoal ? currentGoal.daily_goal_ml : 2000; // Default 2L

    // Aggregate by date in JavaScript
    const dailyMap = new Map<string, number>();

    for (const log of (logs || [])) {
      const date = log.date;
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + (log.amount_ml || 0));
    }

    // Build daily_totals array
    const dailyTotals = Array.from(dailyMap.entries())
      .map(([date, total_ml]) => ({
        date,
        total_ml,
        goal_ml: goalMl,
        percentage: Math.round((total_ml / goalMl) * 100),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Compute summary
    const totalDays = dailyTotals.length;
    const totalMl = dailyTotals.reduce((sum, d) => sum + d.total_ml, 0);
    const averageDailyMl = totalDays > 0 ? Math.round(totalMl / totalDays) : 0;
    const daysGoalReached = dailyTotals.filter(d => d.percentage >= 100).length;
    const alert = averageDailyMl < goalMl * 0.5;

    const summary = {
      average_daily_ml: averageDailyMl,
      goal_ml: goalMl,
      days_goal_reached: daysGoalReached,
      total_days: totalDays,
      alert,
    };

    return apiResponse.success({ daily_totals: dailyTotals, summary });
  } catch (error) {
    console.error('Unexpected error in hydration GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
