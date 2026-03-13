/**
 * API Route: /api/protected/dossier/meal-plan
 * Patient-side: returns the active meal plan metadata
 *
 * GET - Plan actif du patient (sans notes privées)
 */

import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

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

    // Fetch the active meal plan for this patient
    const { data: plan, error: planError } = await s
      .from('meal_plans')
      .select('id, name, objective, description, status, start_date, end_date, nutritional_targets, meal_types, created_at, updated_at, nutritionist_id')
      .eq('patient_id', userId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planError) {
      console.error('Error fetching patient meal plan:', planError);
      return apiResponse.serverError('Erreur lors de la récupération du plan');
    }

    if (!plan) {
      return apiResponse.success({ plan: null });
    }

    // Get nutritionist name from profiles
    let nutritionistName: string | null = null;
    if (plan.nutritionist_id) {
      const { data: profile } = await s
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', plan.nutritionist_id)
        .single();

      if (profile) {
        nutritionistName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || null;
      }
    }

    // Get days count
    const { data: days } = await s
      .from('meal_plan_days')
      .select('id')
      .eq('meal_plan_id', plan.id);

    return apiResponse.success({
      plan: {
        id: plan.id,
        name: plan.name,
        objective: plan.objective,
        description: plan.description,
        status: plan.status,
        start_date: plan.start_date,
        end_date: plan.end_date,
        nutritional_targets: plan.nutritional_targets || null,
        meal_types: plan.meal_types || null,
        updated_at: plan.updated_at,
        days_count: days?.length || 0,
        nutritionist_name: nutritionistName,
      },
    });
  } catch (error) {
    console.error('Unexpected error in patient meal-plan GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
