/**
 * API Route: /api/protected/nutritionist/consultation-types
 * Gestion des types de consultation du nutritionniste
 *
 * GET - Récupérer tous les types de consultation du nutritionniste connecté
 * POST - Créer un nouveau type de consultation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createConsultationTypeSchema } from '@/lib/api-schemas';

export async function GET() {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Créer client Supabase
    const supabase = await createClient();

    // 3. Récupérer le profil nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: nutritionistProfile, error: profileError } = await (
      supabase as any
    )
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // 4. Récupérer les types de consultation du nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: consultationTypes, error: queryError } = await (
      supabase as any
    )
      .from('consultation_types')
      .select('*')
      .eq('nutritionist_id', nutritionistProfile.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (queryError) {
      console.error('Error fetching consultation types:', queryError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des types de consultation'
      );
    }

    return NextResponse.json(
      {
        consultationTypes: consultationTypes || [],
        total: consultationTypes?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/nutritionist/consultation-types:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser et valider le body
    const body = await req.json();
    const validationResult = createConsultationTypeSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map(issue => issue.message)
        .join(', ');
      return apiResponse.error(errorMessages || 'Données invalides', 400);
    }

    const data = validationResult.data;

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Récupérer le profil nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: nutritionistProfile, error: profileError } = await (
      supabase as any
    )
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (profileError || !nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // 5. Vérifier que le code n'existe pas déjà pour ce nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingType } = await (supabase as any)
      .from('consultation_types')
      .select('id')
      .eq('nutritionist_id', nutritionistProfile.id)
      .eq('code', data.code)
      .single();

    if (existingType) {
      return apiResponse.error(
        `Un type de consultation avec le code "${data.code}" existe déjà`,
        400
      );
    }

    // 6. Récupérer le sort_order max pour ce nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: maxSortOrder } = await (supabase as any)
      .from('consultation_types')
      .select('sort_order')
      .eq('nutritionist_id', nutritionistProfile.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = (maxSortOrder?.sort_order || 0) + 1;

    // 7. Créer le type de consultation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newType, error: insertError } = await (supabase as any)
      .from('consultation_types')
      .insert({
        nutritionist_id: nutritionistProfile.id,
        code: data.code,
        name_fr: data.name_fr,
        description_fr: data.description_fr || null,
        default_duration: data.default_duration,
        default_price: data.default_price,
        visio_available: data.visio_available ?? true,
        cabinet_available: data.cabinet_available ?? true,
        sort_order: nextSortOrder,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating consultation type:', insertError);
      return apiResponse.serverError(
        'Erreur lors de la création du type de consultation'
      );
    }

    return NextResponse.json(
      {
        message: 'Type de consultation créé avec succès',
        consultationType: newType,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/protected/nutritionist/consultation-types:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
