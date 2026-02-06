/**
 * API Routes pour le module Hydratation
 * Endpoints: POST (créer log), GET (récupérer logs)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { createHydrationLogSchema } from '@/lib/api-schemas';
import { apiResponse } from '@/lib/api-auth';

// ============================================================================
// SCHEMAS DE VALIDATION
// ============================================================================

const hydrationQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // YYYY-MM-DD
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

// ============================================================================
// POST - Créer un log d'hydratation
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Authentifier
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
      validatedData = createHydrationLogSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Données invalides: ' + error.errors.map(e => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Insérer le log dans la base de données
    const { data: log, error: insertError } = await supabase
      .from('hydration_logs')
      .insert({
        user_id: auth.user.id,
        date: new Date().toISOString().split('T')[0], // CURRENT_DATE
        amount_ml: validatedData.amount_ml,
        beverage_type: validatedData.beverage_type || 'water',
        notes: validatedData.notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting hydration log:', insertError);
      return apiResponse.serverError('Erreur lors de la création du log');
    }

    // 5. Retourner le log créé
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/protected/hydration:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// GET - Récupérer les logs d'hydratation
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Authentifier
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser query params
    const { searchParams } = new URL(req.url);
    const queryParams = {
      date: searchParams.get('date') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    };

    let validatedQuery;
    try {
      validatedQuery = hydrationQuerySchema.parse(queryParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Paramètres invalides: ' +
            error.errors.map(e => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Construire la requête
    let query = supabase
      .from('hydration_logs')
      .select('*')
      .eq('user_id', auth.user.id);

    // Filtrer par date
    if (validatedQuery.date) {
      // Date unique
      query = query.eq('date', validatedQuery.date);
    } else if (validatedQuery.start_date && validatedQuery.end_date) {
      // Plage de dates
      const start = new Date(validatedQuery.start_date);
      const end = new Date(validatedQuery.end_date);
      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Limiter à 90 jours max
      if (diffDays > 90) {
        return apiResponse.error(
          'Plage de dates trop large (max 90 jours)',
          400
        );
      }

      query = query
        .gte('date', validatedQuery.start_date)
        .lte('date', validatedQuery.end_date);
    } else {
      // Par défaut: 7 derniers jours
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      query = query.gte('date', sevenDaysAgoStr);
    }

    // Ordonner par date (desc) puis par heure de création (desc)
    query = query
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    const { data: logs, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching hydration logs:', fetchError);
      return apiResponse.serverError('Erreur lors de la récupération des logs');
    }

    // 5. Calculer le summary
    // Note: Pour simplifier, on calcule le summary seulement pour aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = (logs || []).filter(log => log.date === today);
    const totalMl = todayLogs.reduce(
      (sum, log) => sum + (log.amount_ml || 0),
      0
    );

    // Récupérer l'objectif actuel
    const { data: goal } = await supabase
      .from('hydration_goals')
      .select('daily_goal_ml')
      .eq('user_id', auth.user.id)
      .lte('valid_from', today)
      .or(`valid_until.is.null,valid_until.gte.${today}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const goalMl = goal?.daily_goal_ml || 2000; // Default 2000ml
    const percentage = goalMl > 0 ? Math.round((totalMl / goalMl) * 100) : 0;

    const summary = {
      total_ml: totalMl,
      goal_ml: goalMl,
      percentage,
    };

    // 6. Retourner la réponse
    const response = {
      logs: logs || [],
      summary,
    };

    console.log(
      '🔍 [Hydration GET] Returning:',
      JSON.stringify(response, null, 2)
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/hydration:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
