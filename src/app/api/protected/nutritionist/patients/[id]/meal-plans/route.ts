/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans
 * PLAN-N-001: Gestion des plans alimentaires
 *
 * GET  - Liste des plans alimentaires du patient
 * POST - Création d'un nouveau plan alimentaire
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createMealPlanNutriSchema } from '@/lib/api-schemas';

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
// GET - Liste des plans alimentaires
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
      return apiResponse.error('Patient introuvable ou accès non autorisé', 403);
    }

    // Fetch plans
    const { data: plans, error: plansError } = await s
      .from('meal_plans')
      .select('id, name, objective, status, start_date, end_date, is_template, notes, description, created_at, updated_at')
      .eq('patient_id', patientAccess.userId)
      .eq('nutritionist_id', auth.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (plansError) {
      console.error('Error fetching meal plans:', plansError);
      return apiResponse.serverError('Erreur lors de la récupération des plans');
    }

    // For each plan, get days and meals count
    const plansWithCounts = await Promise.all(
      (plans || []).map(async (plan: Record<string, unknown>) => {
        const { data: days } = await s
          .from('meal_plan_days')
          .select('id')
          .eq('meal_plan_id', plan.id);

        const dayIds = (days || []).map((d: { id: string }) => d.id);
        let mealsCount = 0;
        if (dayIds.length > 0) {
          const { count } = await s
            .from('meal_plan_meals')
            .select('id', { count: 'exact', head: true })
            .in('plan_day_id', dayIds);
          mealsCount = count || 0;
        }

        return {
          id: plan.id,
          name: plan.name,
          objective: plan.objective,
          status: plan.status,
          start_date: plan.start_date,
          end_date: plan.end_date,
          is_template: plan.is_template,
          created_at: plan.created_at,
          updated_at: plan.updated_at,
          days_count: dayIds.length,
          meals_count: mealsCount,
        };
      })
    );

    return apiResponse.success(plansWithCounts);
  } catch (error) {
    console.error('Unexpected error in meal plans GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// POST - Création d'un plan alimentaire
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
      return apiResponse.error('Patient introuvable ou accès non autorisé', 403);
    }

    // Parse and validate body
    const body = await req.json();
    const parsed = createMealPlanNutriSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const { name, objective, description, start_date, end_date, nutritional_targets, notes, meal_types } = parsed.data;

    // Create the meal plan
    const { data: plan, error: createError } = await s
      .from('meal_plans')
      .insert({
        patient_id: patientAccess.userId,
        nutritionist_id: auth.user.id,
        name,
        objective: objective || null,
        description: description || null,
        start_date,
        end_date,
        status: 'draft',
        is_template: false,
        nutritional_targets: nutritional_targets || null,
        notes: notes || null,
        meal_types: meal_types || null,
      })
      .select('id, name, objective, status, start_date, end_date, is_template, description, notes, nutritional_targets, meal_types, created_at, updated_at')
      .single();

    if (createError) {
      console.error('Error creating meal plan:', createError);
      // If nutritional_targets column doesn't exist, retry without it
      if (createError.message?.includes('nutritional_targets')) {
        const { data: planFallback, error: fallbackError } = await s
          .from('meal_plans')
          .insert({
            patient_id: patientAccess.userId,
            nutritionist_id: auth.user.id,
            name,
            objective: objective || null,
            description: description || null,
            start_date,
            end_date,
            status: 'draft',
            is_template: false,
            notes: nutritional_targets
              ? JSON.stringify({ _nutritional_targets: nutritional_targets, _notes: notes || '' })
              : notes || null,
          })
          .select('id, name, objective, status, start_date, end_date, is_template, description, notes, created_at, updated_at')
          .single();

        if (fallbackError) {
          return apiResponse.serverError('Erreur lors de la création du plan');
        }

        return apiResponse.success(
          {
            ...planFallback,
            nutritional_targets: nutritional_targets || null,
            patient_id: patientAccess.userId,
            nutritionist_id: auth.user.id,
            days_count: 0,
            meals_count: 0,
          },
          201
        );
      }
      return apiResponse.serverError('Erreur lors de la création du plan');
    }

    return apiResponse.success(
      {
        ...plan,
        patient_id: patientAccess.userId,
        nutritionist_id: auth.user.id,
        days_count: 0,
        meals_count: 0,
      },
      201
    );
  } catch (error) {
    console.error('Unexpected error in meal plans POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
