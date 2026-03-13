/**
 * API Route: /api/protected/nutritionist/appointments/[id]/relancer
 * Envoyer un message au patient pour l'inviter à reprendre rendez-vous
 * après un refus de contre-proposition
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createNotification } from '@/lib/notifications';

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

    // 1. Authentification nutritionniste
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser le body
    const body = await req.json();
    const messageContent = body.message_content;

    if (!messageContent || typeof messageContent !== 'string' || messageContent.trim().length < 5) {
      return apiResponse.error('Le message doit contenir au moins 5 caractères', 400);
    }

    // 3. Créer client Supabase
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // 4. Récupérer le nutritionist_profiles.id
    const { data: nutritionistProfile, error: profileError } = await s
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste non trouvé', 404);
    }

    // 5. Récupérer le rendez-vous
    const { data: appointment, error: fetchError } = await s
      .from('appointments')
      .select('id, user_id, nutritionist_id, status, status_reason')
      .eq('id', id)
      .single();

    if (fetchError || !appointment) {
      return apiResponse.error('Rendez-vous non trouvé', 404);
    }

    // 6. Vérifications
    if (appointment.nutritionist_id !== nutritionistProfile.id) {
      return apiResponse.error('Accès non autorisé à ce rendez-vous', 403);
    }

    if (appointment.status !== 'cancelled_by_patient') {
      return apiResponse.error('Ce rendez-vous ne peut pas être relancé', 400);
    }

    // 7. Récupérer le user_id du patient (pour la conversation et notification)
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('user_id')
      .eq('id', appointment.user_id)
      .single();

    if (!patientProfile?.user_id) {
      return apiResponse.error('Profil patient non trouvé', 404);
    }

    // 8. Envoyer le message via la messagerie
    const { data: conversationId, error: convError } = await s.rpc(
      'get_or_create_conversation',
      {
        p_patient_id: patientProfile.user_id,
        p_nutritionist_id: auth.user.id,
      }
    );

    if (convError) {
      console.error('Error getting/creating conversation:', convError);
      return apiResponse.serverError('Erreur lors de la création de la conversation');
    }

    if (conversationId) {
      const { error: msgError } = await s.rpc('send_message', {
        p_conversation_id: conversationId,
        p_sender_id: auth.user.id,
        p_content: messageContent.trim(),
        p_message_type: 'text',
        p_plan_modification: null,
      });

      if (msgError) {
        console.error('Error sending relancer message:', msgError);
        return apiResponse.serverError("Erreur lors de l'envoi du message");
      }
    }

    // 9. Créer notification pour le patient
    await createNotification(
      supabase,
      patientProfile.user_id,
      'appointment_rescheduled',
      {
        message: messageContent.trim(),
      }
    );

    return NextResponse.json(
      { success: true, message: 'Message envoyé au patient' },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/protected/nutritionist/appointments/[id]/relancer:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
