/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]/meals/[mealId]/foods/reorder
 * PLAN-N-003: Batch reorder food items within a meal
 *
 * PUT - Update display_order for multiple foods at once
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { reorderPlanFoodsSchema } from '@/lib/api-schemas';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string; mealId: string }> }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, planId, mealId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Verify nutritionist has access to this patient + plan + meal
    const [{ data: nutProfile }, { data: patient }] = await Promise.all([
      s.from('nutritionist_profiles').select('id').eq('user_id', auth.user.id).single(),
      s.from('patient_profiles').select('user_id, nutritionist_id').eq('id', patientProfileId).single(),
    ]);

    if (!nutProfile || !patient || patient.nutritionist_id !== nutProfile.id) {
      return apiResponse.error('Accès non autorisé à ce patient', 403);
    }

    const [{ data: plan }, { data: meal }] = await Promise.all([
      s.from('meal_plans').select('id').eq('id', planId).eq('patient_id', patient.user_id).eq('nutritionist_id', auth.user.id).is('deleted_at', null).single(),
      s.from('meal_plan_meals').select('id, plan_day_id').eq('id', mealId).single(),
    ]);

    if (!plan || !meal) {
      return apiResponse.error('Plan ou repas introuvable', 404);
    }

    const { data: day } = await s.from('meal_plan_days').select('id').eq('id', meal.plan_day_id).eq('meal_plan_id', planId).single();
    if (!day) {
      return apiResponse.error('Jour introuvable', 404);
    }

    // Parse body
    const body = await request.json();
    const parsed = reorderPlanFoodsSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Batch update display_order
    const updates = parsed.data.items.map(item =>
      s.from('meal_plan_meal_foods')
        .update({ display_order: item.display_order })
        .eq('id', item.id)
        .eq('plan_meal_id', mealId)
    );

    await Promise.all(updates);

    return apiResponse.success({ reordered: true });
  } catch {
    return apiResponse.error('Erreur interne', 500);
  }
}
