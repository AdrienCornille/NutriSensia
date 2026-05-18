import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { upsertRecipeIngredientsSchema } from '@/lib/api-schemas';
import { upsertAutoTags } from '@/lib/recipe-auto-tags-db';

/**
 * PUT /api/protected/nutritionist/recipes/[recipeId]/ingredients
 * Bulk upsert ingredients — replaces all existing ingredients
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { recipeId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Verify ownership
    const { data: recipe } = await s
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .eq('created_by', auth.user.id)
      .is('deleted_at', null)
      .single();

    if (!recipe) {
      return apiResponse.error('Recette introuvable', 404);
    }

    const body = await req.json();
    const parsed = upsertRecipeIngredientsSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Delete all existing ingredients
    await s.from('recipe_ingredients').delete().eq('recipe_id', recipeId);

    // Insert new ingredients
    const ingredients = parsed.data.ingredients.map((ing, idx) => ({
      recipe_id: recipeId,
      food_id: ing.food_id || null,
      name: ing.name,
      quantity: ing.quantity,
      quantity_value: ing.quantity_value || null,
      quantity_unit: ing.quantity_unit || null,
      is_optional: ing.is_optional,
      substitution_notes: ing.substitution_notes || null,
      group_name: ing.group_name || null,
      display_order: ing.display_order ?? idx,
    }));

    if (ingredients.length > 0) {
      const { error: insertError } = await s
        .from('recipe_ingredients')
        .insert(ingredients);

      if (insertError) {
        console.error('Error inserting ingredients:', insertError);
        return apiResponse.serverError(
          "Erreur lors de l'enregistrement des ingrédients"
        );
      }
    }

    // Recalculate nutrition from CIQUAL data
    await recalculateNutrition(s, recipeId, ingredients);

    // Recompute auto-tags (nutrition values just changed)
    await upsertAutoTags(s, recipeId);

    // Fetch updated ingredients
    const { data: updated } = await s
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('display_order', { ascending: true });

    return apiResponse.success({ ingredients: updated || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * Recalculate per-serving nutrition from CIQUAL-linked ingredients
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculateNutrition(
  s: any,
  recipeId: string,
  ingredients: any[]
) {
  try {
    // Get recipe servings
    const { data: recipe } = await s
      .from('recipes')
      .select('servings')
      .eq('id', recipeId)
      .single();

    const servings = recipe?.servings || 1;

    // Get CIQUAL data for linked foods
    const foodIds = ingredients.filter(i => i.food_id).map(i => i.food_id);

    if (foodIds.length === 0) {
      // No CIQUAL-linked ingredients — clear nutrition
      await s
        .from('recipes')
        .update({
          calories: null,
          protein_g: null,
          carbs_g: null,
          fat_g: null,
          fiber_g: null,
        })
        .eq('id', recipeId);
      return;
    }

    const { data: foods } = await s
      .from('foods')
      .select(
        'id, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g'
      )
      .in('id', foodIds);

    if (!foods || foods.length === 0) return;

    interface FoodNutrition {
      id: string;
      calories_per_100g: number;
      protein_per_100g: number;
      carbs_per_100g: number;
      fat_per_100g: number;
      fiber_per_100g: number | null;
    }
    const foodMap = new Map<string, FoodNutrition>(
      foods.map((f: FoodNutrition) => [f.id, f])
    );

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    for (const ing of ingredients) {
      if (!ing.food_id) continue;
      const food = foodMap.get(ing.food_id);
      if (!food) continue;

      // Use quantity_value as grams (default to 100g if no value)
      const grams = ing.quantity_value || 100;
      const factor = grams / 100;

      totalCalories += (food.calories_per_100g || 0) * factor;
      totalProtein += (food.protein_per_100g || 0) * factor;
      totalCarbs += (food.carbs_per_100g || 0) * factor;
      totalFat += (food.fat_per_100g || 0) * factor;
      totalFiber += (food.fiber_per_100g || 0) * factor;
    }

    await s
      .from('recipes')
      .update({
        calories: Math.round(totalCalories / servings),
        protein_g: Math.round((totalProtein / servings) * 100) / 100,
        carbs_g: Math.round((totalCarbs / servings) * 100) / 100,
        fat_g: Math.round((totalFat / servings) * 100) / 100,
        fiber_g: Math.round((totalFiber / servings) * 100) / 100,
      })
      .eq('id', recipeId);
  } catch (err) {
    console.error('Error recalculating nutrition:', err);
  }
}
