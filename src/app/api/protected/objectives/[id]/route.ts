/**
 * API Route pour un objectif hebdomadaire spécifique
 * PATCH - Mettre à jour un objectif individuel dans la semaine
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { updateObjectiveSchema } from '@/lib/api-schemas';

// ============================================================================
// PATCH - Mettre à jour un objectif
// ============================================================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id } = await params;

    const body = await req.json();
    let validatedData;
    try {
      validatedData = updateObjectiveSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Données invalides: ' + error.errors.map(e => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    const supabase = await createClient();

    // Récupérer l'entrée weekly_objectives
    const { data: weeklyObj, error: fetchError } = await supabase
      .from('weekly_objectives')
      .select('*')
      .eq('id', id)
      .eq('patient_id', auth.user.id)
      .single();

    if (fetchError || !weeklyObj) {
      return apiResponse.notFound('Objectifs hebdomadaires non trouvés');
    }

    // Trouver l'objectif dans le JSONB
    const objectives = weeklyObj.objectives || [];
    const objIndex = objectives.findIndex(
      (o: any) => o.id === validatedData.objective_id
    );

    if (objIndex === -1) {
      return apiResponse.notFound('Objectif non trouvé');
    }

    // Mettre à jour l'objectif
    const obj = objectives[objIndex];
    if (validatedData.current !== undefined) {
      obj.current = validatedData.current;
      obj.progress = obj.target > 0
        ? Math.min(Math.round((obj.current / obj.target) * 100), 100)
        : 0;
    }
    if (validatedData.isCompleted !== undefined) {
      obj.isCompleted = validatedData.isCompleted;
    }
    if (validatedData.completedAt !== undefined) {
      obj.completedAt = validatedData.completedAt;
    }

    // Si progress >= 100, marquer comme complété
    if (obj.progress >= 100 && !obj.isCompleted) {
      obj.isCompleted = true;
      obj.completedAt = new Date().toISOString();
    }

    objectives[objIndex] = obj;

    // Recalculer les stats globales
    const completedCount = objectives.filter((o: any) => o.isCompleted).length;
    const overallProgress = objectives.length > 0
      ? Math.round(objectives.reduce((sum: number, o: any) => sum + (o.progress || 0), 0) / objectives.length)
      : 0;

    // Sauvegarder
    const { data: updated, error: updateError } = await supabase
      .from('weekly_objectives')
      .update({
        objectives,
        completed_objectives: completedCount,
        progress_percent: overallProgress,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating objective:', updateError);
      return apiResponse.serverError("Erreur lors de la mise à jour de l'objectif");
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Unexpected error in PATCH /api/protected/objectives/[id]:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
