/**
 * API Route: /api/protected/nutritionist/content/upload-pdf
 * Upload d'un guide PDF pour un contenu éducatif
 *
 * POST - Upload un PDF et retourne l'URL signée
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return apiResponse.error('FormData invalide', 400);
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return apiResponse.error('Fichier requis', 400);
    }

    if (file.type !== 'application/pdf') {
      return apiResponse.error('Seuls les fichiers PDF sont acceptés', 400);
    }

    if (file.size > MAX_PDF_SIZE) {
      return apiResponse.error('Fichier trop volumineux (max 20 MB)', 413);
    }

    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!profile) {
      return apiResponse.forbidden('Profil nutritionniste introuvable');
    }

    const timestamp = Date.now();
    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_');
    const storagePath = `${profile.id}/${timestamp}_${safeName}`;

    const fileBuffer = await file.arrayBuffer();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: uploadError } = await (supabase as any).storage
      .from('content-files')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('PDF upload error:', uploadError);
      return apiResponse.error(
        `Erreur lors de l'upload : ${uploadError.message}`,
        500
      );
    }

    // Generate a signed URL valid for 1 year (for the nutritionist to store)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: signedData, error: signError } = await (
      supabase as any
    ).storage
      .from('content-files')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    if (signError) {
      console.error('Sign URL error:', signError);
      return apiResponse.serverError("Erreur lors de la génération de l'URL");
    }

    return apiResponse.success({
      url: signedData.signedUrl,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
    });
  } catch (error) {
    console.error('Upload PDF error:', error);
    return apiResponse.serverError("Erreur lors de l'upload du PDF");
  }
}
