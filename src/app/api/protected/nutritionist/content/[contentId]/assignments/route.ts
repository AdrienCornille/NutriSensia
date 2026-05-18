import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { assignContentSchema } from '@/lib/api-schemas';

// Helper: resolve nutritionist profile ID from auth user
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

/**
 * GET /api/protected/nutritionist/content/[contentId]/assignments
 * List all assignments for a content (joined with patient_profiles for name)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify ownership of the content
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();

    if (!content) {
      return apiResponse.error('Contenu introuvable', 404);
    }

    // Fetch assignments with patient info
    const { data: assignments, error: fetchError } = await s
      .from('content_assignments')
      .select(
        `
        id,
        content_id,
        patient_id,
        assigned_by,
        note,
        assigned_at,
        patient_profiles!content_assignments_patient_id_fkey (
          first_name,
          last_name
        )
      `
      )
      .eq('content_id', contentId)
      .order('assigned_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching assignments:', fetchError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des assignations'
      );
    }

    // Transform to include patient name at top level
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformed = (assignments || []).map((a: any) => ({
      id: a.id,
      content_id: a.content_id,
      patient_id: a.patient_id,
      assigned_by: a.assigned_by,
      note: a.note,
      assigned_at: a.assigned_at,
      patient_name: a.patient_profiles
        ? `${a.patient_profiles.first_name || ''} ${a.patient_profiles.last_name || ''}`.trim()
        : null,
    }));

    return apiResponse.success(transformed);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content/[contentId]/assignments
 * Assign content to one or more patients
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify ownership of the content
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();

    if (!content) {
      return apiResponse.error('Contenu introuvable', 404);
    }

    const body = await req.json();
    const parsed = assignContentSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const { patient_ids, note } = parsed.data;

    // Build assignment rows
    const rows = patient_ids.map(patientId => ({
      content_id: contentId,
      patient_id: patientId,
      assigned_by: nutritionistId,
      note: note || null,
      assigned_at: new Date().toISOString(),
    }));

    // Upsert to handle duplicates (same content + patient)
    const { data: created, error: insertError } = await s
      .from('content_assignments')
      .upsert(rows, {
        onConflict: 'content_id,patient_id',
        ignoreDuplicates: false,
      })
      .select();

    if (insertError) {
      console.error('Error creating assignments:', insertError);
      return apiResponse.serverError("Erreur lors de l'assignation du contenu");
    }

    return apiResponse.success(created, 201);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
