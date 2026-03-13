/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]/days
 * PLAN-N-002: Jours du plan alimentaire
 *
 * GET  - Liste les 7 jours avec repas (auto-init si aucun jour)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { decodeHtmlEntities } from '@/lib/utils';

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
  // Verify patient belongs to nutritionist
  const { data: patient } = await supabase
    .from('patient_profiles')
    .select('user_id')
    .eq('id', patientProfileId)
    .eq('nutritionist_id', nutritionistId)
    .single();

  if (!patient) return null;

  // Verify plan exists and belongs to this nutritionist + patient
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

// Fallback (used when start_date is not available)
const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
const JS_DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function buildDayInfo(startDateStr: string | null, dayIndex: number): { day_name: string; date: string | null } {
  if (!startDateStr) {
    return { day_name: DAY_NAMES[dayIndex % 7], date: null };
  }
  const d = new Date(startDateStr + 'T00:00:00');
  d.setDate(d.getDate() + dayIndex);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return {
    day_name: JS_DAY_NAMES[d.getDay()],
    date: `${yyyy}-${mm}-${dd}`,
  };
}

// ============================================================================
// GET - Liste des jours avec repas
// ============================================================================

export async function GET(
  _req: NextRequest,
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

    // Fetch the plan to get date range for day count calculation
    const { data: planData } = await s
      .from('meal_plans')
      .select('start_date, end_date')
      .eq('id', planId)
      .single();

    // Fetch existing days
    let { data: days, error: daysError } = await s
      .from('meal_plan_days')
      .select('id, day_number, day_name, date, total_calories, total_protein, total_carbs, total_fat, notes')
      .eq('meal_plan_id', planId)
      .order('day_number', { ascending: true });

    if (daysError) {
      console.error('Error fetching days:', daysError);
      return apiResponse.serverError('Erreur lors de la récupération des jours');
    }

    // Calculate expected number of days from plan date range (default 7, max 28)
    let numDays = 7;
    if (planData?.start_date && planData?.end_date) {
      const start = new Date(planData.start_date);
      const end = new Date(planData.end_date);
      const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      numDays = Math.max(1, Math.min(diff, 28));
    }

    const currentCount = days?.length || 0;

    const startDateStr = planData?.start_date || null;

    // Refresh calendar dates: update days whose date/day_name don't match the plan's start_date
    if (startDateStr && days && days.length > 0) {
      for (const day of days as { id: string; day_number: number; day_name: string | null; date: string | null }[]) {
        const expected = buildDayInfo(startDateStr, day.day_number - 1);
        if (day.date !== expected.date || day.day_name !== expected.day_name) {
          await s
            .from('meal_plan_days')
            .update({ day_name: expected.day_name, date: expected.date })
            .eq('id', day.id);
          // Update in-memory too
          const idx = days.findIndex((d: { id: string }) => d.id === day.id);
          if (idx !== -1) {
            (days[idx] as Record<string, unknown>).day_name = expected.day_name;
            (days[idx] as Record<string, unknown>).date = expected.date;
          }
        }
      }
    }

    // Shrink: remove excess days when the plan duration was reduced
    if (currentCount > numDays) {
      const excessDays = (days as { id: string; day_number: number }[])
        .filter(d => d.day_number > numDays);
      const excessIds = excessDays.map(d => d.id);

      if (excessIds.length > 0) {
        // Delete foods, meals, then days for excess days (respecting FK order)
        const { data: excessMeals } = await s
          .from('meal_plan_meals')
          .select('id')
          .in('plan_day_id', excessIds);

        const excessMealIds = (excessMeals || []).map((m: { id: string }) => m.id);

        if (excessMealIds.length > 0) {
          await s.from('meal_plan_meal_foods').delete().in('plan_meal_id', excessMealIds);
          await s.from('meal_plan_meals').delete().in('plan_day_id', excessIds);
        }

        await s.from('meal_plan_days').delete().in('id', excessIds);

        // Update in-memory list
        days = (days as { id: string; day_number: number }[])
          .filter(d => d.day_number <= numDays);
      }
    }

    // Auto-initialize or expand days to match expected count
    if (currentCount < numDays) {
      const daysToInsert = Array.from({ length: numDays - currentCount }, (_, i) => {
        const dayIndex = currentCount + i;
        const info = buildDayInfo(startDateStr, dayIndex);
        return {
          meal_plan_id: planId,
          day_number: dayIndex + 1,
          day_name: info.day_name,
          date: info.date,
        };
      });

      const { data: newDays, error: insertError } = await s
        .from('meal_plan_days')
        .insert(daysToInsert)
        .select('id, day_number, day_name, date, total_calories, total_protein, total_carbs, total_fat, notes')
        .order('day_number', { ascending: true });

      if (insertError) {
        console.error('Error initializing/expanding days:', insertError);
        return apiResponse.serverError('Erreur lors de l\'initialisation des jours');
      }

      // Merge existing + new days
      days = [...(days || []), ...(newDays || [])];
    }

    // Fetch all meals for these days
    const dayIds = (days || []).map((d: { id: string }) => d.id);
    let meals: Record<string, unknown>[] = [];

    if (dayIds.length > 0) {
      const { data: mealsData, error: mealsError } = await s
        .from('meal_plan_meals')
        .select('id, plan_day_id, meal_type, title, description, calories, protein_g, carbs_g, fat_g, suggested_time, display_order, notes')
        .in('plan_day_id', dayIds)
        .order('display_order', { ascending: true });

      if (mealsError) {
        console.error('Error fetching meals:', mealsError);
        return apiResponse.serverError('Erreur lors de la récupération des repas');
      }

      meals = mealsData || [];
    }

    // Fetch all foods for these meals
    const mealIds = meals.map((m: Record<string, unknown>) => m.id as string);
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

    // Batch-fetch micronutrient data from foods table for CIQUAL food_ids
    const MICRO_KEYS = ['vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k', 'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b6', 'vitamin_b9', 'vitamin_b12', 'calcium', 'iron', 'magnesium', 'phosphorus', 'zinc'] as const;
    const foodIds = [...new Set(foods.filter(f => f.food_id).map(f => f.food_id as string))];
    const microByFoodId = new Map<string, Record<string, unknown>>();

    if (foodIds.length > 0) {
      const { data: microData } = await s
        .from('foods')
        .select('id, calories, fiber, vitamin_a, vitamin_c, vitamin_d, vitamin_e, vitamin_k, vitamin_b1, vitamin_b2, vitamin_b3, vitamin_b6, vitamin_b9, vitamin_b12, calcium, iron, magnesium, phosphorus, zinc')
        .in('id', foodIds);

      if (microData) {
        for (const row of microData as Record<string, unknown>[]) {
          microByFoodId.set(row.id as string, row);
        }
      }
    }

    // Group foods by meal (decode HTML entities in food names + attach micronutrients)
    const foodsByMeal = new Map<string, Record<string, unknown>[]>();
    for (const food of foods) {
      const mealId = food.plan_meal_id as string;
      if (!foodsByMeal.has(mealId)) {
        foodsByMeal.set(mealId, []);
      }

      // Calculate fiber + micronutrients from CIQUAL reference data
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
      });
    }

    // Group meals by day and attach foods
    const mealsByDay = new Map<string, Record<string, unknown>[]>();
    for (const meal of meals) {
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
    const result = (days || []).map((day: Record<string, unknown>) => ({
      ...day,
      meals: mealsByDay.get(day.id as string) || [],
    }));

    return apiResponse.success(result);
  } catch (error) {
    console.error('Unexpected error in plan days GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
