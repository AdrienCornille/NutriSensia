/**
 * API Route: /api/protected/nutritionist/patients/[id]/nutritional-profiles
 * Gestion des profils nutritionnels d'un patient
 *
 * GET  - Liste des profils nutritionnels (par version DESC)
 * POST - Création d'un nouveau profil nutritionnel
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createNutritionalProfileSchema } from '@/lib/api-schemas';
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

// ============================================================================
// GET - Liste des profils nutritionnels
// ============================================================================

export async function GET(
  _req: NextRequest,
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

    const { data: profiles, error: fetchError } = await s
      .from('nutritional_profiles')
      .select('id, name, status, version, calculated_calories, goal, bmr_formula, created_at, archived_at')
      .eq('patient_id', patientAccess.userId)
      .eq('nutritionist_id', nutritionistId)
      .order('version', { ascending: false });

    if (fetchError) {
      console.error('Error fetching nutritional profiles:', fetchError);
      return apiResponse.serverError('Erreur lors de la recuperation des profils');
    }

    return apiResponse.success(profiles || []);
  } catch (error) {
    console.error('Unexpected error in nutritional profiles GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// POST - Creation d'un profil nutritionnel
// ============================================================================

export async function POST(
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

    // Parse and validate body
    const body = await req.json();
    const parsed = createNutritionalProfileSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;

    // Calculate nutritional values
    const calculated = calculateNutritionalProfile({
      weight_kg: data.weight_kg,
      height_cm: data.height_cm,
      age: data.age,
      gender: data.gender,
      body_fat_pct: data.body_fat_pct,
      bmr_formula: data.bmr_formula,
      activity_level: data.activity_level,
      goal: data.goal,
      goal_adjustment_kcal: data.goal_adjustment_kcal,
      special_case: data.special_case || 'none',
      special_case_adjustment_kcal: data.special_case_adjustment_kcal ?? undefined,
      protein_pct: data.protein_pct,
      carbs_pct: data.carbs_pct,
      fat_pct: data.fat_pct,
    });

    // Compute next version
    const { data: maxVersionRow } = await s
      .from('nutritional_profiles')
      .select('version')
      .eq('patient_id', patientAccess.userId)
      .eq('nutritionist_id', nutritionistId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const nextVersion = (maxVersionRow?.version || 0) + 1;

    // If status is active, archive existing active profile first
    if (data.status === 'active') {
      await s
        .from('nutritional_profiles')
        .update({ status: 'archived', archived_at: new Date().toISOString() })
        .eq('patient_id', patientAccess.userId)
        .eq('status', 'active');
    }

    // Insert the new profile
    const { data: profile, error: insertError } = await s
      .from('nutritional_profiles')
      .insert({
        patient_id: patientAccess.userId,
        nutritionist_id: nutritionistId,
        name: data.name,
        status: data.status || 'draft',
        version: nextVersion,
        weight_kg: data.weight_kg,
        height_cm: data.height_cm,
        age: data.age,
        gender: data.gender,
        body_fat_pct: data.body_fat_pct || null,
        bmr_formula: data.bmr_formula,
        activity_level: data.activity_level,
        goal: data.goal,
        goal_adjustment_kcal: data.goal_adjustment_kcal || 0,
        special_case: data.special_case || 'none',
        macro_template: data.macro_template || null,
        protein_pct: data.protein_pct,
        carbs_pct: data.carbs_pct,
        fat_pct: data.fat_pct,
        micro_targets: data.micro_targets || null,
        notes: data.notes || null,
        private_notes: data.private_notes || null,
        calculated_bmr: calculated.bmr,
        calculated_tdee: calculated.tdee,
        calculated_calories: calculated.targetCalories,
        calculated_protein_g: calculated.protein_g,
        calculated_carbs_g: calculated.carbs_g,
        calculated_fat_g: calculated.fat_g,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating nutritional profile:', insertError);
      return apiResponse.serverError('Erreur lors de la creation du profil');
    }

    // Notify patient when profile is created as active
    if (profile && (data.status === 'active')) {
      try {
        await s.rpc('create_notification', {
          p_user_id: patientAccess.userId,
          p_type_code: 'nutritional_profile_activated',
          p_data: {
            profile_name: profile.name,
            calories: String(profile.calculated_calories),
          },
        });
      } catch (notifError) {
        console.error('Non-blocking notification error:', notifError);
      }
    }

    return apiResponse.success(profile, 201);
  } catch (error) {
    console.error('Unexpected error in nutritional profiles POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
