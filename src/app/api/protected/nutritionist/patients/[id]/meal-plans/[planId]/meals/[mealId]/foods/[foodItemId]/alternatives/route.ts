/**
 * API Route: .../foods/[foodItemId]/alternatives
 * PLAN-N-004: Alternatives alimentaires
 *
 * GET  - Liste les alternatives pour cet aliment
 * POST - Ajouter une alternative
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

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
  const { data: patient } = await supabase.from('patient_profiles').select('user_id').eq('id', patientProfileId).eq('nutritionist_id', nutritionistId).single();
  if (!patient) return false;
  const { data: plan } = await supabase.from('meal_plans').select('id').eq('id', planId).eq('patient_id', patient.user_id).eq('nutritionist_id', nutritionistUserId).is('deleted_at', null).single();
  if (!plan) return false;
  const { data: foodItem } = await supabase.from('meal_plan_meal_foods').select('id, plan_meal_id').eq('id', foodItemId).eq('plan_meal_id', mealId).single();
  if (!foodItem) return false;
  const { data: meal } = await supabase.from('meal_plan_meals').select('plan_day_id').eq('id', mealId).single();
  if (!meal) return false;
  const { data: day } = await supabase.from('meal_plan_days').select('id').eq('id', meal.plan_day_id).eq('meal_plan_id', planId).single();
  return !!day;
}

type RouteParams = { params: Promise<{ id: string; planId: string; mealId: string; foodItemId: string }> };

// GET - List alternatives
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) return apiResponse.unauthorized();

    const { id: patientProfileId, planId, mealId, foodItemId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) return apiResponse.error('Profil nutritionniste introuvable', 404);

    const hasAccess = await verifyFoodAccess(s, foodItemId, mealId, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!hasAccess) return apiResponse.error('Aliment introuvable ou accès non autorisé', 403);

    const { data: alternatives, error } = await s
      .from('meal_plan_alternatives')
      .select('id, plan_food_id, alternative_food_id, alternative_name, reason, calories, protein_g, carbs_g, fat_g, preference_order, created_at')
      .eq('plan_food_id', foodItemId)
      .order('preference_order', { ascending: true });

    if (error) {
      console.error('Error fetching alternatives:', error);
      return apiResponse.serverError('Erreur lors de la récupération des alternatives');
    }

    return apiResponse.success(alternatives || []);
  } catch (error) {
    console.error('Unexpected error in alternatives GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// POST - Add alternative
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) return apiResponse.unauthorized();

    const { id: patientProfileId, planId, mealId, foodItemId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) return apiResponse.error('Profil nutritionniste introuvable', 404);

    const hasAccess = await verifyFoodAccess(s, foodItemId, mealId, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!hasAccess) return apiResponse.error('Aliment introuvable ou accès non autorisé', 403);

    const body = await req.json();
    const { alternative_food_id, alternative_name, reason, quantity } = body;

    if (!alternative_food_id && !alternative_name) {
      return apiResponse.error('Un aliment alternatif ou un nom est requis', 400);
    }

    let altName = alternative_name || 'Alternative';
    let calories = 0;
    let protein_g = 0;
    let carbs_g = 0;
    let fat_g = 0;

    // Get the original food's quantity for proportional calculation
    const { data: originalFood } = await s
      .from('meal_plan_meal_foods')
      .select('quantity, calories, protein_g, carbs_g, fat_g')
      .eq('id', foodItemId)
      .single();

    const targetQty = quantity || originalFood?.quantity || 100;

    if (alternative_food_id) {
      const { data: foodData } = await s
        .from('foods')
        .select('name_fr, calories, proteins, carbohydrates, fat')
        .eq('id', alternative_food_id)
        .single();

      if (!foodData) return apiResponse.error('Aliment alternatif introuvable', 404);

      altName = foodData.name_fr || alternative_name || 'Alternative';
      calories = Math.round(((foodData.calories || 0) * targetQty) / 100);
      protein_g = Math.round(((foodData.proteins || 0) * targetQty) / 100 * 100) / 100;
      carbs_g = Math.round(((foodData.carbohydrates || 0) * targetQty) / 100 * 100) / 100;
      fat_g = Math.round(((foodData.fat || 0) * targetQty) / 100 * 100) / 100;
    }

    // Get next preference_order
    const { data: existing } = await s
      .from('meal_plan_alternatives')
      .select('preference_order')
      .eq('plan_food_id', foodItemId)
      .order('preference_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? (existing[0].preference_order || 0) + 1 : 0;

    const { data: alternative, error: createError } = await s
      .from('meal_plan_alternatives')
      .insert({
        plan_food_id: foodItemId,
        alternative_food_id: alternative_food_id || null,
        alternative_name: altName,
        reason: reason || null,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        preference_order: nextOrder,
      })
      .select('id, plan_food_id, alternative_food_id, alternative_name, reason, calories, protein_g, carbs_g, fat_g, preference_order')
      .single();

    if (createError) {
      console.error('Error creating alternative:', createError);
      return apiResponse.serverError('Erreur lors de la création de l\'alternative');
    }

    return apiResponse.success(alternative, 201);
  } catch (error) {
    console.error('Unexpected error in alternatives POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
