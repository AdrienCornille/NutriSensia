import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createQuestionnaireSchema } from '@/lib/api-schemas';

export async function GET(
  _req: NextRequest,
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

    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    const { data: questionnaires, error: qError } = await (supabase as any)
      .from('follow_up_questionnaires')
      .select('*')
      .eq('patient_id', patient.user_id)
      .order('created_at', { ascending: false });

    if (qError) {
      console.error('Error fetching questionnaires:', qError);
      return apiResponse.serverError('Erreur lors de la récupération');
    }

    return apiResponse.success(questionnaires || []);
  } catch (error) {
    console.error('Unexpected error in questionnaires GET:', error);
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

    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    const body = await req.json();
    const parsed = createQuestionnaireSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.errors[0].message, 400);
    }

    const { title, questionnaire_type, due_date, questions, consultation_id } =
      parsed.data;

    const { data: newQ, error: insertError } = await (supabase as any)
      .from('follow_up_questionnaires')
      .insert({
        patient_id: patient.user_id,
        title,
        questionnaire_type,
        status: 'pending',
        due_date: due_date || null,
        questions,
        answers: null,
        consultation_id: consultation_id || null,
      })
      .select('id, title, status, created_at')
      .single();

    if (insertError) {
      console.error('Error creating questionnaire:', insertError);
      return apiResponse.serverError('Erreur lors de la création');
    }

    return apiResponse.success(newQ, 201);
  } catch (error) {
    console.error('Unexpected error in questionnaires POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
