import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/appointments/[id]/reminders
 * Récupérer les rappels d'un rendez-vous
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error);
    }

    const appointmentId = params.id;

    const supabase = await createClient();

    // Verify the appointment belongs to the user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: appointment, error: aptError } = await (supabase as any)
      .from('appointments')
      .select('id, user_id')
      .eq('id', appointmentId)
      .single();

    if (aptError || !appointment) {
      return apiResponse.notFound('Rendez-vous non trouvé');
    }

    // Check ownership via patient_profiles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile } = await (supabase as any)
      .from('patient_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile || patientProfile.id !== appointment.user_id) {
      return apiResponse.forbidden('Ce rendez-vous ne vous appartient pas');
    }

    // Fetch reminders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: reminders, error } = await (supabase as any)
      .from('appointment_reminders')
      .select('id, reminder_type, remind_before_hours, scheduled_for, enabled, sent, sent_at')
      .eq('appointment_id', appointmentId)
      .order('remind_before_hours', { ascending: false });

    if (error) {
      return apiResponse.error(`Erreur DB: ${error.message}`, 500);
    }

    return apiResponse.success(reminders || []);
  } catch (error) {
    console.error('Error in GET /api/protected/appointments/[id]/reminders:', error);
    return apiResponse.error('Erreur serveur', 500);
  }
}

/**
 * PATCH /api/protected/appointments/[id]/reminders
 * Activer/désactiver les rappels d'un rendez-vous
 * Body: { reminders: [{ id: string, enabled: boolean }] }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error);
    }

    const appointmentId = params.id;
    const body = await req.json();

    if (!body.reminders || !Array.isArray(body.reminders)) {
      return apiResponse.error('Format invalide: { reminders: [{ id, enabled }] }');
    }

    const supabase = await createClient();

    // Verify ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: appointment } = await (supabase as any)
      .from('appointments')
      .select('id, user_id')
      .eq('id', appointmentId)
      .single();

    if (!appointment) {
      return apiResponse.notFound('Rendez-vous non trouvé');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile } = await (supabase as any)
      .from('patient_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile || patientProfile.id !== appointment.user_id) {
      return apiResponse.forbidden('Ce rendez-vous ne vous appartient pas');
    }

    // Update each reminder
    const results = [];
    for (const reminder of body.reminders) {
      if (!reminder.id || typeof reminder.enabled !== 'boolean') continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('appointment_reminders')
        .update({ enabled: reminder.enabled })
        .eq('id', reminder.id)
        .eq('appointment_id', appointmentId)
        .select()
        .single();

      if (!error && data) {
        results.push(data);
      }
    }

    return apiResponse.success(results);
  } catch (error) {
    console.error('Error in PATCH /api/protected/appointments/[id]/reminders:', error);
    return apiResponse.error('Erreur serveur', 500);
  }
}
