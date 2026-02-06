/**
 * API Routes pour un log d'hydratation spécifique
 * Endpoints: PATCH (modifier un log), DELETE (supprimer un log)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { apiResponse } from '@/lib/api-auth';
import { updateHydrationLogSchema } from '@/lib/api-schemas';

// ============================================================================
// PATCH - Modifier un log d'hydratation
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
      return apiResponse.error('ID du log requis', 400);
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
      validatedData = updateHydrationLogSchema.parse(body);
    } catch (error: any) {
      return apiResponse.error(
        `Données invalides: ${error.errors?.map((e: any) => e.message).join(', ')}`,
        400
      );
    }

    // 4. Créer client Supabase
    const supabase = await createClient();

    // 5. Vérifier que le log existe et appartient à l'utilisateur
    const { data: log, error: fetchError } = await supabase
      .from('hydration_logs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !log) {
      console.error('Error fetching hydration log for update:', fetchError);
      return apiResponse.error('Log introuvable', 404);
    }

    // 6. Vérifier ownership
    if (log.user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé à ce log', 403);
    }

    // 7. Mettre à jour le log
    const { data: updatedLog, error: updateError } = await supabase
      .from('hydration_logs')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating hydration log:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour du log');
    }

    // 8. Retourner le log mis à jour
    return NextResponse.json(updatedLog, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/hydration/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Supprimer un log d'hydratation
// ============================================================================

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Résoudre les params dynamiques (Next.js 14 pattern)
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return apiResponse.error('ID du log requis', 400);
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

    // 4. Vérifier que le log existe et appartient à l'utilisateur
    const { data: log, error: fetchError } = await supabase
      .from('hydration_logs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !log) {
      console.error('Error fetching hydration log for deletion:', fetchError);
      return apiResponse.error('Log introuvable', 404);
    }

    // 5. Vérifier ownership
    if (log.user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé à ce log', 403);
    }

    // 6. Supprimer le log (suppression réelle, pas soft delete)
    const { error: deleteError } = await supabase
      .from('hydration_logs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting hydration log:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression du log');
    }

    // 7. Retourner 204 No Content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/protected/hydration/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
