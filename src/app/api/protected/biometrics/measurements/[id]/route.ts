/**
 * API Routes pour une mesure spécifique
 * Endpoints: PATCH (modifier), DELETE (supprimer)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { apiResponse } from '@/lib/api-auth';
import { updateMeasurementEntrySchema } from '@/lib/api-schemas';

// ============================================================================
// PATCH - Modifier une mesure
// ============================================================================

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Résoudre les params dynamiques
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return apiResponse.error('ID de la mesure requis', 400);
    }

    // 2. Authentifier
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 3. Parser et valider le body
    const body = await req.json();
    let validatedData;

    try {
      validatedData = updateMeasurementEntrySchema.parse(body);
    } catch (error: any) {
      return apiResponse.error(
        `Données invalides: ${error.errors?.map((e: any) => e.message).join(', ')}`,
        400
      );
    }

    // 4. Créer client Supabase
    const supabase = await createClient();

    // 5. Vérifier que la mesure existe et appartient à l'utilisateur
    const { data: measurement, error: fetchError } = await supabase
      .from('measurements')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !measurement) {
      console.error('Error fetching measurement for update:', fetchError);
      return apiResponse.error('Mesure introuvable', 404);
    }

    // 6. Vérifier ownership
    if ((measurement as any).user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé à cette mesure', 403);
    }

    // 7. Préparer les données de mise à jour
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Ajouter value_cm si fourni
    if (validatedData.value_cm !== undefined) {
      updateData.value_cm = validatedData.value_cm;
    }

    // Ajouter notes si fourni
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    // 8. Mettre à jour la mesure
    // @ts-ignore - Supabase type issue with dynamic update object
    const { data: updatedMeasurement, error: updateError } = await supabase
      .from('measurements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating measurement:', updateError);
      return apiResponse.serverError(
        'Erreur lors de la mise à jour de la mesure'
      );
    }

    // 9. Retourner la mesure mise à jour
    return NextResponse.json(updatedMeasurement, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/biometrics/measurements/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Supprimer une mesure
// ============================================================================

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Résoudre les params dynamiques
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return apiResponse.error('ID de la mesure requis', 400);
    }

    // 2. Authentifier
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Vérifier que la mesure existe et appartient à l'utilisateur
    const { data: measurement, error: fetchError } = await supabase
      .from('measurements')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !measurement) {
      console.error('Error fetching measurement for deletion:', fetchError);
      return apiResponse.error('Mesure introuvable', 404);
    }

    // 5. Vérifier ownership
    if ((measurement as any).user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé à cette mesure', 403);
    }

    // 6. Supprimer la mesure
    const { error: deleteError } = await supabase
      .from('measurements')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting measurement:', deleteError);
      return apiResponse.serverError(
        'Erreur lors de la suppression de la mesure'
      );
    }

    // 7. Retourner 204 No Content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/protected/biometrics/measurements/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
