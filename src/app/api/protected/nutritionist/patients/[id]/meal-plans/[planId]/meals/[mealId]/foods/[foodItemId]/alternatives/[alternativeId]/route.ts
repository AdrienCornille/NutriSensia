/**
 * API Route: .../alternatives/[alternativeId]
 * PLAN-N-004: Supprimer une alternative
 *
 * DELETE - Supprimer une alternative
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

type RouteParams = { params: Promise<{ id: string; planId: string; mealId: string; foodItemId: string; alternativeId: string }> };

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) return apiResponse.unauthorized();

    const { planId, foodItemId, alternativeId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify alternative exists and belongs to this food
    const { data: alt } = await s
      .from('meal_plan_alternatives')
      .select('id, plan_food_id')
      .eq('id', alternativeId)
      .eq('plan_food_id', foodItemId)
      .single();

    if (!alt) return apiResponse.error('Alternative introuvable', 404);

    // Verify food belongs to plan (via meal → day → plan)
    const { data: food } = await s.from('meal_plan_meal_foods').select('plan_meal_id').eq('id', foodItemId).single();
    if (!food) return apiResponse.error('Aliment introuvable', 404);

    const { data: meal } = await s.from('meal_plan_meals').select('plan_day_id').eq('id', food.plan_meal_id).single();
    if (!meal) return apiResponse.error('Repas introuvable', 404);

    const { data: day } = await s.from('meal_plan_days').select('id').eq('id', meal.plan_day_id).eq('meal_plan_id', planId).single();
    if (!day) return apiResponse.error('Plan introuvable', 404);

    const { error: deleteError } = await s
      .from('meal_plan_alternatives')
      .delete()
      .eq('id', alternativeId);

    if (deleteError) {
      console.error('Error deleting alternative:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error in alternative DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
