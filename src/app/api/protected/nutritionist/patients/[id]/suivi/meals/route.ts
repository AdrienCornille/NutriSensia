import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId } = await params;
    if (!patientProfileId) {
      return apiResponse.error('ID patient requis', 400);
    }

    const supabase = await createClient();

    // Get nutritionist profile
    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify patient belongs to nutritionist
    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch meals with nested meal_foods -> foods and meal_feedback
    let mealsQuery = (supabase as any)
      .from('meals')
      .select(
        '*, meal_foods(*, foods(name_fr, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)), meal_feedback(*)',
        { count: 'exact' }
      )
      .eq('patient_id', patient.user_id)
      .order('consumed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (date) {
      // Filter by specific date: consumed_at::date = date
      mealsQuery = mealsQuery.gte('consumed_at', `${date}T00:00:00`)
        .lt('consumed_at', `${date}T23:59:59.999`);
    } else {
      if (startDate) {
        mealsQuery = mealsQuery.gte('consumed_at', `${startDate}T00:00:00`);
      }
      if (endDate) {
        mealsQuery = mealsQuery.lte('consumed_at', `${endDate}T23:59:59.999`);
      }
    }

    const { data: rawMeals, count, error: mealsError } = await mealsQuery;

    if (mealsError) {
      console.error('Error fetching meals:', mealsError);
      return apiResponse.serverError('Erreur lors de la recuperation des repas');
    }

    // Transform meals into the expected format
    const meals = (rawMeals || []).map((meal: any) => {
      const foods = (meal.meal_foods || []).map((mf: any) => {
        const food = mf.foods;
        const qty = mf.quantity || 0;
        const gramEquivalent = mf.gram_equivalent || 1;
        const gramQty = qty * gramEquivalent;

        return {
          id: mf.id,
          food_name: food?.name_fr || mf.custom_name || 'Aliment inconnu',
          quantity: qty,
          unit: mf.unit || 'g',
          calories: food ? Math.round((food.calories_per_100g * gramQty) / 100) : 0,
          protein_g: food ? Math.round(((food.protein_per_100g * gramQty) / 100) * 10) / 10 : 0,
          carbs_g: food ? Math.round(((food.carbs_per_100g * gramQty) / 100) * 10) / 10 : 0,
          fat_g: food ? Math.round(((food.fat_per_100g * gramQty) / 100) * 10) / 10 : 0,
        };
      });

      const feedback = (meal.meal_feedback || []).map((fb: any) => ({
        id: fb.id,
        comment: fb.comment,
        feedback_type: fb.feedback_type || 'general',
        created_at: fb.created_at,
      }));

      // Calculate totals from foods
      const totalCalories = foods.reduce((sum: number, f: any) => sum + f.calories, 0);
      const totalProtein = foods.reduce((sum: number, f: any) => sum + f.protein_g, 0);
      const totalCarbs = foods.reduce((sum: number, f: any) => sum + f.carbs_g, 0);
      const totalFat = foods.reduce((sum: number, f: any) => sum + f.fat_g, 0);

      return {
        id: meal.id,
        meal_type: meal.type,
        consumed_at: meal.consumed_at,
        total_calories: totalCalories,
        total_protein: Math.round(totalProtein * 10) / 10,
        total_carbs: Math.round(totalCarbs * 10) / 10,
        total_fat: Math.round(totalFat * 10) / 10,
        notes: meal.notes || null,
        photo_url: meal.photo_url || null,
        location: meal.location || null,
        foods,
        feedback,
      };
    });

    // Compute daily summary if a specific date was requested
    let dailySummary = null;
    if (date && meals.length > 0) {
      dailySummary = {
        date,
        total_calories: meals.reduce((sum: number, m: any) => sum + m.total_calories, 0),
        total_protein: Math.round(meals.reduce((sum: number, m: any) => sum + m.total_protein, 0) * 10) / 10,
        total_carbs: Math.round(meals.reduce((sum: number, m: any) => sum + m.total_carbs, 0) * 10) / 10,
        total_fat: Math.round(meals.reduce((sum: number, m: any) => sum + m.total_fat, 0) * 10) / 10,
        meal_count: meals.length,
      };
    }

    return apiResponse.success({
      meals,
      daily_summary: dailySummary,
      total: count || 0,
    });
  } catch (error) {
    console.error('Unexpected error in meals GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
