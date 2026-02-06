import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  verifyAuth,
  apiResponse,
} from '@/lib/api-auth';

// ============================================================================
// GET /api/protected/meals/daily-summary - Résumé nutritionnel quotidien
// ============================================================================

interface MealsSummary {
  breakfast: { calories: number; logged: boolean };
  lunch: { calories: number; logged: boolean };
  dinner: { calories: number; logged: boolean };
  snack: { calories: number; logged: boolean };
}

export async function GET(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser les query params
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    // Date par défaut = aujourd'hui
    const date = dateParam || new Date().toISOString().split('T')[0];

    // Valider le format de date YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return apiResponse.error(
        'Format de date invalide. Utilisez YYYY-MM-DD',
        400
      );
    }

    // 3. Créer le client Supabase
    const supabase = await createServerSupabaseClient();

    // 4. Récupérer tous les repas du jour
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select(
        'id, meal_type, total_calories, total_protein, total_carbs, total_fat'
      )
      .eq('user_id', auth.user.id)
      .eq('meal_date', date)
      .is('deleted_at', null);

    if (mealsError) {
      console.error('Error fetching meals for summary:', mealsError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des repas'
      );
    }

    // 5. Calculer les totaux
    const totalCalories =
      meals?.reduce((sum, m) => sum + (m.total_calories || 0), 0) || 0;
    const totalProtein =
      meals?.reduce((sum, m) => sum + (m.total_protein || 0), 0) || 0;
    const totalCarbs =
      meals?.reduce((sum, m) => sum + (m.total_carbs || 0), 0) || 0;
    const totalFat =
      meals?.reduce((sum, m) => sum + (m.total_fat || 0), 0) || 0;

    // 6. Objectifs nutritionnels (hardcodés pour l'instant)
    // TODO: Récupérer depuis meal_plans ou user_settings
    const calorieGoal = 2100;
    const proteinGoal = 140;
    const carbsGoal = 230;
    const fatGoal = 70;

    // 7. Calculer le reste
    const calorieRemaining = calorieGoal - totalCalories;

    // 8. Grouper les repas par type
    const mealsByType: MealsSummary = {
      breakfast: { calories: 0, logged: false },
      lunch: { calories: 0, logged: false },
      dinner: { calories: 0, logged: false },
      snack: { calories: 0, logged: false },
    };

    meals?.forEach(meal => {
      const type = meal.meal_type as keyof MealsSummary;
      if (type in mealsByType) {
        mealsByType[type] = {
          calories: meal.total_calories || 0,
          logged: true,
        };
      }
    });

    // 9. Calculer l'adhérence (basé sur les calories)
    const adherencePercent =
      calorieGoal > 0 ? Math.round((totalCalories / calorieGoal) * 100) : 0;

    // 10. Compter le nombre de repas
    const mealCount = meals?.length || 0;

    // 11. Dernière mise à jour
    const lastUpdated = new Date().toISOString();

    // 12. Construire la réponse
    const response = {
      date,
      total_calories: totalCalories,
      calorie_goal: calorieGoal,
      calorie_remaining: calorieRemaining,
      total_protein: Math.round(totalProtein * 10) / 10,
      protein_goal: proteinGoal,
      total_carbs: Math.round(totalCarbs * 10) / 10,
      carbs_goal: carbsGoal,
      total_fat: Math.round(totalFat * 10) / 10,
      fat_goal: fatGoal,
      meals: mealsByType,
      meal_count: mealCount,
      adherence_percent: adherencePercent,
      last_updated: lastUpdated,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/meals/daily-summary:',
      error
    );
    return apiResponse.serverError(
      'Erreur serveur lors de la récupération du résumé'
    );
  }
}
