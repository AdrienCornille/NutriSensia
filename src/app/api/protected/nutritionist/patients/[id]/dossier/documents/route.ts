import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createDocumentMetadataSchema } from '@/lib/api-schemas';

export async function GET(
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

    const url = new URL(req.url);
    const category = url.searchParams.get('category');

    let query = (supabase as any)
      .from('documents')
      .select('*')
      .eq('patient_id', patient.user_id)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: documents, error: docsError } = await query;

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return apiResponse.serverError('Erreur lors de la récupération');
    }

    return apiResponse.success(documents || []);
  } catch (error) {
    console.error('Unexpected error in documents GET:', error);
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
    const parsed = createDocumentMetadataSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.errors[0].message, 400);
    }

    const { name, category, description, consultation_id } = parsed.data;

    // Insert document metadata (file upload handled client-side via Supabase Storage)
    const { data: newDoc, error: insertError } = await (supabase as any)
      .from('documents')
      .insert({
        patient_id: patient.user_id,
        uploaded_by: auth.user.id,
        uploader_type: 'nutritionist',
        name,
        file_type: body.file_type || 'pdf',
        mime_type: body.mime_type || null,
        file_url: body.file_url || '',
        file_size: body.file_size || null,
        category,
        description: description || null,
        consultation_id: consultation_id || null,
      })
      .select('id, name, category, created_at')
      .single();

    if (insertError) {
      console.error('Error creating document:', insertError);
      return apiResponse.serverError('Erreur lors de la création');
    }

    return apiResponse.success(newDoc, 201);
  } catch (error) {
    console.error('Unexpected error in documents POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
