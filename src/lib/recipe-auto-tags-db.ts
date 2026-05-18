// ============================================================================
// Recipe Auto-Tags — Database helper (server-side only)
// Fetches recipe data from Supabase and upserts computed auto-tags.
// Also handles semi-auto diet tag suggestions (Phase 2).
// ============================================================================

import { computeAllAutoTags } from '@/lib/recipe-auto-tags';
import {
  analyzeDietCompatibility,
  getDietTagSlugs,
  type FoodOrigin,
} from '@/lib/recipe-diet-analyzer';
import {
  analyzeAllergens,
  getAllergenAutoTags,
  type IngredientAllergenData,
} from '@/lib/recipe-allergen-analyzer';

/**
 * Recompute and persist auto-tags for a recipe (calories, time, nutrition).
 * Also computes diet suggestions (vegan, vegetarian, etc.) from ingredient origins.
 * Safe to call even when nutrition data is missing — tags will simply be empty.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function upsertAutoTags(supabase: any, recipeId: string) {
  const { data: recipe } = await supabase
    .from('recipes')
    .select(
      'calories, protein_g, carbs_g, fat_g, fiber_g, servings, prep_time_minutes, cook_time_minutes'
    )
    .eq('id', recipeId)
    .single();

  if (!recipe) return;

  // ── Phase 1: calories, time, nutrition auto-tags ──
  const autoTags = computeAllAutoTags({
    calories: recipe.calories,
    proteinG: recipe.protein_g,
    carbsG: recipe.carbs_g,
    fatG: recipe.fat_g,
    fiberG: recipe.fiber_g,
    servings: recipe.servings ?? 1,
    prepTimeMinutes: recipe.prep_time_minutes ?? 0,
    cookTimeMinutes: recipe.cook_time_minutes ?? 0,
  });

  // ── Phase 2 & 3: diet + allergen analysis from ingredients ──
  const { data: ingredients, error: ingError } = await supabase
    .from('recipe_ingredients')
    .select('food_id, foods!food_id(origin_type, allergens)')
    .eq('recipe_id', recipeId);

  if (ingError) {
    console.error(
      '[upsertAutoTags] Error fetching ingredients with foods join:',
      JSON.stringify(ingError)
    );
  }

  const ingredientList = ingredients || [];
  console.log(
    '[upsertAutoTags] Ingredients found:',
    ingredientList.length,
    'Sample:',
    JSON.stringify(ingredientList.slice(0, 2))
  );

  // Phase 2: Diet suggestions
  const origins: FoodOrigin[] = ingredientList
    .map(
      (ing: { foods?: { origin_type: string } | null }) =>
        ing.foods?.origin_type as FoodOrigin
    )
    .filter(Boolean);

  console.log('[upsertAutoTags] Origins:', origins);

  if (origins.length > 0) {
    const suggestions = analyzeDietCompatibility(origins);
    const dietSlugs = getDietTagSlugs(suggestions);

    for (const slug of dietSlugs) {
      const confident =
        suggestions.find(s => s.diet === slug)?.confident ?? false;
      autoTags.push({
        tag_group: 'diet',
        tag_value: confident ? slug : `${slug}-uncertain`,
      });
    }
  }

  // Phase 3: Allergen detection
  if (ingredientList.length > 0) {
    const allergenData: IngredientAllergenData[] = ingredientList.map(
      (ing: {
        food_id: string | null;
        foods?: { allergens: string[] | null } | null;
      }) => ({
        food_id: ing.food_id,
        allergens: ing.foods?.allergens ?? null,
      })
    );

    const allergenResults = analyzeAllergens(allergenData);
    const allergenTags = getAllergenAutoTags(allergenResults);
    autoTags.push(...allergenTags);
  }

  // ── Persist ──
  console.log(
    '[upsertAutoTags] Final auto-tags to persist:',
    JSON.stringify(autoTags)
  );

  // Delete existing auto-tags for this recipe
  await supabase.from('recipe_auto_tags').delete().eq('recipe_id', recipeId);

  // Insert new auto-tags
  if (autoTags.length > 0) {
    await supabase.from('recipe_auto_tags').insert(
      autoTags.map(t => ({
        recipe_id: recipeId,
        tag_group: t.tag_group,
        tag_value: t.tag_value,
      }))
    );
  }
}
