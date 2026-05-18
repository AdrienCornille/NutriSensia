import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/protected/nutritionist/recipes/upload-thumbnail
 * Upload a recipe thumbnail image to Supabase Storage
 */
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

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return apiResponse.error(
        "Type d'image non supporté (JPEG, PNG, WebP uniquement)",
        400
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return apiResponse.error('Image trop volumineuse (max 5 Mo)', 413);
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const { data: profile } = await s
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!profile) {
      return apiResponse.forbidden('Profil nutritionniste introuvable');
    }

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const storagePath = `${profile.id}/recipes/${timestamp}.${ext}`;

    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await s.storage
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

    const { data: urlData } = s.storage
      .from('content-thumbnails')
      .getPublicUrl(storagePath);

    return apiResponse.success({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Upload recipe thumbnail error:', error);
    return apiResponse.serverError("Erreur lors de l'upload");
  }
}
