/**
 * API Route: /api/protected/nutritionist/consultation-types/[id]
 * Gestion d'un type de consultation spécifique
 *
 * GET - Récupérer un type de consultation
 * PATCH - Modifier un type de consultation
 * DELETE - Supprimer un type de consultation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateConsultationTypeSchema } from '@/lib/api-schemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Créer client Supabase
    const supabase = await createClient();

    // 3. Récupérer le profil nutritionniste
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

    // 4. Récupérer le type de consultation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: consultationType, error: queryError } = await (
      supabase as any
    )
      .from('consultation_types')
      .select('*')
      .eq('id', id)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (queryError || !consultationType) {
      return apiResponse.error('Type de consultation introuvable', 404);
    }

    return NextResponse.json({ consultationType }, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/nutritionist/consultation-types/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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
    const validationResult = updateConsultationTypeSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map(issue => issue.message)
        .join(', ');
      return apiResponse.error(errorMessages || 'Données invalides', 400);
    }

    const data = validationResult.data;

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

    // 5. Vérifier que le type existe et appartient au nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingType, error: checkError } = await (supabase as any)
      .from('consultation_types')
      .select('*')
      .eq('id', id)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (checkError || !existingType) {
      return apiResponse.error('Type de consultation introuvable', 404);
    }

    // 6. Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (data.code && data.code !== existingType.code) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: duplicateCode } = await (supabase as any)
        .from('consultation_types')
        .select('id')
        .eq('nutritionist_id', nutritionistProfile.id)
        .eq('code', data.code)
        .neq('id', id)
        .single();

      if (duplicateCode) {
        return apiResponse.error(
          `Un type de consultation avec le code "${data.code}" existe déjà`,
          400
        );
      }
    }

    // 7. Mettre à jour le type de consultation
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.code !== undefined) updateData.code = data.code;
    if (data.name_fr !== undefined) updateData.name_fr = data.name_fr;
    if (data.description_fr !== undefined)
      updateData.description_fr = data.description_fr;
    if (data.default_duration !== undefined)
      updateData.default_duration = data.default_duration;
    if (data.default_price !== undefined)
      updateData.default_price = data.default_price;
    if (data.visio_available !== undefined)
      updateData.visio_available = data.visio_available;
    if (data.cabinet_available !== undefined)
      updateData.cabinet_available = data.cabinet_available;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedType, error: updateError } = await (supabase as any)
      .from('consultation_types')
      .update(updateData)
      .eq('id', id)
      .eq('nutritionist_id', nutritionistProfile.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating consultation type:', updateError);
      return apiResponse.serverError(
        'Erreur lors de la mise à jour du type de consultation'
      );
    }

    return NextResponse.json(
      {
        message: 'Type de consultation mis à jour avec succès',
        consultationType: updatedType,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/nutritionist/consultation-types/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Créer client Supabase
    const supabase = await createClient();

    // 3. Récupérer le profil nutritionniste
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

    // 4. Vérifier que le type existe et appartient au nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingType, error: checkError } = await (supabase as any)
      .from('consultation_types')
      .select('id')
      .eq('id', id)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (checkError || !existingType) {
      return apiResponse.error('Type de consultation introuvable', 404);
    }

    // 5. Vérifier si des disponibilités utilisent ce type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: linkedAvailabilities } = await (supabase as any)
      .from('nutritionist_availability')
      .select('id')
      .eq('consultation_type_id', id)
      .limit(1);

    if (linkedAvailabilities && linkedAvailabilities.length > 0) {
      // Soft delete - désactiver plutôt que supprimer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('consultation_types')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('nutritionist_id', nutritionistProfile.id);

      if (updateError) {
        console.error('Error deactivating consultation type:', updateError);
        return apiResponse.serverError(
          'Erreur lors de la désactivation du type de consultation'
        );
      }

      return NextResponse.json(
        {
          message:
            'Type de consultation désactivé (utilisé par des disponibilités)',
          softDeleted: true,
        },
        { status: 200 }
      );
    }

    // 6. Supprimer le type de consultation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('consultation_types')
      .delete()
      .eq('id', id)
      .eq('nutritionist_id', nutritionistProfile.id);

    if (deleteError) {
      console.error('Error deleting consultation type:', deleteError);
      return apiResponse.serverError(
        'Erreur lors de la suppression du type de consultation'
      );
    }

    return NextResponse.json(
      { message: 'Type de consultation supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/protected/nutritionist/consultation-types/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
