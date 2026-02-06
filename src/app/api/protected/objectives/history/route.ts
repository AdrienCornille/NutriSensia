/**
 * API Route pour l'historique des objectifs hebdomadaires
 * GET - Récupérer les X dernières semaines d'objectifs
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 52);

    const supabase = await createClient();

    const { data: weeks, error } = await supabase
      .from('weekly_objectives')
      .select('id, week_start, week_end, total_objectives, completed_objectives, progress_percent, points_earned')
      .eq('patient_id', auth.user.id)
      .order('week_start', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching objectives history:', error);
      return apiResponse.serverError("Erreur lors de la récupération de l'historique");
    }

    return NextResponse.json({ weeks: weeks || [] });
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/objectives/history:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
