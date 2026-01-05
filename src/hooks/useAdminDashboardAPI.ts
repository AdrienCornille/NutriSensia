/**
 * Hook pour récupérer les données du dashboard administrateur via API route
 * Utilise une API route côté serveur pour accéder aux données avec service role
 */

import { useState, useEffect } from 'react';

interface DashboardMetrics {
  totalUsers: number;
  totalSessions: number;
  totalABTests: number;
  conversionRate: number;
}

interface UserStats {
  total: number;
  byRole: {
    admin: number;
    nutritionist: number;
    patient: number;
  };
  recent: number;
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

interface DashboardData {
  metrics: DashboardMetrics;
  userStats: UserStats;
  sessionStats: SessionStats;
  abTestStats: ABTestStats;
}

export const useAdminDashboardAPI = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [Admin Dashboard API] Récupération des données...');

      const response = await fetch('/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Erreur lors de la récupération des données'
        );
      }

      const dashboardData = await response.json();
      setData(dashboardData);

      console.log(
        '✅ [Admin Dashboard API] Données récupérées:',
        dashboardData
      );
    } catch (err: any) {
      console.error('❌ [Admin Dashboard API] Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    data,
    loading,
    error,
    loadDashboardData,
  };
};
