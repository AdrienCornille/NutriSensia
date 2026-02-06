/**
 * API Route: /api/protected/appointments/consultation-types
 * Module 3.1 - Agenda (Rendez-vous)
 *
 * GET - Récupérer les types de consultation du nutritionniste assigné au patient
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

export async function GET() {
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

    // 3. Récupérer le nutritionniste assigné au patient
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patientProfile, error: profileError } = await (
      supabase as any
    )
      .from('patient_profiles')
      .select('nutritionist_id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !patientProfile) {
      return apiResponse.error('Profil patient non trouvé', 404);
    }

    if (!patientProfile.nutritionist_id) {
      return apiResponse.error(
        'Aucun nutritionniste assigné. Veuillez contacter le support.',
        400
      );
    }

    // 4. Récupérer les types de consultation actifs du nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: consultationTypes, error: queryError } = await (
      supabase as any
    )
      .from('consultation_types')
      .select(
        `
        id,
        code,
        name_fr,
        name_en,
        description_fr,
        description_en,
        default_duration,
        default_price,
        icon,
        color,
        visio_available,
        cabinet_available,
        phone_available
      `
      )
      .eq('nutritionist_id', patientProfile.nutritionist_id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (queryError) {
      console.error('Error fetching consultation types:', queryError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des types de consultation'
      );
    }

    return NextResponse.json(consultationTypes || [], { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/appointments/consultation-types:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
