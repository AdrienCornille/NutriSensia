/**
 * API Route: /api/protected/appointments/next
 * Module 3.1 - Agenda (Rendez-vous)
 * Dashboard: DASH-005 - Prochain rendez-vous
 *
 * GET - Récupérer le prochain rendez-vous du patient
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

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

    // 2. Créer client Supabase
    const supabase = await createClient();

    // 3. Récupérer le patient_profiles.id (appointments.user_id référence patient_profiles.id)
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

    const patientProfileId = patientProfile.id;

    // 4. Récupérer le prochain RDV (non annulé, dans le futur)
    const now = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: nextAppointment, error: queryError } = await (supabase as any)
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
      .eq('user_id', patientProfileId)
      .gte('scheduled_at', now)
      .in('status', ['pending', 'confirmed'])
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (queryError) {
      console.error('Error fetching next appointment:', queryError);
      return apiResponse.serverError(
        'Erreur lors de la récupération du prochain rendez-vous'
      );
    }

    // 5. Calculer le countdown si un RDV existe
    let countdownDays: number | null = null;
    if (nextAppointment) {
      const appointmentDate = new Date(nextAppointment.scheduled_at);
      const nowDate = new Date();
      const diffMs = appointmentDate.getTime() - nowDate.getTime();
      countdownDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json(
      {
        appointment: nextAppointment || null,
        countdown_days: countdownDays,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/appointments/next:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
