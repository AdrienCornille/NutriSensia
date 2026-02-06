/**
 * API Route: /api/protected/nutritionist/appointments/[id]
 * Gestion des rendez-vous par le nutritionniste
 *
 * PATCH  - Modifier un rendez-vous (date, mode, notes)
 * DELETE - Annuler un rendez-vous
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { nutritionistUpdateAppointmentSchema } from '@/lib/api-schemas';
import { z } from 'zod';
import {
  notifyAppointmentCancelled,
  notifyAppointmentRescheduled,
  formatDateForNotification,
  formatTimeForNotification,
} from '@/lib/notifications';

// ============================================================================
// PATCH - Modifier un rendez-vous
// ============================================================================

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return apiResponse.error('ID du rendez-vous requis', 400);
    }

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

    let validatedData;
    try {
      validatedData = nutritionistUpdateAppointmentSchema.parse(body);
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

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Récupérer le profil nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: nutritionistProfile, error: profileError } = await (
      supabase as any
    )
      .from('nutritionist_profiles')
      .select('id, title')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // 5. Récupérer le rendez-vous existant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingAppointment, error: fetchError } = await (
      supabase as any
    )
      .from('appointments')
      .select('*, consultation_type:consultation_types(default_duration)')
      .eq('id', id)
      .single();

    if (fetchError || !existingAppointment) {
      return apiResponse.error('Rendez-vous non trouvé', 404);
    }

    // 6. Vérifier que le RDV appartient à ce nutritionniste
    if (existingAppointment.nutritionist_id !== nutritionistProfile.id) {
      return apiResponse.error('Accès non autorisé à ce rendez-vous', 403);
    }

    // 7. Vérifier que le statut permet la modification
    if (
      [
        'cancelled',
        'cancelled_by_patient',
        'cancelled_by_nutritionist',
        'completed',
        'no_show',
      ].includes(existingAppointment.status)
    ) {
      return apiResponse.error('Ce rendez-vous ne peut plus être modifié', 403);
    }

    // 8. Vérifier > 24h avant le RDV
    const scheduledAt = new Date(existingAppointment.scheduled_at);
    const now = new Date();
    const hoursUntilAppointment =
      (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return apiResponse.error(
        'Modification impossible: le rendez-vous a lieu dans moins de 24 heures',
        403
      );
    }

    // 9. Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.scheduled_at) {
      const newScheduledAt = new Date(validatedData.scheduled_at);
      const duration =
        existingAppointment.consultation_type?.default_duration ||
        existingAppointment.duration;
      const newScheduledEndAt = new Date(
        newScheduledAt.getTime() + duration * 60 * 1000
      );

      // Vérifier que le nouveau créneau est disponible
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: conflicts } = await (supabase as any)
        .from('appointments')
        .select('id')
        .eq('nutritionist_id', nutritionistProfile.id)
        .neq('id', id)
        .not(
          'status',
          'in',
          '("cancelled","cancelled_by_patient","cancelled_by_nutritionist","no_show")'
        )
        .lt('scheduled_at', newScheduledEndAt.toISOString())
        .gt('scheduled_end_at', newScheduledAt.toISOString());

      if (conflicts && conflicts.length > 0) {
        return apiResponse.error(
          "Ce créneau n'est plus disponible. Veuillez en choisir un autre.",
          409
        );
      }

      updateData.scheduled_at = newScheduledAt.toISOString();
      updateData.scheduled_end_at = newScheduledEndAt.toISOString();

      // Passer en counter_proposal pour que le patient valide le nouvel horaire
      updateData.status = 'pending';
      updateData.status_reason = 'counter_proposal';
      updateData.status_changed_at = new Date().toISOString();

      if (validatedData.message) {
        updateData.nutritionist_notes_internal = validatedData.message;
      }
    }

    if (validatedData.mode) {
      updateData.mode = validatedData.mode;

      // Générer un nouveau lien visio si passage en visio
      if (validatedData.mode === 'visio' && !existingAppointment.visio_link) {
        const visioRoomId = `nutrisensia-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        updateData.visio_link = `https://meet.jit.si/${visioRoomId}`;
        updateData.visio_room_id = visioRoomId;
      }
    }

    if (validatedData.nutritionist_notes !== undefined) {
      updateData.nutritionist_notes_internal = validatedData.nutritionist_notes;
    }

    // 10. Mettre à jour le rendez-vous
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedAppointment, error: updateError } = await (
      supabase as any
    )
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        consultation_type:consultation_types (
          id,
          code,
          name_fr,
          name_en,
          default_duration,
          default_price,
          icon,
          color
        )
      `
      )
      .single();

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      return apiResponse.serverError(
        'Erreur lors de la modification du rendez-vous'
      );
    }

    // 11. Notifier le patient si la date a changé
    if (validatedData.scheduled_at) {
      // Récupérer le user_id auth du patient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: patientProfile } = await (supabase as any)
        .from('patient_profiles')
        .select('user_id')
        .eq('id', existingAppointment.user_id)
        .single();

      if (patientProfile?.user_id) {
        try {
          const oldDate = new Date(existingAppointment.scheduled_at);
          const newDate = new Date(validatedData.scheduled_at);
          await notifyAppointmentRescheduled(supabase, patientProfile.user_id, {
            old_date: formatDateForNotification(oldDate),
            new_date: formatDateForNotification(newDate),
            new_time: formatTimeForNotification(newDate),
          });
        } catch (notifError) {
          console.error('Error sending reschedule notification:', notifError);
        }
      }
    }

    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/nutritionist/appointments/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Annuler un rendez-vous
// ============================================================================

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return apiResponse.error('ID du rendez-vous requis', 400);
    }

    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser le body pour la raison d'annulation
    let reason: string | null = null;
    try {
      const body = await req.json();
      reason = body.reason || null;
    } catch {
      // Pas de body, c'est OK
    }

    if (!reason || reason.length < 5) {
      return apiResponse.error(
        "Veuillez indiquer une raison d'annulation (min 5 caractères)",
        400
      );
    }

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

    // 5. Récupérer le rendez-vous existant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingAppointment, error: fetchError } = await (
      supabase as any
    )
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingAppointment) {
      return apiResponse.error('Rendez-vous non trouvé', 404);
    }

    // 6. Vérifier que le RDV appartient à ce nutritionniste
    if (existingAppointment.nutritionist_id !== nutritionistProfile.id) {
      return apiResponse.error('Accès non autorisé à ce rendez-vous', 403);
    }

    // 7. Vérifier que le statut permet l'annulation
    if (
      [
        'cancelled',
        'cancelled_by_patient',
        'cancelled_by_nutritionist',
        'completed',
        'no_show',
      ].includes(existingAppointment.status)
    ) {
      return apiResponse.error('Ce rendez-vous ne peut plus être annulé', 403);
    }

    // 8. Annuler le rendez-vous (soft delete)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('appointments')
      .update({
        status: 'cancelled_by_nutritionist',
        status_changed_at: new Date().toISOString(),
        status_reason: reason,
        cancelled_by: auth.user.id,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error cancelling appointment:', updateError);
      return apiResponse.serverError(
        "Erreur lors de l'annulation du rendez-vous"
      );
    }

    // 9. Notifier le patient
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile } = await (supabase as any)
      .from('patient_profiles')
      .select('user_id')
      .eq('id', existingAppointment.user_id)
      .single();

    if (patientProfile?.user_id) {
      try {
        const appointmentDate = new Date(existingAppointment.scheduled_at);
        await notifyAppointmentCancelled(supabase, patientProfile.user_id, {
          date: formatDateForNotification(appointmentDate),
          reason: reason || undefined,
        });
      } catch (notifError) {
        console.error('Error sending cancellation notification:', notifError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Rendez-vous annulé avec succès',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/protected/nutritionist/appointments/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
