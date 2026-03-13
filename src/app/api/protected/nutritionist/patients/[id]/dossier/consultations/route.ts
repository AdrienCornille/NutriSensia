import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createConsultationSchema } from '@/lib/api-schemas';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId } = await params;
    if (!patientProfileId) {
      return apiResponse.error('ID patient requis', 400);
    }

    const supabase = await createClient();

    // Get nutritionist profile
    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify patient belongs to nutritionist
    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Fetch consultations and appointments in parallel
    const now = new Date().toISOString();

    const [consultationsResult, appointmentsResult] = await Promise.all([
      // Consultations (comptes-rendus)
      (supabase as any)
        .from('consultations')
        .select('*')
        .eq('patient_id', patient.user_id)
        .eq('nutritionist_id', auth.user.id)
        .order('date', { ascending: false }),

      // Appointments (RDV) for this patient
      // user_id in appointments = patient_profiles.id
      (supabase as any)
        .from('appointments')
        .select(`
          *,
          consultation_type:consultation_types (
            id, code, name_fr, default_duration, icon, color
          )
        `)
        .eq('user_id', patient.id)
        .eq('nutritionist_id', nutritionistProfile.id)
        .not(
          'status',
          'in',
          '("cancelled","cancelled_by_patient","cancelled_by_nutritionist")'
        )
        .order('scheduled_at', { ascending: false }),
    ]);

    if (consultationsResult.error) {
      console.error('Error fetching consultations:', consultationsResult.error);
      return apiResponse.serverError('Erreur lors de la récupération des consultations');
    }

    const consultations = consultationsResult.data || [];
    const appointments = appointmentsResult.data || [];

    // Separate upcoming vs past appointments
    const upcomingAppointments = appointments.filter(
      (a: { scheduled_at: string; status: string }) =>
        a.scheduled_at >= now && a.status !== 'completed' && a.status !== 'no_show'
    );

    // Past appointments that don't have a linked consultation
    const consultationAppointmentIds = new Set(
      consultations
        .map((c: { appointment_id: string | null }) => c.appointment_id)
        .filter(Boolean)
    );

    const pastAppointmentsWithoutReport = appointments.filter(
      (a: { id: string; scheduled_at: string; status: string }) =>
        (a.scheduled_at < now || a.status === 'completed') &&
        !consultationAppointmentIds.has(a.id)
    );

    return apiResponse.success({
      consultations,
      upcoming_appointments: upcomingAppointments,
      past_without_report: pastAppointmentsWithoutReport,
    });
  } catch (error) {
    console.error('Unexpected error in consultations GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId } = await params;
    if (!patientProfileId) {
      return apiResponse.error('ID patient requis', 400);
    }

    const supabase = await createClient();

    // Get nutritionist profile
    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify patient belongs to nutritionist
    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id, status')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    const body = await req.json();
    const parsed = createConsultationSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const { status: consultStatus, ...consultData } = parsed.data;

    // Create consultation
    const { data: consultation, error: createError } = await (supabase as any)
      .from('consultations')
      .insert({
        patient_id: patient.user_id,
        nutritionist_id: auth.user.id,
        status: consultStatus || 'final',
        appointment_id: consultData.appointment_id || null,
        date: consultData.date,
        start_time: consultData.start_time || null,
        duration_minutes: consultData.duration_minutes || null,
        consultation_type: consultData.consultation_type || null,
        mode: consultData.mode,
        summary: consultData.summary,
        key_points: consultData.key_points || [],
        next_steps: consultData.next_steps || null,
        private_notes: consultData.private_notes || null,
        attached_document_ids: consultData.attached_document_ids || [],
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating consultation:', createError);
      return apiResponse.serverError('Erreur lors de la création du compte-rendu');
    }

    // Link the appointment to this consultation if appointment_id is provided
    if (consultation && consultData.appointment_id) {
      await (supabase as any)
        .from('appointments')
        .update({
          consultation_id: consultation.id,
          status: 'completed',
        })
        .eq('id', consultData.appointment_id);
    }

    // Auto-activate patient on first consultation (pending → active)
    if (patient.status === 'pending') {
      await (supabase as any)
        .from('patient_profiles')
        .update({
          status: 'active',
          status_changed_at: new Date().toISOString(),
          status_reason: 'Première consultation créée',
        })
        .eq('id', patientProfileId);

      // Notifier le patient
      try {
        await (supabase as any).rpc('create_notification', {
          p_user_id: patient.user_id,
          p_type_code: 'welcome',
          p_data: {
            message: 'Votre suivi nutritionnel est maintenant actif !',
          },
        });
      } catch (notifError) {
        console.error('Error sending activation notification:', notifError);
      }
    }

    return apiResponse.success(consultation, 201);
  } catch (error) {
    console.error('Unexpected error in consultations POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
