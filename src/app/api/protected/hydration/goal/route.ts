/**
 * API Routes pour les objectifs d'hydratation
 * Endpoints: GET (récupérer objectif actuel), PATCH (mettre à jour objectif)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { updateHydrationGoalSchema } from '@/lib/api-schemas';
import { apiResponse } from '@/lib/api-auth';

// ============================================================================
// GET - Récupérer l'objectif d'hydratation actuel
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Authentifier
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Créer client Supabase
    const supabase = await createClient();

    // 3. Récupérer l'objectif valide pour aujourd'hui
    const today = new Date().toISOString().split('T')[0];

    const { data: goal, error: fetchError } = await supabase
      .from('hydration_goals')
      .select('*')
      .eq('user_id', auth.user.id)
      .lte('valid_from', today)
      .or(`valid_until.is.null,valid_until.gte.${today}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (normal si aucun objectif)
      console.error('Error fetching hydration goal:', fetchError);
      return apiResponse.serverError(
        "Erreur lors de la récupération de l'objectif"
      );
    }

    // 4. Si aucun objectif, retourner l'objectif par défaut
    if (!goal) {
      return NextResponse.json(
        {
          id: null,
          user_id: auth.user.id,
          daily_goal_ml: 2000, // Default 2L
          valid_from: today,
          valid_until: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_default: true,
        },
        { status: 200 }
      );
    }

    // 5. Retourner l'objectif trouvé
    return NextResponse.json(
      {
        ...goal,
        is_default: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/hydration/goal:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// PATCH - Mettre à jour l'objectif d'hydratation
// ============================================================================

export async function PATCH(req: NextRequest) {
  try {
    // 1. Authentifier
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser et valider le body
    const body = await req.json();
    let validatedData;

    try {
      validatedData = updateHydrationGoalSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Données invalides: ' + error.errors.map(e => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 4. Transaction: Fermer l'ancien objectif et créer le nouveau
    // Note: Supabase ne supporte pas les vraies transactions SQL,
    // on fait les opérations séquentiellement

    // a. Fermer tous les objectifs actifs (set valid_until = yesterday)
    const { error: closeError } = await supabase
      .from('hydration_goals')
      .update({ valid_until: yesterdayStr })
      .eq('user_id', auth.user.id)
      .or(`valid_until.is.null,valid_until.gte.${today}`);

    if (closeError) {
      console.error('Error closing previous hydration goals:', closeError);
      return apiResponse.serverError(
        "Erreur lors de la fermeture de l'ancien objectif"
      );
    }

    // b. Créer le nouvel objectif
    const { data: newGoal, error: createError } = await supabase
      .from('hydration_goals')
      .insert({
        user_id: auth.user.id,
        daily_goal_ml: validatedData.daily_goal_ml,
        valid_from: today,
        valid_until: null, // Ouvert (valide indéfiniment)
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating new hydration goal:', createError);
      return apiResponse.serverError(
        'Erreur lors de la création du nouvel objectif'
      );
    }

    // 5. Retourner le nouvel objectif
    return NextResponse.json(newGoal, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/hydration/goal:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
