import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createObjectiveSchema } from '@/lib/api-schemas';

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

    const { data: objectives, error: objError } = await (supabase as any)
      .from('patient_objectives')
      .select('*')
      .eq('patient_id', patient.user_id)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (objError) {
      console.error('Error fetching objectives:', objError);
      return apiResponse.serverError('Erreur lors de la récupération');
    }

    return apiResponse.success(objectives || []);
  } catch (error) {
    console.error('Unexpected error in objectives GET:', error);
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
    const parsed = createObjectiveSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.errors[0].message, 400);
    }

    const {
      title,
      description,
      category,
      target_value,
      target_unit,
      start_value,
      start_date,
      deadline,
      priority,
    } = parsed.data;

    const { data: newObj, error: insertError } = await (supabase as any)
      .from('patient_objectives')
      .insert({
        patient_id: patient.user_id,
        created_by: auth.user.id,
        title,
        description: description || null,
        category,
        target_value: target_value || null,
        target_unit: target_unit || null,
        start_value: start_value || null,
        current_value: start_value || null,
        progress: 0,
        start_date: start_date || new Date().toISOString(),
        deadline: deadline || null,
        status: 'active',
        priority,
      })
      .select('id, title, category, status, created_at')
      .single();

    if (insertError) {
      console.error('Error creating objective:', insertError);
      return apiResponse.serverError(
        "Erreur lors de la création de l'objectif"
      );
    }

    return apiResponse.success(newObj, 201);
  } catch (error) {
    console.error('Unexpected error in objectives POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
