/**
 * API Route: /api/protected/appointments
 * Module 3.1 - Agenda (Rendez-vous)
 *
 * GET  - Récupérer les rendez-vous (avec filtres)
 * POST - Créer un nouveau rendez-vous
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createAppointmentSchema } from '@/lib/api-schemas';
import { z } from 'zod';
import {
  notifyAppointmentConfirmed,
  formatDateForNotification,
  formatTimeForNotification,
} from '@/lib/notifications';

// ============================================================================
// GET - Récupérer les rendez-vous
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser les query params
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'upcoming' | 'past' | 'all'
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Récupérer le patient_profiles.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile, error: profileError } = await (supabase as any)
      .from('patient_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !patientProfile) {
      console.error('Error finding patient profile for user_id:', auth.user.id, 'Error:', profileError);
      return apiResponse.error(`Profil patient non trouvé: ${profileError?.message || 'aucun profil'}`, 404);
    }

    // Note: appointments.user_id référence patient_profiles.id (pas auth.users.id)
    const patientProfileId = patientProfile.id;

    // 5. Construire la requête avec jointures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
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
      .eq('user_id', patientProfileId);

    // 6. Appliquer les filtres
    const now = new Date().toISOString();

    if (filter === 'upcoming') {
      query = query
        .gte('scheduled_at', now)
        .not('status', 'in', '("cancelled","no_show")')
        .order('scheduled_at', { ascending: true });
    } else if (filter === 'past') {
      query = query
        .or(`scheduled_at.lt.${now},status.eq.completed`)
        .order('scheduled_at', { ascending: false });
    } else {
      // 'all' - tous les RDV triés par date décroissante
      query = query.order('scheduled_at', { ascending: false });
    }

    // 7. Pagination
    query = query.range(offset, offset + limit - 1);

    // 8. Exécuter la requête
    const { data: appointments, error: queryError, count } = await query;

    if (queryError) {
      console.error('Error fetching appointments:', JSON.stringify(queryError, null, 2));
      console.error('Query details - patientProfileId:', patientProfileId, 'filter:', filter, 'now:', now);
      return apiResponse.serverError(`Erreur DB: ${queryError.message || 'Erreur lors de la récupération des rendez-vous'}`);
    }

    // 9. Compter les RDV à venir et passés pour les statistiques
    const { count: upcomingCount } = await (supabase as any)
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', patientProfileId)
      .gte('scheduled_at', now)
      .not('status', 'in', '("cancelled","no_show")');

    const { count: pastCount } = await (supabase as any)
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', patientProfileId)
      .lt('scheduled_at', now);

    return NextResponse.json(
      {
        appointments: appointments || [],
        total: count || appointments?.length || 0,
        upcoming_count: upcomingCount || 0,
        past_count: pastCount || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/appointments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur inconnue';
    return apiResponse.serverError(`Erreur: ${errorMessage}`);
  }
}

// ============================================================================
// POST - Créer un rendez-vous
// ============================================================================

export async function POST(req: NextRequest) {
  try {
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
      validatedData = createAppointmentSchema.parse(body);
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

    // 4. Récupérer le patient_id depuis patient_profiles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile, error: profileError } = await (supabase as any)
      .from('patient_profiles')
      .select('id, nutritionist_id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !patientProfile) {
      console.error('Error finding patient profile:', profileError);
      return apiResponse.error('Profil patient non trouvé', 404);
    }

    // Déterminer le nutritionist_id à utiliser
    // Si non fourni dans la requête, utiliser celui assigné au patient
    const nutritionistId = validatedData.nutritionist_id || patientProfile.nutritionist_id;

    if (!nutritionistId) {
      return apiResponse.error(
        'Aucun nutritionniste assigné. Veuillez contacter le support.',
        400
      );
    }

    // 5. Récupérer les infos du type de consultation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: consultationType, error: typeError } = await (supabase as any)
      .from('consultation_types')
      .select('id, code, default_duration, default_price')
      .eq('id', validatedData.consultation_type_id)
      .eq('is_active', true)
      .single();

    if (typeError || !consultationType) {
      console.error('Error finding consultation type:', typeError);
      return apiResponse.error('Type de consultation non trouvé', 400);
    }

    // 6. Calculer scheduled_end_at
    const scheduledAt = new Date(validatedData.scheduled_at);
    const scheduledEndAt = new Date(
      scheduledAt.getTime() + consultationType.default_duration * 60 * 1000
    );

    // 7. Vérifier que le créneau est disponible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conflicts } = await (supabase as any)
      .from('appointments')
      .select('id')
      .eq('nutritionist_id', nutritionistId)
      .not('status', 'in', '("cancelled","no_show")')
      .lt('scheduled_at', scheduledEndAt.toISOString())
      .gt('scheduled_end_at', scheduledAt.toISOString());

    if (conflicts && conflicts.length > 0) {
      return apiResponse.error(
        'Ce créneau n\'est plus disponible. Veuillez en choisir un autre.',
        409
      );
    }

    // 8. Générer un lien Jitsi si mode = visio
    let visioLink: string | null = null;
    let visioRoomId: string | null = null;

    if (validatedData.mode === 'visio') {
      visioRoomId = `nutrisensia-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      visioLink = `https://meet.jit.si/${visioRoomId}`;
    }

    // 9. Insérer le rendez-vous
    // Note: user_id référence patient_profiles.id (pas auth.users.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newAppointment, error: insertError } = await (supabase as any)
      .from('appointments')
      .insert({
        user_id: patientProfile.id,    // Référence patient_profiles.id (requis par RLS)
        nutritionist_id: nutritionistId,
        consultation_type_id: consultationType.id,
        consultation_type_code: consultationType.code,
        scheduled_at: scheduledAt.toISOString(),
        scheduled_end_at: scheduledEndAt.toISOString(),
        duration: consultationType.default_duration,
        timezone: 'Europe/Zurich',
        mode: validatedData.mode,
        visio_link: visioLink,
        visio_room_id: visioRoomId,
        status: 'pending',
        patient_message: validatedData.patient_notes || null,
        price: consultationType.default_price,
        currency: 'CHF',
        booking_source: 'web',
        is_first_consultation: false, // TODO: vérifier si premier RDV
        created_by: auth.user.id,
      })
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

    if (insertError) {
      console.error('Error creating appointment:', insertError);
      return apiResponse.serverError('Erreur lors de la création du rendez-vous');
    }

    // Les rappels sont créés automatiquement par le trigger DB (trigger_create_appointment_reminders)

    // Envoyer notification de confirmation au patient
    try {
      // Récupérer le user_id du patient (pas le patient_profile.id)
      const nutritionistName = newAppointment.nutritionist?.title
        ? `${newAppointment.nutritionist.title}`
        : 'votre nutritionniste';

      await notifyAppointmentConfirmed(supabase, auth.user.id, {
        date: formatDateForNotification(scheduledAt),
        time: formatTimeForNotification(scheduledAt),
        nutritionist: nutritionistName,
      });
    } catch (notifError) {
      // Ne pas bloquer la création si la notification échoue
      console.error('Error sending appointment confirmation notification:', notifError);
    }

    // TODO: Envoyer email de confirmation (nécessite configuration email service)

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/protected/appointments:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
