/**
 * API Route pour le résumé complet du dashboard
 * GET - Agrège toutes les données du dashboard en un seul appel
 *
 * Sections incluses:
 * - DASH-001: Nutrition quotidienne
 * - DASH-002: Hydratation
 * - DASH-003: État des repas du jour
 * - DASH-004: Progression hebdomadaire
 * - DASH-005: Prochain rendez-vous
 * - DASH-006: Messages non lus
 * - DASH-007: Objectifs hebdomadaires
 */

import { NextResponse } from 'next/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// HELPERS
// ============================================================================

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

// ============================================================================
// GET - Dashboard Summary (toutes les données agrégées)
// ============================================================================

export async function GET() {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    const userId = auth.user.id;
    const today = new Date().toISOString().split('T')[0];
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd(weekStart);

    // Exécuter toutes les queries en parallèle pour la performance
    const [
      mealsToday,
      hydrationToday,
      hydrationGoal,
      weightRecent,
      nextAppointment,
      unreadMessages,
      weeklyObjectives,
      mealStreak,
    ] = await Promise.all([
      // DASH-001 & DASH-003: Repas du jour
      supabase
        .from('meals')
        .select('id, type, total_calories, total_protein, total_carbs, total_fat')
        .eq('user_id', userId)
        .gte('consumed_at', `${today}T00:00:00Z`)
        .lte('consumed_at', `${today}T23:59:59Z`),

      // DASH-002: Hydratation
      supabase
        .from('hydration_logs')
        .select('amount_ml')
        .eq('user_id', userId)
        .eq('date', today),

      // Objectif hydratation
      supabase
        .from('hydration_goals')
        .select('daily_goal_ml')
        .eq('user_id', userId)
        .lte('valid_from', today)
        .or(`valid_until.is.null,valid_until.gte.${today}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),

      // DASH-004: Poids récent (variation hebdomadaire)
      supabase
        .from('weight_entries')
        .select('weight_kg, measured_at')
        .eq('user_id', userId)
        .gte('measured_at', `${weekStart}T00:00:00Z`)
        .order('measured_at', { ascending: false })
        .limit(7),

      // DASH-005: Prochain rendez-vous
      supabase
        .from('appointments')
        .select(`
          id, scheduled_at, scheduled_end_at, mode, status,
          consultation_type:consultation_types(name, duration_minutes),
          nutritionist:nutritionist_profiles(
            first_name, last_name
          )
        `)
        .eq('patient_id', userId)
        .in('status', ['pending', 'confirmed'])
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single(),

      // DASH-006: Messages non lus
      supabase
        .from('conversations')
        .select('patient_unread_count')
        .eq('patient_id', userId),

      // DASH-007: Objectifs hebdomadaires
      supabase
        .from('weekly_objectives')
        .select('*')
        .eq('patient_id', userId)
        .eq('week_start', weekStart)
        .single(),

      // Streak des repas
      supabase
        .from('streaks')
        .select('current_count, longest_count')
        .eq('patient_id', userId)
        .eq('streak_type', 'meal_logging')
        .single(),
    ]);

    // ---- DASH-001: Nutrition quotidienne ----
    const meals = mealsToday.data || [];
    const totalCalories = meals.reduce((sum, m) => sum + (m.total_calories || 0), 0);
    const totalProtein = meals.reduce((sum, m) => sum + (m.total_protein || 0), 0);
    const totalCarbs = meals.reduce((sum, m) => sum + (m.total_carbs || 0), 0);
    const totalFat = meals.reduce((sum, m) => sum + (m.total_fat || 0), 0);

    // Objectifs nutritionnels par défaut (peuvent être surchargés par un plan alimentaire)
    const calorieGoal = 2100;
    const proteinGoal = 120;
    const carbsGoal = 250;
    const fatGoal = 70;

    const nutrition = {
      total_calories: totalCalories,
      calorie_goal: calorieGoal,
      calories_remaining: Math.max(0, calorieGoal - totalCalories),
      macros: {
        protein: totalProtein,
        protein_goal: proteinGoal,
        carbs: totalCarbs,
        carbs_goal: carbsGoal,
        fat: totalFat,
        fat_goal: fatGoal,
      },
      adherence_percent: calorieGoal > 0 ? Math.min(Math.round((totalCalories / calorieGoal) * 100), 100) : 0,
    };

    // ---- DASH-002: Hydratation ----
    const hydrationLogs = hydrationToday.data || [];
    const totalMl = hydrationLogs.reduce((sum, l) => sum + (l.amount_ml || 0), 0);
    const goalMl = hydrationGoal.data?.daily_goal_ml || 2000;

    const hydration = {
      current_ml: totalMl,
      goal_ml: goalMl,
      percent: goalMl > 0 ? Math.min(Math.round((totalMl / goalMl) * 100), 100) : 0,
    };

    // ---- DASH-003: État des repas ----
    const mealTypes = new Set(meals.map(m => m.type));
    const meals_status = {
      breakfast: mealTypes.has('breakfast'),
      lunch: mealTypes.has('lunch'),
      dinner: mealTypes.has('dinner'),
      snack: mealTypes.has('snack'),
    };

    // ---- DASH-004: Progression hebdomadaire ----
    const weightEntries = weightRecent.data || [];
    const weightChange = weightEntries.length >= 2
      ? weightEntries[0].weight_kg - weightEntries[weightEntries.length - 1].weight_kg
      : 0;

    const weekly_progress = {
      meal_streak_days: mealStreak.data?.current_count || 0,
      longest_streak: mealStreak.data?.longest_count || 0,
      weight_change_kg: Math.round(weightChange * 10) / 10,
      adherence_percent: nutrition.adherence_percent,
    };

    // ---- DASH-005: Prochain RDV ----
    let next_appointment = null;
    if (nextAppointment.data) {
      const apt = nextAppointment.data;
      const scheduledDate = new Date(apt.scheduled_at);
      const countdownDays = Math.ceil((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      const nutri = apt.nutritionist as any;
      const consultationType = apt.consultation_type as any;

      next_appointment = {
        id: apt.id,
        scheduled_at: apt.scheduled_at,
        scheduled_end_at: apt.scheduled_end_at,
        type: consultationType?.name || 'Consultation',
        mode: apt.mode,
        status: apt.status,
        nutritionist: nutri ? `${nutri.first_name || ''} ${nutri.last_name || ''}`.trim() : 'Nutritionniste',
        countdown_days: countdownDays,
      };
    }

    // ---- DASH-006: Messages non lus ----
    const conversations = unreadMessages.data || [];
    const unread_messages_count = conversations.reduce(
      (sum, c) => sum + (c.patient_unread_count || 0), 0
    );

    // ---- DASH-007: Objectifs hebdomadaires ----
    let weekly_objectives = null;
    if (weeklyObjectives.data) {
      const obj = weeklyObjectives.data;
      const endDate = new Date(weekEnd + 'T23:59:59Z');
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

      weekly_objectives = {
        total: obj.total_objectives || 0,
        completed: obj.completed_objectives || 0,
        overall_progress: obj.progress_percent || 0,
        time_remaining_days: daysRemaining,
      };
    }

    return NextResponse.json({
      nutrition,
      hydration,
      meals_status,
      weekly_progress,
      next_appointment,
      unread_messages_count,
      weekly_objectives,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/protected/dashboard/summary:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
