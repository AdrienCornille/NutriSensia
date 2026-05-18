import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { duplicateRecipeSchema } from '@/lib/api-schemas';
import { upsertAutoTags } from '@/lib/recipe-auto-tags-db';

const RECIPE_SELECT = `
  *,
  recipe_categories(*),
  recipe_tag_assignments(tag_id, recipe_tags(*)),
  recipe_auto_tags(*),
  recipe_ingredients(*, foods!food_id(calories, proteins, carbohydrates, fat, fiber)),
  recipe_steps(*)
`;

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * POST /api/protected/nutritionist/recipes/[recipeId]/duplicate
 * Duplicate a recipe with a new title
 */
export async function POST(
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

    // Fetch original recipe with all relations
    const { data: original, error } = await s
      .from('recipes')
      .select(RECIPE_SELECT)
      .eq('id', recipeId)
      .eq('created_by', auth.user.id)
      .is('deleted_at', null)
      .single();

    if (error || !original) {
      return apiResponse.error('Recette introuvable', 404);
    }

    const body = await req.json();
    const parsed = duplicateRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const newTitle = parsed.data.new_title;
    let slug = generateSlug(newTitle);
    const { data: existingSlug } = await s
      .from('recipes')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Create new recipe (as draft)
    const { data: newRecipe, error: createError } = await s
      .from('recipes')
      .insert({
        created_by: auth.user.id,
        title: newTitle,
        slug,
        description: original.description,
        category_id: original.category_id,
        difficulty: original.difficulty,
        prep_time_minutes: original.prep_time_minutes,
        cook_time_minutes: original.cook_time_minutes,
        servings: original.servings,
        image_url: original.image_url,
        tips: original.tips,
        calories: original.calories,
        protein_g: original.protein_g,
        carbs_g: original.carbs_g,
        fat_g: original.fat_g,
        fiber_g: original.fiber_g,
        status: 'draft',
      })
      .select()
      .single();

    if (createError || !newRecipe) {
      console.error('Error duplicating recipe:', createError);
      return apiResponse.serverError('Erreur lors de la duplication');
    }

    // Duplicate tag assignments
    const tagAssignments = (original.recipe_tag_assignments || []).map(
      (rta: { tag_id: string }) => ({
        recipe_id: newRecipe.id,
        tag_id: rta.tag_id,
      })
    );
    if (tagAssignments.length > 0) {
      await s.from('recipe_tag_assignments').insert(tagAssignments);
    }

    // Duplicate ingredients
    const ingredients = (original.recipe_ingredients || []).map(
      (ing: Record<string, unknown>) => ({
        recipe_id: newRecipe.id,
        food_id: ing.food_id,
        name: ing.name,
        quantity: ing.quantity,
        quantity_value: ing.quantity_value,
        quantity_unit: ing.quantity_unit,
        is_optional: ing.is_optional,
        substitution_notes: ing.substitution_notes,
        group_name: ing.group_name,
        display_order: ing.display_order,
      })
    );
    if (ingredients.length > 0) {
      await s.from('recipe_ingredients').insert(ingredients);
    }

    // Duplicate steps
    const steps = (original.recipe_steps || []).map(
      (step: Record<string, unknown>) => ({
        recipe_id: newRecipe.id,
        step_number: step.step_number,
        instruction: step.instruction,
        duration_minutes: step.duration_minutes,
        image_url: step.image_url,
        tips: step.tips,
      })
    );
    if (steps.length > 0) {
      await s.from('recipe_steps').insert(steps);
    }

    // Compute auto-tags for the duplicate
    await upsertAutoTags(s, newRecipe.id);

    // Fetch complete duplicate
    const { data: fullRecipe } = await s
      .from('recipes')
      .select(RECIPE_SELECT)
      .eq('id', newRecipe.id)
      .single();

    return apiResponse.success(fullRecipe || newRecipe, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
