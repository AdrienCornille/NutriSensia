/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]/days/copy
 * Multi-week UX: Copier les repas d'un jour vers un ou plusieurs autres jours
 *
 * POST - Copie tous les repas + aliments d'un jour source vers des jours cibles
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { copyDayMealsSchema } from '@/lib/api-schemas';

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

async function verifyPlanAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  planId: string,
  nutritionistUserId: string,
  patientProfileId: string,
  nutritionistId: string
): Promise<{ patientUserId: string } | null> {
  const { data: patient } = await supabase
    .from('patient_profiles')
    .select('user_id')
    .eq('id', patientProfileId)
    .eq('nutritionist_id', nutritionistId)
    .single();

  if (!patient) return null;

  const { data: plan } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('id', planId)
    .eq('patient_id', patient.user_id)
    .eq('nutritionist_id', nutritionistUserId)
    .is('deleted_at', null)
    .single();

  if (!plan) return null;

  return { patientUserId: patient.user_id };
}

// ============================================================================
// POST - Copier les repas d'un jour vers d'autres
// ============================================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, planId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const access = await verifyPlanAccess(s, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!access) {
      return apiResponse.error('Plan introuvable ou accès non autorisé', 403);
    }

    // Parse and validate body
    const body = await req.json();
    const parsed = copyDayMealsSchema.safeParse(body);
    if (!parsed.success) {
      const messages = parsed.error.issues.map(e => e.message).join(', ');
      return apiResponse.error(messages, 400);
    }

    const { source_day_id, target_day_ids } = parsed.data;

    // Verify source day belongs to this plan
    const { data: sourceDay } = await s
      .from('meal_plan_days')
      .select('id')
      .eq('id', source_day_id)
      .eq('meal_plan_id', planId)
      .single();

    if (!sourceDay) {
      return apiResponse.error('Jour source introuvable dans ce plan', 404);
    }

    // Verify all target days belong to this plan
    const { data: targetDays } = await s
      .from('meal_plan_days')
      .select('id')
      .in('id', target_day_ids)
      .eq('meal_plan_id', planId);

    if (!targetDays || targetDays.length !== target_day_ids.length) {
      return apiResponse.error('Un ou plusieurs jours cibles introuvables dans ce plan', 404);
    }

    // Fetch source meals with their foods
    const { data: sourceMeals } = await s
      .from('meal_plan_meals')
      .select('meal_type, title, description, calories, protein_g, carbs_g, fat_g, suggested_time, display_order, notes')
      .eq('plan_day_id', source_day_id)
      .order('display_order', { ascending: true });

    const sourceMealRows = sourceMeals || [];

    // Fetch source meal IDs to get their foods
    const { data: sourceMealIds } = await s
      .from('meal_plan_meals')
      .select('id, meal_type')
      .eq('plan_day_id', source_day_id);

    const mealIdMap = new Map<string, string>();
    for (const m of (sourceMealIds || [])) {
      mealIdMap.set(m.meal_type, m.id);
    }

    // Fetch all foods grouped by source meal
    const foodsBySourceMeal = new Map<string, Record<string, unknown>[]>();
    const allSourceMealIds = (sourceMealIds || []).map((m: { id: string }) => m.id);

    if (allSourceMealIds.length > 0) {
      const { data: sourceFoods } = await s
        .from('meal_plan_meal_foods')
        .select('plan_meal_id, food_id, custom_name, quantity, unit, calories, protein_g, carbs_g, fat_g, display_order')
        .in('plan_meal_id', allSourceMealIds)
        .order('display_order', { ascending: true });

      for (const food of (sourceFoods || [])) {
        const mealId = food.plan_meal_id;
        if (!foodsBySourceMeal.has(mealId)) {
          foodsBySourceMeal.set(mealId, []);
        }
        foodsBySourceMeal.get(mealId)!.push(food);
      }
    }

    // For each target day: delete existing meals, then duplicate source
    for (const targetDayId of target_day_ids) {
      // Skip if target is same as source
      if (targetDayId === source_day_id) continue;

      // Delete existing meals for this target day (CASCADE will delete foods)
      const { data: existingMeals } = await s
        .from('meal_plan_meals')
        .select('id')
        .eq('plan_day_id', targetDayId);

      if (existingMeals && existingMeals.length > 0) {
        const existingMealIds = existingMeals.map((m: { id: string }) => m.id);

        // Delete foods first
        await s
          .from('meal_plan_meal_foods')
          .delete()
          .in('plan_meal_id', existingMealIds);

        // Delete meals
        await s
          .from('meal_plan_meals')
          .delete()
          .eq('plan_day_id', targetDayId);
      }

      // Duplicate each source meal into the target day
      for (const sourceMeal of sourceMealRows) {
        const { data: newMeal } = await s
          .from('meal_plan_meals')
          .insert({
            plan_day_id: targetDayId,
            meal_type: sourceMeal.meal_type,
            title: sourceMeal.title,
            description: sourceMeal.description,
            calories: sourceMeal.calories,
            protein_g: sourceMeal.protein_g,
            carbs_g: sourceMeal.carbs_g,
            fat_g: sourceMeal.fat_g,
            suggested_time: sourceMeal.suggested_time,
            display_order: sourceMeal.display_order,
            notes: sourceMeal.notes,
          })
          .select('id, meal_type')
          .single();

        if (!newMeal) continue;

        // Get foods for this source meal type
        const sourceMealId = mealIdMap.get(sourceMeal.meal_type);
        if (!sourceMealId) continue;

        const foods = foodsBySourceMeal.get(sourceMealId) || [];
        if (foods.length === 0) continue;

        // Duplicate foods into the new meal
        const foodsToInsert = foods.map(f => ({
          plan_meal_id: newMeal.id,
          food_id: f.food_id,
          custom_name: f.custom_name,
          quantity: f.quantity,
          unit: f.unit,
          calories: f.calories,
          protein_g: f.protein_g,
          carbs_g: f.carbs_g,
          fat_g: f.fat_g,
          display_order: f.display_order,
        }));

        await s
          .from('meal_plan_meal_foods')
          .insert(foodsToInsert);
      }
    }

    return apiResponse.success({
      copied_to: target_day_ids.filter(id => id !== source_day_id).length,
    });
  } catch (error) {
    console.error('Unexpected error in copy day POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
