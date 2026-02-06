/**
 * Page d'administration pour les analytics d'onboarding
 * Affiche le tableau de bord des métriques d'onboarding
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Users,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { OnboardingAnalyticsDashboard } from '@/components/analytics/OnboardingAnalyticsDashboard';
import { OnboardingRole } from '@/types/analytics';
import { AdminGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/AuthContext';

// Force dynamic rendering - cette page utilise useAuth qui nécessite AuthProvider
export const dynamic = 'force-dynamic';

/**
 * Page des analytics d'onboarding
 */
export default function OnboardingAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [role, setRole] = useState<OnboardingRole | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, loading } = useAuth();
  const { hasRole, isAdmin } = usePermissions();

  // Debug logs
  useEffect(() => {
    console.log('🔍 [Analytics Page Debug]', {
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Forcer le rechargement en changeant temporairement la clé
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExport = () => {
    // TODO: Implémenter l'export des données
    console.log("Export des données d'analytics");
  };

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

  // Vérification directe d'accès admin (solution de contournement)
  if (!isAuthenticated || !hasRole('admin')) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-600 text-xl font-semibold mb-2'>
            Accès Refusé
          </div>
          <p className='text-gray-600 mb-4'>
            Vous devez être administrateur pour accéder à cette page.
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
    <AdminGuard
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='text-red-600 text-xl font-semibold mb-2'>
              Accès Refusé
            </div>
            <p className='text-gray-600'>
              Vous devez être administrateur pour accéder à cette page.
            </p>
          </div>
        </div>
      }
    >
      <div className='min-h-screen bg-gray-50'>
        {/* En-tête */}
        <div className='bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='py-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 flex items-center space-x-2'>
                    <BarChart3 className='h-8 w-8 text-blue-600' />
                    <span>Analytics d'Onboarding</span>
                  </h1>
                  <p className='text-gray-600 mt-1'>
                    Suivi et analyse des parcours d'onboarding des utilisateurs
                  </p>
                </div>

                <div className='flex items-center space-x-3'>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className='flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                    <span>Actualiser</span>
                  </button>

                  <button
                    onClick={handleExport}
                    className='flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <Download className='h-4 w-4' />
                    <span>Exporter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className='bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='py-4'>
              <div className='flex items-center space-x-6'>
                {/* Filtre par période */}
                <div className='flex items-center space-x-2'>
                  <Calendar className='h-4 w-4 text-gray-500' />
                  <label className='text-sm font-medium text-gray-700'>
                    Période:
                  </label>
                  <select
                    value={timeframe}
                    onChange={e => setTimeframe(e.target.value as any)}
                    className='ml-2 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='1d'>Dernières 24h</option>
                    <option value='7d'>7 derniers jours</option>
                    <option value='30d'>30 derniers jours</option>
                    <option value='90d'>90 derniers jours</option>
                  </select>
                </div>

                {/* Filtre par rôle */}
                <div className='flex items-center space-x-2'>
                  <Users className='h-4 w-4 text-gray-500' />
                  <label className='text-sm font-medium text-gray-700'>
                    Rôle:
                  </label>
                  <select
                    value={role || ''}
                    onChange={e =>
                      setRole((e.target.value as OnboardingRole) || undefined)
                    }
                    className='ml-2 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value=''>Tous les rôles</option>
                    <option value='nutritionist'>Nutritionnistes</option>
                    <option value='patient'>Patients</option>
                    <option value='admin'>Administrateurs</option>
                  </select>
                </div>

                {/* Indicateur de filtres actifs */}
                {(timeframe !== '7d' || role) && (
                  <div className='flex items-center space-x-2 text-sm text-blue-600'>
                    <Filter className='h-4 w-4' />
                    <span>Filtres actifs</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <motion.div
            key={`${timeframe}-${role}-${isRefreshing}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <OnboardingAnalyticsDashboard timeframe={timeframe} role={role} />
          </motion.div>
        </div>

        {/* Informations supplémentaires */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
            <h3 className='text-lg font-semibold text-blue-900 mb-2'>
              À propos des analytics d'onboarding
            </h3>
            <div className='text-blue-800 space-y-2'>
              <p>
                Ce tableau de bord vous permet de suivre et analyser les
                parcours d'onboarding de vos utilisateurs pour optimiser leur
                expérience.
              </p>
              <ul className='list-disc list-inside space-y-1 text-sm'>
                <li>
                  <strong>Funnel d'onboarding:</strong> Visualisez où les
                  utilisateurs abandonnent
                </li>
                <li>
                  <strong>Erreurs par étape:</strong> Identifiez les problèmes
                  récurrents
                </li>
                <li>
                  <strong>Demandes d'aide:</strong> Comprenez où les
                  utilisateurs ont besoin d'assistance
                </li>
                <li>
                  <strong>Tendances temporelles:</strong> Suivez l'évolution des
                  métriques dans le temps
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
