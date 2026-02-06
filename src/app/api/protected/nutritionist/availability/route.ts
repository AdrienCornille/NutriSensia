/**
 * API Route: /api/protected/nutritionist/availability
 * Gestion des disponibilités du nutritionniste
 *
 * GET - Récupérer toutes les disponibilités du nutritionniste connecté
 * POST - Créer une nouvelle disponibilité
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createAvailabilitySchema } from '@/lib/api-schemas';

export async function GET(req: NextRequest) {
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

    // 4. Récupérer les query params pour filtrage
    const { searchParams } = new URL(req.url);
    const availabilityType = searchParams.get('type');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    // 5. Construire la requête
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('nutritionist_availability')
      .select('*')
      .eq('nutritionist_id', nutritionistProfile.id)
      .order('day_of_week', { ascending: true, nullsFirst: false })
      .order('start_time', { ascending: true });

    if (availabilityType) {
      query = query.eq('availability_type', availabilityType);
    }

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: availabilities, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching availabilities:', queryError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des disponibilités'
      );
    }

    // 6. Grouper par type pour faciliter l'affichage
    const grouped = {
      recurring:
        availabilities?.filter(
          (a: { availability_type: string }) =>
            a.availability_type === 'recurring'
        ) || [],
      exceptions:
        availabilities?.filter(
          (a: { availability_type: string }) =>
            a.availability_type === 'exception'
        ) || [],
      blocked:
        availabilities?.filter(
          (a: { availability_type: string }) =>
            a.availability_type === 'blocked'
        ) || [],
    };

    return NextResponse.json(
      {
        availabilities: availabilities || [],
        grouped,
        total: availabilities?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/nutritionist/availability:',
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
    const validationResult = createAvailabilitySchema.safeParse(body);

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

    // 5. Vérifier les chevauchements pour les créneaux récurrents
    if (data.availability_type === 'recurring') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingSlots } = await (supabase as any)
        .from('nutritionist_availability')
        .select('*')
        .eq('nutritionist_id', nutritionistProfile.id)
        .eq('availability_type', 'recurring')
        .eq('day_of_week', data.day_of_week)
        .eq('is_active', true);

      if (existingSlots && existingSlots.length > 0) {
        // Vérifier les chevauchements de plages horaires
        const [newStartH, newStartM] = data.start_time.split(':').map(Number);
        const [newEndH, newEndM] = data.end_time.split(':').map(Number);
        const newStart = newStartH * 60 + newStartM;
        const newEnd = newEndH * 60 + newEndM;

        for (const slot of existingSlots) {
          const [existStartH, existStartM] = slot.start_time
            .split(':')
            .map(Number);
          const [existEndH, existEndM] = slot.end_time.split(':').map(Number);
          const existStart = existStartH * 60 + existStartM;
          const existEnd = existEndH * 60 + existEndM;

          // Vérifier le chevauchement
          if (newStart < existEnd && newEnd > existStart) {
            return apiResponse.error(
              `Chevauchement avec un créneau existant (${slot.start_time}-${slot.end_time})`,
              400
            );
          }
        }
      }
    }

    // 6. Créer la disponibilité
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newAvailability, error: insertError } = await (
      supabase as any
    )
      .from('nutritionist_availability')
      .insert({
        nutritionist_id: nutritionistProfile.id,
        availability_type: data.availability_type,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        specific_date: data.specific_date,
        visio_available: data.visio_available,
        cabinet_available: data.cabinet_available,
        consultation_type_id: data.consultation_type_id || null,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        notes: data.notes,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating availability:', insertError);
      return apiResponse.serverError(
        'Erreur lors de la création de la disponibilité'
      );
    }

    return NextResponse.json(
      {
        message: 'Disponibilité créée avec succès',
        availability: newAvailability,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/protected/nutritionist/availability:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
