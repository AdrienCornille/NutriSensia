/**
 * API route pour récupérer les données du dashboard administrateur
 * Utilise le service role key côté serveur pour contourner les politiques RLS
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est authentifié et admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
      return NextResponse.json(
        { error: 'Variables d\'environnement Supabase manquantes' },
        { status: 500 }
      );
    }

    // Créer un client avec service role pour contourner RLS
    const supabaseService = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Récupérer les données des utilisateurs
    const { data: profiles, error: profilesError } = await supabaseService
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ [API Dashboard] Erreur récupération profils:', profilesError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des profils' },
        { status: 500 }
      );
    }

    // Calculer les statistiques des utilisateurs
    const totalUsers = profiles?.length || 0;
    const byRole = profiles?.reduce((acc, user) => {
      acc[user.role as keyof typeof acc] = (acc[user.role as keyof typeof acc] || 0) + 1;
      return acc;
    }, { admin: 0, nutritionist: 0, patient: 0 }) || { admin: 0, nutritionist: 0, patient: 0 };

    // Calculer les utilisateurs récents (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = profiles?.filter(profile => {
      const createdAt = new Date(profile.created_at);
      return createdAt >= thirtyDaysAgo;
    }).length || 0;

    // Récupérer les données des sessions
    const { data: sessions, error: sessionsError } = await supabaseService
      .from('onboarding_sessions')
      .select('status, created_at');

    let sessionStats = {
      total: 0,
      active: 0,
      completed: 0,
      abandoned: 0,
    };

    if (!sessionsError && sessions) {
      sessionStats = {
        total: sessions.length,
        active: sessions.filter(s => s.status === 'active').length,
        completed: sessions.filter(s => s.status === 'completed').length,
        abandoned: sessions.filter(s => s.status === 'abandoned').length,
      };
    }

    // Calculer le taux de conversion
    const conversionRate = sessionStats.total > 0 
      ? Math.round((sessionStats.completed / sessionStats.total) * 100 * 100) / 100 
      : 0;

    // Retourner les données du dashboard
    const dashboardData = {
      metrics: {
        totalUsers,
        totalSessions: sessionStats.total,
        totalABTests: 0, // Pas encore implémenté
        conversionRate,
      },
      userStats: {
        total: totalUsers,
        byRole,
        recent: recentUsers,
      },
      sessionStats,
      abTestStats: {
        total: 0,
        active: 0,
        completed: 0,
      },
    };

    console.log('✅ [API Dashboard] Données récupérées:', {
      totalUsers,
      byRole,
      recentUsers,
      sessions: sessionStats.total,
    });

    return NextResponse.json(dashboardData);

  } catch (error: any) {
    console.error('❌ [API Dashboard] Erreur générale:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}