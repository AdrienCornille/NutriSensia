/**
 * API Route: /api/protected/dossier/nutritional-profile/compare
 * Patient-side: compare two nutritional profiles
 *
 * GET - Compare deux profils (sans private_notes)
 *       Query params: profile_a, profile_b (UUIDs)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// All columns EXCEPT private_notes
const PROFILE_SELECT =
  'id, patient_id, nutritionist_id, name, status, version, weight_kg, height_cm, age, gender, body_fat_pct, bmr_formula, activity_level, goal, goal_adjustment_kcal, special_case, macro_template, protein_pct, carbs_pct, fat_pct, calculated_bmr, calculated_tdee, calculated_calories, calculated_protein_g, calculated_carbs_g, calculated_fat_g, micro_targets, notes, created_at, updated_at, archived_at';

// Fields to calculate deltas for
const DELTA_FIELDS = [
  'weight_kg',
  'calculated_bmr',
  'calculated_tdee',
  'calculated_calories',
  'calculated_protein_g',
  'calculated_carbs_g',
  'calculated_fat_g',
] as const;

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const url = new URL(req.url);
    const profileAId = url.searchParams.get('profile_a');
    const profileBId = url.searchParams.get('profile_b');

    if (!profileAId || !profileBId) {
      return apiResponse.error(
        'Les paramètres profile_a et profile_b sont requis',
        400
      );
    }

    if (profileAId === profileBId) {
      return apiResponse.error(
        'Les deux profils doivent être différents',
        400
      );
    }

    const supabase = await createClient();
    const userId = auth.user.id;

    // Fetch both profiles in parallel, ensuring they belong to this patient
    const [resultA, resultB] = await Promise.all([
      (supabase as any)
        .from('nutritional_profiles')
        .select(PROFILE_SELECT)
        .eq('id', profileAId)
        .eq('patient_id', userId)
        .single(),
      (supabase as any)
        .from('nutritional_profiles')
        .select(PROFILE_SELECT)
        .eq('id', profileBId)
        .eq('patient_id', userId)
        .single(),
    ]);

    if (resultA.error || !resultA.data) {
      return apiResponse.notFound('Profil A introuvable');
    }

    if (resultB.error || !resultB.data) {
      return apiResponse.notFound('Profil B introuvable');
    }

    const profileA = resultA.data;
    const profileB = resultB.data;

    // Calculate deltas (B - A)
    const deltas: Record<string, number | null> = {};
    for (const field of DELTA_FIELDS) {
      const valA = profileA[field];
      const valB = profileB[field];
      if (valA != null && valB != null) {
        deltas[field] = Math.round((valB - valA) * 100) / 100;
      } else {
        deltas[field] = null;
      }
    }

    return apiResponse.success({
      profile_a: profileA,
      profile_b: profileB,
      deltas,
    });
  } catch (error) {
    console.error('Unexpected error in patient nutritional-profile compare GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
