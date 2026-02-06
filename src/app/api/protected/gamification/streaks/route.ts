/**
 * API Route pour les streaks du patient
 * GET - Récupérer tous les streaks (repas, hydratation, poids, etc.)
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

    const { data: streaks, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('patient_id', auth.user.id);

    if (error) {
      console.error('Error fetching streaks:', error);
      return apiResponse.serverError('Erreur lors de la récupération des streaks');
    }

    // Formater la réponse
    const formattedStreaks = (streaks || []).map(s => ({
      id: s.id,
      type: s.streak_type,
      current_count: s.current_count,
      longest_count: s.longest_count,
      last_activity_date: s.last_activity_date,
      streak_started_at: s.streak_started_at,
      freeze_days_remaining: s.freeze_days_remaining,
      is_active: s.last_activity_date === new Date().toISOString().split('T')[0],
    }));

    // Trouver le streak principal (meal_logging)
    const mealStreak = formattedStreaks.find(s => s.type === 'meal_logging');

    return NextResponse.json({
      streaks: formattedStreaks,
      primary_streak: mealStreak || {
        type: 'meal_logging',
        current_count: 0,
        longest_count: 0,
        is_active: false,
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/gamification/streaks:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
