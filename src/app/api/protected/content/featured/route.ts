import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * GET /api/protected/content/featured
 * Returns featured published content from the patient's nutritionist.
 * Content must have is_featured=true and status='published'.
 * Ordered by featured_order ascending (max 3).
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

    // Fetch featured published content from the patient's nutritionist
    const { data: featured, error: fetchError } = await s
      .from('educational_contents')
      .select('*')
      .eq('nutritionist_id', patientProfile.nutritionist_id)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('featured_order', { ascending: true })
      .limit(3);

    if (fetchError) {
      console.error('Error fetching featured content:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la recuperation des contenus mis en avant'
      );
    }

    return apiResponse.success({ featured: featured || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
