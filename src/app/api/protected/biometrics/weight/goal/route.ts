/**
 * API Routes pour l'objectif de poids
 * Endpoints: GET (récupérer objectif), PATCH (mettre à jour objectif)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { apiResponse } from '@/lib/api-auth';
import { updateWeightGoalSchema } from '@/lib/api-schemas';

// ============================================================================
// GET - Récupérer l'objectif de poids actuel
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

    // 3. Récupérer l'objectif le plus récent (non atteint)
    const { data: goal, error: fetchError } = await supabase
      .from('weight_goals')
      .select('*')
      .eq('user_id', auth.user.id)
      .eq('is_achieved', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (pas d'objectif)
      console.error('Error fetching weight goal:', fetchError);
      return apiResponse.serverError(
        "Erreur lors de la récupération de l'objectif"
      );
    }

    // 4. Si aucun objectif, retourner null
    if (!goal) {
      return NextResponse.json(null, { status: 200 });
    }

    // 5. Retourner l'objectif
    return NextResponse.json(goal, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/biometrics/weight/goal:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// PATCH - Mettre à jour l'objectif de poids
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
      validatedData = updateWeightGoalSchema.parse(body);
    } catch (error: any) {
      return apiResponse.error(
        `Données invalides: ${error.errors?.map((e: any) => e.message).join(', ')}`,
        400
      );
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Récupérer le poids actuel de l'utilisateur
    const { data: currentWeightEntry } = await supabase
      .from('weight_entries')
      .select('weight_kg')
      .eq('user_id', auth.user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    const initialWeight =
      currentWeightEntry?.weight_kg || validatedData.goal_weight_kg;

    // 5. Marquer l'ancien objectif comme atteint (s'il existe)
    await supabase
      .from('weight_goals')
      .update({
        is_achieved: true,
        achieved_at: new Date().toISOString(),
      })
      .eq('user_id', auth.user.id)
      .eq('is_achieved', false);

    // 6. Créer le nouvel objectif
    const { data: newGoal, error: insertError } = await supabase
      .from('weight_goals')
      .insert({
        user_id: auth.user.id,
        initial_weight_kg: initialWeight,
        target_weight_kg: validatedData.goal_weight_kg,
        target_date: validatedData.target_date,
        is_achieved: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating weight goal:', insertError);
      return apiResponse.serverError(
        "Erreur lors de la création de l'objectif"
      );
    }

    // 7. Retourner le nouvel objectif
    return NextResponse.json(newGoal, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/biometrics/weight/goal:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
