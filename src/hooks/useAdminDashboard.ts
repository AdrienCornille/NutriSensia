/**
 * Hook pour récupérer les données réelles du dashboard administrateur
 * Utilise Supabase pour récupérer les métriques en temps réel
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardMetrics {
  totalUsers: number;
  totalSessions: number;
  totalABTests: number;
  conversionRate: number;
  loading: boolean;
  error: string | null;
}

interface UserStats {
  total: number;
  byRole: {
    admin: number;
    nutritionist: number;
    patient: number;
  };
  recent: number; // Utilisateurs créés dans les 30 derniers jours
}

interface SessionStats {
  total: number;
  active: number;
  completed: number;
  abandoned: number;
}

interface ABTestStats {
  total: number;
  active: number;
  completed: number;
}

export const useAdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalSessions: 0,
    totalABTests: 0,
    conversionRate: 0,
    loading: true,
    error: null,
  });

  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    byRole: { admin: 0, nutritionist: 0, patient: 0 },
    recent: 0,
  });

  const [sessionStats, setSessionStats] = useState<SessionStats>({
    total: 0,
    active: 0,
    completed: 0,
    abandoned: 0,
  });

  const [abTestStats, setAbTestStats] = useState<ABTestStats>({
    total: 0,
    active: 0,
    completed: 0,
  });

  // Fonction pour récupérer les statistiques des utilisateurs
  const fetchUserStats = async () => {
    try {
      console.log('🔄 [Admin Dashboard] Récupération des statistiques utilisateurs...');

      // Essayer d'abord une récupération simple pour diagnostiquer
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*');

      console.log('🔍 [Admin Dashboard] Récupération simple:', { 
        count: allProfiles?.length || 0, 
        error: allError 
      });

      if (allError) {
        console.error('❌ [Admin Dashboard] Erreur récupération simple:', allError);
        throw allError;
      }

      // Utiliser les données récupérées pour calculer les statistiques
      const totalUsers = allProfiles?.length || 0;
      const roleData = allProfiles?.map(p => ({ role: p.role })) || [];

      console.log('🔍 [Admin Dashboard] Données rôles calculées:', roleData);

      // Calculer les statistiques par rôle
      const byRole = roleData?.reduce((acc, user) => {
        acc[user.role as keyof typeof acc] = (acc[user.role as keyof typeof acc] || 0) + 1;
        return acc;
      }, { admin: 0, nutritionist: 0, patient: 0 }) || { admin: 0, nutritionist: 0, patient: 0 };

      // Calculer les utilisateurs récents (30 derniers jours) à partir des données récupérées
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentUsers = allProfiles?.filter(profile => {
        const createdAt = new Date(profile.created_at);
        return createdAt >= thirtyDaysAgo;
      }).length || 0;

      console.log('🔍 [Admin Dashboard] Utilisateurs récents calculés:', recentUsers);

      setUserStats({
        total: totalUsers || 0,
        byRole,
        recent: recentUsers || 0,
      });

      console.log('✅ [Admin Dashboard] Statistiques utilisateurs récupérées:', {
        total: totalUsers,
        byRole,
        recent: recentUsers,
      });

    } catch (error: any) {
      console.error('❌ [Admin Dashboard] Erreur récupération utilisateurs:', error);
      setMetrics(prev => ({ ...prev, error: error.message }));
    }
  };

  // Fonction pour récupérer les statistiques des sessions
  const fetchSessionStats = async () => {
    try {
      console.log('🔄 [Admin Dashboard] Récupération des statistiques sessions...');

      // Vérifier si la table onboarding_sessions existe
      const { data: sessionData, error: sessionError } = await supabase
        .from('onboarding_sessions')
        .select('status, created_at');

      if (sessionError) {
        console.warn('⚠️ [Admin Dashboard] Table onboarding_sessions non disponible:', sessionError.message);
        setSessionStats({
          total: 0,
          active: 0,
          completed: 0,
          abandoned: 0,
        });
        return;
      }

      // Calculer les statistiques des sessions
      const total = sessionData?.length || 0;
      const active = sessionData?.filter(s => s.status === 'active').length || 0;
      const completed = sessionData?.filter(s => s.status === 'completed').length || 0;
      const abandoned = sessionData?.filter(s => s.status === 'abandoned').length || 0;

      setSessionStats({
        total,
        active,
        completed,
        abandoned,
      });

      console.log('✅ [Admin Dashboard] Statistiques sessions récupérées:', {
        total,
        active,
        completed,
        abandoned,
      });

    } catch (error: any) {
      console.error('❌ [Admin Dashboard] Erreur récupération sessions:', error);
    }
  };

  // Fonction pour récupérer les statistiques des tests A/B
  const fetchABTestStats = async () => {
    try {
      console.log('🔄 [Admin Dashboard] Récupération des statistiques tests A/B...');

      // Pour l'instant, on simule des données car les tests A/B ne sont pas encore implémentés
      // TODO: Implémenter quand les tests A/B seront créés
      setAbTestStats({
        total: 0,
        active: 0,
        completed: 0,
      });

      console.log('✅ [Admin Dashboard] Statistiques tests A/B récupérées (simulées)');

    } catch (error: any) {
      console.error('❌ [Admin Dashboard] Erreur récupération tests A/B:', error);
    }
  };

  // Fonction pour calculer le taux de conversion
  const calculateConversionRate = () => {
    if (sessionStats.total === 0) return 0;
    return Math.round((sessionStats.completed / sessionStats.total) * 100 * 100) / 100; // Arrondi à 2 décimales
  };

  // Charger toutes les données
  const loadDashboardData = async () => {
    try {
      setMetrics(prev => ({ ...prev, loading: true, error: null }));

      await Promise.all([
        fetchUserStats(),
        fetchSessionStats(),
        fetchABTestStats(),
      ]);

      // Calculer le taux de conversion
      const conversionRate = calculateConversionRate();

      setMetrics(prev => ({
        ...prev,
        totalUsers: userStats.total,
        totalSessions: sessionStats.total,
        totalABTests: abTestStats.total,
        conversionRate,
        loading: false,
      }));

    } catch (error: any) {
      console.error('❌ [Admin Dashboard] Erreur chargement données:', error);
      setMetrics(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Recalculer le taux de conversion quand les sessions changent
  useEffect(() => {
    const conversionRate = calculateConversionRate();
    setMetrics(prev => ({
      ...prev,
      conversionRate,
    }));
  }, [sessionStats]);

  return {
    metrics,
    userStats,
    sessionStats,
    abTestStats,
    loadDashboardData,
    loading: metrics.loading,
    error: metrics.error,
  };
};
