/**
 * Composant de démonstration pour les tests A/B
 *
 * Ce composant permet de tester visuellement les différentes variantes
 * du système A/B Testing en mode développement.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Users,
  Target,
  BarChart3,
  Settings,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  ABTestProvider,
  useFeatureFlag,
  useOnboardingTracking,
} from '../feature-flags/ABTestProvider';
import {
  ControlOnboardingVariant,
  SimplifiedOnboardingVariant,
  GamifiedOnboardingVariant,
  GuidedOnboardingVariant,
} from '../feature-flags/OnboardingVariants';

/**
 * Interface pour les statistiques de test
 */
interface TestStats {
  variant: string;
  views: number;
  interactions: number;
  completions: number;
  conversionRate: number;
  avgTimeSpent: number;
}

/**
 * Composant principal de démonstration
 */
export default function ABTestingDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [testStats, setTestStats] = useState<TestStats[]>([]);
  const [simulatedUsers, setSimulatedUsers] = useState(0);
  const [testDuration, setTestDuration] = useState(0);

  // Simulation d'utilisateurs de test
  const testUsers = [
    { id: 'demo_user_1', role: 'nutritionist' as const },
    { id: 'demo_user_2', role: 'nutritionist' as const },
    { id: 'demo_user_3', role: 'patient' as const },
    { id: 'demo_user_4', role: 'nutritionist' as const },
  ];

  /**
   * Initialisation des statistiques de test
   */
  useEffect(() => {
    const variants = ['control', 'simplified', 'gamified', 'guided'];
    const initialStats = variants.map(variant => ({
      variant,
      views: 0,
      interactions: 0,
      completions: 0,
      conversionRate: 0,
      avgTimeSpent: 0,
    }));
    setTestStats(initialStats);
  }, []);

  /**
   * Simulation du test en cours
   */
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTestDuration(prev => prev + 1);
      setSimulatedUsers(prev => prev + Math.floor(Math.random() * 3));

      // Mise à jour des statistiques simulées
      setTestStats(prev =>
        prev.map(stat => {
          const newViews = stat.views + Math.floor(Math.random() * 2);
          const newInteractions =
            stat.interactions + Math.floor(Math.random() * 1.5);
          const newCompletions =
            stat.completions + (Math.random() > 0.7 ? 1 : 0);

          return {
            ...stat,
            views: newViews,
            interactions: newInteractions,
            completions: newCompletions,
            conversionRate:
              newViews > 0 ? (newCompletions / newViews) * 100 : 0,
            avgTimeSpent: 120 + Math.random() * 180, // 2-5 minutes
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning]);

  /**
   * Démarrage/arrêt du test
   */
  const toggleTest = () => {
    setIsRunning(!isRunning);
  };

  /**
   * Reset du test
   */
  const resetTest = () => {
    setIsRunning(false);
    setTestDuration(0);
    setSimulatedUsers(0);
    setTestStats(prev =>
      prev.map(stat => ({
        ...stat,
        views: 0,
        interactions: 0,
        completions: 0,
        conversionRate: 0,
        avgTimeSpent: 0,
      }))
    );
  };

  /**
   * Export des données de test
   */
  const exportTestData = () => {
    const data = {
      testDuration,
      simulatedUsers,
      statistics: testStats,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-demo-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                🧪 Démonstration A/B Testing
              </h1>
              <p className='text-gray-600 mt-1'>
                Testez visuellement les différentes variantes d'onboarding
              </p>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={toggleTest}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  isRunning
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className='w-4 h-4' />
                    Arrêter le test
                  </>
                ) : (
                  <>
                    <Play className='w-4 h-4' />
                    Démarrer le test
                  </>
                )}
              </button>

              <button
                onClick={resetTest}
                className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                <RotateCcw className='w-4 h-4' />
                Reset
              </button>

              <button
                onClick={exportTestData}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
              >
                <Download className='w-4 h-4' />
                Export
              </button>
            </div>
          </div>

          {/* Métriques temps réel */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='bg-blue-50 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <Users className='w-4 h-4 text-blue-600' />
                <span className='text-sm font-medium text-blue-900'>
                  Utilisateurs
                </span>
              </div>
              <div className='text-2xl font-bold text-blue-900'>
                {simulatedUsers}
              </div>
            </div>

            <div className='bg-green-50 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <Target className='w-4 h-4 text-green-600' />
                <span className='text-sm font-medium text-green-900'>
                  Conversions
                </span>
              </div>
              <div className='text-2xl font-bold text-green-900'>
                {testStats.reduce((sum, stat) => sum + stat.completions, 0)}
              </div>
            </div>

            <div className='bg-purple-50 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <BarChart3 className='w-4 h-4 text-purple-600' />
                <span className='text-sm font-medium text-purple-900'>
                  Taux moyen
                </span>
              </div>
              <div className='text-2xl font-bold text-purple-900'>
                {testStats.length > 0
                  ? (
                      testStats.reduce(
                        (sum, stat) => sum + stat.conversionRate,
                        0
                      ) / testStats.length
                    ).toFixed(1)
                  : 0}
                %
              </div>
            </div>

            <div className='bg-orange-50 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <RefreshCw className='w-4 h-4 text-orange-600' />
                <span className='text-sm font-medium text-orange-900'>
                  Durée
                </span>
              </div>
              <div className='text-2xl font-bold text-orange-900'>
                {Math.floor(testDuration / 60)}:
                {(testDuration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Sélecteur de variante */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            🎯 Prévisualisation des variantes
          </h2>

          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {[
              {
                key: 'control',
                name: 'Contrôle',
                description: 'Version standard',
              },
              {
                key: 'simplified',
                name: 'Simplifiée',
                description: 'Interface épurée',
              },
              {
                key: 'gamified',
                name: 'Gamifiée',
                description: 'Éléments de jeu',
              },
              {
                key: 'guided',
                name: 'Guidée',
                description: 'Aide contextuelle',
              },
            ].map(variant => (
              <button
                key={variant.key}
                onClick={() =>
                  setSelectedVariant(
                    selectedVariant === variant.key ? null : variant.key
                  )
                }
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedVariant === variant.key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className='flex items-center gap-2 mb-1'>
                  <Eye className='w-4 h-4' />
                  <span className='font-medium'>{variant.name}</span>
                </div>
                <p className='text-sm text-gray-600'>{variant.description}</p>

                {/* Stats de la variante */}
                {testStats.find(s => s.variant === variant.key) && (
                  <div className='mt-2 pt-2 border-t border-gray-200'>
                    <div className='text-xs text-gray-500'>
                      Taux:{' '}
                      {testStats
                        .find(s => s.variant === variant.key)
                        ?.conversionRate.toFixed(1)}
                      %
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Prévisualisation de la variante sélectionnée */}
          {selectedVariant && (
            <div className='border-2 border-dashed border-gray-300 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-4'>
                <Settings className='w-5 h-5 text-gray-600' />
                <span className='font-medium text-gray-900'>
                  Prévisualisation: {selectedVariant}
                </span>
              </div>

              <div className='bg-gray-100 rounded-lg overflow-hidden'>
                <VariantPreview variant={selectedVariant} />
              </div>
            </div>
          )}
        </div>

        {/* Tableau des statistiques détaillées */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            📊 Statistiques détaillées par variante
          </h2>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left py-3 px-4 font-medium text-gray-900'>
                    Variante
                  </th>
                  <th className='text-left py-3 px-4 font-medium text-gray-900'>
                    Vues
                  </th>
                  <th className='text-left py-3 px-4 font-medium text-gray-900'>
                    Interactions
                  </th>
                  <th className='text-left py-3 px-4 font-medium text-gray-900'>
                    Conversions
                  </th>
                  <th className='text-left py-3 px-4 font-medium text-gray-900'>
                    Taux
                  </th>
                  <th className='text-left py-3 px-4 font-medium text-gray-900'>
                    Temps moyen
                  </th>
                </tr>
              </thead>
              <tbody>
                {testStats.map((stat, index) => (
                  <motion.tr
                    key={stat.variant}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='border-b border-gray-100 hover:bg-gray-50'
                  >
                    <td className='py-3 px-4'>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-3 h-3 rounded-full ${getVariantColor(stat.variant)}`}
                        />
                        <span className='font-medium capitalize'>
                          {stat.variant}
                        </span>
                      </div>
                    </td>
                    <td className='py-3 px-4'>{stat.views}</td>
                    <td className='py-3 px-4'>{stat.interactions}</td>
                    <td className='py-3 px-4'>{stat.completions}</td>
                    <td className='py-3 px-4'>
                      <span
                        className={`font-medium ${getConversionRateColor(stat.conversionRate)}`}
                      >
                        {stat.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className='py-3 px-4'>
                      {formatTime(stat.avgTimeSpent)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tests interactifs */}
        <div className='mt-6'>
          <InteractiveTestSection users={testUsers} />
        </div>
      </div>
    </div>
  );
}

/**
 * Composant de prévisualisation des variantes
 */
function VariantPreview({ variant }: { variant: string }) {
  const commonProps = {
    currentStep: 1,
    totalSteps: 5,
    stepName: 'personal-info',
    onNext: () => console.log('Next clicked'),
    onPrevious: () => console.log('Previous clicked'),
    onSkip: () => console.log('Skip clicked'),
  };

  const VariantComponent =
    {
      control: ControlOnboardingVariant,
      simplified: SimplifiedOnboardingVariant,
      gamified: GamifiedOnboardingVariant,
      guided: GuidedOnboardingVariant,
    }[variant] || ControlOnboardingVariant;

  return (
    <div className='transform scale-50 origin-top-left w-[200%] h-96 overflow-hidden'>
      <VariantComponent {...commonProps}>
        <div className='text-center p-8'>
          <h3 className='text-xl font-semibold mb-4'>
            Informations personnelles
          </h3>
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='Prénom'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              readOnly
            />
            <input
              type='text'
              placeholder='Nom'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              readOnly
            />
            <input
              type='email'
              placeholder='Email'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              readOnly
            />
          </div>
        </div>
      </VariantComponent>
    </div>
  );
}

/**
 * Section de tests interactifs
 */
function InteractiveTestSection({
  users,
}: {
  users: Array<{ id: string; role: 'nutritionist' | 'patient' }>;
}) {
  const [selectedUser, setSelectedUser] = useState(users[0]);

  return (
    <div className='bg-white rounded-lg shadow-sm p-6'>
      <h2 className='text-lg font-semibold text-gray-900 mb-4'>
        🎮 Tests interactifs
      </h2>

      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Sélectionner un utilisateur de test:
        </label>
        <select
          value={selectedUser.id}
          onChange={e =>
            setSelectedUser(
              users.find(u => u.id === e.target.value) || users[0]
            )
          }
          className='px-3 py-2 border border-gray-300 rounded-lg'
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.id} ({user.role})
            </option>
          ))}
        </select>
      </div>

      <ABTestProvider userId={selectedUser.id} userRole={selectedUser.role}>
        <TestUserInterface />
      </ABTestProvider>
    </div>
  );
}

/**
 * Interface de test pour un utilisateur
 */
function TestUserInterface() {
  const nutritionistVariant = useFeatureFlag(
    'nutritionist-onboarding-variant',
    'control'
  );
  const progressDisplay = useFeatureFlag(
    'onboarding-progress-display',
    'linear'
  );
  const animationsEnabled = useFeatureFlag('onboarding-animations', true);
  const { trackOnboardingStart, trackOnboardingStep } = useOnboardingTracking();

  const handleTestAction = async (action: string) => {
    switch (action) {
      case 'start':
        await trackOnboardingStart();
        break;
      case 'step':
        await trackOnboardingStep('personal-info', 1, 5);
        break;
    }
  };

  return (
    <div className='border border-gray-200 rounded-lg p-4'>
      <h3 className='font-medium text-gray-900 mb-3'>
        Configuration actuelle:
      </h3>

      <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
        <div>
          <span className='text-gray-600'>Variante onboarding:</span>
          <span className='ml-2 font-medium capitalize'>
            {nutritionistVariant}
          </span>
        </div>
        <div>
          <span className='text-gray-600'>Affichage progrès:</span>
          <span className='ml-2 font-medium capitalize'>{progressDisplay}</span>
        </div>
        <div>
          <span className='text-gray-600'>Animations:</span>
          <span className='ml-2 font-medium'>
            {animationsEnabled ? 'Activées' : 'Désactivées'}
          </span>
        </div>
      </div>

      <div className='flex gap-2'>
        <button
          onClick={() => handleTestAction('start')}
          className='px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700'
        >
          Démarrer onboarding
        </button>
        <button
          onClick={() => handleTestAction('step')}
          className='px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'
        >
          Étape suivante
        </button>
      </div>
    </div>
  );
}

/**
 * Fonctions utilitaires
 */
function getVariantColor(variant: string): string {
  const colors = {
    control: 'bg-gray-500',
    simplified: 'bg-blue-500',
    gamified: 'bg-purple-500',
    guided: 'bg-green-500',
  };
  return colors[variant as keyof typeof colors] || 'bg-gray-500';
}

function getConversionRateColor(rate: number): string {
  if (rate >= 25) return 'text-green-600';
  if (rate >= 15) return 'text-yellow-600';
  return 'text-red-600';
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
