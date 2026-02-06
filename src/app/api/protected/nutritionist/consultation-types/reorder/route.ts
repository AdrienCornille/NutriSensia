/**
 * API Route: /api/protected/nutritionist/consultation-types/reorder
 * Réordonnancement des types de consultation du nutritionniste
 *
 * PATCH - Mettre à jour l'ordre des types de consultation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { z } from 'zod';

// Schema de validation pour le réordonnancement
const reorderSchema = z.object({
  orderedIds: z
    .array(z.string().uuid())
    .min(1, 'Au moins un ID est requis'),
});

export async function PATCH(req: NextRequest) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser et valider le body
    const body = await req.json();
    const validationResult = reorderSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map(issue => issue.message)
        .join(', ');
      return apiResponse.error(errorMessages || 'Données invalides', 400);
    }

    const { orderedIds } = validationResult.data;

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Récupérer le profil nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: nutritionistProfile, error: profileError } = await (
      supabase as any
    )
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // 5. Vérifier que tous les IDs appartiennent bien au nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingTypes, error: checkError } = await (supabase as any)
      .from('consultation_types')
      .select('id')
      .eq('nutritionist_id', nutritionistProfile.id)
      .in('id', orderedIds);

    if (checkError) {
      console.error('Error checking consultation types:', checkError);
      return apiResponse.serverError('Erreur lors de la vérification');
    }

    const existingIds = new Set(existingTypes?.map((t: { id: string }) => t.id) || []);
    const invalidIds = orderedIds.filter(id => !existingIds.has(id));

    if (invalidIds.length > 0) {
      return apiResponse.error(
        'Certains types de consultation sont invalides ou ne vous appartiennent pas',
        400
      );
    }

    // 6. Mettre à jour l'ordre pour chaque type
    const updates = orderedIds.map((id, index) => ({
      id,
      sort_order: index + 1,
    }));

    // Utiliser une transaction pour mettre à jour tous les ordres
    for (const update of updates) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('consultation_types')
        .update({ sort_order: update.sort_order, updated_at: new Date().toISOString() })
        .eq('id', update.id)
        .eq('nutritionist_id', nutritionistProfile.id);

      if (updateError) {
        console.error('Error updating sort_order:', updateError);
        return apiResponse.serverError(
          'Erreur lors de la mise à jour de l\'ordre'
        );
      }
    }

    return NextResponse.json(
      {
        message: 'Ordre mis à jour avec succès',
        updatedCount: updates.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/nutritionist/consultation-types/reorder:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
