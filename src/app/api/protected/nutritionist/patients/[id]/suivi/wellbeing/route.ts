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

    // Fetch wellbeing logs
    let query = (supabase as any)
      .from('wellbeing_logs')
      .select('*')
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
      console.error('Error fetching wellbeing logs:', logsError);
      return apiResponse.serverError(
        'Erreur lors de la recuperation des donnees bien-etre'
      );
    }

    const entries = logs || [];

    // Compute averages (handle nulls)
    const energyValues = entries
      .map((l: any) => l.energy_level)
      .filter((v: any) => v != null) as number[];
    const sleepQualityValues = entries
      .map((l: any) => l.sleep_quality)
      .filter((v: any) => v != null) as number[];
    const sleepHoursValues = entries
      .map((l: any) => l.sleep_hours)
      .filter((v: any) => v != null) as number[];

    const avg = (arr: number[]): number | null =>
      arr.length > 0
        ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
        : null;

    const averages = {
      energy: avg(energyValues),
      sleep_quality: avg(sleepQualityValues),
      sleep_hours: avg(sleepHoursValues),
    };

    // Compute mood distribution
    const moodDistribution: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.mood) {
        moodDistribution[entry.mood] =
          (moodDistribution[entry.mood] || 0) + 1;
      }
    }

    // Compute digestion distribution
    const digestionDistribution: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.digestion) {
        digestionDistribution[entry.digestion] =
          (digestionDistribution[entry.digestion] || 0) + 1;
      }
    }

    return apiResponse.success({
      logs: entries,
      count: entries.length,
      averages,
      distributions: {
        mood: moodDistribution,
        digestion: digestionDistribution,
      },
    });
  } catch (error) {
    console.error('Unexpected error in wellbeing suivi:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
