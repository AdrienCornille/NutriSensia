/**
 * API Route: /api/protected/appointments/[id]/ics
 * Module 3.1 - Agenda (Rendez-vous)
 *
 * GET - Télécharger le fichier .ics pour ajouter le RDV au calendrier
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import {
  generateICSContent,
  generateICSFilename,
  createICSEventFromAppointment,
} from '@/lib/calendar';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      console.log('[ICS] Auth error:', auth.error);
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    console.log('[ICS] User authenticated:', auth.user.id);

    // 2. Récupérer l'ID du rendez-vous
    const { id: appointmentId } = await params;
    console.log('[ICS] Appointment ID:', appointmentId);

    if (!appointmentId) {
      return apiResponse.error('ID du rendez-vous requis', 400);
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Récupérer le patient_profile.id (car appointments.user_id = patient_profiles.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile, error: profileError } = await (supabase as any)
      .from('patient_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !patientProfile) {
      console.log('[ICS] Patient profile error:', profileError);
      return apiResponse.error('Profil patient non trouvé', 404);
    }

    console.log('[ICS] Patient profile ID:', patientProfile.id);

    // 5. Récupérer le rendez-vous avec les infos nécessaires
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: appointment, error: appointmentError } = await (supabase as any)
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        scheduled_end_at,
        duration,
        consultation_type_code,
        mode,
        visio_link,
        patient_message,
        nutritionist:nutritionist_profiles (
          id,
          user_id
        )
      `)
      .eq('id', appointmentId)
      .eq('user_id', patientProfile.id)
      .single();

    if (appointmentError || !appointment) {
      console.log('[ICS] Appointment error:', appointmentError);
      console.log('[ICS] Query params - appointmentId:', appointmentId, 'user_id (patient_profile.id):', patientProfile.id);
      return apiResponse.error('Rendez-vous non trouvé', 404);
    }

    console.log('[ICS] Appointment found:', appointment.id);

    // 6. Récupérer les infos du nutritionniste
    let nutritionistInfo = null;
    if (appointment.nutritionist?.user_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: nutProfile } = await (supabase as any)
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', appointment.nutritionist.user_id)
        .single();
      nutritionistInfo = nutProfile;
    }

    // 7. Récupérer les infos du patient
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientInfo } = await (supabase as any)
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', auth.user.id)
      .single();

    // 8. Générer le fichier .ics
    const locale = req.headers.get('accept-language')?.startsWith('en') ? 'en' : 'fr';

    const icsEventData = createICSEventFromAppointment(
      {
        ...appointment,
        nutritionist: nutritionistInfo,
        patient: patientInfo,
      },
      locale
    );

    const icsContent = generateICSContent(icsEventData);
    const filename = generateICSFilename(icsEventData.title, icsEventData.startDate);

    // 9. Retourner le fichier .ics
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating ICS file:', error);
    return apiResponse.serverError('Erreur lors de la génération du fichier calendrier');
  }
}
