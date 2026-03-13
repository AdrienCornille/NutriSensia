/**
 * API Route: /api/protected/dossier/nutritional-profile/export
 * Patient-side: export a nutritional profile as JSON
 *
 * GET - Export du profil (actif par defaut, ou specifique via ?profileId=...)
 *       Sans private_notes. PDF prevu pour Phase 6.
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
    const profileId = url.searchParams.get('profileId');

    let profile;

    if (profileId) {
      // Fetch the specific profile
      const { data, error } = await (supabase as any)
        .from('nutritional_profiles')
        .select(PROFILE_SELECT)
        .eq('id', profileId)
        .eq('patient_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return apiResponse.notFound('Profil nutritionnel introuvable');
        }
        console.error('Error fetching profile for export:', error);
        return apiResponse.serverError(
          'Erreur lors de la récupération du profil'
        );
      }

      profile = data;
    } else {
      // Fetch the active profile
      const { data, error } = await (supabase as any)
        .from('nutritional_profiles')
        .select(PROFILE_SELECT)
        .eq('patient_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active profile for export:', error);
        return apiResponse.serverError(
          'Erreur lors de la récupération du profil actif'
        );
      }

      if (!data) {
        return apiResponse.error('Aucun profil nutritionnel actif à exporter', 400);
      }

      profile = data;
    }

    // Fetch patient info for export metadata
    const { data: patientInfo } = await (supabase as any)
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    // Fetch nutritionist name if available
    let nutritionistName: string | null = null;
    if (profile.nutritionist_id) {
      // nutritionist_id in nutritional_profiles references nutritionist_profiles.id
      const { data: nutri } = await (supabase as any)
        .from('nutritionist_profiles')
        .select('user_id')
        .eq('id', profile.nutritionist_id)
        .single();

      if (nutri?.user_id) {
        const { data: nutriProfile } = await (supabase as any)
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', nutri.user_id)
          .single();

        if (nutriProfile) {
          nutritionistName = [nutriProfile.first_name, nutriProfile.last_name]
            .filter(Boolean)
            .join(' ') || null;
        }
      }
    }

    return apiResponse.success({
      export_date: new Date().toISOString(),
      patient: patientInfo
        ? {
            first_name: patientInfo.first_name || null,
            last_name: patientInfo.last_name || null,
            email: patientInfo.email || null,
          }
        : null,
      nutritionist_name: nutritionistName,
      profile,
    });
  } catch (error) {
    console.error('Unexpected error in patient nutritional-profile export GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
