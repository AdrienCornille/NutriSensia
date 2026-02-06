/**
 * API Routes pour une pesée spécifique
 * Endpoints: PATCH (modifier), DELETE (supprimer)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { apiResponse } from '@/lib/api-auth';
import { z } from 'zod';

// Schéma pour mettre à jour une pesée
const updateWeightEntrySchema = z.object({
  weight_kg: z
    .number()
    .positive('Le poids doit être positif')
    .min(20, 'Poids minimum: 20kg')
    .max(500, 'Poids maximum: 500kg')
    .optional(),
  measured_at: z.string().datetime('Date/heure invalide').optional(),
  notes: z
    .string()
    .max(200, 'Notes trop longues (max 200 caractères)')
    .optional(),
});

// ============================================================================
// PATCH - Modifier une pesée
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
      return apiResponse.error('ID de la pesée requis', 400);
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
      validatedData = updateWeightEntrySchema.parse(body);
    } catch (error: any) {
      return apiResponse.error(
        `Données invalides: ${error.errors?.map((e: any) => e.message).join(', ')}`,
        400
      );
    }

    // 4. Créer client Supabase
    const supabase = await createClient();

    // 5. Vérifier que la pesée existe et appartient à l'utilisateur
    const { data: entry, error: fetchError } = await supabase
      .from('weight_entries')
      .select('user_id, weight_kg, date')
      .eq('id', id)
      .single();

    if (fetchError || !entry) {
      console.error('Error fetching weight entry for update:', fetchError);
      return apiResponse.error('Pesée introuvable', 404);
    }

    // 6. Vérifier ownership
    if (entry.user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé à cette pesée', 403);
    }

    // 7. Préparer les données de mise à jour
    let updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Ajouter weight_kg si fourni
    if (validatedData.weight_kg !== undefined) {
      updateData.weight_kg = validatedData.weight_kg;
    }

    // Ajouter date si measured_at est fourni
    if (validatedData.measured_at) {
      const measuredDate = new Date(validatedData.measured_at);
      updateData.date = measuredDate.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // Ajouter notes si fourni
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    // 8. Mettre à jour la pesée
    const { data: updatedEntry, error: updateError } = await supabase
      .from('weight_entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating weight entry:', updateError);
      return apiResponse.serverError(
        'Erreur lors de la mise à jour de la pesée'
      );
    }

    // 9. Calculer la variation pour la réponse
    const { data: previousEntry } = await supabase
      .from('weight_entries')
      .select('weight_kg, date')
      .eq('user_id', auth.user.id)
      .lt('date', updatedEntry.date)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    const variation_kg = previousEntry
      ? Number((updatedEntry.weight_kg - previousEntry.weight_kg).toFixed(2))
      : 0;

    // 10. Retourner la pesée mise à jour avec variation
    return NextResponse.json(
      {
        ...updatedEntry,
        variation_kg,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/biometrics/weight/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Supprimer une pesée
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
      return apiResponse.error('ID de la pesée requis', 400);
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

    // 4. Vérifier que la pesée existe et appartient à l'utilisateur
    const { data: entry, error: fetchError } = await supabase
      .from('weight_entries')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !entry) {
      console.error('Error fetching weight entry for deletion:', fetchError);
      return apiResponse.error('Pesée introuvable', 404);
    }

    // 5. Vérifier ownership
    if (entry.user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé à cette pesée', 403);
    }

    // 6. Supprimer la pesée
    const { error: deleteError } = await supabase
      .from('weight_entries')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting weight entry:', deleteError);
      return apiResponse.serverError(
        'Erreur lors de la suppression de la pesée'
      );
    }

    // 7. Retourner 204 No Content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/protected/biometrics/weight/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
