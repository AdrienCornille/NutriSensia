import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createPatientNoteSchema } from '@/lib/api-schemas';

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
      .select('id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Fetch notes
    const { data: notes, error } = await (supabase as any)
      .from('patient_notes')
      .select('id, content, created_at, updated_at')
      .eq('patient_id', patientProfileId)
      .eq('nutritionist_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patient notes:', error);
      return apiResponse.serverError('Erreur lors de la récupération des notes');
    }

    return apiResponse.success(notes || []);
  } catch (error) {
    console.error('Unexpected error in patient notes GET:', error);
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
      .select('id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Validate body
    const body = await req.json();
    const parsed = createPatientNoteSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Create note
    const { data: note, error } = await (supabase as any)
      .from('patient_notes')
      .insert({
        patient_id: patientProfileId,
        nutritionist_id: auth.user.id,
        content: parsed.data.content,
      })
      .select('id, content, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error creating patient note:', error);
      return apiResponse.serverError('Erreur lors de la création de la note');
    }

    return apiResponse.success(note, 201);
  } catch (error) {
    console.error('Unexpected error in patient notes POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
