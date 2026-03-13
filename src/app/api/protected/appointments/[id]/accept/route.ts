/**
 * API Route: /api/protected/appointments/[id]/accept
 * Réponse du patient à une contre-proposition de rendez-vous
 *
 * POST - Accepter, refuser ou contre-proposer le nouvel horaire proposé par le nutritionniste
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { patientCounterProposalResponseSchema } from '@/lib/api-schemas';
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
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser et valider le body
    const body = await req.json();

    let validatedData;
    try {
      validatedData = patientCounterProposalResponseSchema.parse(body);
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

    // 4. Récupérer le patient_profiles.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile, error: profileError } = await (
      supabase as any
    )
      .from('patient_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !patientProfile) {
      return apiResponse.error('Profil patient non trouvé', 404);
    }

    // 5. Récupérer le rendez-vous
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: appointment, error: fetchError } = await (supabase as any)
      .from('appointments')
      .select(
        `
        *,
        nutritionist:nutritionist_profiles (
          id,
          user_id,
          title
        )
      `
      )
      .eq('id', id)
      .single();

    if (fetchError || !appointment) {
      return apiResponse.error('Rendez-vous non trouvé', 404);
    }

    // 6. Vérifier que le RDV appartient au patient
    if (appointment.user_id !== patientProfile.id) {
      return apiResponse.error('Accès non autorisé à ce rendez-vous', 403);
    }

    // 7. Vérifier que c'est bien une contre-proposition en attente
    if (
      appointment.status !== 'pending' ||
      appointment.status_reason !== 'counter_proposal'
    ) {
      return apiResponse.error(
        "Ce rendez-vous n'est pas en attente d'une réponse de votre part",
        400
      );
    }

    const now = new Date().toISOString();
    const nutritionistAuthUserId = appointment.nutritionist?.user_id;

    if (validatedData.action === 'accept') {
      // Patient accepte le nouvel horaire
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error: updateError } = await (supabase as any)
        .from('appointments')
        .update({
          status: 'confirmed',
          status_reason: null,
          status_changed_at: now,
          updated_at: now,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error accepting counter-proposal:', updateError);
        return apiResponse.serverError("Erreur lors de l'acceptation");
      }

      // Notifier le nutritionniste
      if (nutritionistAuthUserId) {
        try {
          const scheduledAt = new Date(appointment.scheduled_at);
          await notifyAppointmentConfirmed(
            supabase,
            nutritionistAuthUserId,
            {
              date: formatDateForNotification(scheduledAt),
              time: formatTimeForNotification(scheduledAt),
              nutritionist: 'le patient',
            }
          );
        } catch (notifError) {
          console.error('Error sending accept notification:', notifError);
        }
      }

      return NextResponse.json(
        { message: 'Nouvel horaire accepté', appointment: updated },
        { status: 200 }
      );
    }

    if (validatedData.action === 'decline') {
      // Patient refuse le nouvel horaire
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error: updateError } = await (supabase as any)
        .from('appointments')
        .update({
          status: 'cancelled_by_patient',
          status_reason: 'counter_proposal_declined:' + (validatedData.reason || 'Nouvel horaire refusé'),
          status_changed_at: now,
          cancelled_at: now,
          cancelled_by: auth.user.id,
          updated_at: now,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error declining counter-proposal:', updateError);
        return apiResponse.serverError('Erreur lors du refus');
      }

      // Notifier le nutritionniste
      if (nutritionistAuthUserId) {
        try {
          const scheduledAt = new Date(appointment.scheduled_at);
          await notifyAppointmentCancelled(
            supabase,
            nutritionistAuthUserId,
            {
              date: formatDateForNotification(scheduledAt),
              reason: validatedData.reason || 'Nouvel horaire refusé par le patient',
            }
          );
        } catch (notifError) {
          console.error('Error sending decline notification:', notifError);
        }
      }

      return NextResponse.json(
        { message: 'Rendez-vous annulé', appointment: updated },
        { status: 200 }
      );
    }

    if (validatedData.action === 'counter_propose') {
      // Patient propose un autre horaire
      const proposedAt = new Date(validatedData.proposed_at);
      if (isNaN(proposedAt.getTime())) {
        return apiResponse.error('Date proposée invalide', 400);
      }
      if (proposedAt <= new Date()) {
        return apiResponse.error('La date proposée doit être dans le futur', 400);
      }

      // Calculer scheduled_end_at basé sur la durée du RDV original
      const originalStart = new Date(appointment.scheduled_at);
      const originalEnd = new Date(appointment.scheduled_end_at || appointment.scheduled_at);
      const durationMs = originalEnd.getTime() - originalStart.getTime();
      const newEndAt = new Date(proposedAt.getTime() + durationMs);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error: updateError } = await (supabase as any)
        .from('appointments')
        .update({
          scheduled_at: proposedAt.toISOString(),
          scheduled_end_at: newEndAt.toISOString(),
          status: 'pending',
          status_reason: 'patient_counter_proposal',
          patient_message: validatedData.message || appointment.patient_message,
          status_changed_at: now,
          updated_at: now,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error patient counter-proposing:', updateError);
        return apiResponse.serverError('Erreur lors de la contre-proposition');
      }

      // Notifier le nutritionniste
      if (nutritionistAuthUserId) {
        try {
          const oldScheduledAt = new Date(appointment.scheduled_at);
          await notifyAppointmentRescheduled(
            supabase,
            nutritionistAuthUserId,
            {
              old_date: formatDateForNotification(oldScheduledAt),
              new_date: formatDateForNotification(proposedAt),
              new_time: formatTimeForNotification(proposedAt),
            }
          );
        } catch (notifError) {
          console.error('Error sending counter-propose notification:', notifError);
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
      'Unexpected error in POST /api/protected/appointments/[id]/accept:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
