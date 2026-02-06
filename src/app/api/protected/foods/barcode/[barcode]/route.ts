import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  verifyAuth,
  apiResponse,
} from '@/lib/api-auth';

// ============================================================================
// GET /api/protected/foods/barcode/[barcode] - Rechercher par code-barres
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: { barcode: string } }
) {
  try {
    // 1. Vérifier l'authentification
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Valider le code-barres
    const barcode = params.barcode;
    if (!barcode || barcode.trim().length === 0) {
      return apiResponse.error('Code-barres manquant', 400);
    }

    // Validation basique du format EAN-13 (13 chiffres) ou EAN-8 (8 chiffres)
    const barcodePattern = /^\d{8}$|^\d{13}$/;
    if (!barcodePattern.test(barcode)) {
      return apiResponse.error(
        'Format de code-barres invalide (attendu: EAN-8 ou EAN-13)',
        400
      );
    }

    // 3. Créer le client Supabase
    const supabase = await createServerSupabaseClient();

    // 4. Rechercher l'aliment par code-barres
    const { data: food, error: searchError } = await supabase
      .from('foods')
      .select(
        `
        id,
        name_fr,
        brand,
        barcode,
        calories,
        proteins,
        carbohydrates,
        fat,
        fiber,
        image_url
      `
      )
      .eq('barcode', barcode)
      .eq('is_active', true)
      .single();

    // 5. Si non trouvé, retourner found: false
    if (searchError || !food) {
      return NextResponse.json(
        {
          found: false,
          barcode,
          message: 'Aucun aliment trouvé avec ce code-barres',
        },
        { status: 200 }
      );
    }

    // 6. Si trouvé, retourner les détails
    const response = {
      found: true,
      food: {
        id: food.id,
        name: food.name_fr,
        brand: food.brand,
        barcode: food.barcode,
        calories_per_100g: food.calories,
        protein_per_100g: food.proteins,
        carbs_per_100g: food.carbohydrates,
        fat_per_100g: food.fat,
        fiber_per_100g: food.fiber,
        image_url: food.image_url,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/foods/barcode/[barcode]:',
      error
    );
    return apiResponse.serverError(
      'Erreur serveur lors de la recherche par code-barres'
    );
  }
}
