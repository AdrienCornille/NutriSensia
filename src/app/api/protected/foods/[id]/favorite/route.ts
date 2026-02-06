import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  verifyAuth,
  apiResponse,
} from '@/lib/api-auth';

// ============================================================================
// POST /api/protected/foods/[id]/favorite - Ajouter aux favoris
// ============================================================================

export async function POST(
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

    // 4. Vérifier que l'aliment existe
    const { data: food, error: foodError } = await supabase
      .from('foods')
      .select('id')
      .eq('id', foodId)
      .eq('is_active', true)
      .single();

    if (foodError || !food) {
      return apiResponse.error('Aliment non trouvé', 404);
    }

    // 5. Ajouter aux favoris (INSERT ON CONFLICT DO UPDATE)
    const { error: insertError } = await supabase
      .from('food_favorites')
      .insert({
        user_id: auth.user.id,
        food_id: foodId,
        usage_count: 0,
        last_used_at: null,
      })
      .select()
      .single();

    // Si conflit (déjà favori), on ignore l'erreur
    if (insertError && insertError.code !== '23505') {
      console.error('Error adding favorite:', insertError);
      return apiResponse.serverError("Erreur lors de l'ajout aux favoris");
    }

    // 6. Réponse
    return NextResponse.json(
      {
        is_favorite: true,
        message: 'Ajouté aux favoris',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/protected/foods/[id]/favorite:',
      error
    );
    return apiResponse.serverError(
      "Erreur serveur lors de l'ajout aux favoris"
    );
  }
}

// ============================================================================
// DELETE /api/protected/foods/[id]/favorite - Retirer des favoris
// ============================================================================

export async function DELETE(
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

    // 4. Supprimer des favoris
    const { error: deleteError } = await supabase
      .from('food_favorites')
      .delete()
      .eq('user_id', auth.user.id)
      .eq('food_id', foodId);

    if (deleteError) {
      console.error('Error removing favorite:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression du favori');
    }

    // 5. Réponse
    return NextResponse.json(
      {
        is_favorite: false,
        message: 'Retiré des favoris',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/protected/foods/[id]/favorite:',
      error
    );
    return apiResponse.serverError(
      'Erreur serveur lors de la suppression du favori'
    );
  }
}
