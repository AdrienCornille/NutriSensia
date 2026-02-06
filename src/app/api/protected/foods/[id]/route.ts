import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  verifyAuth,
  apiResponse,
} from '@/lib/api-auth';

// ============================================================================
// GET /api/protected/foods/[id] - Détail d'un aliment
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Vérifier l'authentification
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Valider l'ID
    const foodId = params.id;
    if (!foodId) {
      return apiResponse.error("ID de l'aliment manquant", 400);
    }

    // 3. Créer le client Supabase
    const supabase = await createServerSupabaseClient();

    // 4. Récupérer l'aliment avec ses portions et vérifier si favori
    const { data: food, error: foodError } = await supabase
      .from('foods')
      .select(
        `
        id,
        name_fr,
        name_en,
        brand,
        barcode,
        description,
        category:food_categories(name_fr),
        calories,
        proteins,
        carbohydrates,
        sugars,
        fiber,
        fat,
        saturated_fat,
        sodium,
        image_url,
        tags,
        allergens
      `
      )
      .eq('id', foodId)
      .eq('is_active', true)
      .single();

    if (foodError || !food) {
      console.error('Error fetching food:', foodError);
      return apiResponse.error('Aliment non trouvé', 404);
    }

    // 5. Récupérer les portions standards
    const { data: portions } = await supabase
      .from('food_portions')
      .select('name_fr, grams, is_default')
      .eq('food_id', foodId)
      .order('sort_order', { ascending: true });

    // 6. Vérifier si l'aliment est dans les favoris
    const { data: favorite } = await supabase
      .from('food_favorites')
      .select('id, last_used_at')
      .eq('user_id', auth.user.id)
      .eq('food_id', foodId)
      .single();

    // 7. Formater la réponse
    const response = {
      id: food.id,
      name: food.name_fr,
      name_en: food.name_en,
      brand: food.brand,
      barcode: food.barcode,
      description: food.description,
      category: food.category?.name_fr || null,

      // Valeurs nutritionnelles (pour 100g)
      calories_per_100g: food.calories,
      protein_per_100g: food.proteins,
      carbs_per_100g: food.carbohydrates,
      fat_per_100g: food.fat,
      fiber_per_100g: food.fiber,
      sugar_per_100g: food.sugars,
      saturated_fat_per_100g: food.saturated_fat,
      sodium_per_100mg: food.sodium,

      // Métadonnées
      image_url: food.image_url,
      tags: food.tags || [],
      allergens: food.allergens || [],

      // Portions standards
      common_portions:
        portions?.map(p => ({
          name: p.name_fr,
          grams: p.grams,
          is_default: p.is_default,
        })) || [],

      // Favori
      is_favorite: !!favorite,
      last_used_at: favorite?.last_used_at || null,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/foods/[id]:', error);
    return apiResponse.serverError(
      "Erreur serveur lors de la récupération de l'aliment"
    );
  }
}
