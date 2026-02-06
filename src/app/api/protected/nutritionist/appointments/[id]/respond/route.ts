/**
 * API Route: /api/protected/nutritionist/appointments/[id]/respond
 * Réponse du nutritionniste à une demande de rendez-vous
 *
 * POST - Accepter, refuser ou proposer un nouvel horaire
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { nutritionistAppointmentResponseSchema } from '@/lib/api-schemas';
import { z } from 'zod';
import {
  notifyAppointmentConfirmed,
  notifyAppointmentCancelled,
  notifyAppointmentRescheduled,
  formatDateForNotification,
  formatTimeForNotification,
} from '@/lib/notifications';

export async function POST(
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
      validatedData = nutritionistAppointmentResponseSchema.parse(body);
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

    // 5. Récupérer le rendez-vous
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: appointment, error: fetchError } = await (supabase as any)
      .from('appointments')
      .select('*, consultation_type:consultation_types(default_duration)')
      .eq('id', id)
      .single();

    if (fetchError || !appointment) {
      return apiResponse.error('Rendez-vous non trouvé', 404);
    }

    // 6. Vérifier que le RDV appartient à ce nutritionniste
    if (appointment.nutritionist_id !== nutritionistProfile.id) {
      return apiResponse.error('Accès non autorisé à ce rendez-vous', 403);
    }

    // 7. Vérifier que le RDV est en attente
    if (appointment.status !== 'pending') {
      return apiResponse.error(
        'Ce rendez-vous ne peut plus être modifié (statut actuel: ' +
          appointment.status +
          ')',
        400
      );
    }

    // 8. Récupérer le user_id auth du patient pour les notifications
    // appointments.user_id = patient_profiles.id (pas auth.users.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile } = await (supabase as any)
      .from('patient_profiles')
      .select('user_id')
      .eq('id', appointment.user_id)
      .single();

    const patientAuthUserId = patientProfile?.user_id;

    // 9. Traiter l'action
    const now = new Date().toISOString();

    if (validatedData.action === 'accept') {
      // Accepter le rendez-vous
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error: updateError } = await (supabase as any)
        .from('appointments')
        .update({
          status: 'confirmed',
          status_changed_at: now,
          updated_at: now,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error accepting appointment:', updateError);
        return apiResponse.serverError('Erreur lors de la confirmation');
      }

      // Notifier le patient
      if (patientAuthUserId) {
        try {
          const scheduledAt = new Date(appointment.scheduled_at);
          await notifyAppointmentConfirmed(supabase, patientAuthUserId, {
            date: formatDateForNotification(scheduledAt),
            time: formatTimeForNotification(scheduledAt),
            nutritionist: nutritionistProfile.title || 'votre nutritionniste',
          });
        } catch (notifError) {
          console.error('Error sending accept notification:', notifError);
        }
      }

      return NextResponse.json(
        { message: 'Rendez-vous confirmé', appointment: updated },
        { status: 200 }
      );
    }

    if (validatedData.action === 'decline') {
      // Refuser le rendez-vous
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error: updateError } = await (supabase as any)
        .from('appointments')
        .update({
          status: 'cancelled_by_nutritionist',
          status_reason: `declined:${validatedData.reason}`,
          status_changed_at: now,
          cancelled_at: now,
          cancelled_by: auth.user.id,
          updated_at: now,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error declining appointment:', updateError);
        return apiResponse.serverError('Erreur lors du refus');
      }

      // Notifier le patient
      if (patientAuthUserId) {
        try {
          const scheduledAt = new Date(appointment.scheduled_at);
          await notifyAppointmentCancelled(supabase, patientAuthUserId, {
            date: formatDateForNotification(scheduledAt),
            reason: validatedData.reason,
          });
        } catch (notifError) {
          console.error('Error sending decline notification:', notifError);
        }
      }

      return NextResponse.json(
        { message: 'Rendez-vous refusé', appointment: updated },
        { status: 200 }
      );
    }

    if (validatedData.action === 'propose_new_time') {
      // Proposer un nouvel horaire
      const proposedAt = new Date(validatedData.proposed_at);
      const duration =
        appointment.consultation_type?.default_duration ||
        appointment.duration ||
        30;
      const proposedEndAt = new Date(
        proposedAt.getTime() + duration * 60 * 1000
      );

      // Vérifier pas de conflit sur le nouveau créneau
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: conflicts } = await (supabase as any)
        .from('appointments')
        .select('id')
        .eq('nutritionist_id', nutritionistProfile.id)
        .neq('id', id) // Exclure le RDV en cours de modification
        .not(
          'status',
          'in',
          '("cancelled","cancelled_by_patient","cancelled_by_nutritionist","no_show")'
        )
        .lt('scheduled_at', proposedEndAt.toISOString())
        .gt('scheduled_end_at', proposedAt.toISOString());

      if (conflicts && conflicts.length > 0) {
        return apiResponse.error(
          "Ce créneau n'est pas disponible. Veuillez en proposer un autre.",
          409
        );
      }

      // Mettre à jour le rendez-vous
      const oldScheduledAt = new Date(appointment.scheduled_at);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        scheduled_at: proposedAt.toISOString(),
        scheduled_end_at: proposedEndAt.toISOString(),
        status_reason: 'counter_proposal',
        status_changed_at: now,
        updated_at: now,
      };

      if (validatedData.message) {
        updateData.nutritionist_notes_internal = validatedData.message;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error: updateError } = await (supabase as any)
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error proposing new time:', updateError);
        return apiResponse.serverError(
          "Erreur lors de la proposition d'un nouvel horaire"
        );
      }

      // Notifier le patient du changement d'horaire
      if (patientAuthUserId) {
        try {
          await notifyAppointmentRescheduled(supabase, patientAuthUserId, {
            old_date: formatDateForNotification(oldScheduledAt),
            new_date: formatDateForNotification(proposedAt),
            new_time: formatTimeForNotification(proposedAt),
          });
        } catch (notifError) {
          console.error('Error sending reschedule notification:', notifError);
        }
      }

      return NextResponse.json(
        { message: 'Nouvel horaire proposé', appointment: updated },
        { status: 200 }
      );
    }

    return apiResponse.error('Action non reconnue', 400);
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/protected/nutritionist/appointments/[id]/respond:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
