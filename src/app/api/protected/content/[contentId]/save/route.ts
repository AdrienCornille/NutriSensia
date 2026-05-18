import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * POST /api/protected/content/[contentId]/save
 * Toggle save (bookmark) on a published content for the authenticated patient.
 * If already saved, removes the save. If not saved, adds a save.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Get patient profile to verify nutritionist relationship
    const { data: patientProfile } = await s
      .from('patient_profiles')
      .select('id, nutritionist_id')
      .eq('user_id', auth.user.id)
      .single();

    if (!patientProfile || !patientProfile.nutritionist_id) {
      return apiResponse.error('Profil patient introuvable', 404);
    }

    // Verify content exists, is published, and belongs to patient's nutritionist
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', patientProfile.nutritionist_id)
      .eq('status', 'published')
      .single();

    if (!content) {
      return apiResponse.error('Contenu introuvable', 404);
    }

    // Check if already saved
    const { data: existingSave } = await s
      .from('content_saves')
      .select('id')
      .eq('content_id', contentId)
      .eq('user_id', auth.user.id)
      .maybeSingle();

    if (existingSave) {
      // Unsave
      const { error: deleteError } = await s
        .from('content_saves')
        .delete()
        .eq('id', existingSave.id);

      if (deleteError) {
        console.error('Error removing save:', deleteError);
        return apiResponse.serverError(
          'Erreur lors du retrait de la sauvegarde'
        );
      }

      return apiResponse.success({ saved: false });
    } else {
      // Save
      const { error: insertError } = await s.from('content_saves').insert({
        content_id: contentId,
        user_id: auth.user.id,
      });

      if (insertError) {
        console.error('Error adding save:', insertError);
        return apiResponse.serverError(
          "Erreur lors de l'ajout de la sauvegarde"
        );
      }

      return apiResponse.success({ saved: true });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
