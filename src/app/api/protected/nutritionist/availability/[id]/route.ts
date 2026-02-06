/**
 * API Route: /api/protected/nutritionist/availability/[id]
 * Gestion d'une disponibilité spécifique
 *
 * GET - Récupérer une disponibilité
 * PATCH - Modifier une disponibilité
 * DELETE - Supprimer une disponibilité
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateAvailabilitySchema } from '@/lib/api-schemas';

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

    // 4. Récupérer la disponibilité
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: availability, error: queryError } = await (supabase as any)
      .from('nutritionist_availability')
      .select('*')
      .eq('id', id)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (queryError || !availability) {
      return apiResponse.error('Disponibilité introuvable', 404);
    }

    return NextResponse.json({ availability }, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/nutritionist/availability/[id]:',
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
    const validationResult = updateAvailabilitySchema.safeParse(body);

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

    // 5. Vérifier que la disponibilité existe et appartient au nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingAvailability, error: checkError } = await (
      supabase as any
    )
      .from('nutritionist_availability')
      .select('*')
      .eq('id', id)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (checkError || !existingAvailability) {
      return apiResponse.error('Disponibilité introuvable', 404);
    }

    // 6. Si modification des heures sur un créneau récurrent, vérifier les chevauchements
    if (
      existingAvailability.availability_type === 'recurring' &&
      (data.start_time || data.end_time)
    ) {
      const newStartTime = data.start_time || existingAvailability.start_time;
      const newEndTime = data.end_time || existingAvailability.end_time;

      // Vérifier que end > start
      const [newStartH, newStartM] = newStartTime.split(':').map(Number);
      const [newEndH, newEndM] = newEndTime.split(':').map(Number);
      const newStart = newStartH * 60 + newStartM;
      const newEnd = newEndH * 60 + newEndM;

      if (newEnd <= newStart) {
        return apiResponse.error(
          "L'heure de fin doit être après l'heure de début",
          400
        );
      }

      // Vérifier les chevauchements avec d'autres créneaux
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: otherSlots } = await (supabase as any)
        .from('nutritionist_availability')
        .select('*')
        .eq('nutritionist_id', nutritionistProfile.id)
        .eq('availability_type', 'recurring')
        .eq('day_of_week', existingAvailability.day_of_week)
        .eq('is_active', true)
        .neq('id', id);

      if (otherSlots && otherSlots.length > 0) {
        for (const slot of otherSlots) {
          const [existStartH, existStartM] = slot.start_time
            .split(':')
            .map(Number);
          const [existEndH, existEndM] = slot.end_time.split(':').map(Number);
          const existStart = existStartH * 60 + existStartM;
          const existEnd = existEndH * 60 + existEndM;

          if (newStart < existEnd && newEnd > existStart) {
            return apiResponse.error(
              `Chevauchement avec un créneau existant (${slot.start_time}-${slot.end_time})`,
              400
            );
          }
        }
      }
    }

    // 7. Mettre à jour la disponibilité
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.start_time !== undefined) updateData.start_time = data.start_time;
    if (data.end_time !== undefined) updateData.end_time = data.end_time;
    if (data.visio_available !== undefined)
      updateData.visio_available = data.visio_available;
    if (data.cabinet_available !== undefined)
      updateData.cabinet_available = data.cabinet_available;
    if (data.valid_from !== undefined) updateData.valid_from = data.valid_from;
    if (data.valid_until !== undefined)
      updateData.valid_until = data.valid_until;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.consultation_type_id !== undefined)
      updateData.consultation_type_id = data.consultation_type_id;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedAvailability, error: updateError } = await (
      supabase as any
    )
      .from('nutritionist_availability')
      .update(updateData)
      .eq('id', id)
      .eq('nutritionist_id', nutritionistProfile.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating availability:', updateError);
      return apiResponse.serverError(
        'Erreur lors de la mise à jour de la disponibilité'
      );
    }

    return NextResponse.json(
      {
        message: 'Disponibilité mise à jour avec succès',
        availability: updatedAvailability,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/nutritionist/availability/[id]:',
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

    // 4. Vérifier que la disponibilité existe et appartient au nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingAvailability, error: checkError } = await (
      supabase as any
    )
      .from('nutritionist_availability')
      .select('id')
      .eq('id', id)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (checkError || !existingAvailability) {
      return apiResponse.error('Disponibilité introuvable', 404);
    }

    // 5. Supprimer la disponibilité
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('nutritionist_availability')
      .delete()
      .eq('id', id)
      .eq('nutritionist_id', nutritionistProfile.id);

    if (deleteError) {
      console.error('Error deleting availability:', deleteError);
      return apiResponse.serverError(
        'Erreur lors de la suppression de la disponibilité'
      );
    }

    return NextResponse.json(
      { message: 'Disponibilité supprimée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/protected/nutritionist/availability/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
