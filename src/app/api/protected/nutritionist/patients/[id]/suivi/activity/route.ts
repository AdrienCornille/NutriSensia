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
    const { data: nutritionistProfile, error: profileError } = await (
      supabase as any
    )
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify patient belongs to nutritionist
    const { data: patient, error: patientError } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (patientError || !patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Fetch activities with join on activity_types
    let query = (supabase as any)
      .from('activities')
      .select(
        '*, activity_type:activity_types(slug, name_fr, emoji, met_value)'
      )
      .eq('patient_id', patient.user_id)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: logs, error: logsError } = await query;

    if (logsError) {
      console.error('Error fetching activity logs:', logsError);
      return apiResponse.serverError(
        'Erreur lors de la recuperation des activites'
      );
    }

    const entries = logs || [];

    // Compute weekly summary (current week: Monday-Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];

    const weekEntries = entries.filter((e: any) => {
      const d = e.date;
      return d >= mondayStr && d <= sundayStr;
    });

    const sessions = weekEntries.length;
    const totalMinutes = weekEntries.reduce(
      (sum: number, e: any) => sum + (e.duration_minutes || 0),
      0
    );
    const totalCalories = weekEntries.reduce(
      (sum: number, e: any) => sum + (e.calories_burned || 0),
      0
    );

    // Fetch activity goal for sessions_per_week
    const { data: goalData } = await (supabase as any)
      .from('activity_goals')
      .select('sessions_per_week')
      .eq('patient_id', patient.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const goalSessions = goalData?.sessions_per_week ?? 3;

    return apiResponse.success({
      logs: entries,
      count: entries.length,
      weekly_summary: {
        sessions,
        total_minutes: totalMinutes,
        total_calories: totalCalories,
        goal_sessions: goalSessions,
      },
    });
  } catch (error) {
    console.error('Unexpected error in activity suivi:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
