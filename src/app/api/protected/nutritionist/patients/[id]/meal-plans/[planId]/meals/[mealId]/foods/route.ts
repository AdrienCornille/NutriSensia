/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]/meals/[mealId]/foods
 * PLAN-N-003: Gestion des aliments dans un repas
 *
 * POST - Ajouter un aliment a un repas
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { addPlanFoodSchema } from '@/lib/api-schemas';
import { decodeHtmlEntities } from '@/lib/utils';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Verify access in 2 parallel queries instead of 5 sequential ones:
 * Query A: nutritionist_profiles + patient_profiles + meal_plans (sequential chain, but needed)
 * Query B: meal_plan_meals + meal_plan_days (join via plan_day_id)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyAccessAndResolve(
  supabase: any,
  userId: string,
  patientProfileId: string,
  planId: string,
  mealId: string
): Promise<{ nutritionistId: string | null; hasAccess: boolean }> {
  // Step 1: Get nutritionist profile + patient in parallel
  const [{ data: nutProfile }, { data: patient }] = await Promise.all([
    supabase.from('nutritionist_profiles').select('id').eq('user_id', userId).single(),
    supabase.from('patient_profiles').select('user_id, nutritionist_id').eq('id', patientProfileId).single(),
  ]);

  if (!nutProfile || !patient || patient.nutritionist_id !== nutProfile.id) {
    return { nutritionistId: null, hasAccess: false };
  }

  // Step 2: Verify plan + meal in parallel
  const [{ data: plan }, { data: meal }] = await Promise.all([
    supabase.from('meal_plans').select('id').eq('id', planId).eq('patient_id', patient.user_id).eq('nutritionist_id', userId).is('deleted_at', null).single(),
    supabase.from('meal_plan_meals').select('id, plan_day_id').eq('id', mealId).single(),
  ]);

  if (!plan || !meal) {
    return { nutritionistId: nutProfile.id, hasAccess: false };
  }

  // Step 3: Verify day belongs to plan
  const { data: day } = await supabase.from('meal_plan_days').select('id').eq('id', meal.plan_day_id).eq('meal_plan_id', planId).single();

  return { nutritionistId: nutProfile.id, hasAccess: !!day };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculateMealTotals(supabase: any, mealId: string) {
  const { data: foods } = await supabase
    .from('meal_plan_meal_foods')
    .select('calories, protein_g, carbs_g, fat_g')
    .eq('plan_meal_id', mealId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totals = (foods || []).reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc: any, f: any) => ({
      calories: acc.calories + (f.calories || 0),
      protein_g: acc.protein_g + (f.protein_g || 0),
      carbs_g: acc.carbs_g + (f.carbs_g || 0),
      fat_g: acc.fat_g + (f.fat_g || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  // This UPDATE triggers meal_plan_meals_update_day_totals() which recalculates day totals
  await supabase
    .from('meal_plan_meals')
    .update({
      calories: Math.round(totals.calories),
      protein_g: Math.round(totals.protein_g * 100) / 100,
      carbs_g: Math.round(totals.carbs_g * 100) / 100,
      fat_g: Math.round(totals.fat_g * 100) / 100,
    })
    .eq('id', mealId);
}

type RouteParams = { params: Promise<{ id: string; planId: string; mealId: string }> };

// ============================================================================
// POST - Ajouter un aliment a un repas
// ============================================================================

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, planId, mealId } = await params;

    // Parse body in parallel with DB access check
    const [supabase, body] = await Promise.all([
      createClient(),
      req.json(),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const parsed = addPlanFoodSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const { food_id, custom_name, quantity, unit } = parsed.data;

    // Verify access (optimized: 3 steps with parallel queries instead of 5 sequential)
    const { nutritionistId, hasAccess } = await verifyAccessAndResolve(s, auth.user.id, patientProfileId, planId, mealId);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }
    if (!hasAccess) {
      return apiResponse.error('Repas introuvable ou accès non autorisé', 403);
    }

    // Parallel: food lookup + display_order + unit conversion
    let foodName = custom_name || 'Aliment';
    let calories = 0;
    let protein_g = 0;
    let carbs_g = 0;
    let fat_g = 0;

    const [foodLookup, orderLookup] = await Promise.all([
      food_id
        ? s.from('foods').select('name_fr, category_id, calories, proteins, carbohydrates, fat').eq('id', food_id).single()
        : Promise.resolve({ data: null }),
      s.from('meal_plan_meal_foods').select('display_order').eq('plan_meal_id', mealId).order('display_order', { ascending: false }).limit(1),
    ]);

    if (food_id) {
      const foodData = foodLookup.data;
      if (!foodData) {
        return apiResponse.error('Aliment introuvable dans la base', 404);
      }
      foodName = decodeHtmlEntities(foodData.name_fr || '') || custom_name || 'Aliment';

      // Resolve gram equivalent for the selected unit
      let gramEquivalent = 1; // default: 1 unit = 1g
      if (unit && unit !== 'g') {
        // Look up food-specific conversion first, then category fallback
        const { data: foodConv } = await s
          .from('food_unit_conversions')
          .select('gram_equivalent')
          .eq('food_id', food_id)
          .eq('unit', unit)
          .single();

        if (foodConv) {
          gramEquivalent = Number(foodConv.gram_equivalent);
        } else if (foodData.category_id) {
          const { data: catConv } = await s
            .from('food_unit_conversions')
            .select('gram_equivalent')
            .eq('food_category_id', foodData.category_id)
            .is('food_id', null)
            .eq('unit', unit)
            .single();
          if (catConv) {
            gramEquivalent = Number(catConv.gram_equivalent);
          }
        }
      }

      const gramQty = quantity * gramEquivalent;
      calories = Math.round(((foodData.calories || 0) * gramQty) / 100);
      protein_g = Math.round(((foodData.proteins || 0) * gramQty) / 100 * 100) / 100;
      carbs_g = Math.round(((foodData.carbohydrates || 0) * gramQty) / 100 * 100) / 100;
      fat_g = Math.round(((foodData.fat || 0) * gramQty) / 100 * 100) / 100;
    }

    const existingFoods = orderLookup.data;
    const nextOrder = existingFoods && existingFoods.length > 0
      ? (existingFoods[0].display_order || 0) + 1
      : 0;

    const { data: foodItem, error: createError } = await s
      .from('meal_plan_meal_foods')
      .insert({
        plan_meal_id: mealId,
        food_id: food_id || null,
        custom_name: foodName,
        quantity,
        unit: unit || 'g',
        calories,
        protein_g,
        carbs_g,
        fat_g,
        display_order: nextOrder,
      })
      .select('id, plan_meal_id, food_id, custom_name, quantity, unit, calories, protein_g, carbs_g, fat_g, display_order')
      .single();

    if (createError) {
      console.error('Error creating food item:', createError);
      return apiResponse.serverError('Erreur lors de l\'ajout de l\'aliment');
    }

    // Recalculate meal totals (triggers day totals recalculation)
    await recalculateMealTotals(s, mealId);

    return apiResponse.success(foodItem, 201);
  } catch (error) {
    console.error('Unexpected error in foods POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
