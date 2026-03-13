/**
 * API Route: /api/protected/nutritionist/patients/[id]/meal-plans/[planId]/shopping-list
 * PLAN-N-009: Generation de liste de courses
 *
 * GET - Genere la liste de courses a partir des aliments du plan
 * POST - Envoie la liste de courses au patient via la messagerie
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { decodeHtmlEntities } from '@/lib/utils';
import { sendShoppingListSchema } from '@/lib/api-schemas';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveNutritionistId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('nutritionist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyPlanAccess(supabase: any, planId: string, nutritionistUserId: string, patientProfileId: string, nutritionistId: string): Promise<{ userId: string } | null> {
  const { data: patient } = await supabase
    .from('patient_profiles')
    .select('user_id')
    .eq('id', patientProfileId)
    .eq('nutritionist_id', nutritionistId)
    .single();
  if (!patient) return null;

  const { data: plan } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('id', planId)
    .eq('patient_id', patient.user_id)
    .eq('nutritionist_id', nutritionistUserId)
    .is('deleted_at', null)
    .single();
  return plan ? { userId: patient.user_id } : null;
}

type RouteParams = { params: Promise<{ id: string; planId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) return apiResponse.unauthorized();

    const { id: patientProfileId, planId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) return apiResponse.error('Profil nutritionniste introuvable', 404);

    const access = await verifyPlanAccess(s, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!access) return apiResponse.error('Plan introuvable ou acces non autorise', 403);

    // Get all days + meals + foods for this plan
    const { data: days } = await s
      .from('meal_plan_days')
      .select('id')
      .eq('meal_plan_id', planId)
      .order('day_number', { ascending: true });

    if (!days || days.length === 0) {
      return apiResponse.success({ items: [], categories: [] });
    }

    const dayIds = days.map((d: { id: string }) => d.id);

    const { data: meals } = await s
      .from('meal_plan_meals')
      .select('id')
      .in('plan_day_id', dayIds);

    if (!meals || meals.length === 0) {
      return apiResponse.success({ items: [], categories: [] });
    }

    const mealIds = meals.map((m: { id: string }) => m.id);

    const { data: foods } = await s
      .from('meal_plan_meal_foods')
      .select('food_id, custom_name, quantity, unit')
      .in('plan_meal_id', mealIds);

    if (!foods || foods.length === 0) {
      return apiResponse.success({ items: [], categories: [] });
    }

    // Aggregate quantities by food + unit (different units are separate entries)
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

      // Get category names
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

      // Map categories to foods (keys are food_id__unit, so match by food_id)
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

    // Group by category
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
    console.error('Unexpected error in shopping-list GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// POST - Send shopping list to patient via messaging
// ============================================================================

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({ requireAuth: true, requiredRole: 'nutritionist' });
    if (auth.error || !auth.user) return apiResponse.unauthorized();

    const { id: patientProfileId, planId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) return apiResponse.error('Profil nutritionniste introuvable', 404);

    const access = await verifyPlanAccess(s, planId, auth.user.id, patientProfileId, nutritionistId);
    if (!access) return apiResponse.error('Plan introuvable ou acces non autorise', 403);

    const body = await req.json();
    const parsed = sendShoppingListSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Get or create conversation between nutritionist and patient
    const { data: conversationId, error: convError } = await s.rpc(
      'get_or_create_conversation',
      {
        p_patient_id: access.userId,
        p_nutritionist_id: auth.user.id,
      }
    );

    if (convError || !conversationId) {
      console.error('Error getting/creating conversation:', convError);
      return apiResponse.error('Impossible de créer la conversation', 500);
    }

    // Send the formatted shopping list as a message
    const { data: messageId, error: msgError } = await s.rpc('send_message', {
      p_conversation_id: conversationId,
      p_sender_id: auth.user.id,
      p_content: parsed.data.message,
      p_message_type: 'text',
    });

    if (msgError || !messageId) {
      console.error('Error sending shopping list message:', msgError);
      return apiResponse.error("Erreur lors de l'envoi du message", 500);
    }

    return apiResponse.success({ sent: true, message_id: messageId, conversation_id: conversationId });
  } catch (error) {
    console.error('Unexpected error in shopping-list POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
