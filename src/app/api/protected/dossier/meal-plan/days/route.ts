/**
 * API Route: /api/protected/dossier/meal-plan/days
 * Patient-side: returns days + meals + foods + micronutrients for the active plan
 *
 * GET - Jours du plan actif avec repas et aliments
 */

import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { decodeHtmlEntities } from '@/lib/utils';

const MICRO_KEYS = [
  'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
  'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b6', 'vitamin_b9', 'vitamin_b12',
  'calcium', 'iron', 'magnesium', 'phosphorus', 'zinc',
] as const;

export async function GET() {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;
    const userId = auth.user.id;

    // Find active plan
    const { data: plan } = await s
      .from('meal_plans')
      .select('id')
      .eq('patient_id', userId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!plan) {
      return apiResponse.success([]);
    }

    // Fetch days
    const { data: days, error: daysError } = await s
      .from('meal_plan_days')
      .select('id, day_number, day_name, date, total_calories, total_protein, total_carbs, total_fat')
      .eq('meal_plan_id', plan.id)
      .order('day_number', { ascending: true });

    if (daysError) {
      console.error('Error fetching plan days:', daysError);
      return apiResponse.serverError('Erreur lors de la récupération des jours');
    }

    if (!days || days.length === 0) {
      return apiResponse.success([]);
    }

    // Fetch meals (exclude notes — private to nutritionist)
    const dayIds = days.map((d: { id: string }) => d.id);
    const { data: meals, error: mealsError } = await s
      .from('meal_plan_meals')
      .select('id, plan_day_id, meal_type, title, description, calories, protein_g, carbs_g, fat_g, suggested_time, display_order')
      .in('plan_day_id', dayIds)
      .order('display_order', { ascending: true });

    if (mealsError) {
      console.error('Error fetching meals:', mealsError);
      return apiResponse.serverError('Erreur lors de la récupération des repas');
    }

    const allMeals: Record<string, unknown>[] = meals || [];

    // Fetch foods
    const mealIds = allMeals.map((m: Record<string, unknown>) => m.id as string);
    let foods: Record<string, unknown>[] = [];

    if (mealIds.length > 0) {
      const { data: foodsData, error: foodsError } = await s
        .from('meal_plan_meal_foods')
        .select('id, plan_meal_id, food_id, custom_name, quantity, unit, calories, protein_g, carbs_g, fat_g, display_order')
        .in('plan_meal_id', mealIds)
        .order('display_order', { ascending: true });

      if (foodsError) {
        console.error('Error fetching foods:', foodsError);
      } else {
        foods = foodsData || [];
      }
    }

    // Batch-fetch micronutrient data from CIQUAL
    const foodIds = [...new Set(foods.filter(f => f.food_id).map(f => f.food_id as string))];
    const microByFoodId = new Map<string, Record<string, unknown>>();

    if (foodIds.length > 0) {
      const { data: microData } = await s
        .from('foods')
        .select(`id, calories, fiber, ${MICRO_KEYS.join(', ')}`)
        .in('id', foodIds);

      if (microData) {
        for (const row of microData as Record<string, unknown>[]) {
          microByFoodId.set(row.id as string, row);
        }
      }
    }

    // Fetch alternatives for all foods
    const allFoodItemIds = foods.map(f => f.id as string);
    const alternativesByFoodId = new Map<string, Record<string, unknown>[]>();

    if (allFoodItemIds.length > 0) {
      const { data: altsData } = await s
        .from('meal_plan_food_alternatives')
        .select('id, plan_food_id, alternative_name, calories, protein_g, carbs_g, fat_g')
        .in('plan_food_id', allFoodItemIds);

      if (altsData) {
        for (const alt of altsData as Record<string, unknown>[]) {
          const foodItemId = alt.plan_food_id as string;
          if (!alternativesByFoodId.has(foodItemId)) {
            alternativesByFoodId.set(foodItemId, []);
          }
          alternativesByFoodId.get(foodItemId)!.push(alt);
        }
      }
    }

    // Group foods by meal
    const foodsByMeal = new Map<string, Record<string, unknown>[]>();
    for (const food of foods) {
      const mealId = food.plan_meal_id as string;
      if (!foodsByMeal.has(mealId)) {
        foodsByMeal.set(mealId, []);
      }

      // Calculate fiber + micronutrients
      let micronutrients: Record<string, number | null> | null = null;
      let fiber_g: number | null = null;
      const foodRef = food.food_id ? microByFoodId.get(food.food_id as string) : null;
      if (foodRef) {
        const refCal = Number(foodRef.calories) || 0;
        const storedCal = Number(food.calories) || 0;
        const qty = Number(food.quantity) || 100;
        const multiplier = refCal > 0 ? storedCal / refCal : qty / 100;

        // Fiber
        if (foodRef.fiber != null) {
          fiber_g = Math.round(Number(foodRef.fiber) * multiplier * 100) / 100;
        }

        micronutrients = {};
        for (const key of MICRO_KEYS) {
          const val = foodRef[key];
          micronutrients[key] = val != null ? Math.round(Number(val) * multiplier * 100) / 100 : null;
        }
      }

      foodsByMeal.get(mealId)!.push({
        ...food,
        custom_name: food.custom_name ? decodeHtmlEntities(food.custom_name as string) : food.custom_name,
        fiber_g,
        micronutrients,
        alternatives: alternativesByFoodId.get(food.id as string) || [],
      });
    }

    // Group meals by day and attach foods
    const mealsByDay = new Map<string, Record<string, unknown>[]>();
    for (const meal of allMeals) {
      const dayId = meal.plan_day_id as string;
      if (!mealsByDay.has(dayId)) {
        mealsByDay.set(dayId, []);
      }
      mealsByDay.get(dayId)!.push({
        ...meal,
        foods: foodsByMeal.get(meal.id as string) || [],
      });
    }

    // Assemble response
    const result = days.map((day: Record<string, unknown>) => ({
      ...day,
      meals: mealsByDay.get(day.id as string) || [],
    }));

    return apiResponse.success(result);
  } catch (error) {
    console.error('Unexpected error in patient meal-plan days GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
