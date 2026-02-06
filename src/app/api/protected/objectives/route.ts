/**
 * API Routes pour les objectifs hebdomadaires
 * GET  - Récupérer les objectifs de la semaine (avec calcul dynamique)
 * POST - Créer des objectifs hebdomadaires
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { createWeeklyObjectivesSchema } from '@/lib/api-schemas';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calcule le lundi de la semaine pour une date donnée
 */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

/**
 * Calcule le dimanche de la semaine à partir du lundi
 */
function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

/**
 * Calcule dynamiquement la progression de chaque objectif
 * en interrogeant les tables de données réelles
 */
async function calculateObjectiveProgress(
  supabase: any,
  userId: string,
  objectives: any[],
  weekStart: string,
  weekEnd: string
): Promise<any[]> {
  const enriched = [];

  for (const obj of objectives) {
    let current = obj.current || 0;

    switch (obj.category) {
      case 'nutrition':
      case 'tracking': {
        // Compter les repas enregistrés cette semaine
        const { count } = await supabase
          .from('meals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('consumed_at', `${weekStart}T00:00:00Z`)
          .lte('consumed_at', `${weekEnd}T23:59:59Z`);
        current = count || 0;
        break;
      }
      case 'hydration': {
        // Compter les jours où l'objectif d'hydratation a été atteint
        const { data: goalData } = await supabase
          .from('hydration_goals')
          .select('daily_goal_ml')
          .eq('user_id', userId)
          .lte('valid_from', weekEnd)
          .or(`valid_until.is.null,valid_until.gte.${weekStart}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const goalMl = goalData?.daily_goal_ml || 2000;

        const { data: logs } = await supabase
          .from('hydration_logs')
          .select('date, amount_ml')
          .eq('user_id', userId)
          .gte('date', weekStart)
          .lte('date', weekEnd);

        if (logs && logs.length > 0) {
          // Grouper par date et sommer
          const dailyTotals: Record<string, number> = {};
          for (const log of logs) {
            dailyTotals[log.date] = (dailyTotals[log.date] || 0) + log.amount_ml;
          }
          current = Object.values(dailyTotals).filter(ml => ml >= goalMl).length;
        } else {
          current = 0;
        }
        break;
      }
      case 'activity': {
        // Compter les sessions d'activité cette semaine
        const { count } = await supabase
          .from('activity_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('performed_at', `${weekStart}T00:00:00Z`)
          .lte('performed_at', `${weekEnd}T23:59:59Z`);
        current = count || 0;
        break;
      }
      case 'recipes': {
        // Pour les recettes, on garde la valeur manuelle (pas de table de suivi)
        current = obj.current || 0;
        break;
      }
      case 'custom':
      default: {
        // Valeur manuelle
        current = obj.current || 0;
        break;
      }
    }

    const progress = obj.target > 0 ? Math.min(Math.round((current / obj.target) * 100), 100) : 0;
    const isCompleted = progress >= 100;

    enriched.push({
      ...obj,
      current,
      progress,
      isCompleted,
      completedAt: isCompleted ? (obj.completedAt || new Date().toISOString()) : null,
    });
  }

  return enriched;
}

// ============================================================================
// GET - Récupérer les objectifs hebdomadaires
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get('week'); // YYYY-MM-DD format

    // Calculer les dates de la semaine
    const weekStart = weekParam || getWeekStart(new Date());
    const weekEnd = getWeekEnd(weekStart);

    const supabase = await createClient();

    // Récupérer les objectifs de la semaine
    const { data: weeklyObj, error } = await supabase
      .from('weekly_objectives')
      .select('*')
      .eq('patient_id', auth.user.id)
      .eq('week_start', weekStart)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('Error fetching objectives:', error);
      return apiResponse.serverError('Erreur lors de la récupération des objectifs');
    }

    // Si aucun objectif n'existe pour cette semaine, retourner un objet vide
    if (!weeklyObj) {
      return NextResponse.json({
        id: null,
        week_start: weekStart,
        week_end: weekEnd,
        objectives: [],
        total_objectives: 0,
        completed_objectives: 0,
        overall_progress: 0,
        points_earned: 0,
        time_remaining: {
          days: Math.max(0, Math.ceil((new Date(weekEnd + 'T23:59:59Z').getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
          label: '',
        },
      });
    }

    // Calculer dynamiquement la progression
    const objectives = weeklyObj.objectives || [];
    const enrichedObjectives = await calculateObjectiveProgress(
      supabase,
      auth.user.id,
      objectives,
      weekStart,
      weekEnd
    );

    const completedCount = enrichedObjectives.filter((o: any) => o.isCompleted).length;
    const totalCount = enrichedObjectives.length;
    const overallProgress = totalCount > 0
      ? Math.round(enrichedObjectives.reduce((sum: number, o: any) => sum + o.progress, 0) / totalCount)
      : 0;

    // Calculer temps restant
    const endDate = new Date(weekEnd + 'T23:59:59Z');
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    // Mettre à jour les données en base
    await supabase
      .from('weekly_objectives')
      .update({
        objectives: enrichedObjectives,
        completed_objectives: completedCount,
        progress_percent: overallProgress,
      })
      .eq('id', weeklyObj.id);

    return NextResponse.json({
      id: weeklyObj.id,
      week_start: weekStart,
      week_end: weekEnd,
      objectives: enrichedObjectives,
      total_objectives: totalCount,
      completed_objectives: completedCount,
      overall_progress: overallProgress,
      points_earned: weeklyObj.points_earned || 0,
      time_remaining: {
        days: daysRemaining,
        label: daysRemaining === 0 ? 'Dernier jour !' :
               daysRemaining === 1 ? 'Demain' :
               `${daysRemaining}j restants`,
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/objectives:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// POST - Créer des objectifs hebdomadaires
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const body = await req.json();
    let validatedData;
    try {
      validatedData = createWeeklyObjectivesSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Données invalides: ' + error.errors.map(e => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    const weekEnd = getWeekEnd(validatedData.week_start);
    const supabase = await createClient();

    // Vérifier qu'il n'y a pas déjà d'objectifs pour cette semaine
    const { data: existing } = await supabase
      .from('weekly_objectives')
      .select('id')
      .eq('patient_id', auth.user.id)
      .eq('week_start', validatedData.week_start)
      .single();

    if (existing) {
      return apiResponse.error(
        'Des objectifs existent déjà pour cette semaine. Utilisez PATCH pour les modifier.',
        409
      );
    }

    // Générer des IDs pour chaque objectif
    const objectivesWithIds = validatedData.objectives.map((obj, i) => ({
      ...obj,
      id: obj.id || `obj-${Date.now()}-${i}`,
      current: 0,
      progress: 0,
      isCompleted: false,
      completedAt: null,
    }));

    // Insérer
    const { data: created, error } = await supabase
      .from('weekly_objectives')
      .insert({
        patient_id: auth.user.id,
        week_start: validatedData.week_start,
        week_end: weekEnd,
        objectives: objectivesWithIds,
        total_objectives: objectivesWithIds.length,
        completed_objectives: 0,
        progress_percent: 0,
        points_earned: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating objectives:', error);
      return apiResponse.serverError('Erreur lors de la création des objectifs');
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/protected/objectives:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
