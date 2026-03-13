/**
 * API Route: /api/protected/nutritionist/patients/[id]/nutritional-profiles/[profileId]/activate
 * Activation d'un profil nutritionnel
 *
 * POST - Active le profil (archive les autres via DB function)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// ============================================================================
// Helpers
// ============================================================================

async function resolveNutritionistId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('nutritionist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

async function verifyPatientAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  patientProfileId: string,
  nutritionistId: string
): Promise<{ userId: string } | null> {
  const { data } = await supabase
    .from('patient_profiles')
    .select('user_id')
    .eq('id', patientProfileId)
    .eq('nutritionist_id', nutritionistId)
    .single();
  return data ? { userId: data.user_id } : null;
}

type RouteParams = { params: Promise<{ id: string; profileId: string }> };

// ============================================================================
// POST - Activer un profil
// ============================================================================

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, profileId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const patientAccess = await verifyPatientAccess(
      s,
      patientProfileId,
      nutritionistId
    );
    if (!patientAccess) {
      return apiResponse.error('Patient introuvable ou acces non autorise', 403);
    }

    // Use DB function to activate the profile (archives others atomically)
    const { data, error: rpcError } = await s.rpc('activate_nutritional_profile', {
      p_profile_id: profileId,
      p_nutritionist_id: nutritionistId,
    });

    if (rpcError) {
      console.error('Error activating nutritional profile:', rpcError);
      return apiResponse.serverError("Erreur lors de l'activation du profil");
    }

    // Notify patient that a nutritional profile has been activated
    try {
      await s.rpc('create_notification', {
        p_user_id: patientAccess.userId,
        p_type_code: 'nutritional_profile_activated',
        p_data: {
          profile_id: profileId,
        },
      });
    } catch (notifError) {
      console.error('Non-blocking notification error:', notifError);
    }

    return apiResponse.success({ activated: true, profile_id: profileId, result: data });
  } catch (error) {
    console.error('Unexpected error in nutritional profile activate POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
