/**
 * API Route: /api/protected/nutritionist/patients/[id]/nutritional-profiles/[profileId]
 * Gestion d'un profil nutritionnel individuel
 *
 * GET    - Detail du profil
 * PATCH  - Mise a jour du profil (avec recalcul si necessaire)
 * DELETE - Archivage (soft delete) ou suppression définitive (?permanent=true)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateNutritionalProfileSchema } from '@/lib/api-schemas';
import { calculateNutritionalProfile } from '@/lib/nutritional-profile-calculator';

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

// Fields that trigger recalculation when changed
const RECALC_FIELDS = [
  'weight_kg',
  'height_cm',
  'age',
  'gender',
  'body_fat_pct',
  'bmr_formula',
  'activity_level',
  'goal',
  'goal_adjustment_kcal',
  'special_case',
  'special_case_adjustment_kcal',
  'protein_pct',
  'carbs_pct',
  'fat_pct',
];

type RouteParams = { params: Promise<{ id: string; profileId: string }> };

// ============================================================================
// GET - Detail du profil
// ============================================================================

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, profileId } = await params;
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

    const { data: profile, error: fetchError } = await s
      .from('nutritional_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('nutritionist_id', nutritionistId)
      .single();

    if (fetchError || !profile) {
      return apiResponse.notFound('Profil nutritionnel introuvable');
    }

    return apiResponse.success(profile);
  } catch (error) {
    console.error('Unexpected error in nutritional profile GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// PATCH - Mise a jour du profil
// ============================================================================

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, profileId } = await params;
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

    // Parse and validate body
    const body = await req.json();
    const parsed = updateNutritionalProfileSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const updates = parsed.data;

    // Check if recalculation is needed
    const needsRecalc = RECALC_FIELDS.some(
      field => (updates as Record<string, unknown>)[field] !== undefined
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let calculatedFields: Record<string, any> = {};

    if (needsRecalc) {
      // Fetch current profile to merge with updates
      const { data: currentProfile, error: fetchError } = await s
        .from('nutritional_profiles')
        .select('*')
        .eq('id', profileId)
        .eq('nutritionist_id', nutritionistId)
        .single();

      if (fetchError || !currentProfile) {
        return apiResponse.notFound('Profil nutritionnel introuvable');
      }

      // Merge current values with updates
      const merged = { ...currentProfile, ...updates };

      const calculated = calculateNutritionalProfile({
        weight_kg: merged.weight_kg,
        height_cm: merged.height_cm,
        age: merged.age,
        gender: merged.gender,
        body_fat_pct: merged.body_fat_pct,
        bmr_formula: merged.bmr_formula,
        activity_level: merged.activity_level,
        goal: merged.goal,
        goal_adjustment_kcal: merged.goal_adjustment_kcal,
        special_case: merged.special_case || 'none',
        special_case_adjustment_kcal: merged.special_case_adjustment_kcal ?? undefined,
        protein_pct: merged.protein_pct,
        carbs_pct: merged.carbs_pct,
        fat_pct: merged.fat_pct,
      });

      calculatedFields = {
        calculated_bmr: calculated.bmr,
        calculated_tdee: calculated.tdee,
        calculated_calories: calculated.targetCalories,
        calculated_protein_g: calculated.protein_g,
        calculated_carbs_g: calculated.carbs_g,
        calculated_fat_g: calculated.fat_g,
      };
    }

    // Update the profile
    const { data: updatedProfile, error: updateError } = await s
      .from('nutritional_profiles')
      .update({
        ...updates,
        ...calculatedFields,
      })
      .eq('id', profileId)
      .eq('nutritionist_id', nutritionistId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating nutritional profile:', updateError);
      return apiResponse.serverError('Erreur lors de la mise a jour du profil');
    }

    if (!updatedProfile) {
      return apiResponse.notFound('Profil nutritionnel introuvable');
    }

    return apiResponse.success(updatedProfile);
  } catch (error) {
    console.error('Unexpected error in nutritional profile PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Archivage (soft delete) ou suppression définitive (?permanent=true)
// ============================================================================

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, profileId } = await params;
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

    const permanent = req.nextUrl.searchParams.get('permanent') === 'true';

    if (permanent) {
      // Hard delete — suppression définitive
      const { error: deleteError } = await s
        .from('nutritional_profiles')
        .delete()
        .eq('id', profileId)
        .eq('nutritionist_id', nutritionistId);

      if (deleteError) {
        console.error('Error deleting nutritional profile:', deleteError);
        return apiResponse.serverError('Erreur lors de la suppression du profil');
      }

      return apiResponse.success({ id: profileId, deleted: true });
    }

    // Soft delete — archivage
    const { data: archivedProfile, error: archiveError } = await s
      .from('nutritional_profiles')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
      })
      .eq('id', profileId)
      .eq('nutritionist_id', nutritionistId)
      .select('id, status, archived_at')
      .single();

    if (archiveError) {
      console.error('Error archiving nutritional profile:', archiveError);
      return apiResponse.serverError("Erreur lors de l'archivage du profil");
    }

    if (!archivedProfile) {
      return apiResponse.notFound('Profil nutritionnel introuvable');
    }

    return apiResponse.success(archivedProfile);
  } catch (error) {
    console.error('Unexpected error in nutritional profile DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
