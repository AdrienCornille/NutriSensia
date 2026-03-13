/**
 * API Route: /api/protected/nutritionist/patients/[id]
 * Détail d'un patient pour le nutritionniste
 *
 * GET - Récupérer les données synthétiques d'un patient
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { patientNotesUpdateSchema, updatePatientStatusSchema } from '@/lib/api-schemas';

// ============================================================================
// GET - Récupérer le détail d'un patient
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId } = await params;

    if (!patientProfileId) {
      return apiResponse.error('ID patient requis', 400);
    }

    // 2. Créer client Supabase
    const supabase = await createClient();

    // 3. Récupérer le nutritionist_profiles.id
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

    const nutritionistId = nutritionistProfile.id;

    // 4. Récupérer le patient_profiles et vérifier qu'il appartient au nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patient, error: patientError } = await (supabase as any)
      .from('patient_profiles')
      .select(
        'id, user_id, status, initial_weight, initial_height, initial_bmi, consultation_reason, health_goals, dietary_restrictions, allergies, medical_conditions, medications, activity_level, assigned_at, created_at, date_of_birth, gender, phone, notes_internal'
      )
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistId)
      .single();

    if (patientError || !patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // 5. Requêtes parallèles pour TOUTES les données (profil inclus)
    const now = new Date().toISOString();
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Calculer le début de la semaine en cours (lundi)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekStart = monday.toISOString().split('T')[0];

    const [
      { data: userProfile },
      weightHistory,
      recentMeals,
      weeklyObjectives,
      nextAppointment,
      lastAppointment,
      appointmentsCount,
      streaks,
      activeMealPlan,
    ] = await Promise.all([
      // Profil utilisateur (nom, email, avatar)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .eq('id', patient.user_id)
        .single(),
      // Historique poids (30 jours)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('weight_entries')
        .select('weight_kg, date')
        .eq('patient_id', patient.user_id)
        .gte('date', thirtyDaysAgo.split('T')[0])
        .order('date', { ascending: true }),

      // Repas récents (3 jours)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('meals')
        .select(
          'id, name, meal_type, total_calories, total_protein, total_carbs, total_fat, meal_date, consumed_at'
        )
        .eq('patient_id', patient.user_id)
        .gte('meal_date', threeDaysAgo)
        .order('consumed_at', { ascending: false })
        .limit(15),

      // Objectifs hebdomadaires (semaine courante)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('weekly_objectives')
        .select('*')
        .eq('patient_id', patient.user_id)
        .gte('week_start', weekStart)
        .limit(1)
        .maybeSingle(),

      // Prochain RDV - appointments utilise patient_profiles.id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('appointments')
        .select(
          'id, scheduled_at, scheduled_end_at, mode, status, consultation_type:consultation_types(name_fr, default_duration)'
        )
        .eq('user_id', patient.id)
        .eq('nutritionist_id', nutritionistId)
        .gte('scheduled_at', now)
        .in('status', ['pending', 'confirmed'])
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle(),

      // Dernière consultation passée
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('appointments')
        .select(
          'id, scheduled_at, scheduled_end_at, mode, status, consultation_type:consultation_types(name_fr)'
        )
        .eq('user_id', patient.id)
        .eq('nutritionist_id', nutritionistId)
        .lt('scheduled_at', now)
        .in('status', ['completed', 'confirmed'])
        .order('scheduled_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Nombre total d'appointments
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', patient.id)
        .eq('nutritionist_id', nutritionistId)
        .in('status', ['confirmed', 'completed']),

      // Streaks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('streaks')
        .select('streak_type, current_count, longest_count')
        .eq('patient_id', patient.user_id),

      // Plan alimentaire actif
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('meal_plans')
        .select('id, name, status, start_date, end_date, daily_calories_target')
        .eq('patient_id', patient.user_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    // 7. Calculer les KPIs
    const weights = weightHistory.data || [];
    const currentWeight =
      weights.length > 0 ? weights[weights.length - 1].weight_kg : null;
    const currentBmi =
      currentWeight && patient.initial_height
        ? +(currentWeight / Math.pow(patient.initial_height / 100, 2)).toFixed(
            1
          )
        : patient.initial_bmi;

    const mealStreak =
      (streaks.data || []).find(
        (s: { streak_type: string }) => s.streak_type === 'meal_logging'
      )?.current_count || 0;

    return NextResponse.json(
      {
        patient: {
          id: patient.id,
          user_id: patient.user_id,
          first_name: userProfile?.first_name || '',
          last_name: userProfile?.last_name || '',
          email: userProfile?.email || '',
          avatar_url: userProfile?.avatar_url || null,
          status: patient.status,
          date_of_birth: patient.date_of_birth,
          gender: patient.gender,
          phone: patient.phone,
          initial_weight: patient.initial_weight,
          initial_height: patient.initial_height,
          initial_bmi: patient.initial_bmi,
          consultation_reason: patient.consultation_reason,
          health_goals: patient.health_goals,
          dietary_restrictions: patient.dietary_restrictions,
          allergies: patient.allergies,
          medical_conditions: patient.medical_conditions,
          medications: patient.medications,
          activity_level: patient.activity_level,
          assigned_at: patient.assigned_at,
          created_at: patient.created_at,
          notes_internal: patient.notes_internal || null,
        },
        kpis: {
          current_weight: currentWeight,
          target_weight: null, // sera rempli quand les objectifs poids existeront
          current_bmi: currentBmi,
          adherence_percent: null, // sera calculé avec les meal plans
          meal_streak: mealStreak,
        },
        weight_history: weights,
        weekly_objectives: weeklyObjectives.data || null,
        recent_meals: recentMeals.data || [],
        next_appointment: nextAppointment.data || null,
        last_appointment: lastAppointment.data || null,
        appointments_count: appointmentsCount.count || 0,
        active_meal_plan: activeMealPlan.data || null,
        streaks: streaks.data || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/nutritionist/patients/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// PATCH - Mettre à jour un patient (notes internes ou statut)
// ============================================================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId } = await params;

    if (!patientProfileId) {
      return apiResponse.error('ID patient requis', 400);
    }

    // 2. Parser le body
    const body = await req.json();

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Récupérer le nutritionist_profiles.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // 5. Vérifier que le patient appartient au nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // 6. Déterminer le type de mise à jour
    if ('status' in body) {
      // Mise à jour du statut patient
      const parsed = updatePatientStatusSchema.safeParse(body);
      if (!parsed.success) {
        return apiResponse.error(parsed.error.issues[0].message, 400);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('patient_profiles')
        .update({
          status: parsed.data.status,
          status_changed_at: new Date().toISOString(),
          status_reason: parsed.data.status_reason || null,
        })
        .eq('id', patientProfileId);

      if (updateError) {
        console.error('Error updating patient status:', updateError);
        return apiResponse.serverError('Erreur lors de la mise à jour du statut');
      }

      // Notifier le patient du changement de statut
      try {
        if (parsed.data.status === 'active') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).rpc('create_notification', {
            p_user_id: patient.user_id,
            p_type_code: 'welcome',
            p_data: {
              message: 'Votre suivi nutritionnel est maintenant actif !',
            },
          });
        } else if (parsed.data.status === 'inactive') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).rpc('create_notification', {
            p_user_id: patient.user_id,
            p_type_code: 'general',
            p_data: {
              message: 'Votre suivi nutritionnel a été mis en pause. Contactez votre nutritionniste pour plus d\'informations.',
            },
          });
        }
      } catch (notifError) {
        console.error('Error sending status notification:', notifError);
      }

      return apiResponse.success({
        status: parsed.data.status,
        status_changed_at: new Date().toISOString(),
      });
    } else {
      // Mise à jour des notes (legacy)
      const parsed = patientNotesUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return apiResponse.error(
          parsed.error.issues.map((e: { message: string }) => e.message).join(', '),
          400
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('patient_profiles')
        .update({ notes_internal: parsed.data.notes_internal || null })
        .eq('id', patientProfileId);

      if (updateError) {
        console.error('Error updating patient notes:', updateError);
        return apiResponse.serverError('Erreur lors de la mise à jour');
      }

      return NextResponse.json(
        {
          success: true,
          notes_internal: parsed.data.notes_internal || null,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/protected/nutritionist/patients/[id]:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
