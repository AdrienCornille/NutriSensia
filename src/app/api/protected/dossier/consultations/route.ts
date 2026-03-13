import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/dossier/consultations
 * Patient-side: returns only finalized consultations (no drafts, no private_notes)
 */
export async function GET() {
  try {
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    const userId = auth.user.id;

    // Fetch only finalized consultations for this patient
    // Exclude private_notes — select specific columns
    const { data: consultations, error } = await (supabase as any)
      .from('consultations')
      .select(
        'id, date, start_time, duration_minutes, consultation_type, mode, summary, key_points, next_steps, created_at'
      )
      .eq('patient_id', userId)
      .eq('status', 'final')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching patient consultations:', error);
      return apiResponse.serverError(
        'Erreur lors de la récupération des consultations'
      );
    }

    return apiResponse.success(consultations || []);
  } catch (error) {
    console.error('Unexpected error in patient consultations GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
