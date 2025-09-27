/**
 * Dashboard d'analyse des tests A/B
 * 
 * Ce composant fournit une interface complète pour monitorer
 * et analyser les résultats des tests A/B de l'onboarding.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Award,
  Zap,
} from 'lucide-react';

/**
 * Types pour les données du dashboard
 */
interface ABTestSummary {
  flagKey: string;
  totalEvents: number;
  uniqueUsers: number;
  conversions: number;
  conversionRate: number;
  variants: Array<{
    name: string;
    users: number;
    events: number;
    conversions: number;
    conversionRate: number;
  }>;
  startDate: string;
  lastActivity: string;
}

interface ABTestResults {
  flagKey: string;
  startDate: string;
  endDate: string;
  variants: Array<{
    name: string;
    users: number;
    conversions: number;
    conversionRate: number;
    confidence: number;
    isWinner?: boolean;
  }>;
  statisticalSignificance: boolean;
  recommendedAction: 'continue' | 'stop' | 'declare_winner' | 'extend';
}

interface ConversionMetrics {
  flagKey: string;
  variant: string;
  totalUsers: number;
  conversions: number;
  conversionRate: number;
  averageTimeToConversion: number;
  dropOffPoints: Array<{
    step: string;
    dropOffRate: number;
  }>;
}

/**
 * Composant principal du dashboard A/B Testing
 */
export default function ABTestDashboard() {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [testSummaries, setTestSummaries] = useState<ABTestSummary[]>([]);
  const [testResults, setTestResults] = useState<ABTestResults | null>(null);
  const [conversionMetrics, setConversionMetrics] = useState<ConversionMetrics[]>([]);

  /**
   * Chargement des données du dashboard
   */
  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Chargement du résumé des tests
      const summaryResponse = await fetch(
        `/api/ab-test/analytics?action=summary&startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setTestSummaries(summaryData.data || []);
        
        // Sélectionner automatiquement le premier test s'il n'y en a pas de sélectionné
        if (!selectedTest && summaryData.data?.length > 0) {
          setSelectedTest(summaryData.data[0].flagKey);
        }
      }
      
      // Chargement des résultats détaillés si un test est sélectionné
      if (selectedTest) {
        await loadTestDetails(selectedTest);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestDetails = async (flagKey: string) => {
    try {
      // Résultats détaillés
      const resultsResponse = await fetch(
        `/api/ab-test/analytics?action=results&flagKey=${flagKey}&startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setTestResults(resultsData.data);
      }
      
      // Métriques de conversion
      const metricsResponse = await fetch(
        `/api/ab-test/analytics?action=metrics&flagKey=${flagKey}&startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setConversionMetrics(metricsData.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    }
  };

  const handleTestSelection = (flagKey: string) => {
    setSelectedTest(flagKey);
    loadTestDetails(flagKey);
  };

  const refreshData = () => {
    loadDashboardData();
  };

  const exportResults = async () => {
    if (!selectedTest) return;
    
    try {
      const response = await fetch(
        `/api/ab-test/analytics?action=events&flagKey=${selectedTest}&startDate=${dateRange.start}&endDate=${dateRange.end}&limit=10000`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Création du fichier CSV
        const csv = convertToCSV(data.data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ab-test-${selectedTest}-${dateRange.start}-${dateRange.end}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Tests A/B
              </h1>
              <p className="text-gray-600 mt-1">
                Analyse et optimisation des parcours d'onboarding
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              
              {selectedTest && (
                <button
                  onClick={exportResults}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              )}
            </div>
          </div>

          {/* Filtres de date */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Du:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Au:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Vue d'ensemble des tests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <TestsOverview 
              tests={testSummaries}
              selectedTest={selectedTest}
              onTestSelect={handleTestSelection}
            />
          </div>
          
          <div className="lg:col-span-2">
            <TestMetricsOverview tests={testSummaries} />
          </div>
        </div>

        {/* Détails du test sélectionné */}
        {selectedTest && testResults && (
          <div className="space-y-6">
            <TestResultsPanel results={testResults} />
            <ConversionFunnelAnalysis metrics={conversionMetrics} />
            <VariantPerformanceComparison results={testResults} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Vue d'ensemble des tests actifs
 */
function TestsOverview({ 
  tests, 
  selectedTest, 
  onTestSelect 
}: {
  tests: ABTestSummary[];
  selectedTest: string | null;
  onTestSelect: (flagKey: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Tests Actifs</h2>
      
      <div className="space-y-3">
        {tests.map((test) => (
          <motion.div
            key={test.flagKey}
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedTest === test.flagKey
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTestSelect(test.flagKey)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900 text-sm">
                {formatTestName(test.flagKey)}
              </h3>
              <StatusBadge conversionRate={test.conversionRate} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Utilisateurs:</span>
                <span className="font-medium ml-1">{test.uniqueUsers}</span>
              </div>
              <div>
                <span className="text-gray-500">Taux:</span>
                <span className="font-medium ml-1">
                  {(test.conversionRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              {test.variants.length} variantes • 
              Dernière activité: {formatRelativeTime(test.lastActivity)}
            </div>
          </motion.div>
        ))}
      </div>
      
      {tests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Aucun test A/B actif</p>
        </div>
      )}
    </div>
  );
}

/**
 * Métriques générales
 */
function TestMetricsOverview({ tests }: { tests: ABTestSummary[] }) {
  const totalUsers = tests.reduce((sum, test) => sum + test.uniqueUsers, 0);
  const totalConversions = tests.reduce((sum, test) => sum + test.conversions, 0);
  const averageConversionRate = tests.length > 0 
    ? tests.reduce((sum, test) => sum + test.conversionRate, 0) / tests.length 
    : 0;
  const activeTests = tests.length;

  const metrics = [
    {
      label: 'Tests Actifs',
      value: activeTests,
      icon: Target,
      color: 'blue',
      change: '+2 ce mois',
    },
    {
      label: 'Utilisateurs Testés',
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: 'green',
      change: '+12% vs mois dernier',
    },
    {
      label: 'Conversions Totales',
      value: totalConversions.toLocaleString(),
      icon: CheckCircle,
      color: 'purple',
      change: '+8% vs mois dernier',
    },
    {
      label: 'Taux Moyen',
      value: `${(averageConversionRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'orange',
      change: '+1.2% vs mois dernier',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg border p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
            <span className="text-xs text-green-600 font-medium">
              {metric.change}
            </span>
          </div>
          
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metric.value}
          </div>
          
          <div className="text-sm text-gray-600">
            {metric.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Panel des résultats détaillés
 */
function TestResultsPanel({ results }: { results: ABTestResults }) {
  const winner = results.variants.find(v => v.isWinner);
  const bestPerformer = results.variants.reduce((best, current) => 
    current.conversionRate > best.conversionRate ? current : best
  );

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Résultats: {formatTestName(results.flagKey)}
        </h2>
        
        <div className="flex items-center gap-2">
          {results.statisticalSignificance ? (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Statistiquement significatif
            </span>
          ) : (
            <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              Données insuffisantes
            </span>
          )}
          
          <ActionRecommendation action={results.recommendedAction} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {results.variants.map((variant) => (
          <VariantCard
            key={variant.name}
            variant={variant}
            isWinner={variant.isWinner}
            isBest={variant.name === bestPerformer.name}
          />
        ))}
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-900 mb-3">Analyse Comparative</h3>
        <VariantComparisonChart variants={results.variants} />
      </div>
    </div>
  );
}

/**
 * Carte de variante
 */
function VariantCard({ 
  variant, 
  isWinner, 
  isBest 
}: { 
  variant: any; 
  isWinner?: boolean; 
  isBest: boolean; 
}) {
  return (
    <div className={`p-4 rounded-lg border-2 ${
      isWinner 
        ? 'border-green-500 bg-green-50' 
        : isBest 
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 capitalize">
          {variant.name}
        </h4>
        {isWinner && <Award className="w-4 h-4 text-green-600" />}
        {!isWinner && isBest && <Zap className="w-4 h-4 text-blue-600" />}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Utilisateurs:</span>
          <span className="font-medium">{variant.users.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Conversions:</span>
          <span className="font-medium">{variant.conversions.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Taux:</span>
          <span className="font-bold text-lg">
            {(variant.conversionRate * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Confiance:</span>
          <span className={`font-medium ${
            variant.confidence >= 0.95 ? 'text-green-600' : 
            variant.confidence >= 0.8 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {(variant.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Analyse du funnel de conversion
 */
function ConversionFunnelAnalysis({ metrics }: { metrics: ConversionMetrics[] }) {
  if (metrics.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Analyse du Funnel de Conversion
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Points d'Abandon</h3>
          <div className="space-y-2">
            {metrics[0]?.dropOffPoints.map((point, index) => (
              <div key={point.step} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{point.step}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${point.dropOffRate * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    {(point.dropOffRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Temps de Conversion</h3>
          <div className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.variant} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{metric.variant}</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {formatDuration(metric.averageTimeToConversion)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Composants utilitaires
 */
function StatusBadge({ conversionRate }: { conversionRate: number }) {
  const rate = conversionRate * 100;
  
  if (rate >= 80) {
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Excellent</span>;
  } else if (rate >= 60) {
    return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Bon</span>;
  } else if (rate >= 40) {
    return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Moyen</span>;
  } else {
    return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Faible</span>;
  }
}

function ActionRecommendation({ action }: { action: string }) {
  const recommendations = {
    continue: { text: 'Continuer le test', color: 'blue' },
    stop: { text: 'Arrêter le test', color: 'red' },
    declare_winner: { text: 'Déclarer un gagnant', color: 'green' },
    extend: { text: 'Étendre la durée', color: 'orange' },
  };
  
  const rec = recommendations[action as keyof typeof recommendations] || recommendations.continue;
  
  return (
    <span className={`px-3 py-1 bg-${rec.color}-100 text-${rec.color}-800 text-sm rounded-full font-medium`}>
      {rec.text}
    </span>
  );
}

function VariantComparisonChart({ variants }: { variants: any[] }) {
  const maxRate = Math.max(...variants.map(v => v.conversionRate));
  
  return (
    <div className="space-y-3">
      {variants.map((variant) => (
        <div key={variant.name} className="flex items-center gap-4">
          <div className="w-20 text-sm text-gray-700 capitalize">
            {variant.name}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(variant.conversionRate / maxRate) * 100}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`h-4 rounded-full ${
                variant.isWinner ? 'bg-green-500' : 'bg-blue-500'
              }`}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
              {(variant.conversionRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-16 text-sm text-gray-600 text-right">
            {variant.users} users
          </div>
        </div>
      ))}
    </div>
  );
}

function VariantPerformanceComparison({ results }: { results: ABTestResults }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Comparaison des Performances
      </h2>
      <VariantComparisonChart variants={results.variants} />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

/**
 * Fonctions utilitaires
 */
function formatTestName(flagKey: string): string {
  return flagKey
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Il y a moins d\'une heure';
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Il y a ${diffInDays}j`;
  
  return date.toLocaleDateString('fr-FR');
}

function formatDuration(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' ? `"${value}"` : value
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
}
