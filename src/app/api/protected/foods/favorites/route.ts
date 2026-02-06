import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  verifyAuth,
  apiResponse,
} from '@/lib/api-auth';

// ============================================================================
// GET /api/protected/foods/favorites - Liste des aliments favoris
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Créer le client Supabase
    const supabase = await createServerSupabaseClient();

    // 3. Récupérer les favoris avec les détails des aliments
    const { data: favorites, error: favoritesError } = await supabase
      .from('food_favorites')
      .select(
        `
        id,
        usage_count,
        last_used_at,
        food:foods (
          id,
          name_fr,
          brand,
          category:food_categories(name_fr),
          calories,
          proteins,
          carbohydrates,
          fat
        )
      `
      )
      .eq('user_id', auth.user.id)
      .order('last_used_at', { ascending: false });

    if (favoritesError) {
      console.error('Error fetching favorites:', favoritesError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des favoris'
      );
    }

    // 4. Formater la réponse
    const response = {
      favorites: (favorites || []).map((fav: any) => ({
        id: fav.food.id,
        name: fav.food.name_fr,
        brand: fav.food.brand,
        category: fav.food.category?.name_fr || null,
        calories_per_100g: fav.food.calories,
        protein_per_100g: fav.food.proteins,
        carbs_per_100g: fav.food.carbohydrates,
        fat_per_100g: fav.food.fat,
        last_used_at: fav.last_used_at,
        usage_count: fav.usage_count,
      })),
      total: favorites?.length || 0,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/foods/favorites:',
      error
    );
    return apiResponse.serverError(
      'Erreur serveur lors de la récupération des favoris'
    );
  }
}
