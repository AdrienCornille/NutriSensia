/**
 * API Routes pour le suivi du bien-être (Module 2.4)
 *
 * POST /api/protected/wellbeing - Créer un log de bien-être
 * GET /api/protected/wellbeing - Récupérer les logs de bien-être
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createWellbeingLogSchema } from '@/lib/api-schemas';
import { z } from 'zod';

// ============================================================================
// POST - Créer un log de bien-être
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
    let validatedData: z.infer<typeof createWellbeingLogSchema>;

    try {
      validatedData = createWellbeingLogSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Données invalides: ' + error.errors.map(e => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    // 3. Déterminer la date
    const logDate =
      validatedData.date || new Date().toISOString().split('T')[0];

    // 4. Créer client Supabase
    const supabase = await createClient();

    // 5. Vérifier si un log existe déjà pour cette date
    const { data: existingLog } = await supabase
      .from('wellbeing_logs')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('date', logDate)
      .single();

    if (existingLog) {
      return apiResponse.error(
        `Un log de bien-être existe déjà pour le ${logDate}. Pour le modifier, utilisez l'endpoint de mise à jour.`,
        409
      );
    }

    // 6. Insérer le log
    const { data: newLog, error: insertError } = await supabase
      .from('wellbeing_logs')
      .insert({
        user_id: auth.user.id,
        date: logDate,
        energy_level: validatedData.energy_level,
        sleep_hours: validatedData.sleep_hours,
        sleep_quality: validatedData.sleep_quality,
        mood: validatedData.mood,
        digestion: validatedData.digestion,
        symptoms: validatedData.symptoms,
        notes: validatedData.notes,
      } as any)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating wellbeing log:', insertError);
      return apiResponse.serverError(
        'Erreur lors de la création du log de bien-être'
      );
    }

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/protected/wellbeing:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// GET - Récupérer les logs de bien-être
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

    // 4. Construire la requête
    let query = supabase
      .from('wellbeing_logs')
      .select('*')
      .eq('user_id', auth.user.id);

    // Filtres de date
    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    } else if (startDate) {
      query = query.gte('date', startDate);
    } else if (endDate) {
      query = query.lte('date', endDate);
    } else {
      // Par défaut: 30 derniers jours (pour générer insights)
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
      console.error('Error fetching wellbeing logs:', error);
      return apiResponse.serverError('Erreur lors de la récupération des logs');
    }

    return NextResponse.json(
      {
        logs: logs || [],
        count: count || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/wellbeing:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
