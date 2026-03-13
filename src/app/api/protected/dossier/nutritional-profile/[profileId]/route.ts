/**
 * API Route: /api/protected/dossier/nutritional-profile/[profileId]
 * Patient-side: read-only access to a specific nutritional profile
 *
 * GET - Detail d'un profil specifique (sans private_notes)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// All columns EXCEPT private_notes
const PROFILE_SELECT =
  'id, patient_id, nutritionist_id, name, status, version, weight_kg, height_cm, age, gender, body_fat_pct, bmr_formula, activity_level, goal, goal_adjustment_kcal, special_case, macro_template, protein_pct, carbs_pct, fat_pct, calculated_bmr, calculated_tdee, calculated_calories, calculated_protein_g, calculated_carbs_g, calculated_fat_g, micro_targets, notes, created_at, updated_at, archived_at';

type RouteParams = { params: Promise<{ profileId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { profileId } = await params;
    const supabase = await createClient();
    const userId = auth.user.id;

    const { data: profile, error } = await (supabase as any)
      .from('nutritional_profiles')
      .select(PROFILE_SELECT)
      .eq('id', profileId)
      .eq('patient_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return apiResponse.notFound('Profil nutritionnel introuvable');
      }
      console.error('Error fetching nutritional profile detail:', error);
      return apiResponse.serverError(
        'Erreur lors de la récupération du profil nutritionnel'
      );
    }

    return apiResponse.success(profile);
  } catch (error) {
    console.error('Unexpected error in patient nutritional-profile detail GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
