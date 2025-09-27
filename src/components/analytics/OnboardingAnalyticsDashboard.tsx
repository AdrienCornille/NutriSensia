/**
 * Tableau de bord pour les analytics d'onboarding
 * Affiche les métriques et visualisations des données d'onboarding
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  SkipForward,
} from 'lucide-react';
import { OnboardingDashboardData, OnboardingRole } from '@/types/analytics';

interface OnboardingAnalyticsDashboardProps {
  timeframe?: '1d' | '7d' | '30d' | '90d';
  role?: OnboardingRole;
  className?: string;
}

/**
 * Composant de métrique individuelle
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  format?: 'number' | 'percentage' | 'time' | 'currency';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
  format = 'number',
}) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
    },
    green: {
      bg: 'from-green-50 to-green-100', 
      text: 'text-green-700',
      border: 'border-green-200',
      icon: 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
    },
    yellow: {
      bg: 'from-yellow-50 to-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg'
    },
    red: {
      bg: 'from-red-50 to-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg'
    },
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${val}%`;
      case 'time':
        return `${Math.round(val / 1000)}s`;
      case 'currency':
        return `€${val}`;
      default:
        return val.toLocaleString();
    }
  };

  const currentColor = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.3 }}
      className={`relative p-6 rounded-xl border ${currentColor.border} bg-gradient-to-br ${currentColor.bg} shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 tracking-wide uppercase mb-2 opacity-90">{title}</p>
          <p className={`text-3xl font-bold tracking-tight ${currentColor.text} mb-1`}>{formatValue(value)}</p>
          {change !== undefined && (
            <p className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↗' : '↘'} {change >= 0 ? '+' : ''}{change}% vs précédente
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${currentColor.icon} group-hover:scale-110 transition-transform duration-300 ml-4`}>
          {icon}
        </div>
      </div>
      
      {/* Effet de brillance subtil au hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none transform -skew-x-12"></div>
    </motion.div>
  );
};

/**
 * Composant de graphique en barres simple
 */
interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value || 0));
  // Utiliser 100 comme référence pour les pourcentages
  const referenceValue = Math.max(maxValue, 100);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">{title}</h3>
      <div className="space-y-5">
        {data.map((item, index) => (
          <motion.div 
            key={index} 
            className="group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 tracking-wide">
                {item.label}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {isNaN(item.value) ? '0%' : `${Math.round(item.value || 0)}%`}
              </span>
            </div>
            
            <div className="relative bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max((item.value || 0) / referenceValue * 100, 2)}%` }}
                transition={{ duration: 1.2, delay: index * 0.15, ease: "easeOut" }}
                className="h-3 rounded-full relative overflow-hidden group-hover:h-4 transition-all duration-300"
                style={{ 
                  background: `linear-gradient(90deg, ${item.color || '#3b82f6'}, ${item.color || '#3b82f6'}cc, ${item.color || '#3b82f6'})`
                }}
              >
                {/* Dégradé radial pour la profondeur */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(ellipse at top, ${item.color || '#3b82f6'}40, transparent 70%)`
                  }}
                ></div>
                
                {/* Effet de brillance animé */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Bordure subtile */}
                <div 
                  className="absolute inset-0 rounded-full ring-1 ring-inset"
                  style={{ 
                    ringColor: `${item.color || '#3b82f6'}20`
                  }}
                ></div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/**
 * Composant de graphique en secteurs simple
 */
interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  title: string;
}

const PieChartComponent: React.FC<PieChartProps> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  // Protection contre les données vides
  if (total === 0 || !data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  // Filtrer les données pour le graphique (seulement celles avec valeur > 0)
  const chartData = data.filter(item => item.value > 0);

  return (
    <div className="bg-white p-6 rounded-lg border h-full">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">{title}</h3>
      
      {/* Layout vertical : graphique en haut, légende en bas sur une ligne */}
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        
        {/* Graphique - plus gros et centré en haut */}
        <div className="flex justify-center">
          <div className="w-80 h-80 lg:w-72 lg:h-72 xl:w-80 xl:h-80 relative">
              {chartData.length === 1 ? (
                // Cas spécial : un seul segment = cercle complet avec dégradé et pourcentage
                <svg viewBox="0 0 120 120" className="w-full h-full filter drop-shadow-lg">
                  <defs>
                    <radialGradient id="singleGradient" cx="30%" cy="30%">
                      <stop offset="0%" stopColor={`${chartData[0].color}20`} />
                      <stop offset="100%" stopColor={chartData[0].color} />
                    </radialGradient>
                  </defs>
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="url(#singleGradient)"
                    stroke="white"
                    strokeWidth="3"
                  />
                  {/* Pourcentage centré dans le cercle */}
                  <text
                    x="60"
                    y="65"
                    textAnchor="middle"
                    className="text-2xl font-bold fill-white drop-shadow-lg"
                  >
                    {total > 0 ? Math.round((chartData[0].value / total) * 100) : 0}%
                  </text>
                </svg>
              ) : (
                // Cas normal : graphique en secteurs avec dégradés et pourcentages
                <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90 filter drop-shadow-lg">
                  <defs>
                    {chartData.map((item, index) => (
                      <radialGradient key={index} id={`gradient-${index}`} cx="30%" cy="30%">
                        <stop offset="0%" stopColor={`${item.color}40`} />
                        <stop offset="100%" stopColor={item.color} />
                      </radialGradient>
                    ))}
                  </defs>
                  {chartData.map((item, index) => {
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    const startAngle = cumulativePercentage * 3.6;
                    const endAngle = (cumulativePercentage + percentage) * 3.6;
                    cumulativePercentage += percentage;

                    const x1 = 60 + 50 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 60 + 50 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 60 + 50 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 60 + 50 * Math.sin((endAngle * Math.PI) / 180);
                    const largeArcFlag = percentage > 50 ? 1 : 0;

                    const pathData = [
                      `M 60 60`,
                      `L ${x1} ${y1}`,
                      `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      'Z',
                    ].join(' ');

                    // Calculer la position du texte au centre du secteur
                    const midAngle = (startAngle + endAngle) / 2;
                    const textRadius = 25; // Distance du centre pour le texte
                    const textX = 60 + textRadius * Math.cos((midAngle * Math.PI) / 180);
                    const textY = 60 + textRadius * Math.sin((midAngle * Math.PI) / 180);

                    return (
                      <g key={index}>
                        <path
                          d={pathData}
                          fill={`url(#gradient-${index})`}
                          stroke="white"
                          strokeWidth="3"
                        />
                        {/* Pourcentage dans le secteur */}
                        {percentage > 5 && (
                          <text
                            x={textX}
                            y={textY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-sm font-bold fill-white drop-shadow-lg"
                            transform={`rotate(${midAngle + 90} ${textX} ${textY})`}
                          >
                            {Math.round(percentage)}%
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
            )}
          </div>
        </div>
        
        {/* Légende - en ligne horizontale en bas */}
        <div className="w-full max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {data.map((item, index) => (
              <div key={index} className="group flex-shrink-0">
                <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant principal du tableau de bord
 */
export const OnboardingAnalyticsDashboard: React.FC<OnboardingAnalyticsDashboardProps> = ({
  timeframe = '7d',
  role,
  className = '',
}) => {
  const [data, setData] = useState<OnboardingDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          timeframe,
          type: 'dashboard',
        });

        if (role) {
          params.append('role', role);
        }

        const response = await fetch(`/api/analytics/onboarding/metrics?${params}`);
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeframe, role]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Erreur de chargement</span>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`p-6 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    );
  }

  const { overview, funnel, errors, helpRequests, trends } = data;
  
  

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Utilisateurs totaux"
          value={overview.totalUsers}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Taux de completion"
          value={overview.completionRate}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
          format="percentage"
        />
        <MetricCard
          title="Temps moyen"
          value={overview.averageTimeToComplete}
          icon={<Clock className="h-6 w-6" />}
          color="purple"
          format="time"
        />
        <MetricCard
          title="Utilisateurs actifs"
          value={overview.currentActiveUsers}
          icon={<Activity className="h-6 w-6" />}
          color="yellow"
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel d'onboarding */}
        <BarChart
          title="Funnel d'onboarding"
          data={funnel && Array.isArray(funnel) ? funnel.map((step, index) => {
            // Palette de couleurs étendue pour une meilleure visibilité
            const colors = [
              '#10b981', // Vert émeraude
              '#3b82f6', // Bleu
              '#f59e0b', // Orange
              '#ef4444', // Rouge
              '#8b5cf6', // Violet
              '#06b6d4', // Cyan
              '#84cc16', // Lime
              '#f97316', // Orange vif
              '#ec4899', // Rose
              '#6366f1', // Indigo
              '#14b8a6', // Teal
              '#f43f5e', // Rose vif
              '#a855f7', // Violet vif
              '#22c55e', // Vert
              '#eab308', // Jaune
            ];
            
            // Fonction de traduction des étapes en français explicite
            const translateStepName = (stepName: string) => {
              const stepTranslations: { [key: string]: string } = {
                'welcome': 'Bienvenue & Présentation',
                'personal-info': 'Informations Personnelles',
                'credentials': 'Identifiants & Diplômes',
                'practice-details': 'Détails du Cabinet',
                'specializations': 'Spécialisations Médicales',
                'consultation-rates': 'Tarifs de Consultation',
                'platform-training': 'Formation à la Plateforme',
                'completion': 'Finalisation & Validation',
                'terms': 'Conditions d\'Utilisation',
                'privacy': 'Politique de Confidentialité',
                'marketing': 'Consentement Marketing',
                'profile': 'Profil Professionnel',
                'verification': 'Vérification d\'Identité',
                'setup': 'Configuration Initiale',
                'onboarding': 'Processus d\'Intégration'
              };
              
              return stepTranslations[stepName] || stepName.charAt(0).toUpperCase() + stepName.slice(1).replace(/-/g, ' ');
            };
            
            // Utiliser l'index modulo pour éviter les doublons
            const colorIndex = index % colors.length;
            
            return {
              label: translateStepName(step.step || `étape-${index + 1}`),
              value: step.completion_rate || 0,
              color: colors[colorIndex],
            };
          }) : []}
        />

        {/* Répartition des statuts */}
        <PieChartComponent
          title="Répartition des utilisateurs"
          data={[
            {
              label: 'Complétés',
              value: overview.completedUsers || 0,
              color: '#10b981',
            },
            {
              label: 'Abandonnés',
              value: overview.abandonedUsers || 0,
              color: '#ef4444',
            },
            {
              label: 'En cours',
              value: Math.max(0, (overview.totalUsers || 0) - (overview.completedUsers || 0) - (overview.abandonedUsers || 0)),
              color: '#f59e0b',
            },
          ]}
        />
      </div>

      {/* Erreurs et demandes d'aide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Erreurs par étape */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold mb-6 flex items-center space-x-3 text-gray-800">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <span>Erreurs par étape</span>
          </h3>
          <div className="space-y-4">
            {errors && errors.length > 0 ? (
              errors.slice(0, 5).map((error, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 hover:shadow-md transition-all duration-200 group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800 mb-1">{error.step}</p>
                    <p className="text-xs text-gray-600 tracking-wide">{error.errorType}</p>
                  </div>
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm group-hover:scale-110 transition-transform duration-200">
                    {error.count}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <p className="text-gray-500 font-medium">Aucune erreur enregistrée</p>
              </div>
            )}
          </div>
        </div>

        {/* Demandes d'aide */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold mb-6 flex items-center space-x-3 text-gray-800">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <HelpCircle className="h-5 w-5" />
            </div>
            <span>Demandes d'aide</span>
          </h3>
          <div className="space-y-4">
            {helpRequests && helpRequests.length > 0 ? (
              helpRequests.slice(0, 5).map((help, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200 group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800 mb-1">{help.step}</p>
                    <p className="text-xs text-gray-600 tracking-wide">{help.helpType}</p>
                  </div>
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm group-hover:scale-110 transition-transform duration-200">
                    {help.count}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <p className="text-gray-500 font-medium">Aucune demande d'aide enregistrée</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tendances temporelles */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-semibold mb-6 flex items-center space-x-3 text-gray-800">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span>Tendances sur 7 jours</span>
        </h3>
        
        {/* Graphique de tendances */}
        <div className="mb-6">
          {trends && trends.length > 0 ? (
            <div className="h-72 flex items-end justify-between gap-3 bg-gradient-to-t from-gray-50 to-transparent p-4 rounded-xl">
              {trends.slice(-7).map((trend, index) => {
                const maxUsers = Math.max(...trends.slice(-7).map(t => t.usersStarted || 0));
                const height = maxUsers > 0 ? ((trend.usersStarted || 0) / maxUsers) * 100 : 0;
                const completionHeight = maxUsers > 0 ? ((trend.usersCompleted || 0) / maxUsers) * 100 : 0;
                
                return (
                  <motion.div 
                    key={index} 
                    className="flex-1 flex flex-col items-center space-y-3 group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* Barres empilées avec effets et pourcentages intégrés */}
                    <div className="w-full h-40 flex flex-col justify-end relative">
                      {/* Barre des complétions (vert) avec pourcentage intégré */}
                      <motion.div
                        className="w-full rounded-t-lg relative overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300 flex items-center justify-center"
                        style={{ 
                          height: `${completionHeight}%`,
                          background: 'linear-gradient(180deg, #10b981, #059669)',
                          minHeight: completionHeight > 0 ? '20px' : '0px'
                        }}
                        title={`Complétés: ${trend.usersCompleted || 0}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${completionHeight}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
                        {/* Pourcentage des complétions */}
                        {completionHeight > 15 && (
                          <span className="relative z-10 text-xs font-bold text-white drop-shadow-sm">
                            {trend.completionRate || 0}%
                          </span>
                        )}
                      </motion.div>
                      
                      {/* Barre des débuts (bleu) avec pourcentage intégré */}
                      <motion.div
                        className="w-full rounded-b-lg relative overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300 flex items-center justify-center"
                        style={{ 
                          height: `${Math.max(height - completionHeight, 0)}%`,
                          background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)',
                          minHeight: height - completionHeight > 0 ? '20px' : '0px'
                        }}
                        title={`Débuts: ${trend.usersStarted || 0}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height - completionHeight, 0)}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
                        {/* Pourcentage de conversion (débuts vers complétions) */}
                        {height - completionHeight > 15 && (
                          <span className="relative z-10 text-xs font-bold text-white drop-shadow-sm">
                            {trend.usersStarted > 0 ? Math.round(((trend.usersCompleted || 0) / (trend.usersStarted || 1)) * 100) : 0}%
                          </span>
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Légende simplifiée - uniquement le jour */}
                    <div className="w-full text-center">
                      <p className="text-xs font-semibold text-gray-800 tracking-wide">
                        {new Date(trend.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <p className="text-gray-500 font-medium">Aucune donnée de tendance disponible</p>
            </div>
          )}
          
          {/* Légende du graphique */}
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Débuts d'onboarding</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Complétions</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default OnboardingAnalyticsDashboard;
