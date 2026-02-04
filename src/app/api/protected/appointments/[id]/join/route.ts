/**
 * API Route: /api/protected/appointments/[id]/join
 * Module 3.1 - Agenda (Rendez-vous)
 * AGENDA-009: Rejoindre une visioconférence
 *
 * GET - Obtenir le lien de visioconférence si autorisé
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

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

    // 3. Récupérer le patient_profiles.id
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

    // 4. Récupérer le rendez-vous
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: appointment, error: queryError } = await (supabase as any)
      .from('appointments')
      .select(
        `
        id,
        user_id,
        scheduled_at,
        scheduled_end_at,
        mode,
        status,
        visio_link,
        visio_room_id,
        nutritionist:nutritionist_profiles (
          id,
          title,
          cabinet_name
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

    // 6. Vérifier que c'est une visio
    if (appointment.mode !== 'visio') {
      return NextResponse.json(
        {
          can_join: false,
          message: 'Ce rendez-vous n\'est pas en visioconférence',
          mode: appointment.mode,
        },
        { status: 200 }
      );
    }

    // 7. Vérifier le statut du RDV
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return NextResponse.json(
        {
          can_join: false,
          message: `Ce rendez-vous est ${appointment.status === 'completed' ? 'terminé' : 'annulé'}`,
          status: appointment.status,
        },
        { status: 200 }
      );
    }

    // 8. Vérifier la fenêtre de temps
    const now = new Date();
    const scheduledAt = new Date(appointment.scheduled_at);
    const scheduledEndAt = new Date(appointment.scheduled_end_at);

    // Fenêtre: 15 minutes avant jusqu'à 30 minutes après la fin
    const windowStart = new Date(scheduledAt.getTime() - 15 * 60 * 1000);
    const windowEnd = new Date(scheduledEndAt.getTime() + 30 * 60 * 1000);

    if (now < windowStart) {
      const minutesUntilOpen = Math.ceil(
        (windowStart.getTime() - now.getTime()) / (1000 * 60)
      );
      const hoursUntilOpen = Math.floor(minutesUntilOpen / 60);
      const remainingMinutes = minutesUntilOpen % 60;

      let timeMessage: string;
      if (hoursUntilOpen > 0) {
        timeMessage = `${hoursUntilOpen}h${remainingMinutes > 0 ? remainingMinutes : ''}`;
      } else {
        timeMessage = `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
      }

      return NextResponse.json(
        {
          can_join: false,
          message: `La salle de visio ouvrira dans ${timeMessage} (15 minutes avant le rendez-vous)`,
          scheduled_at: appointment.scheduled_at,
          window_opens_at: windowStart.toISOString(),
        },
        { status: 200 }
      );
    }

    if (now > windowEnd) {
      return NextResponse.json(
        {
          can_join: false,
          message: 'La fenêtre pour rejoindre ce rendez-vous est terminée',
          scheduled_end_at: appointment.scheduled_end_at,
          window_closed_at: windowEnd.toISOString(),
        },
        { status: 200 }
      );
    }

    // 9. Vérifier que le lien visio existe
    if (!appointment.visio_link) {
      // Générer un lien si manquant (cas de migration)
      const visioRoomId = `nutrisensia-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const visioLink = `https://meet.jit.si/${visioRoomId}`;

      // Mettre à jour le RDV
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('appointments')
        .update({
          visio_link: visioLink,
          visio_room_id: visioRoomId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      return NextResponse.json(
        {
          can_join: true,
          video_link: visioLink,
          room_id: visioRoomId,
          message: 'Vous pouvez rejoindre la visioconférence',
          scheduled_at: appointment.scheduled_at,
          scheduled_end_at: appointment.scheduled_end_at,
          nutritionist: appointment.nutritionist,
        },
        { status: 200 }
      );
    }

    // 10. Retourner le lien visio
    return NextResponse.json(
      {
        can_join: true,
        video_link: appointment.visio_link,
        room_id: appointment.visio_room_id,
        message: 'Vous pouvez rejoindre la visioconférence',
        scheduled_at: appointment.scheduled_at,
        scheduled_end_at: appointment.scheduled_end_at,
        nutritionist: appointment.nutritionist,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/appointments/[id]/join:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
