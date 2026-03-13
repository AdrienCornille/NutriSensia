/**
 * API Route: /api/protected/nutritionist/patients
 * Liste des patients du nutritionniste connecté
 *
 * GET - Récupérer la liste des patients avec filtres, recherche et tri
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { nutritionistPatientsQuerySchema } from '@/lib/api-schemas';

// ============================================================================
// GET - Récupérer la liste des patients du nutritionniste
// ============================================================================

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

    // 2. Parser et valider les query params
    const { searchParams } = new URL(req.url);
    const rawParams = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      sort: searchParams.get('sort') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };

    const parsed = nutritionistPatientsQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return apiResponse.error(
        parsed.error.issues
          .map((e: { message: string }) => e.message)
          .join(', '),
        400
      );
    }

    const { search, status, sort, limit, offset } = parsed.data;

    // 3. Créer client Supabase
    const supabase = await createClient();

    // 4. Récupérer le nutritionist_profiles.id
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

    // 5. Récupérer tous les patient_profiles pour ce nutritionniste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let patientQuery = (supabase as any)
      .from('patient_profiles')
      .select(
        'id, user_id, status, initial_weight, initial_height, initial_bmi, consultation_reason, health_goals, assigned_at, created_at'
      )
      .eq('nutritionist_id', nutritionistId);

    // Appliquer filtre status
    if (status && status !== 'all') {
      patientQuery = patientQuery.eq('status', status);
    }

    const { data: patients, error: patientsError } = await patientQuery;

    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des patients'
      );
    }

    if (!patients || patients.length === 0) {
      // Compter quand même les stats par statut
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count: totalCount } = await (supabase as any)
        .from('patient_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('nutritionist_id', nutritionistId);

      return NextResponse.json(
        {
          patients: [],
          total: 0,
          stats: {
            total: totalCount || 0,
            active: 0,
            pending: 0,
            inactive: 0,
          },
        },
        { status: 200 }
      );
    }

    // 6. Récupérer toutes les données enrichies EN PARALLÈLE
    const userIds = patients.map((p: { user_id: string }) => p.user_id);
    const patientProfileIds = patients.map((p: { id: string }) => p.id);
    const now = new Date().toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const [
      { data: profiles },
      { data: appointmentCounts },
      { data: allAppointments },
      { data: latestWeights },
      unreadMessages,
      pendingChanges,
      lastMeals,
      pendingModifications,
      weekAdherence,
      { count: activeCount },
      { count: pendingCount },
      { count: inactiveCount },
    ] = await Promise.all([
      // Profils (noms, emails, avatars)
      s.from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .in('id', userIds),
      // Appointments count par patient
      s.from('appointments')
        .select('user_id, id')
        .eq('nutritionist_id', nutritionistId)
        .in('user_id', patientProfileIds)
        .in('status', ['confirmed', 'completed']),
      // Tous les appointments pour last/next RDV
      s.from('appointments')
        .select('user_id, scheduled_at, status')
        .eq('nutritionist_id', nutritionistId)
        .in('user_id', patientProfileIds)
        .not('status', 'in', '("cancelled","cancelled_by_patient","cancelled_by_nutritionist")')
        .order('scheduled_at', { ascending: true }),
      // Dernier poids par patient
      s.from('weight_entries')
        .select('patient_id, weight_kg, date')
        .in('patient_id', userIds)
        .order('date', { ascending: false }),
      // Messages non lus
      s.from('conversations')
        .select('patient_id, nutritionist_unread_count')
        .eq('nutritionist_id', nutritionistId)
        .in('patient_id', patientProfileIds)
        .gt('nutritionist_unread_count', 0),
      // Signalements non révisés
      s.from('change_reports')
        .select('patient_id')
        .in('patient_id', userIds)
        .eq('status', 'pending'),
      // Dernier repas par patient
      s.from('meals')
        .select('patient_id, meal_date')
        .in('patient_id', userIds)
        .order('meal_date', { ascending: false }),
      // Demandes de modification de plan en attente
      s.from('plan_modification_requests')
        .select('patient_id')
        .in('patient_id', userIds)
        .eq('status', 'pending'),
      // Adhérence cette semaine (hors not_tracked)
      s.from('plan_adherence')
        .select('patient_id, status')
        .in('patient_id', userIds)
        .gte('date', sevenDaysAgo)
        .neq('status', 'not_tracked'),
      // Stats par statut
      s.from('patient_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('nutritionist_id', nutritionistId)
        .eq('status', 'active'),
      s.from('patient_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('nutritionist_id', nutritionistId)
        .eq('status', 'pending'),
      s.from('patient_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('nutritionist_id', nutritionistId)
        .eq('status', 'inactive'),
    ]);

    // Build maps
    const profileMap: Record<string, { first_name: string; last_name: string; email: string; avatar_url: string | null }> = {};
    if (profiles) {
      for (const p of profiles) {
        profileMap[p.id] = { first_name: p.first_name || '', last_name: p.last_name || '', email: p.email || '', avatar_url: p.avatar_url || null };
      }
    }

    const appointmentCountMap: Record<string, number> = {};
    if (appointmentCounts) {
      for (const apt of appointmentCounts) {
        appointmentCountMap[apt.user_id] = (appointmentCountMap[apt.user_id] || 0) + 1;
      }
    }

    const lastAppointmentMap: Record<string, string> = {};
    const nextAppointmentMap: Record<string, string> = {};
    if (allAppointments) {
      for (const apt of allAppointments as { user_id: string; scheduled_at: string }[]) {
        if (apt.scheduled_at < now) {
          lastAppointmentMap[apt.user_id] = apt.scheduled_at;
        } else if (!nextAppointmentMap[apt.user_id]) {
          nextAppointmentMap[apt.user_id] = apt.scheduled_at;
        }
      }
    }

    const latestWeightMap: Record<string, number> = {};
    if (latestWeights) {
      for (const w of latestWeights as { patient_id: string; weight_kg: number }[]) {
        if (!latestWeightMap[w.patient_id]) latestWeightMap[w.patient_id] = w.weight_kg;
      }
    }

    const unreadMessagesMap: Record<string, number> = {};
    if (unreadMessages.data) {
      for (const m of unreadMessages.data as { patient_id: string; nutritionist_unread_count: number }[]) {
        unreadMessagesMap[m.patient_id] = (unreadMessagesMap[m.patient_id] || 0) + m.nutritionist_unread_count;
      }
    }

    const pendingChangesMap: Record<string, number> = {};
    if (pendingChanges.data) {
      for (const c of pendingChanges.data as { patient_id: string }[]) {
        pendingChangesMap[c.patient_id] = (pendingChangesMap[c.patient_id] || 0) + 1;
      }
    }

    const lastMealDateMap: Record<string, string> = {};
    if (lastMeals.data) {
      for (const m of lastMeals.data as { patient_id: string; meal_date: string }[]) {
        if (!lastMealDateMap[m.patient_id]) lastMealDateMap[m.patient_id] = m.meal_date;
      }
    }

    const pendingModificationsMap: Record<string, number> = {};
    if (pendingModifications.data) {
      for (const r of pendingModifications.data as { patient_id: string }[]) {
        pendingModificationsMap[r.patient_id] = (pendingModificationsMap[r.patient_id] || 0) + 1;
      }
    }

    const adherenceMap: Record<string, number | null> = {};
    if (weekAdherence.data) {
      const grouped: Record<string, { total: number; ok: number }> = {};
      for (const a of weekAdherence.data as { patient_id: string; status: string }[]) {
        if (!grouped[a.patient_id]) grouped[a.patient_id] = { total: 0, ok: 0 };
        grouped[a.patient_id].total++;
        if (a.status === 'followed' || a.status === 'partial') grouped[a.patient_id].ok++;
      }
      for (const [pid, g] of Object.entries(grouped)) {
        adherenceMap[pid] = g.total > 0 ? Math.round((g.ok / g.total) * 100) : null;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const totalAll = (activeCount || 0) + (pendingCount || 0) + (inactiveCount || 0);

    // 7. Construire la liste enrichie
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let enrichedPatients = patients.map((patient: any) => {
      const profile = profileMap[patient.user_id] || {
        first_name: 'Patient',
        last_name: '',
        email: '',
        avatar_url: null,
      };

      return {
        id: patient.id,
        user_id: patient.user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        status: patient.status,
        consultation_reason: patient.consultation_reason,
        health_goals: patient.health_goals,
        initial_weight: patient.initial_weight,
        current_weight: latestWeightMap[patient.user_id] ?? null,
        initial_bmi: patient.initial_bmi,
        assigned_at: patient.assigned_at,
        created_at: patient.created_at,
        appointments_count: appointmentCountMap[patient.id] || 0,
        last_appointment_at: lastAppointmentMap[patient.id] || null,
        next_appointment_at: nextAppointmentMap[patient.id] || null,
        alerts: {
          unread_messages: unreadMessagesMap[patient.id] || 0,
          pending_changes: pendingChangesMap[patient.user_id] || 0,
          days_without_meal: lastMealDateMap[patient.user_id]
            ? Math.floor(
                (new Date(todayStr).getTime() -
                  new Date(lastMealDateMap[patient.user_id]).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null,
          pending_modification_requests: pendingModificationsMap[patient.user_id] || 0,
          adherence_percent: adherenceMap[patient.user_id] ?? null,
        },
      };
    });

    // 8. Appliquer la recherche côté serveur
    if (search) {
      const searchLower = search.toLowerCase();
      enrichedPatients = enrichedPatients.filter(
        (p: { first_name: string; last_name: string; email: string }) =>
          p.first_name.toLowerCase().includes(searchLower) ||
          p.last_name.toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower)
      );
    }

    // 9. Appliquer le tri
    enrichedPatients.sort(
      (
        a: {
          first_name: string;
          last_name: string;
          assigned_at: string | null;
        },
        b: {
          first_name: string;
          last_name: string;
          assigned_at: string | null;
        }
      ) => {
        switch (sort) {
          case 'name_asc':
            return `${a.last_name} ${a.first_name}`.localeCompare(
              `${b.last_name} ${b.first_name}`
            );
          case 'name_desc':
            return `${b.last_name} ${b.first_name}`.localeCompare(
              `${a.last_name} ${a.first_name}`
            );
          case 'date_desc':
            return (
              new Date(b.assigned_at || b.last_name).getTime() -
              new Date(a.assigned_at || a.first_name).getTime()
            );
          case 'date_asc':
            return (
              new Date(a.assigned_at || a.first_name).getTime() -
              new Date(b.assigned_at || b.last_name).getTime()
            );
          default:
            return 0;
        }
      }
    );

    // 10. Pagination
    const total = enrichedPatients.length;
    const paginatedPatients = enrichedPatients.slice(offset, offset + limit);

    return NextResponse.json(
      {
        patients: paginatedPatients,
        total,
        stats: {
          total: totalAll,
          active: activeCount || 0,
          pending: pendingCount || 0,
          inactive: inactiveCount || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/nutritionist/patients:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
