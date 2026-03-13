/**
 * API Route: /api/protected/nutritionist/appointments/[id]/status
 * Marquage du statut post-RDV par le nutritionniste (AGENDA-N-011)
 *
 * POST - Marquer un rendez-vous passé comme effectué ou absence
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { postAppointmentStatusSchema } from '@/lib/api-schemas';
import { z } from 'zod';
import {
  createNotification,
  formatDateForNotification,
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
      validatedData = postAppointmentStatusSchema.parse(body);
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

    // 4. Récupérer le nutritionist_profiles.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: nutritionistProfile, error: profileError } = await (
      supabase as any
    )
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste non trouvé', 404);
    }

    // 5. Récupérer le rendez-vous
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: appointment, error: fetchError } = await (supabase as any)
      .from('appointments')
      .select(
        `
        *,
        consultation_type:consultation_types (
          id,
          code,
          default_duration,
          default_price
        )
      `
      )
      .eq('id', id)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (fetchError || !appointment) {
      return apiResponse.error('Rendez-vous non trouvé', 404);
    }

    // 6. Vérifier que le RDV est éligible : statut = confirmed uniquement
    if (appointment.status !== 'confirmed') {
      return apiResponse.error(
        `Ce rendez-vous ne peut pas être marqué (statut: ${appointment.status})`,
        400
      );
    }

    // 7. Vérifier que le RDV est passé (scheduled_end_at < now)
    const now = new Date();
    const scheduledEndAt = new Date(appointment.scheduled_end_at);
    if (scheduledEndAt >= now) {
      return apiResponse.error(
        'Ce rendez-vous n\'est pas encore terminé',
        400
      );
    }

    const nowISO = now.toISOString();

    // 8. Traiter selon l'action
    if (validatedData.action === 'completed') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error: updateError } = await (supabase as any)
        .from('appointments')
        .update({
          status: 'completed',
          status_reason: validatedData.notes || null,
          status_changed_at: nowISO,
          updated_at: nowISO,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error marking appointment as completed:', updateError);
        return apiResponse.serverError('Erreur lors du marquage');
      }

      return NextResponse.json(
        {
          message: 'Rendez-vous marqué comme effectué',
          appointment: updated,
          suggest_consultation_report: true,
        },
        { status: 200 }
      );
    }

    if (validatedData.action === 'no_show') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error: updateError } = await (supabase as any)
        .from('appointments')
        .update({
          status: 'no_show',
          status_reason: validatedData.notes || null,
          status_changed_at: nowISO,
          updated_at: nowISO,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error marking appointment as no_show:', updateError);
        return apiResponse.serverError('Erreur lors du marquage');
      }

      // Envoyer notification + message dans la messagerie si demandé
      if (validatedData.send_message) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const s = supabase as any;

          // Récupérer profil patient (user_id + gender)
          const { data: patientProfile } = await s
            .from('patient_profiles')
            .select('user_id, gender')
            .eq('id', appointment.user_id)
            .single();

          if (patientProfile?.user_id) {
            const scheduledAt = new Date(appointment.scheduled_at);

            // Le message est construit côté frontend (PostAppointmentStatusModal)
            const messageText = validatedData.message_content || '';

            // 1. Notification in-app
            await createNotification(
              supabase,
              patientProfile.user_id,
              'appointment_no_show',
              {
                date: formatDateForNotification(scheduledAt),
                message: messageText,
              }
            );

            // 2. Message dans la messagerie
            // Récupérer ou créer la conversation nutritionniste <-> patient
            const { data: conversationId, error: convError } = await s.rpc(
              'get_or_create_conversation',
              {
                p_patient_id: patientProfile.user_id,
                p_nutritionist_id: auth.user.id,
              }
            );

            if (!convError && conversationId) {
              // Envoyer le message via la RPC send_message
              const { error: msgError } = await s.rpc('send_message', {
                p_conversation_id: conversationId,
                p_sender_id: auth.user.id,
                p_content: messageText,
                p_message_type: 'text',
                p_plan_modification: null,
              });

              if (msgError) {
                console.error('Error sending no_show message:', msgError);
              }
            } else if (convError) {
              console.error('Error getting/creating conversation:', convError);
            }
          }
        } catch (notifError) {
          console.error('Error sending no_show notification/message:', notifError);
        }
      }

      return NextResponse.json(
        {
          message: 'Rendez-vous marqué comme absence',
          appointment: updated,
        },
        { status: 200 }
      );
    }

    return apiResponse.error('Action non reconnue', 400);
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/protected/nutritionist/appointments/[id]/status:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
