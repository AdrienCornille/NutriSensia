/**
 * API Route pour les points et le niveau de gamification
 * GET - Récupérer les points, niveau et statistiques du patient
 */

import { NextResponse } from 'next/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();

    // Récupérer les points du patient
    const { data: points, error: pointsError } = await supabase
      .from('patient_points')
      .select('*')
      .eq('patient_id', auth.user.id)
      .single();

    if (pointsError && pointsError.code !== 'PGRST116') {
      console.error('Error fetching points:', pointsError);
      return apiResponse.serverError('Erreur lors de la récupération des points');
    }

    // Si pas encore de points, retourner les valeurs par défaut
    const pointsData = points || {
      total_points: 0,
      current_level: 1,
      points_to_next_level: 100,
      points_this_week: 0,
      points_this_month: 0,
    };

    // Calculer le rang
    const level = pointsData.current_level || 1;
    let rank = 'Débutant';
    if (level >= 20) rank = 'Platine';
    else if (level >= 15) rank = 'Or';
    else if (level >= 10) rank = 'Argent';
    else if (level >= 5) rank = 'Bronze';

    // Compter les badges
    const { count: badgesCount } = await supabase
      .from('patient_badges')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', auth.user.id);

    return NextResponse.json({
      total_points: pointsData.total_points,
      level: pointsData.current_level,
      next_level_points: pointsData.points_to_next_level,
      points_to_next_level: Math.max(0, pointsData.points_to_next_level - pointsData.total_points),
      points_this_week: pointsData.points_this_week,
      points_this_month: pointsData.points_this_month,
      rank,
      badges_count: badgesCount || 0,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/gamification:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
