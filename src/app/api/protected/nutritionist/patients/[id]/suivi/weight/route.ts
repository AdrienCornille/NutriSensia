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

    // Fetch weight entries
    let entriesQuery = (supabase as any)
      .from('weight_entries')
      .select('id, weight_kg, date, notes, source')
      .eq('patient_id', patient.user_id)
      .order('date', { ascending: false });

    if (startDate) {
      entriesQuery = entriesQuery.gte('date', startDate);
    }
    if (endDate) {
      entriesQuery = entriesQuery.lte('date', endDate);
    }

    const { data: entries, error: entriesError } = await entriesQuery;

    if (entriesError) {
      console.error('Error fetching weight entries:', entriesError);
      return apiResponse.serverError('Erreur lors de la recuperation du poids');
    }

    // Fetch weight goal (latest)
    const { data: goals } = await (supabase as any)
      .from('weight_goals')
      .select('id, initial_weight_kg, target_weight_kg, target_date')
      .eq('patient_id', patient.user_id)
      .order('created_at', { ascending: false })
      .limit(1);

    const goal = goals && goals.length > 0 ? goals[0] : null;

    // Compute statistics
    const sortedEntries = [...(entries || [])];
    // entries are DESC, so [0] = latest, [last] = oldest
    const currentWeight =
      sortedEntries.length > 0 ? sortedEntries[0].weight_kg : null;
    const initialWeight =
      sortedEntries.length > 0
        ? sortedEntries[sortedEntries.length - 1].weight_kg
        : null;
    const goalWeight = goal ? goal.target_weight_kg : null;
    const totalChange =
      currentWeight !== null && initialWeight !== null
        ? Math.round((currentWeight - initialWeight) * 100) / 100
        : 0;

    // Weekly change: compare latest entry with earliest entry from last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const recentEntries = sortedEntries.filter(
      (e: { date: string }) => e.date >= sevenDaysAgoStr
    );

    let weeklyChange = 0;
    if (recentEntries.length >= 2) {
      const latestRecent = recentEntries[0].weight_kg;
      const earliestRecent = recentEntries[recentEntries.length - 1].weight_kg;
      weeklyChange = Math.round((latestRecent - earliestRecent) * 100) / 100;
    }

    // Trend determination
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (weeklyChange > 0.2) {
      trend = 'up';
    } else if (weeklyChange < -0.2) {
      trend = 'down';
    }

    const statistics = {
      current_weight: currentWeight,
      initial_weight: initialWeight,
      goal_weight: goalWeight,
      total_change: totalChange,
      weekly_change: weeklyChange,
      trend,
      entries_count: sortedEntries.length,
    };

    return apiResponse.success({
      entries: entries || [],
      statistics,
      goal,
    });
  } catch (error) {
    console.error('Unexpected error in weight GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
