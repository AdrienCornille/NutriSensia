/**
 * API Route: /api/protected/nutritionist/appointments
 * Gestion des rendez-vous côté nutritionniste
 *
 * GET - Récupérer les rendez-vous du nutritionniste connecté (avec filtres)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// ============================================================================
// GET - Récupérer les rendez-vous du nutritionniste
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

    // 2. Parser les query params
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'pending' | 'upcoming' | 'past' | 'all'
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

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

    // 5. Construire la requête avec jointures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('appointments')
      .select(
        `
        *,
        consultation_type:consultation_types (
          id,
          code,
          name_fr,
          name_en,
          default_duration,
          default_price,
          icon,
          color
        )
      `
      )
      .eq('nutritionist_id', nutritionistId);

    // 6. Appliquer les filtres
    const now = new Date().toISOString();

    if (filter === 'pending') {
      // Demandes en attente initiales (pas les contre-propositions)
      query = query
        .eq('status', 'pending')
        .is('status_reason', null)
        .order('scheduled_at', { ascending: true });
    } else if (filter === 'upcoming') {
      query = query
        .gte('scheduled_at', now)
        .not(
          'status',
          'in',
          '("cancelled","cancelled_by_patient","cancelled_by_nutritionist","no_show")'
        )
        .order('scheduled_at', { ascending: true });
    } else if (filter === 'past') {
      query = query
        .or(`scheduled_at.lt.${now},status.eq.completed`)
        .not(
          'status',
          'in',
          '("cancelled","cancelled_by_patient","cancelled_by_nutritionist")'
        )
        .order('scheduled_at', { ascending: false });
    } else if (filter === 'cancelled') {
      query = query
        .in('status', [
          'cancelled',
          'cancelled_by_patient',
          'cancelled_by_nutritionist',
        ])
        .order('scheduled_at', { ascending: false });
    } else {
      // 'all' - tous les RDV
      query = query.order('scheduled_at', { ascending: false });
    }

    // 7. Pagination
    query = query.range(offset, offset + limit - 1);

    // 8. Exécuter la requête
    const { data: appointments, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching nutritionist appointments:', queryError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des rendez-vous'
      );
    }

    // 9. Récupérer les noms des patients via patient_profiles → profiles
    const patientIds = [
      ...new Set(
        (appointments || []).map(
          (apt: { user_id: string }) => apt.user_id
        )
      ),
    ];

    let patientNames: Record<string, { first_name: string; last_name: string }> = {};

    if (patientIds.length > 0) {
      // user_id dans appointments = patient_profiles.id
      // On doit aller chercher patient_profiles.user_id → profiles.first_name/last_name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: patientProfiles } = await (supabase as any)
        .from('patient_profiles')
        .select('id, user_id')
        .in('id', patientIds);

      if (patientProfiles && patientProfiles.length > 0) {
        const authUserIds = patientProfiles.map(
          (p: { user_id: string }) => p.user_id
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profiles } = await (supabase as any)
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', authUserIds);

        if (profiles) {
          // Build map: patient_profiles.id → { first_name, last_name }
          const authToProfile: Record<string, { first_name: string; last_name: string }> = {};
          for (const p of profiles) {
            authToProfile[p.id] = {
              first_name: p.first_name || '',
              last_name: p.last_name || '',
            };
          }

          for (const pp of patientProfiles) {
            const profile = authToProfile[pp.user_id];
            if (profile) {
              patientNames[pp.id] = profile;
            }
          }
        }
      }
    }

    // 10. Enrichir les appointments avec les noms patients
    const enrichedAppointments = (appointments || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (apt: any) => ({
        ...apt,
        patient: patientNames[apt.user_id] || {
          first_name: 'Patient',
          last_name: '',
        },
      })
    );

    // 11. Compter les RDV par statut pour les badges
    const { count: pendingCount } = await (supabase as any)
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('nutritionist_id', nutritionistId)
      .eq('status', 'pending')
      .is('status_reason', null);

    const { count: upcomingCount } = await (supabase as any)
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('nutritionist_id', nutritionistId)
      .gte('scheduled_at', now)
      .not(
        'status',
        'in',
        '("cancelled","cancelled_by_patient","cancelled_by_nutritionist","no_show")'
      );

    const { count: pastCount } = await (supabase as any)
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('nutritionist_id', nutritionistId)
      .lt('scheduled_at', now)
      .not(
        'status',
        'in',
        '("cancelled","cancelled_by_patient","cancelled_by_nutritionist")'
      );

    const { count: cancelledCount } = await (supabase as any)
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('nutritionist_id', nutritionistId)
      .in('status', [
        'cancelled',
        'cancelled_by_patient',
        'cancelled_by_nutritionist',
      ]);

    return NextResponse.json(
      {
        appointments: enrichedAppointments,
        total: appointments?.length || 0,
        pending_count: pendingCount || 0,
        upcoming_count: upcomingCount || 0,
        past_count: pastCount || 0,
        cancelled_count: cancelledCount || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/nutritionist/appointments:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
