/**
 * API Route: /api/protected/appointments/[id]
 * Module 3.1 - Agenda (Rendez-vous)
 *
 * GET    - Détail d'un rendez-vous
 * PATCH  - Modifier un rendez-vous (AGENDA-007)
 * DELETE - Annuler un rendez-vous (AGENDA-008)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateAppointmentSchema } from '@/lib/api-schemas';
import { z } from 'zod';
import {
  notifyAppointmentCancelled,
  notifyAppointmentRescheduled,
  formatDateForNotification,
  formatTimeForNotification,
} from '@/lib/notifications';

// ============================================================================
// GET - Détail d'un rendez-vous
// ============================================================================

export async function GET(
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
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Créer client Supabase
    const supabase = await createClient();

    // 3. Récupérer le patient_profiles.id (appointments.user_id référence patient_profiles.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile, error: profileError } = await (supabase as any)
      .from('patient_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !patientProfile) {
      return apiResponse.error('Profil patient non trouvé', 404);
    }

    const patientProfileId = patientProfile.id;

    // 4. Récupérer le rendez-vous avec jointures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: appointment, error: queryError } = await (supabase as any)
      .from('appointments')
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
        ),
        nutritionist:nutritionist_profiles (
          id,
          user_id,
          title,
          cabinet_name,
          cabinet_address_line1,
          cabinet_address_line2,
          cabinet_city,
          cabinet_postal_code
        )
      `
      )
      .eq('id', id)
      .single();

    if (queryError || !appointment) {
      console.error('Error fetching appointment:', queryError);
      return apiResponse.error('Rendez-vous non trouvé', 404);
    }

    // 5. Vérifier que le RDV appartient à l'utilisateur
    if (appointment.user_id !== patientProfileId) {
      return apiResponse.error('Accès non autorisé à ce rendez-vous', 403);
    }

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/appointments/[id]:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// PATCH - Modifier un rendez-vous (AGENDA-007)
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
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser et valider le body
    const body = await req.json();

    let validatedData;
    try {
      validatedData = updateAppointmentSchema.parse(body);
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

    // Récupérer le patient_profiles.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile } = await (supabase as any)
      .from('patient_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile) {
      return apiResponse.error('Profil patient non trouvé', 404);
    }

    const patientProfileId = patientProfile.id;

    // 4. Récupérer le rendez-vous existant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingAppointment, error: fetchError } = await (supabase as any)
      .from('appointments')
      .select('*, consultation_type:consultation_types(default_duration)')
      .eq('id', id)
      .single();

    if (fetchError || !existingAppointment) {
      return apiResponse.error('Rendez-vous non trouvé', 404);
    }

    // 5. Vérifier que le RDV appartient à l'utilisateur
    if (existingAppointment.user_id !== patientProfileId) {
      return apiResponse.error('Accès non autorisé à ce rendez-vous', 403);
    }

    // 6. Vérifier que le RDV peut être modifié (> 24h avant)
    const scheduledAt = new Date(existingAppointment.scheduled_at);
    const now = new Date();
    const hoursUntilAppointment = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return apiResponse.error(
        'Modification impossible: le rendez-vous a lieu dans moins de 24 heures',
        403
      );
    }

    // 7. Vérifier que le statut permet la modification
    if (['cancelled', 'completed', 'no_show'].includes(existingAppointment.status)) {
      return apiResponse.error(
        'Ce rendez-vous ne peut plus être modifié',
        403
      );
    }

    // 9. Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.scheduled_at) {
      const newScheduledAt = new Date(validatedData.scheduled_at);
      const duration = existingAppointment.consultation_type?.default_duration || existingAppointment.duration;
      const newScheduledEndAt = new Date(newScheduledAt.getTime() + duration * 60 * 1000);

      // Vérifier que le nouveau créneau est disponible
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: conflicts } = await (supabase as any)
        .from('appointments')
        .select('id')
        .eq('nutritionist_id', existingAppointment.nutritionist_id)
        .neq('id', id)
        .not('status', 'in', '("cancelled_by_patient","cancelled_by_nutritionist")')
        .lt('scheduled_at', newScheduledEndAt.toISOString())
        .gt('scheduled_end_at', newScheduledAt.toISOString());

      if (conflicts && conflicts.length > 0) {
        return apiResponse.error(
          'Ce créneau n\'est plus disponible. Veuillez en choisir un autre.',
          409
        );
      }

      updateData.scheduled_at = newScheduledAt.toISOString();
      updateData.scheduled_end_at = newScheduledEndAt.toISOString();
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

    if (validatedData.patient_notes !== undefined) {
      updateData.patient_message = validatedData.patient_notes;
    }

    // 10. Mettre à jour le rendez-vous
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedAppointment, error: updateError } = await (supabase as any)
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
        ),
        nutritionist:nutritionist_profiles (
          id,
          user_id,
          title,
          cabinet_name,
          cabinet_address_line1,
          cabinet_address_line2,
          cabinet_city,
          cabinet_postal_code
        )
      `
      )
      .single();

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      return apiResponse.serverError('Erreur lors de la modification du rendez-vous');
    }

    // Le changement est loggé automatiquement par le trigger DB (trigger_log_appointment_change)

    // Notifier le nutritionniste si la date a changé
    if (validatedData.scheduled_at && existingAppointment.nutritionist_id) {
      try {
        // Récupérer le user_id du nutritionniste
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: nutritionist } = await (supabase as any)
          .from('nutritionist_profiles')
          .select('user_id')
          .eq('id', existingAppointment.nutritionist_id)
          .single();

        if (nutritionist?.user_id) {
          const oldDate = new Date(existingAppointment.scheduled_at);
          const newDate = new Date(validatedData.scheduled_at);
          await notifyAppointmentRescheduled(supabase, nutritionist.user_id, {
            old_date: formatDateForNotification(oldDate),
            new_date: formatDateForNotification(newDate),
            new_time: formatTimeForNotification(newDate),
          });
        }
      } catch (notifError) {
        console.error('Error sending reschedule notification:', notifError);
      }
    }

    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/protected/appointments/[id]:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Annuler un rendez-vous (AGENDA-008)
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
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser le body pour la raison d'annulation (optionnel)
    let reason: string | null = null;
    try {
      const body = await req.json();
      reason = body.reason || null;
    } catch {
      // Pas de body, c'est OK
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    // Récupérer le patient_profiles.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile } = await (supabase as any)
      .from('patient_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile) {
      return apiResponse.error('Profil patient non trouvé', 404);
    }

    const patientProfileId = patientProfile.id;

    // 4. Récupérer le rendez-vous existant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingAppointment, error: fetchError } = await (supabase as any)
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingAppointment) {
      return apiResponse.error('Rendez-vous non trouvé', 404);
    }

    // 5. Vérifier que le RDV appartient à l'utilisateur
    if (existingAppointment.user_id !== patientProfileId) {
      return apiResponse.error('Accès non autorisé à ce rendez-vous', 403);
    }

    // 6. Vérifier que le RDV peut être annulé (> 24h avant)
    const scheduledAt = new Date(existingAppointment.scheduled_at);
    const now = new Date();
    const hoursUntilAppointment = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return apiResponse.error(
        'Annulation impossible: le rendez-vous a lieu dans moins de 24 heures. Veuillez contacter votre nutritionniste.',
        403
      );
    }

    // 7. Vérifier que le statut permet l'annulation
    if (['cancelled', 'completed', 'no_show'].includes(existingAppointment.status)) {
      return apiResponse.error(
        'Ce rendez-vous ne peut plus être annulé',
        403
      );
    }

    // 8. Annuler le rendez-vous (soft delete)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('appointments')
      .update({
        status: 'cancelled',
        status_changed_at: new Date().toISOString(),
        status_reason: reason,
        cancelled_by: auth.user.id,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error cancelling appointment:', updateError);
      return apiResponse.serverError('Erreur lors de l\'annulation du rendez-vous');
    }

    // Le changement est loggé automatiquement par le trigger DB (trigger_log_appointment_change)

    // Notifier le nutritionniste de l'annulation
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: nutritionist } = await (supabase as any)
        .from('nutritionist_profiles')
        .select('user_id')
        .eq('id', existingAppointment.nutritionist_id)
        .single();

      if (nutritionist?.user_id) {
        const appointmentDate = new Date(existingAppointment.scheduled_at);
        await notifyAppointmentCancelled(supabase, nutritionist.user_id, {
          date: formatDateForNotification(appointmentDate),
          reason: reason || undefined,
        });
      }
    } catch (notifError) {
      console.error('Error sending cancellation notification:', notifError);
    }

    // TODO: Envoyer email de confirmation d'annulation (nécessite configuration email service)

    return NextResponse.json(
      {
        success: true,
        message: 'Rendez-vous annulé avec succès',
        cancellation_policy:
          hoursUntilAppointment >= 24
            ? 'Annulation gratuite (plus de 24h avant le rendez-vous)'
            : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in DELETE /api/protected/appointments/[id]:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
