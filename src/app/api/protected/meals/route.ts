import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createServerSupabaseClient,
  verifyAuth,
  apiResponse,
} from '@/lib/api-auth';
import { createMealSchema, mealsQuerySchema } from '@/lib/api-schemas';

// ============================================================================
// POST /api/protected/meals - Créer un repas
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parse et valider le body
    const body = await req.json();

    // Adapter consumed_at en meal_date et meal_time
    let validatedData;
    try {
      validatedData = createMealSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Données invalides: ' + error.errors.map(e => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    // 3. Extraire date et heure depuis consumed_at
    const consumedAt = new Date(validatedData.consumed_at);
    const mealDate = consumedAt.toISOString().split('T')[0]; // YYYY-MM-DD
    const mealTime = consumedAt.toTimeString().split(' ')[0]; // HH:MM:SS

    // 4. Créer le client Supabase
    const supabase = await createServerSupabaseClient();

    // 5. Pour chaque aliment, récupérer les infos nutritionnelles
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select(
        'id, name_fr, brand, calories, proteins, carbohydrates, fat, fiber'
      )
      .in(
        'id',
        validatedData.foods.map(f => f.food_id)
      );

    if (foodsError) {
      console.error('Error fetching foods:', foodsError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des aliments'
      );
    }

    if (!foods || foods.length === 0) {
      return apiResponse.error('Aucun aliment trouvé avec ces IDs', 404);
    }

    // 6. Calculer les totaux nutritionnels
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const mealFoodsData = validatedData.foods.map(mealFood => {
      const food = foods.find(f => f.id === mealFood.food_id);

      if (!food) {
        throw new Error(`Aliment ${mealFood.food_id} non trouvé`);
      }

      // Facteur = quantité / 100g (pour g) ou quantité / 100ml (pour ml)
      const factor = mealFood.quantity / 100;

      const calories = Math.round((food.calories || 0) * factor);
      const protein = Math.round((food.proteins || 0) * factor * 100) / 100;
      const carbs = Math.round((food.carbohydrates || 0) * factor * 100) / 100;
      const fat = Math.round((food.fat || 0) * factor * 100) / 100;
      const fiber = Math.round((food.fiber || 0) * factor * 100) / 100;

      totalCalories += calories;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFat += fat;

      return {
        food_id: mealFood.food_id,
        quantity: mealFood.quantity,
        unit: mealFood.unit,
        calories,
        protein_g: protein,
        carbs_g: carbs,
        fat_g: fat,
        fiber_g: fiber,
      };
    });

    // 7. Insérer le repas dans la table meals
    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .insert({
        user_id: auth.user.id,
        name: `${validatedData.type} - ${mealDate}`, // Nom par défaut
        meal_type: validatedData.type,
        meal_date: mealDate,
        meal_time: mealTime,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fat: totalFat,
        notes: validatedData.notes || null,
        location: validatedData.location || null,
        photo_url: validatedData.photo_url || null,
      })
      .select()
      .single();

    if (mealError) {
      console.error('Error creating meal:', mealError);
      return apiResponse.serverError('Erreur lors de la création du repas');
    }

    // 8. Insérer les aliments dans meal_foods
    const mealFoodsToInsert = mealFoodsData.map((mf, index) => ({
      ...mf,
      meal_id: meal.id,
      display_order: index,
    }));

    const { error: mealFoodsError } = await supabase
      .from('meal_foods')
      .insert(mealFoodsToInsert);

    if (mealFoodsError) {
      console.error('Error inserting meal_foods:', mealFoodsError);
      // Rollback: supprimer le repas créé
      await supabase.from('meals').delete().eq('id', meal.id);
      return apiResponse.serverError(
        "Erreur lors de l'ajout des aliments au repas"
      );
    }

    // 9. Récupérer le repas complet avec les aliments
    const { data: completeMeal, error: fetchError } = await supabase
      .from('meals')
      .select(
        `
        *,
        meal_foods (
          id,
          food_id,
          quantity,
          unit,
          calories,
          protein_g,
          carbs_g,
          fat_g,
          fiber_g,
          display_order,
          foods (
            id,
            name_fr,
            brand
          )
        )
      `
      )
      .eq('id', meal.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete meal:', fetchError);
      return apiResponse.serverError(
        'Repas créé mais erreur lors de la récupération'
      );
    }

    // 10. Trigger daily_nutrition_summary sera mis à jour automatiquement via le trigger SQL
    // Pas besoin d'appeler manuellement

    // 11. Formater la réponse
    const response = {
      id: completeMeal.id,
      user_id: completeMeal.user_id,
      type: completeMeal.meal_type,
      consumed_at: `${completeMeal.meal_date}T${completeMeal.meal_time}`,
      total_calories: completeMeal.total_calories,
      total_protein: completeMeal.total_protein,
      total_carbs: completeMeal.total_carbs,
      total_fat: completeMeal.total_fat,
      notes: completeMeal.notes,
      location: completeMeal.location,
      photo_url: completeMeal.photo_url,
      created_at: completeMeal.created_at,
      foods: completeMeal.meal_foods.map((mf: any) => ({
        id: mf.id,
        food_id: mf.food_id,
        food_name: mf.foods?.name_fr || 'Unknown',
        brand: mf.foods?.brand || null,
        quantity: mf.quantity,
        unit: mf.unit,
        calories: mf.calories,
        protein: mf.protein_g,
        carbs: mf.carbs_g,
        fat: mf.fat_g,
      })),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/protected/meals:', error);
    return apiResponse.serverError(
      'Erreur serveur lors de la création du repas'
    );
  }
}

// ============================================================================
// GET /api/protected/meals - Lister les repas
// ============================================================================

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
    const queryParams = {
      date: searchParams.get('date') || undefined,
      type: searchParams.get('type') || undefined,
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
    };

    // Valider les query params
    let validatedQuery;
    try {
      validatedQuery = mealsQuerySchema.parse(queryParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Paramètres invalides: ' +
            error.errors.map(e => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    // 3. Créer le client Supabase
    const supabase = await createServerSupabaseClient();

    // 4. Construire la requête avec filtres
    let query = supabase
      .from('meals')
      .select(
        `
        id,
        meal_type,
        meal_date,
        meal_time,
        total_calories,
        total_protein,
        total_carbs,
        total_fat,
        location,
        photo_url,
        notes,
        created_at,
        meal_foods (count)
      `,
        { count: 'exact' }
      )
      .eq('user_id', auth.user.id)
      .is('deleted_at', null);

    // Filtre par date
    if (validatedQuery.date) {
      query = query.eq('meal_date', validatedQuery.date);
    }

    // Filtre par type
    if (validatedQuery.type) {
      query = query.eq('meal_type', validatedQuery.type);
    }

    // Tri par date et heure décroissants
    query = query.order('meal_date', { ascending: false });
    query = query.order('meal_time', { ascending: false });

    // Pagination
    query = query.range(
      validatedQuery.offset,
      validatedQuery.offset + validatedQuery.limit - 1
    );

    // 5. Exécuter la requête
    const { data: meals, error, count } = await query;

    if (error) {
      console.error('Error fetching meals:', error);
      return apiResponse.serverError(
        'Erreur lors de la récupération des repas'
      );
    }

    // 6. Formater la réponse
    const response = {
      meals: (meals || []).map((meal: any) => ({
        id: meal.id,
        type: meal.meal_type,
        consumed_at: `${meal.meal_date}T${meal.meal_time}`,
        total_calories: meal.total_calories,
        total_protein: meal.total_protein,
        total_carbs: meal.total_carbs,
        total_fat: meal.total_fat,
        food_count: meal.meal_foods?.[0]?.count || 0,
        has_photo: !!meal.photo_url,
        location: meal.location,
      })),
      total: count || 0,
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/meals:', error);
    return apiResponse.serverError(
      'Erreur serveur lors de la récupération des repas'
    );
  }
}
