import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  verifyAuth,
  apiResponse,
} from '@/lib/api-auth';

// ============================================================================
// GET /api/protected/meals/check - Vérifier l'état des repas du jour
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

    // 4. Récupérer tous les repas du jour (seulement les types)
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('meal_type')
      .eq('user_id', auth.user.id)
      .eq('meal_date', date)
      .is('deleted_at', null);

    if (mealsError) {
      console.error('Error fetching meals for check:', mealsError);
      return apiResponse.serverError(
        'Erreur lors de la vérification des repas'
      );
    }

    // 5. Créer un Set des types de repas présents
    const mealTypesLogged = new Set(meals?.map(m => m.meal_type) || []);

    // 6. Construire la réponse
    const response = {
      date,
      breakfast: mealTypesLogged.has('breakfast'),
      lunch: mealTypesLogged.has('lunch'),
      dinner: mealTypesLogged.has('dinner'),
      snack: mealTypesLogged.has('snack'),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/meals/check:', error);
    return apiResponse.serverError(
      'Erreur serveur lors de la vérification des repas'
    );
  }
}
