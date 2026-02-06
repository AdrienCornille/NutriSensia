/**
 * Composant client pour le dashboard administrateur
 *
 * Ce composant gère l'authentification et la protection d'accès
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/AuthContext';
import { useAdminDashboardAPI } from '@/hooks/useAdminDashboardAPI';
import {
  BarChart3,
  Users,
  Settings,
  TestTube,
  BarChart,
  Shield,
  Database,
  Activity,
  TrendingUp,
  Eye,
  Play,
  FileText,
  RefreshCw,
  UserCheck,
} from 'lucide-react';

export default function AdminDashboardClient() {
  const { user, isAuthenticated, loading } = useAuth();
  const { hasRole, isAdmin } = usePermissions();
  const [isLoading, setIsLoading] = useState(true);

  // Hook pour récupérer les données réelles du dashboard
  const {
    data: dashboardData,
    loading: dataLoading,
    error: dataError,
    loadDashboardData,
  } = useAdminDashboardAPI();

  // Extraire les données du dashboard
  const metrics = dashboardData?.metrics || {
    totalUsers: 0,
    totalSessions: 0,
    totalABTests: 0,
    conversionRate: 0,
  };

  const userStats = dashboardData?.userStats || {
    total: 0,
    byRole: { admin: 0, nutritionist: 0, patient: 0 },
    recent: 0,
  };

  const sessionStats = dashboardData?.sessionStats || {
    total: 0,
    active: 0,
    completed: 0,
    abandoned: 0,
  };

  const abTestStats = dashboardData?.abTestStats || {
    total: 0,
    active: 0,
    completed: 0,
  };

  // Debug logs
  useEffect(() => {
    console.log('🔍 [Admin Dashboard Debug]', {
      user: !!user,
      isAuthenticated,
      loading,
      userRole: user?.user_metadata?.role,
      isAdmin: isAdmin(),
      hasAdminRole: hasRole('admin'),
    });

    if (!loading) {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, loading, isAdmin, hasRole]);

  // Affichage de chargement
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    );
  }

  // Vérification d'accès admin
  if (!isAuthenticated || !hasRole('admin')) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-600 text-xl font-semibold mb-2'>
            Accès Refusé
          </div>
          <p className='text-gray-600 mb-4'>
            Vous devez être administrateur pour accéder à ce dashboard.
          </p>
          <div className='space-x-4'>
            <button
              onClick={() => (window.location.href = '/auth/signin')}
              className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
            >
              Se connecter
            </button>
            <button
              onClick={() => (window.location.href = '/debug-auth-status')}
              className='bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700'
            >
              Diagnostic
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                🛡️ Dashboard Administrateur
              </h1>
              <p className='text-gray-600 mt-1'>
                Tableau de bord principal pour la gestion de NutriSensia
              </p>
              {dataError && (
                <div className='mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm'>
                  ⚠️ Erreur de chargement des données: {dataError}
                </div>
              )}
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={loadDashboardData}
                disabled={dataLoading}
                className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <RefreshCw
                  className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`}
                />
                Actualiser
              </button>
              <div className='text-sm text-gray-500'>
                Connecté en tant que{' '}
                <span className='font-medium text-gray-900'>{user?.email}</span>
              </div>
              <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                <Shield className='w-4 h-4 text-white' />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Métriques rapides */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Users className='w-6 h-6 text-blue-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Utilisateurs
                </p>
                {dataLoading ? (
                  <div className='animate-pulse bg-gray-200 h-8 w-16 rounded'></div>
                ) : (
                  <p className='text-2xl font-bold text-gray-900'>
                    {metrics.totalUsers.toLocaleString()}
                  </p>
                )}
                {userStats.recent > 0 && (
                  <p className='text-xs text-green-600 mt-1'>
                    +{userStats.recent} ce mois
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <Activity className='w-6 h-6 text-green-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>Sessions</p>
                {dataLoading ? (
                  <div className='animate-pulse bg-gray-200 h-8 w-16 rounded'></div>
                ) : (
                  <p className='text-2xl font-bold text-gray-900'>
                    {metrics.totalSessions.toLocaleString()}
                  </p>
                )}
                {sessionStats.active > 0 && (
                  <p className='text-xs text-blue-600 mt-1'>
                    {sessionStats.active} actives
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-purple-100 rounded-lg'>
                <TestTube className='w-6 h-6 text-purple-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>Tests A/B</p>
                {dataLoading ? (
                  <div className='animate-pulse bg-gray-200 h-8 w-16 rounded'></div>
                ) : (
                  <p className='text-2xl font-bold text-gray-900'>
                    {metrics.totalABTests}
                  </p>
                )}
                {abTestStats.active > 0 && (
                  <p className='text-xs text-purple-600 mt-1'>
                    {abTestStats.active} actifs
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-orange-100 rounded-lg'>
                <TrendingUp className='w-6 h-6 text-orange-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>Conversion</p>
                {dataLoading ? (
                  <div className='animate-pulse bg-gray-200 h-8 w-16 rounded'></div>
                ) : (
                  <p className='text-2xl font-bold text-gray-900'>
                    {metrics.conversionRate.toFixed(1)}%
                  </p>
                )}
                {sessionStats.completed > 0 && (
                  <p className='text-xs text-orange-600 mt-1'>
                    {sessionStats.completed} complétées
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sections principales */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Analytics et Rapports */}
          <div className='bg-white rounded-lg shadow-sm'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center'>
                <BarChart className='w-6 h-6 text-blue-600 mr-3' />
                <h2 className='text-xl font-semibold text-gray-900'>
                  Analytics & Rapports
                </h2>
              </div>
            </div>
            <div className='p-6'>
              <div className='space-y-4'>
                <a
                  href='/admin/dashboard/analytics/onboarding'
                  className='flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  <BarChart3 className='w-5 h-5 text-blue-600 mr-3' />
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      Analytics d'Onboarding
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Métriques et analyses du processus d'onboarding
                    </p>
                  </div>
                </a>

                <a
                  href='/admin/dashboard/ab-testing/ab-demo'
                  className='flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  <TestTube className='w-5 h-5 text-purple-600 mr-3' />
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      Démo A/B Testing (Complète)
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Interface complète de démonstration des tests A/B
                    </p>
                  </div>
                </a>

                <a
                  href='/admin/dashboard/ab-testing/ab-basic-demo'
                  className='flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  <Eye className='w-5 h-5 text-green-600 mr-3' />
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      Démo A/B Testing (Basique)
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Version simplifiée avec métriques statiques
                    </p>
                  </div>
                </a>

                <a
                  href='/admin/dashboard/ab-testing/ab-simple-demo'
                  className='flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  <Play className='w-5 h-5 text-orange-600 mr-3' />
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      Démo A/B Testing (Simple)
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Version ultra-simplifiée pour tests rapides
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Gestion et Administration */}
          <div className='bg-white rounded-lg shadow-sm'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center'>
                <Settings className='w-6 h-6 text-green-600 mr-3' />
                <h2 className='text-xl font-semibold text-gray-900'>
                  Gestion & Administration
                </h2>
              </div>
            </div>
            <div className='p-6'>
              <div className='space-y-4'>
                <a
                  href='/admin/nutritionists'
                  className='flex items-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200'
                >
                  <UserCheck className='w-5 h-5 text-emerald-600 mr-3' />
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      Validation Nutritionnistes
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Valider les demandes d'inscription des nutritionnistes
                    </p>
                  </div>
                </a>

                <a
                  href='/admin/users'
                  className='flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  <Users className='w-5 h-5 text-blue-600 mr-3' />
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      Gestion des Utilisateurs
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Gérer les comptes utilisateurs et leurs rôles
                    </p>
                  </div>
                </a>

                <a
                  href='/admin/settings'
                  className='flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  <Settings className='w-5 h-5 text-gray-600 mr-3' />
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      Paramètres Système
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Configuration générale de l'application
                    </p>
                  </div>
                </a>

                <a
                  href='/admin/database'
                  className='flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  <Database className='w-5 h-5 text-purple-600 mr-3' />
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      Base de Données
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Gestion et maintenance de la base de données
                    </p>
                  </div>
                </a>

                <a
                  href='/admin/logs'
                  className='flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  <FileText className='w-5 h-5 text-orange-600 mr-3' />
                  <div>
                    <h3 className='font-medium text-gray-900'>Logs Système</h3>
                    <p className='text-sm text-gray-500'>
                      Consulter les logs et événements système
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className='mt-8 bg-white rounded-lg shadow-sm'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Actions Rapides
            </h2>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <button className='flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'>
                <BarChart3 className='w-5 h-5 text-blue-600 mr-2' />
                <span className='font-medium text-blue-900'>
                  Générer Rapport
                </span>
              </button>

              <button className='flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors'>
                <TestTube className='w-5 h-5 text-green-600 mr-2' />
                <span className='font-medium text-green-900'>
                  Nouveau Test A/B
                </span>
              </button>

              <button className='flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors'>
                <Users className='w-5 h-5 text-purple-600 mr-2' />
                <span className='font-medium text-purple-900'>
                  Ajouter Utilisateur
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Détails des utilisateurs par rôle */}
        <div className='mt-8 bg-white rounded-lg shadow-sm'>
          <div className='p-6 border-b border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900'>
              Répartition des Utilisateurs
            </h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {userStats.byRole.admin}
                </div>
                <div className='text-sm text-gray-500'>Administrateurs</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {userStats.byRole.nutritionist}
                </div>
                <div className='text-sm text-gray-500'>Nutritionnistes</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>
                  {userStats.byRole.patient}
                </div>
                <div className='text-sm text-gray-500'>Patients</div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations système */}
        <div className='mt-8 bg-gray-50 rounded-lg p-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Informations Système
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div>
              <span className='font-medium text-gray-700'>Version:</span>
              <span className='ml-2 text-gray-600'>1.0.0</span>
            </div>
            <div>
              <span className='font-medium text-gray-700'>Environnement:</span>
              <span className='ml-2 text-gray-600'>Développement</span>
            </div>
            <div>
              <span className='font-medium text-gray-700'>
                Dernière mise à jour:
              </span>
              <span className='ml-2 text-gray-600'>Aujourd'hui</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
