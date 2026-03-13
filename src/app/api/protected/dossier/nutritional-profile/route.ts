/**
 * API Route: /api/protected/dossier/nutritional-profile
 * Patient-side: read-only access to nutritional profiles
 *
 * GET - Profil actif ou historique des profils (sans private_notes)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// All columns EXCEPT private_notes
const PROFILE_SELECT =
  'id, patient_id, nutritionist_id, name, status, version, weight_kg, height_cm, age, gender, body_fat_pct, bmr_formula, activity_level, goal, goal_adjustment_kcal, special_case, macro_template, protein_pct, carbs_pct, fat_pct, calculated_bmr, calculated_tdee, calculated_calories, calculated_protein_g, calculated_carbs_g, calculated_fat_g, micro_targets, notes, created_at, updated_at, archived_at';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    const userId = auth.user.id;
    const url = new URL(req.url);
    const history = url.searchParams.get('history') === 'true';

    if (history) {
      // Return all profiles ordered by version DESC
      const { data: profiles, error } = await (supabase as any)
        .from('nutritional_profiles')
        .select(PROFILE_SELECT)
        .eq('patient_id', userId)
        .order('version', { ascending: false });

      if (error) {
        console.error('Error fetching nutritional profile history:', error);
        return apiResponse.serverError(
          'Erreur lors de la récupération de l\'historique des profils'
        );
      }

      return apiResponse.success(profiles || []);
    }

    // Return only the active profile
    const { data: profile, error } = await (supabase as any)
      .from('nutritional_profiles')
      .select(PROFILE_SELECT)
      .eq('patient_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned — not a real error
      console.error('Error fetching active nutritional profile:', error);
      return apiResponse.serverError(
        'Erreur lors de la récupération du profil nutritionnel'
      );
    }

    // If no active profile found, return null (not 404)
    return apiResponse.success(profile || null);
  } catch (error) {
    console.error('Unexpected error in patient nutritional-profile GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
