import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/content/categories
 * Returns custom content categories created by the patient's nutritionist.
 */
export async function GET() {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Get patient's nutritionist
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('id, nutritionist_id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile || !patientProfile.nutritionist_id) {
      return apiResponse.error('Profil patient introuvable', 404);
    }

    const { data: categories, error } = await s
      .from('custom_content_categories')
      .select('id, name, color')
      .eq('nutritionist_id', patientProfile.nutritionist_id)
      .order('name');

    if (error) {
      console.error('Error fetching custom categories:', error);
      return apiResponse.serverError(
        'Erreur lors du chargement des catégories'
      );
    }

    return apiResponse.success({ categories: categories || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
