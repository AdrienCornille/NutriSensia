import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  verifyAuth,
  apiResponse,
} from '@/lib/api-auth';

// ============================================================================
// GET /api/protected/foods/search - Rechercher des aliments
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser les query params
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const limitParam = searchParams.get('limit');

    // Validation
    if (!query || query.trim().length < 2) {
      return apiResponse.error(
        'Le terme de recherche doit contenir au moins 2 caractères',
        400
      );
    }

    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : 20;

    // 3. Créer le client Supabase
    const supabase = await createServerSupabaseClient();

    // 4. Utiliser la fonction SQL search_foods (optimisée avec similarité trigram)
    const { data: foods, error: searchError } = await supabase.rpc(
      'search_foods',
      {
        search_query: query.trim(),
        user_id_param: auth.user.id,
        limit_count: limit,
      }
    );

    if (searchError) {
      console.error('Error searching foods:', searchError);
      return apiResponse.serverError("Erreur lors de la recherche d'aliments");
    }

    // 5. Filtrer par catégorie si fournie
    let filteredFoods = foods || [];
    if (category) {
      // Note: La fonction search_foods retourne category_name mais pas category_id
      // Pour filtrer par catégorie, on pourrait améliorer la fonction SQL
      // Pour l'instant, on filtre après coup (non optimal)
      filteredFoods = filteredFoods.filter(
        (f: any) => f.category_name?.toLowerCase() === category.toLowerCase()
      );
    }

    // 6. Formater la réponse
    const response = {
      foods: filteredFoods.map((food: any) => ({
        id: food.id,
        name: food.name_fr,
        brand: food.brand,
        category: food.category_name,
        calories_per_100g: food.calories,
        protein_per_100g: food.proteins,
        carbs_per_100g: food.carbohydrates,
        fat_per_100g: food.fat,
        is_favorite: food.is_favorite,
      })),
      total: filteredFoods.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/foods/search:',
      error
    );
    return apiResponse.serverError('Erreur serveur lors de la recherche');
  }
}
