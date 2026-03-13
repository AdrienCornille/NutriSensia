import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createMealFeedbackSchema } from '@/lib/api-schemas';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mealId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, mealId } = await params;
    if (!patientProfileId || !mealId) {
      return apiResponse.error('ID patient et ID repas requis', 400);
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

    // Verify the meal belongs to the patient
    const { data: meal } = await (supabase as any)
      .from('meals')
      .select('id')
      .eq('id', mealId)
      .eq('patient_id', patient.user_id)
      .single();

    if (!meal) {
      return apiResponse.notFound('Repas introuvable');
    }

    // Validate request body
    const body = await req.json();
    const parsed = createMealFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0]?.message || 'Donnees invalides', 400);
    }

    const { comment, feedback_type } = parsed.data;

    // Insert feedback
    const { data: feedback, error: insertError } = await (supabase as any)
      .from('meal_feedback')
      .insert({
        meal_id: mealId,
        nutritionist_id: auth.user.id,
        comment,
        feedback_type,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting meal feedback:', insertError);
      return apiResponse.serverError("Erreur lors de l'ajout du feedback");
    }

    return apiResponse.success(feedback, 201);
  } catch (error) {
    console.error('Unexpected error in meal feedback POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mealId: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId, mealId } = await params;
    if (!patientProfileId || !mealId) {
      return apiResponse.error('ID patient et ID repas requis', 400);
    }

    // Get feedbackId from query params
    const { searchParams } = new URL(req.url);
    const feedbackId = searchParams.get('feedbackId');

    if (!feedbackId) {
      return apiResponse.error('ID feedback requis (query param feedbackId)', 400);
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

    // Verify the feedback belongs to the nutritionist
    const { data: feedback } = await (supabase as any)
      .from('meal_feedback')
      .select('id, nutritionist_id')
      .eq('id', feedbackId)
      .eq('meal_id', mealId)
      .eq('nutritionist_id', auth.user.id)
      .single();

    if (!feedback) {
      return apiResponse.notFound('Feedback introuvable ou non autorise');
    }

    // Delete feedback
    const { error: deleteError } = await (supabase as any)
      .from('meal_feedback')
      .delete()
      .eq('id', feedbackId);

    if (deleteError) {
      console.error('Error deleting meal feedback:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression du feedback');
    }

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error in meal feedback DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
