import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAuth,
  createServerSupabaseClient,
  apiResponse,
} from '@/lib/api-auth';
import { updateMealSchema } from '@/lib/api-schemas';
import { z } from 'zod';

// ============================================================================
// GET /api/protected/meals/[id] - Récupérer un repas
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createServerSupabaseClient();
    const { id: mealId } = await params;

    // Récupérer le repas
    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .select(
        `
        id,
        user_id,
        name,
        meal_type,
        meal_date,
        meal_time,
        total_calories,
        total_protein,
        total_carbs,
        total_fat,
        notes,
        location,
        photo_url,
        created_at,
        updated_at
      `
      )
      .eq('id', mealId)
      .is('deleted_at', null)
      .single();

    if (mealError || !meal) {
      console.error('[GET /meals/[id]] Meal not found:', mealError);
      return apiResponse.error('Repas introuvable', 404);
    }

    // Vérifier que l'utilisateur a accès à ce repas
    if (meal.user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé', 403);
    }

    // Récupérer les aliments du repas avec leurs détails
    const { data: mealFoods, error: foodsError } = await supabase
      .from('meal_foods')
      .select(
        `
        id,
        quantity,
        unit,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        food:foods (
          id,
          name_fr,
          brand,
          calories,
          proteins,
          carbohydrates,
          fat,
          fiber
        )
      `
      )
      .eq('meal_id', mealId);

    if (foodsError) {
      console.error('[GET /meals/[id]] Error fetching foods:', foodsError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des aliments'
      );
    }

    // Formater consumed_at depuis meal_date + meal_time
    const consumed_at = meal.meal_time
      ? `${meal.meal_date}T${meal.meal_time}`
      : `${meal.meal_date}T12:00:00`;

    // Formater la réponse
    const response = {
      id: meal.id,
      user_id: meal.user_id,
      type: meal.meal_type,
      consumed_at,
      total_calories: meal.total_calories,
      total_protein: meal.total_protein,
      total_carbs: meal.total_carbs,
      total_fat: meal.total_fat,
      notes: meal.notes,
      location: meal.location,
      photo_url: meal.photo_url,
      created_at: meal.created_at,
      foods:
        mealFoods?.map((mf: any) => ({
          id: mf.id,
          food_id: mf.food.id,
          food_name: mf.food.name_fr,
          brand: mf.food.brand,
          quantity: mf.quantity,
          unit: mf.unit,
          calories: mf.calories,
          protein: mf.protein_g,
          carbs: mf.carbs_g,
          fat: mf.fat_g,
        })) || [],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[GET /meals/[id]] Error:', error);
    return apiResponse.serverError();
  }
}

// ============================================================================
// PATCH /api/protected/meals/[id] - Modifier un repas
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createServerSupabaseClient();
    const { id: mealId } = await params;

    // Parser le body
    const body = await request.json();

    // Valider avec le schéma
    let validatedData;
    try {
      validatedData = updateMealSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Données invalides: ' + error.errors.map(e => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    // Vérifier que le repas existe et appartient à l'utilisateur
    const { data: existingMeal, error: checkError } = await supabase
      .from('meals')
      .select('id, user_id, meal_date')
      .eq('id', mealId)
      .is('deleted_at', null)
      .single();

    if (checkError || !existingMeal) {
      return apiResponse.error('Repas introuvable', 404);
    }

    // Vérifier les permissions
    if (existingMeal.user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé', 403);
    }

    // Construire l'objet de mise à jour
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Extraire date et heure depuis consumed_at si fourni
    if (validatedData.consumed_at) {
      const consumedAt = new Date(validatedData.consumed_at);
      updateData.meal_date = consumedAt.toISOString().split('T')[0]; // YYYY-MM-DD
      updateData.meal_time = consumedAt.toTimeString().split(' ')[0]; // HH:MM:SS
    }

    if (validatedData.type) {
      updateData.meal_type = validatedData.type;
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    if (validatedData.location !== undefined) {
      updateData.location = validatedData.location;
    }

    if (validatedData.photo_url !== undefined) {
      updateData.photo_url = validatedData.photo_url;
    }

    // Si les aliments sont modifiés, recalculer les totaux
    if (validatedData.foods) {
      // Récupérer les infos nutritionnelles des aliments
      const { data: foods, error: foodsError } = await supabase
        .from('foods')
        .select(
          'id, name_fr, brand, calories, proteins, carbohydrates, fat, fiber'
        )
        .in(
          'id',
          validatedData.foods.map(f => f.food_id)
        );

      if (foodsError || !foods || foods.length === 0) {
        return apiResponse.error('Aliments introuvables', 404);
      }

      // Supprimer tous les meal_foods existants
      await supabase.from('meal_foods').delete().eq('meal_id', mealId);

      // Calculer les totaux et insérer les nouveaux meal_foods
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      const mealFoodsData = validatedData.foods.map(mealFood => {
        const food = foods.find(f => f.id === mealFood.food_id);
        if (!food) {
          throw new Error(`Aliment ${mealFood.food_id} non trouvé`);
        }

        // Facteur = quantité / 100g
        const factor = mealFood.quantity / 100;
        const calories = Math.round((food.calories || 0) * factor);
        const protein = Math.round((food.proteins || 0) * factor * 100) / 100;
        const carbs =
          Math.round((food.carbohydrates || 0) * factor * 100) / 100;
        const fat = Math.round((food.fat || 0) * factor * 100) / 100;

        totalCalories += calories;
        totalProtein += protein;
        totalCarbs += carbs;
        totalFat += fat;

        return {
          meal_id: mealId,
          food_id: mealFood.food_id,
          quantity: mealFood.quantity,
          unit: mealFood.unit,
          calories,
          protein_g: protein,
          carbs_g: carbs,
          fat_g: fat,
        };
      });

      // Insérer les nouveaux meal_foods
      const { error: insertError } = await supabase
        .from('meal_foods')
        .insert(mealFoodsData);

      if (insertError) {
        console.error(
          '[PATCH /meals/[id]] Error inserting meal_foods:',
          insertError
        );
        return apiResponse.serverError("Erreur lors de l'ajout des aliments");
      }

      // Mettre à jour les totaux
      updateData.total_calories = totalCalories;
      updateData.total_protein = totalProtein;
      updateData.total_carbs = totalCarbs;
      updateData.total_fat = totalFat;
    }

    // Mettre à jour le repas
    const { data: updatedMeal, error: updateError } = await supabase
      .from('meals')
      .update(updateData)
      .eq('id', mealId)
      .select()
      .single();

    if (updateError) {
      console.error('[PATCH /meals/[id]] Error updating meal:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour du repas');
    }

    // Le trigger mettra à jour daily_nutrition_summary automatiquement

    return NextResponse.json(updatedMeal, { status: 200 });
  } catch (error) {
    console.error('[PATCH /meals/[id]] Error:', error);
    return apiResponse.serverError();
  }
}

// ============================================================================
// DELETE /api/protected/meals/[id] - Supprimer un repas (soft delete)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createServerSupabaseClient();
    const { id: mealId } = await params;

    // Vérifier que le repas existe et appartient à l'utilisateur
    const { data: existingMeal, error: checkError } = await supabase
      .from('meals')
      .select('id, user_id')
      .eq('id', mealId)
      .is('deleted_at', null)
      .single();

    if (checkError || !existingMeal) {
      return apiResponse.error('Repas introuvable', 404);
    }

    // Vérifier les permissions
    if (existingMeal.user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé', 403);
    }

    // Soft delete du repas
    const { error: deleteError } = await supabase
      .from('meals')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', mealId);

    if (deleteError) {
      console.error('[DELETE /meals/[id]] Error deleting meal:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression du repas');
    }

    // Le trigger mettra à jour daily_nutrition_summary automatiquement

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DELETE /meals/[id]] Error:', error);
    return apiResponse.serverError();
  }
}
