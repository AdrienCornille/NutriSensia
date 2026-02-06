/**
 * API Route: /api/protected/biometrics/activity
 * Module 2.5 - Activité physique (BIO-007)
 *
 * POST - Créer une activité
 * GET  - Récupérer les activités avec filtres
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createActivityLogSchema } from '@/lib/api-schemas';
import { z } from 'zod';

// ============================================================================
// POST - Créer une activité
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser et valider le body
    const body = await req.json();

    let validatedData;
    try {
      validatedData = createActivityLogSchema.parse(body);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const issues = error.issues || [];
        return apiResponse.error(
          'Données invalides: ' +
            issues.map((e: { message: string }) => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Récupérer l'activity_type_id à partir du slug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: activityType, error: typeError } = await (supabase as any)
      .from('activity_types')
      .select('id')
      .eq('slug', validatedData.activity_type)
      .eq('is_active', true)
      .single();

    if (typeError || !activityType) {
      console.error('Error finding activity type:', typeError);
      return apiResponse.error(
        `Type d'activité '${validatedData.activity_type}' non trouvé`,
        400
      );
    }

    const activityTypeId = (activityType as { id: string }).id;

    // 5. Préparer les données pour l'insertion
    const activityDate =
      validatedData.date || new Date().toISOString().split('T')[0];

    // 6. Insérer l'activité
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newActivity, error: insertError } = await (supabase as any)
      .from('activities')
      .insert({
        user_id: auth.user.id,
        activity_type_id: activityTypeId,
        date: activityDate,
        duration_minutes: validatedData.duration_minutes,
        intensity: validatedData.intensity,
        calories_burned: validatedData.calories_burned || null,
        notes: validatedData.notes || null,
        source: 'manual',
      })
      .select(
        `
        *,
        activity_type:activity_types (
          id,
          slug,
          name_fr,
          name_en,
          met_value,
          emoji,
          bg_color,
          text_color
        )
      `
      )
      .single();

    if (insertError) {
      console.error('Error creating activity:', insertError);
      return apiResponse.serverError(
        "Erreur lors de la création de l'activité"
      );
    }

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/protected/biometrics/activity:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// GET - Récupérer les activités
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser les query params
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Construire la requête avec jointure sur activity_types
    let query = supabase
      .from('activities')
      .select(
        `
        *,
        activity_type:activity_types (
          id,
          slug,
          name_fr,
          name_en,
          met_value,
          emoji,
          bg_color,
          text_color
        )
      `
      )
      .eq('user_id', auth.user.id);

    // Filtres de date
    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    } else if (startDate) {
      query = query.gte('date', startDate);
    } else if (endDate) {
      query = query.lte('date', endDate);
    } else {
      // Par défaut: 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateStr = thirtyDaysAgo.toISOString().split('T')[0];
      query = query.gte('date', dateStr);
    }

    // Tri par date décroissante
    query = query.order('date', { ascending: false });

    // 5. Exécuter la requête
    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return apiResponse.serverError(
        'Erreur lors de la récupération des activités'
      );
    }

    return NextResponse.json(
      {
        logs: logs || [],
        count: count || logs?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/biometrics/activity:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
