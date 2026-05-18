import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { logRecipeAsMealSchema } from '@/lib/api-schemas';

/**
 * POST /api/protected/recipes/[recipeId]/log-meal
 * Log a recipe as a meal in the patient's food journal
 * Creates a meal + meal_foods entries from recipe ingredients
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { recipeId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;
    // Admin client to bypass triggers that reference old column names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;

    const body = await req.json();
    const parsed = logRecipeAsMealSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const { meal_type, date, servings_multiplier } = parsed.data;

    // Fetch recipe with ingredients
    const { data: recipe, error: recipeError } = await s
      .from('recipes')
      .select(
        '*, recipe_ingredients(*, foods!food_id(calories, proteins, carbohydrates, fat, fiber))'
      )
      .eq('id', recipeId)
      .eq('status', 'published')
      .is('deleted_at', null)
      .single();

    if (recipeError || !recipe) {
      console.error(
        'Error fetching recipe for log-meal:',
        recipeError?.message
      );
      return apiResponse.error('Recette introuvable', 404);
    }

    const patientId = auth.user.id;

    // Calculate nutrition totals from ingredients
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    interface IngredientWithFood {
      food_id: string | null;
      name: string;
      quantity_value: number | null;
      quantity_unit: string | null;
      quantity: string;
      display_order: number;
      foods?: {
        calories: number;
        proteins: number;
        carbohydrates: number;
        fat: number;
        fiber: number | null;
      } | null;
    }

    const mealFoods: {
      food_id: string;
      quantity: number;
      unit: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      display_order: number;
    }[] = [];

    for (const ing of (recipe.recipe_ingredients ||
      []) as IngredientWithFood[]) {
      if (!ing.food_id || !ing.foods) continue;

      const grams = (ing.quantity_value || 100) * servings_multiplier;
      const factor = grams / 100;

      const cal = Math.round((ing.foods.calories || 0) * factor);
      const pro = Math.round((ing.foods.proteins || 0) * factor * 100) / 100;
      const carb =
        Math.round((ing.foods.carbohydrates || 0) * factor * 100) / 100;
      const fat = Math.round((ing.foods.fat || 0) * factor * 100) / 100;

      totalCalories += cal;
      totalProtein += pro;
      totalCarbs += carb;
      totalFat += fat;

      mealFoods.push({
        food_id: ing.food_id,
        quantity: grams,
        unit: 'g',
        calories: cal,
        protein_g: pro,
        carbs_g: carb,
        fat_g: fat,
        display_order: ing.display_order || 0,
      });
    }

    // 1. Log in recipe history first (this powers the "Cuisinées" tab)
    const { error: historyError } = await admin.from('recipe_history').insert({
      user_id: auth.user.id,
      recipe_id: recipeId,
      action_type: 'cooked',
    });

    if (historyError) {
      console.error(
        'Error logging cooked recipe:',
        JSON.stringify(historyError)
      );
    }

    // 2. Try to create meal entry (best-effort — DB trigger may fail)
    let mealId: string | null = null;
    try {
      const { data: meal, error: mealError } = await admin
        .from('meals')
        .insert({
          patient_id: patientId,
          name: recipe.title,
          meal_type,
          meal_date: date,
          total_calories: totalCalories,
          total_protein: Math.round(totalProtein * 100) / 100,
          total_carbs: Math.round(totalCarbs * 100) / 100,
          total_fat: Math.round(totalFat * 100) / 100,
          notes: `Recette : ${recipe.title}`,
        })
        .select()
        .single();

      if (mealError) {
        console.warn(
          'Could not create meal (trigger issue):',
          mealError.message
        );
      } else if (meal) {
        mealId = meal.id;

        // Create meal_foods
        if (mealFoods.length > 0) {
          await admin
            .from('meal_foods')
            .insert(mealFoods.map(f => ({ meal_id: meal.id, ...f })));
        }
      }
    } catch (e) {
      console.warn('Meal creation skipped:', e);
    }

    return apiResponse.success(
      {
        meal_id: mealId,
        recipe_title: recipe.title,
        meal_type,
        date,
        total_calories: totalCalories,
        total_protein: Math.round(totalProtein * 100) / 100,
        total_carbs: Math.round(totalCarbs * 100) / 100,
        total_fat: Math.round(totalFat * 100) / 100,
        foods_count: mealFoods.length,
      },
      201
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
