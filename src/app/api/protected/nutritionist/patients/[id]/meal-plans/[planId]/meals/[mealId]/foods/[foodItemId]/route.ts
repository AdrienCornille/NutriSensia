/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]/meals/[mealId]/foods/[foodItemId]
 * PLAN-N-003: Gestion d'un aliment individuel dans un repas
 *
 * PATCH  - Modifier la quantite d'un aliment
 * DELETE - Supprimer un aliment du repas
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updatePlanFoodSchema } from '@/lib/api-schemas';

// ============================================================================
// Helpers
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveNutritionistId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('nutritionist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyFoodAccess(supabase: any, foodItemId: string, mealId: string, planId: string, nutritionistUserId: string, patientProfileId: string, nutritionistId: string): Promise<boolean> {
  const { data: patient } = await supabase
    .from('patient_profiles')
    .select('user_id')
    .eq('id', patientProfileId)
    .eq('nutritionist_id', nutritionistId)
    .single();
  if (!patient) return false;

  const { data: plan } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('id', planId)
    .eq('patient_id', patient.user_id)
    .eq('nutritionist_id', nutritionistUserId)
    .is('deleted_at', null)
    .single();
  if (!plan) return false;

  // Verify food → meal → day → plan chain
  const { data: foodItem } = await supabase
    .from('meal_plan_meal_foods')
    .select('id, plan_meal_id')
    .eq('id', foodItemId)
    .eq('plan_meal_id', mealId)
    .single();
  if (!foodItem) return false;

  const { data: meal } = await supabase
    .from('meal_plan_meals')
    .select('id, plan_day_id')
    .eq('id', mealId)
    .single();
  if (!meal) return false;

  const { data: day } = await supabase
    .from('meal_plan_days')
    .select('id')
    .eq('id', meal.plan_day_id)
    .eq('meal_plan_id', planId)
    .single();
  return !!day;
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

type RouteParams = { params: Promise<{ id: string; planId: string; mealId: string; foodItemId: string }> };

// ============================================================================
// PATCH - Modifier un aliment (quantite)
// ============================================================================

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, planId, mealId, foodItemId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const hasAccess = await verifyFoodAccess(s, foodItemId, mealId, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!hasAccess) {
      return apiResponse.error('Aliment introuvable ou accès non autorisé', 403);
    }

    const body = await req.json();
    const parsed = updatePlanFoodSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.display_order !== undefined) {
      updateData.display_order = parsed.data.display_order;
    }
    if (parsed.data.unit !== undefined) {
      updateData.unit = parsed.data.unit;
    }

    // If quantity or unit changed, recalculate macros
    if (parsed.data.quantity !== undefined || parsed.data.unit !== undefined) {
      if (parsed.data.quantity !== undefined) updateData.quantity = parsed.data.quantity;
      if (parsed.data.unit !== undefined) updateData.unit = parsed.data.unit;

      // Get the food item to find its food_id and current unit
      const { data: currentFood } = await s
        .from('meal_plan_meal_foods')
        .select('food_id, quantity, unit')
        .eq('id', foodItemId)
        .single();

      if (currentFood?.food_id) {
        // Look up original food for per-100g values
        const { data: foodData } = await s
          .from('foods')
          .select('calories, proteins, carbohydrates, fat, category_id')
          .eq('id', currentFood.food_id)
          .single();

        if (foodData) {
          const qty = parsed.data.quantity ?? currentFood.quantity;
          const unitToUse = parsed.data.unit ?? currentFood.unit ?? 'g';

          // Resolve gram equivalent for unit
          let gramEquivalent = 1;
          if (unitToUse !== 'g') {
            const { data: foodConv } = await s
              .from('food_unit_conversions')
              .select('gram_equivalent')
              .eq('food_id', currentFood.food_id)
              .eq('unit', unitToUse)
              .single();

            if (foodConv) {
              gramEquivalent = Number(foodConv.gram_equivalent);
            } else if (foodData.category_id) {
              const { data: catConv } = await s
                .from('food_unit_conversions')
                .select('gram_equivalent')
                .eq('food_category_id', foodData.category_id)
                .is('food_id', null)
                .eq('unit', unitToUse)
                .single();
              if (catConv) {
                gramEquivalent = Number(catConv.gram_equivalent);
              }
            }
          }

          const gramQty = qty * gramEquivalent;
          updateData.calories = Math.round(((foodData.calories || 0) * gramQty) / 100);
          updateData.protein_g = Math.round(((foodData.proteins || 0) * gramQty) / 100 * 100) / 100;
          updateData.carbs_g = Math.round(((foodData.carbohydrates || 0) * gramQty) / 100 * 100) / 100;
          updateData.fat_g = Math.round(((foodData.fat || 0) * gramQty) / 100 * 100) / 100;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return apiResponse.error('Aucun champ à mettre à jour', 400);
    }

    const { data: updated, error: updateError } = await s
      .from('meal_plan_meal_foods')
      .update(updateData)
      .eq('id', foodItemId)
      .select('id, plan_meal_id, food_id, custom_name, quantity, unit, calories, protein_g, carbs_g, fat_g, display_order')
      .single();

    if (updateError) {
      console.error('Error updating food item:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour de l\'aliment');
    }

    // Recalculate meal totals
    await recalculateMealTotals(s, mealId);

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error in food PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Supprimer un aliment
// ============================================================================

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, planId, mealId, foodItemId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const hasAccess = await verifyFoodAccess(s, foodItemId, mealId, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!hasAccess) {
      return apiResponse.error('Aliment introuvable ou accès non autorisé', 403);
    }

    const { error: deleteError } = await s
      .from('meal_plan_meal_foods')
      .delete()
      .eq('id', foodItemId);

    if (deleteError) {
      console.error('Error deleting food item:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression de l\'aliment');
    }

    // Recalculate meal totals
    await recalculateMealTotals(s, mealId);

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error in food DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
