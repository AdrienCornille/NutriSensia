/**
 * API Route: /api/protected/nutritionist/patients/[id]/nutritional-profiles/compare
 * Comparaison de deux profils nutritionnels
 *
 * GET - Compare deux profils (query params: profile_a, profile_b)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// ============================================================================
// Helpers
// ============================================================================

async function resolveNutritionistId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('nutritionist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

async function verifyPatientAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  patientProfileId: string,
  nutritionistId: string
): Promise<{ userId: string } | null> {
  const { data } = await supabase
    .from('patient_profiles')
    .select('user_id')
    .eq('id', patientProfileId)
    .eq('nutritionist_id', nutritionistId)
    .single();
  return data ? { userId: data.user_id } : null;
}

// ============================================================================
// GET - Comparer deux profils
// ============================================================================

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
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const patientAccess = await verifyPatientAccess(
      s,
      patientProfileId,
      nutritionistId
    );
    if (!patientAccess) {
      return apiResponse.error('Patient introuvable ou acces non autorise', 403);
    }

    // Get query params
    const { searchParams } = new URL(req.url);
    const profileAId = searchParams.get('profile_a');
    const profileBId = searchParams.get('profile_b');

    if (!profileAId || !profileBId) {
      return apiResponse.error('Les parametres profile_a et profile_b sont requis', 400);
    }

    // Fetch both profiles
    const { data: profileA, error: errorA } = await s
      .from('nutritional_profiles')
      .select('*')
      .eq('id', profileAId)
      .eq('nutritionist_id', nutritionistId)
      .single();

    if (errorA || !profileA) {
      return apiResponse.notFound('Profil A introuvable');
    }

    const { data: profileB, error: errorB } = await s
      .from('nutritional_profiles')
      .select('*')
      .eq('id', profileBId)
      .eq('nutritionist_id', nutritionistId)
      .single();

    if (errorB || !profileB) {
      return apiResponse.notFound('Profil B introuvable');
    }

    // Calculate deltas (keys match ProfileComparison type)
    const deltas = {
      calories: (profileB.calculated_calories || 0) - (profileA.calculated_calories || 0),
      bmr: (profileB.calculated_bmr || 0) - (profileA.calculated_bmr || 0),
      tdee: (profileB.calculated_tdee || 0) - (profileA.calculated_tdee || 0),
      protein_g: (profileB.calculated_protein_g || 0) - (profileA.calculated_protein_g || 0),
      carbs_g: (profileB.calculated_carbs_g || 0) - (profileA.calculated_carbs_g || 0),
      fat_g: (profileB.calculated_fat_g || 0) - (profileA.calculated_fat_g || 0),
      weight_kg: (profileB.weight_kg || 0) - (profileA.weight_kg || 0),
    };

    return apiResponse.success({
      profile_a: profileA,
      profile_b: profileB,
      deltas,
    });
  } catch (error) {
    console.error('Unexpected error in nutritional profiles compare GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
