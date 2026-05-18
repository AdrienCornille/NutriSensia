import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createPrerequisiteSchema } from '@/lib/api-schemas';

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
 * GET /api/protected/nutritionist/content/[contentId]/prerequisites
 * List prerequisites with joined prerequisite course info
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership
    const { data: content } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    // Fetch prerequisites with joined course info
    const { data: prerequisites, error } = await s
      .from('course_prerequisites')
      .select(
        '*, prerequisite_course:educational_contents!prerequisite_course_id(id, title, status)'
      )
      .eq('course_id', contentId);

    if (error) {
      console.error('Error fetching prerequisites:', error);
      return apiResponse.serverError('Erreur lors du chargement des prérequis');
    }

    return apiResponse.success(prerequisites || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * POST /api/protected/nutritionist/content/[contentId]/prerequisites
 * Add a prerequisite to this course
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
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership
    const { data: content } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    const body = await req.json();
    const parsed = createPrerequisiteSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.validationError(parsed.error);
    }
    const data = parsed.data;

    // Prevent self-referencing prerequisite
    if (data.prerequisite_course_id === contentId) {
      return apiResponse.error(
        'Un cours ne peut pas être son propre prérequis',
        400
      );
    }

    // Verify prerequisite course exists and is a course type
    const { data: prereqCourse } = await s
      .from('educational_contents')
      .select('id, type')
      .eq('id', data.prerequisite_course_id)
      .single();

    if (!prereqCourse) {
      return apiResponse.error('Cours prérequis introuvable', 404);
    }
    if (prereqCourse.type !== 'course') {
      return apiResponse.error(
        'Le prérequis doit être un contenu de type cours',
        400
      );
    }

    // Insert prerequisite
    const { data: prerequisite, error } = await s
      .from('course_prerequisites')
      .insert({
        course_id: contentId,
        prerequisite_course_id: data.prerequisite_course_id,
        require_completion:
          data.require_completion !== undefined
            ? data.require_completion
            : true,
        require_quiz_score:
          data.require_quiz_score !== undefined
            ? data.require_quiz_score
            : false,
        min_quiz_score: data.min_quiz_score || 70,
      })
      .select(
        '*, prerequisite_course:educational_contents!prerequisite_course_id(id, title, status)'
      )
      .single();

    if (error) {
      console.error('Error creating prerequisite:', error);
      if (error.code === '23505') {
        return apiResponse.error('Ce prérequis existe déjà', 409);
      }
      return apiResponse.serverError('Erreur lors de la création du prérequis');
    }

    return apiResponse.created(prerequisite);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * DELETE /api/protected/nutritionist/content/[contentId]/prerequisites
 * Remove a prerequisite. Body: { prerequisite_course_id: string }
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });
    if (auth.error || !auth.user)
      return apiResponse.unauthorized(auth.error || 'Authentification requise');

    const { contentId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId)
      return apiResponse.error('Profil nutritionniste introuvable', 404);

    // Verify ownership
    const { data: content } = await s
      .from('educational_contents')
      .select('id')
      .eq('id', contentId)
      .eq('nutritionist_id', nutritionistId)
      .single();
    if (!content) return apiResponse.error('Contenu introuvable', 404);

    const body = await req.json();
    const { prerequisite_course_id } = body;

    if (!prerequisite_course_id) {
      return apiResponse.error('prerequisite_course_id est requis', 400);
    }

    const { error } = await s
      .from('course_prerequisites')
      .delete()
      .eq('course_id', contentId)
      .eq('prerequisite_course_id', prerequisite_course_id);

    if (error) {
      console.error('Error deleting prerequisite:', error);
      return apiResponse.serverError(
        'Erreur lors de la suppression du prérequis'
      );
    }

    return apiResponse.success({ message: 'Prérequis supprimé avec succès' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
