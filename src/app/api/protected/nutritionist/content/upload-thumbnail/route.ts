/**
 * API Route: /api/protected/nutritionist/content/upload-thumbnail
 * Upload d'une vignette pour un contenu éducatif
 *
 * POST - Upload une image et retourne l'URL publique
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser le FormData
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

    // 3. Valider le fichier
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return apiResponse.error(
        "Type d'image non supporté (JPEG, PNG, WebP uniquement)",
        400
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return apiResponse.error('Image trop volumineuse (max 2 MB)', 413);
    }

    // 4. Récupérer le profil nutritionniste
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

    // 5. Upload vers Supabase Storage (bucket: content-thumbnails)
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const storagePath = `${profile.id}/${timestamp}.${ext}`;

    const fileBuffer = await file.arrayBuffer();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: uploadError } = await (supabase as any).storage
      .from('content-thumbnails')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return apiResponse.error(
        `Erreur lors de l'upload : ${uploadError.message}`,
        500
      );
    }

    // 6. Obtenir l'URL publique
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: urlData } = (supabase as any).storage
      .from('content-thumbnails')
      .getPublicUrl(storagePath);

    return apiResponse.success({
      url: urlData.publicUrl,
    });
  } catch (error) {
    console.error('Upload thumbnail error:', error);
    return apiResponse.serverError("Erreur lors de l'upload");
  }
}
