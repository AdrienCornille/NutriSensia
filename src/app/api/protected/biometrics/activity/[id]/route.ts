/**
 * API Route: /api/protected/biometrics/activity/[id]
 * Module 2.5 - Activité physique (BIO-007)
 *
 * PATCH  - Modifier une activité
 * DELETE - Supprimer une activité
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateActivityLogSchema } from '@/lib/api-schemas';
import { z } from 'zod';

// ============================================================================
// PATCH - Modifier une activité
// ============================================================================

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Récupérer l'ID depuis les params
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return apiResponse.error("ID de l'activité requis", 400);
    }

    // 2. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Vérifier que l'activité existe et appartient à l'utilisateur
    const { data: existingActivity, error: fetchError } = await supabase
      .from('activities')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingActivity) {
      return apiResponse.error('Activité non trouvée', 404);
    }

    if ((existingActivity as any).user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé', 403);
    }

    // 5. Parser et valider le body
    const body = await req.json();

    let validatedData;
    try {
      validatedData = updateActivityLogSchema.parse(body);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const issues = error.issues || [];
        return apiResponse.error(
          'Données invalides: ' +
            issues.map((e: { message: string }) => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    // 6. Préparer les données de mise à jour
    const updateData: Record<string, any> = {};

    // Si activity_type est fourni, récupérer l'activity_type_id
    if (validatedData.activity_type !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: activityType, error: typeError } = await (supabase as any)
        .from('activity_types')
        .select('id')
        .eq('slug', validatedData.activity_type)
        .eq('is_active', true)
        .single();

      if (typeError || !activityType) {
        return apiResponse.error(
          `Type d'activité '${validatedData.activity_type}' non trouvé`,
          400
        );
      }

      updateData.activity_type_id = (activityType as { id: string }).id;
    }

    if (validatedData.duration_minutes !== undefined) {
      updateData.duration_minutes = validatedData.duration_minutes;
    }
    if (validatedData.intensity !== undefined) {
      updateData.intensity = validatedData.intensity;
    }
    if (validatedData.calories_burned !== undefined) {
      updateData.calories_burned = validatedData.calories_burned;
      updateData.is_calories_manual = validatedData.calories_burned !== null;
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }
    if (validatedData.date !== undefined) {
      updateData.date = validatedData.date;
    }

    updateData.updated_at = new Date().toISOString();

    // 7. Mettre à jour l'activité
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedActivity, error: updateError } = await (
      supabase as any
    )
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        activity_type:activity_types (
          id,
          slug,
          name_fr,
          name_en,
          met_value,
          emoji,
          bg_color,
          text_color
        )
      `
      )
      .single();

    if (updateError) {
      console.error('Error updating activity:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour');
    }

    return NextResponse.json(updatedActivity, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/biometrics/activity/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Supprimer une activité
// ============================================================================

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Récupérer l'ID depuis les params
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return apiResponse.error("ID de l'activité requis", 400);
    }

    // 2. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Vérifier que l'activité existe et appartient à l'utilisateur
    const { data: existingActivity, error: fetchError } = await supabase
      .from('activities')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingActivity) {
      return apiResponse.error('Activité non trouvée', 404);
    }

    if ((existingActivity as any).user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé', 403);
    }

    // 5. Supprimer l'activité
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting activity:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/protected/biometrics/activity/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
