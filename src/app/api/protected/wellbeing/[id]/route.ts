/**
 * API Routes pour un log de bien-être spécifique (Module 2.4)
 *
 * PATCH /api/protected/wellbeing/[id] - Mettre à jour un log
 * DELETE /api/protected/wellbeing/[id] - Supprimer un log
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateWellbeingLogSchema } from '@/lib/api-schemas';
import { z } from 'zod';

// ============================================================================
// PATCH - Mettre à jour un log de bien-être
// ============================================================================

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Résoudre params
    const params = await context.params;
    const { id } = params;

    // 2. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 3. Valider le body
    const body = await req.json();
    let validatedData: z.infer<typeof updateWellbeingLogSchema>;

    try {
      validatedData = updateWellbeingLogSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Données invalides: ' + error.errors.map(e => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    // 4. Créer client Supabase
    const supabase = await createClient();

    // 5. Vérifier ownership (que le log appartient à l'utilisateur)
    const { data: log, error: fetchError } = await supabase
      .from('wellbeing_logs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !log) {
      console.error('Error fetching wellbeing log for update:', fetchError);
      return apiResponse.error('Log introuvable', 404);
    }

    if ((log as any).user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé à ce log', 403);
    }

    // 6. Mettre à jour le log
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
      ...validatedData,
    };

    // @ts-ignore - Supabase type issue with dynamic update object
    const { data: updatedLog, error: updateError } = await supabase
      .from('wellbeing_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating wellbeing log:', updateError);
      return apiResponse.serverError('Erreur lors de la mise à jour');
    }

    return NextResponse.json(updatedLog, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/wellbeing/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Supprimer un log de bien-être
// ============================================================================

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Résoudre params
    const params = await context.params;
    const { id } = params;

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

    // 4. Vérifier ownership (que le log appartient à l'utilisateur)
    const { data: log, error: fetchError } = await supabase
      .from('wellbeing_logs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !log) {
      console.error('Error fetching wellbeing log for deletion:', fetchError);
      return apiResponse.error('Log introuvable', 404);
    }

    if ((log as any).user_id !== auth.user.id) {
      return apiResponse.error('Accès non autorisé à ce log', 403);
    }

    // 5. Supprimer le log
    const { error: deleteError } = await supabase
      .from('wellbeing_logs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting wellbeing log:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression');
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/protected/wellbeing/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
