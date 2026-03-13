/**
 * API Route: /api/protected/nutritionist/meal-plan-templates
 * PLAN-N-005: Bibliothèque de templates de plans alimentaires
 *
 * GET - Liste tous les templates du nutritionniste (tous patients confondus)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

export async function GET(_req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) return apiResponse.unauthorized();

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const { data: templates, error } = await s
      .from('meal_plans')
      .select(`
        id, name, objective, description, status,
        start_date, end_date, is_template, notes,
        nutritional_targets, created_at, updated_at,
        patient_id
      `)
      .eq('nutritionist_id', auth.user.id)
      .eq('is_template', true)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return apiResponse.serverError('Erreur lors de la récupération des templates');
    }

    // Get days/meals counts for each template
    const result = await Promise.all(
      (templates || []).map(async (tpl: Record<string, unknown>) => {
        const { data: days } = await s
          .from('meal_plan_days')
          .select('id')
          .eq('meal_plan_id', tpl.id);

        const dayIds = (days || []).map((d: { id: string }) => d.id);
        let mealsCount = 0;
        if (dayIds.length > 0) {
          const { count } = await s
            .from('meal_plan_meals')
            .select('id', { count: 'exact', head: true })
            .in('plan_day_id', dayIds);
          mealsCount = count || 0;
        }

        return {
          id: tpl.id,
          name: tpl.name,
          objective: tpl.objective,
          description: tpl.description,
          status: tpl.status,
          nutritional_targets: tpl.nutritional_targets || null,
          created_at: tpl.created_at,
          updated_at: tpl.updated_at,
          days_count: dayIds.length,
          meals_count: mealsCount,
        };
      })
    );

    return apiResponse.success(result);
  } catch (error) {
    console.error('Unexpected error in templates GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
