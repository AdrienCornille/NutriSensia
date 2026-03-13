/**
 * API Route: /api/protected/dossier/meal-plan/shopping-list
 * Patient-side: generates shopping list from the active meal plan
 *
 * GET - Génère la liste de courses
 */

import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { decodeHtmlEntities } from '@/lib/utils';

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
      return apiResponse.success({ items: [], categories: [] });
    }

    // Get all days
    const { data: days } = await s
      .from('meal_plan_days')
      .select('id')
      .eq('meal_plan_id', plan.id)
      .order('day_number', { ascending: true });

    if (!days || days.length === 0) {
      return apiResponse.success({ items: [], categories: [] });
    }

    const dayIds = days.map((d: { id: string }) => d.id);

    // Get all meals
    const { data: meals } = await s
      .from('meal_plan_meals')
      .select('id')
      .in('plan_day_id', dayIds);

    if (!meals || meals.length === 0) {
      return apiResponse.success({ items: [], categories: [] });
    }

    const mealIds = meals.map((m: { id: string }) => m.id);

    // Get all foods
    const { data: foods } = await s
      .from('meal_plan_meal_foods')
      .select('food_id, custom_name, quantity, unit')
      .in('plan_meal_id', mealIds);

    if (!foods || foods.length === 0) {
      return apiResponse.success({ items: [], categories: [] });
    }

    // Aggregate quantities by food + unit
    const foodMap: Record<string, {
      food_id: string | null;
      name: string;
      total_quantity: number;
      unit: string;
      category: string | null;
    }> = {};

    for (const food of foods) {
      const foodKey = food.food_id || food.custom_name || 'unknown';
      const unitKey = food.unit || 'g';
      const key = `${foodKey}__${unitKey}`;
      if (!foodMap[key]) {
        foodMap[key] = {
          food_id: food.food_id || null,
          name: decodeHtmlEntities(food.custom_name || '') || 'Aliment',
          total_quantity: 0,
          unit: unitKey,
          category: null,
        };
      }
      foodMap[key].total_quantity += food.quantity || 0;
    }

    // Lookup categories for CIQUAL foods
    const ciqualIds = Object.values(foodMap)
      .filter(f => f.food_id)
      .map(f => f.food_id!);

    if (ciqualIds.length > 0) {
      const { data: foodDetails } = await s
        .from('foods')
        .select('id, name_fr, category_id')
        .in('id', ciqualIds);

      const categoryIds = (foodDetails || [])
        .filter((f: { category_id: string | null }) => f.category_id)
        .map((f: { category_id: string }) => f.category_id);

      let categoryMap: Record<string, string> = {};
      if (categoryIds.length > 0) {
        const { data: categories } = await s
          .from('food_categories')
          .select('id, name_fr')
          .in('id', categoryIds);
        categoryMap = (categories || []).reduce(
          (acc: Record<string, string>, c: { id: string; name_fr: string }) => {
            acc[c.id] = c.name_fr;
            return acc;
          },
          {} as Record<string, string>
        );
      }

      const foodDetailMap: Record<string, { name_fr: string; category_id: string | null }> = {};
      for (const fd of foodDetails || []) {
        foodDetailMap[fd.id] = { name_fr: fd.name_fr, category_id: fd.category_id };
      }
      for (const item of Object.values(foodMap)) {
        if (item.food_id && foodDetailMap[item.food_id]) {
          const fd = foodDetailMap[item.food_id];
          item.name = decodeHtmlEntities(fd.name_fr || '') || item.name;
          item.category = fd.category_id ? categoryMap[fd.category_id] || 'Autre' : 'Autre';
        }
      }
    }

    // Set default category for custom foods
    for (const item of Object.values(foodMap)) {
      if (!item.category) item.category = 'Autre';
    }

    // Sort and group
    const items = Object.values(foodMap).sort((a, b) =>
      (a.category || '').localeCompare(b.category || '') || a.name.localeCompare(b.name)
    );

    const categoriesSet = new Set(items.map(i => i.category || 'Autre'));
    const categories = Array.from(categoriesSet).sort();

    return apiResponse.success({
      items: items.map(i => ({
        food_id: i.food_id,
        name: i.name,
        total_quantity: Math.round(i.total_quantity),
        unit: i.unit,
        category: i.category,
      })),
      categories,
    });
  } catch (error) {
    console.error('Unexpected error in patient shopping-list GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
