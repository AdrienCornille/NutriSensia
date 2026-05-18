'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  useDailySummary,
  useTodayMeals,
  useDeleteMeal,
} from '@/hooks/useMeals';
import {
  useTodayHydration,
  useHydrationGoal,
  useAddWaterLog,
} from '@/hooks/useHydration';
import { mlToLiters } from '@/lib/hydration-transformers';
import {
  UtensilsCrossed,
  Bell,
  Droplets,
  AlertCircle,
  CheckCircle2,
  Plus,
  Clock,
  X,
} from 'lucide-react';

// Lazy-load below-the-fold sections (weekly view + quick access).
// Why: -200KB+ on initial chunk (framer-motion animations, 5 hooks API), and
// avoids 5 queries on every dashboard mount when user scrolls only the top.
const PatientDashboardBelowFold = dynamic(
  () =>
    import('@/components/dashboard/patient/PatientDashboardBelowFold').then(
      m => m.default
    ),
  {
    ssr: false,
    loading: () => (
      <div className='space-y-6 mb-8 animate-pulse'>
        <div className='h-5 w-32 bg-gray-200 rounded' />
        <div className='grid grid-cols-3 gap-6'>
          <div className='h-48 bg-white rounded-xl border border-gray-200' />
          <div className='h-48 bg-white rounded-xl border border-gray-200' />
          <div className='h-48 bg-white rounded-xl border border-gray-200' />
        </div>
        <div className='h-56 bg-white rounded-xl border border-gray-200' />
      </div>
    ),
  }
);

/**
 * Page Dashboard utilisateur - Nouveau design avec sidebar
 *
 * DASH-001: Vue d'ensemble quotidienne
 * - Affichage calories consommées vs objectif
 * - Barres de progression pour protéines, glucides, lipides
 * - Indicateur visuel clair (vert/orange/rouge)
 * - Données mises à jour en temps réel
 *
 * DASH-002: Tracker d'hydratation
 * - Affichage visuel (jauge circulaire)
 * - Boutons d'ajout rapide (plusieurs quantités)
 * - Objectif personnalisable
 * - Historique des ajouts de la journée
 */

// ==================== TYPES ====================

// DASH-003: Type pour les repas
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealEntry {
  id: string;
  type: MealType;
  label: string;
  icon: string;
  logged: boolean;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  time: string | null;
  description?: string;
}

// Type pour les données nutritionnelles
interface NutritionData {
  current: number;
  target: number;
  unit: string;
}

interface DailyNutrition {
  calories: NutritionData;
  proteins: NutritionData;
  carbs: NutritionData;
  fats: NutritionData;
  water: NutritionData;
  lastUpdated: Date;
}

// Type pour le statut de progression
type ProgressStatus = 'excellent' | 'good' | 'warning' | 'danger';

// ==================== HELPERS ====================

/**
 * Détermine le statut de progression basé sur le pourcentage
 * - excellent: 90-100% (vert foncé)
 * - good: 70-89% (vert)
 * - warning: 50-69% (orange)
 * - danger: <50% ou >110% (rouge)
 */
function getProgressStatus(current: number, target: number): ProgressStatus {
  const percentage = (current / target) * 100;

  if (percentage > 110) return 'danger'; // Dépassement
  if (percentage >= 90) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'warning';
  return 'danger';
}

/**
 * Retourne les classes CSS basées sur le statut
 */
function getStatusColors(status: ProgressStatus) {
  switch (status) {
    case 'excellent':
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-600',
        bgLight: 'bg-emerald-50',
        border: 'border-emerald-200',
      };
    case 'good':
      return {
        bg: 'bg-[#1B998B]',
        text: 'text-[#1B998B]',
        bgLight: 'bg-[#1B998B]/10',
        border: 'border-[#1B998B]/30',
      };
    case 'warning':
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-600',
        bgLight: 'bg-amber-50',
        border: 'border-amber-200',
      };
    case 'danger':
      return {
        bg: 'bg-red-500',
        text: 'text-red-600',
        bgLight: 'bg-red-50',
        border: 'border-red-200',
      };
  }
}

/**
 * Retourne le label de statut
 */
function getStatusLabel(status: ProgressStatus): string {
  switch (status) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'En bonne voie';
    case 'warning':
      return 'Attention';
    case 'danger':
      return 'À améliorer';
  }
}

/**
 * Calcule le pourcentage de progression
 */
function getPercentage(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100);
}

/**
 * Formate un nombre avec séparateur de milliers
 */
function formatNumber(num: number): string {
  return num.toLocaleString('fr-CH');
}

// ==================== CONSTANTES ====================

// DASH-002: Options de quantités d'eau prédéfinies
const waterAmountOptions = [
  { amount: 150, label: '150ml', icon: '🥤' },
  { amount: 250, label: '250ml', icon: '🥛' },
  { amount: 500, label: '500ml', icon: '🍶' },
];

// DASH-003: Options rapides pour l'enregistrement de repas
const quickMealOptions = [
  { label: 'Scanner code-barres', icon: '📷', action: 'scan' },
  { label: 'Rechercher aliment', icon: '🔍', action: 'search' },
  { label: 'Repas favoris', icon: '⭐', action: 'favorites' },
  { label: 'Repas récents', icon: '🕒', action: 'recent' },
];

function DashboardContent() {
  const { user } = useAuth();

  // Récupérer les vraies données depuis l'API (above-the-fold uniquement)
  const { data: dailySummaryData, isLoading: summaryLoading } =
    useDailySummary();
  const { data: todayMealsData, isLoading: todayMealsLoading } =
    useTodayMeals();

  // DASH-002: Données d'hydratation depuis l'API
  const { data: todayHydrationData } = useTodayHydration();
  const { data: hydrationGoalData } = useHydrationGoal();
  const addWaterMutation = useAddWaterLog();

  // Dériver les valeurs d'hydratation depuis l'API
  const hydrationCurrentL = todayHydrationData?.summary?.total_ml
    ? mlToLiters(todayHydrationData.summary.total_ml)
    : 0;
  const hydrationTargetL = hydrationGoalData?.daily_goal_ml
    ? mlToLiters(hydrationGoalData.daily_goal_ml)
    : 2;

  // Transformer les données de l'API en format attendu par le dashboard
  const nutrition: DailyNutrition = dailySummaryData
    ? {
        calories: {
          current: dailySummaryData.total_calories,
          target: dailySummaryData.calorie_goal,
          unit: 'kcal',
        },
        proteins: {
          current: dailySummaryData.total_protein,
          target: dailySummaryData.protein_goal,
          unit: 'g',
        },
        carbs: {
          current: dailySummaryData.total_carbs,
          target: dailySummaryData.carbs_goal,
          unit: 'g',
        },
        fats: {
          current: dailySummaryData.total_fat,
          target: dailySummaryData.fat_goal,
          unit: 'g',
        },
        water: {
          current: hydrationCurrentL,
          target: hydrationTargetL,
          unit: 'L',
        },
        lastUpdated: new Date(),
      }
    : {
        calories: { current: 0, target: 2100, unit: 'kcal' },
        proteins: { current: 0, target: 120, unit: 'g' },
        carbs: { current: 0, target: 250, unit: 'g' },
        fats: { current: 0, target: 70, unit: 'g' },
        water: {
          current: hydrationCurrentL,
          target: hydrationTargetL,
          unit: 'L',
        },
        lastUpdated: new Date(),
      };

  // DASH-002: Ajouter de l'eau via API
  const addWater = (amountMl: number) => {
    addWaterMutation.mutate({ amount_ml: amountMl, beverage_type: 'water' });
  };

  // DASH-003: État pour les repas - Synchroniser avec les vraies données
  const getMealsFromApiData = (): MealEntry[] => {
    // Template des types de repas
    const mealTypes: Array<{ type: MealType; label: string; icon: string }> = [
      { type: 'breakfast', label: 'Petit-déjeuner', icon: '🌅' },
      { type: 'lunch', label: 'Déjeuner', icon: '☀️' },
      { type: 'dinner', label: 'Dîner', icon: '🌙' },
      { type: 'snack', label: 'Collation', icon: '🍎' },
    ];

    // Si pas de données, retourner les templates vides
    if (!todayMealsData) {
      return mealTypes.map((mt, idx) => ({
        id: String(idx + 1),
        type: mt.type,
        label: mt.label,
        icon: mt.icon,
        logged: false,
        calories: 0,
        proteins: 0,
        carbs: 0,
        fats: 0,
        time: null,
      }));
    }

    // Créer une map des repas par type
    const mealsByType = new Map<MealType, any>();
    todayMealsData.meals.forEach(meal => {
      mealsByType.set(meal.type as MealType, meal);
    });

    // Créer les MealEntry en fusionnant template + données réelles
    return mealTypes.map((mt, idx) => {
      const apiMeal = mealsByType.get(mt.type);

      if (apiMeal) {
        // Extraire l'heure de consumed_at (format: "YYYY-MM-DDTHH:MM:SS")
        const time = apiMeal.consumed_at
          ? new Date(apiMeal.consumed_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : null;

        return {
          id: apiMeal.id,
          type: mt.type,
          label: mt.label,
          icon: mt.icon,
          logged: true,
          calories: apiMeal.total_calories || 0,
          proteins: apiMeal.total_protein || 0,
          carbs: apiMeal.total_carbs || 0,
          fats: apiMeal.total_fat || 0,
          time,
          description: `${apiMeal.food_count || 0} aliment${(apiMeal.food_count || 0) > 1 ? 's' : ''}`,
        };
      } else {
        // Pas de repas de ce type aujourd'hui
        return {
          id: String(idx + 1),
          type: mt.type,
          label: mt.label,
          icon: mt.icon,
          logged: false,
          calories: 0,
          proteins: 0,
          carbs: 0,
          fats: 0,
          time: null,
        };
      }
    });
  };

  const [meals, setMeals] = useState<MealEntry[]>(getMealsFromApiData());

  // Mettre à jour les meals quand les données de l'API changent
  useEffect(() => {
    setMeals(getMealsFromApiData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayMealsData]);

  // Hook pour supprimer un repas
  const deleteMealMutation = useDeleteMeal();
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealEntry | null>(null);

  // DASH-003: Ouvrir le modal d'enregistrement de repas
  const openMealModal = (meal: MealEntry) => {
    setSelectedMeal(meal);
    setShowMealModal(true);
  };

  // DASH-003: Fermer le modal
  const closeMealModal = () => {
    setShowMealModal(false);
    setSelectedMeal(null);
  };

  // DASH-003: Enregistrer un repas (redirection vers la page de test pour l'instant)
  const logMealQuickly = (mealId: string, quickOption: string) => {
    // Pour l'instant, rediriger vers la page de test API
    // TODO: Implémenter la vraie page de saisie de repas
    alert(
      `Fonctionnalité à venir: ${quickOption}\n\nPour tester l'enregistrement de repas, utilisez la page de test: /dashboard/patient/test-api`
    );
    closeMealModal();
  };

  // DASH-003: Supprimer/annuler un repas enregistré
  const removeMealLog = async (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal || !meal.logged) return;

    // Confirmer la suppression
    if (
      !confirm(`Êtes-vous sûr de vouloir supprimer ce repas (${meal.label})?`)
    ) {
      return;
    }

    try {
      // Supprimer via l'API
      await deleteMealMutation.mutateAsync(mealId);
      // Les queries seront automatiquement invalidées et les données rechargées
    } catch (error: any) {
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  // Extraire le prénom de l'utilisateur
  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    'Jean';

  // Date formatée
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className='flex-1 flex flex-col'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-800'>
              Bonjour {firstName} 👋
            </h1>
            <p className='text-gray-500 text-sm mt-1 capitalize'>
              {formattedDate}
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <Link
              href='/dashboard/patient/notifications'
              className='block p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative transition-colors'
            >
              <Bell className='w-6 h-6' />
              <span className='absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center'>
                3
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className='flex-1 p-8 overflow-auto'>
        {/* Zone primaire - Aujourd'hui */}
        <section className='mb-8'>
          <h2 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4'>
            Aujourd'hui
          </h2>

          <div className='grid grid-cols-3 gap-6'>
            {/* Résumé calories/macros - DASH-001 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className='col-span-2 bg-white rounded-xl p-6 border border-gray-200'
            >
              {/* Header avec statut global */}
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <h3 className='font-semibold text-gray-800'>
                    Résumé nutritionnel
                  </h3>
                  {(() => {
                    const caloriesStatus = getProgressStatus(
                      nutrition.calories.current,
                      nutrition.calories.target
                    );
                    const colors = getStatusColors(caloriesStatus);
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.bgLight} ${colors.text}`}
                      >
                        {caloriesStatus === 'excellent' ||
                        caloriesStatus === 'good' ? (
                          <CheckCircle2 className='w-3 h-3' />
                        ) : (
                          <AlertCircle className='w-3 h-3' />
                        )}
                        {getStatusLabel(caloriesStatus)}
                      </span>
                    );
                  })()}
                </div>
                <span className='text-xs text-gray-400'>
                  Mis à jour à{' '}
                  {nutrition.lastUpdated.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Calories - Indicateur principal */}
              {(() => {
                const status = getProgressStatus(
                  nutrition.calories.current,
                  nutrition.calories.target
                );
                const colors = getStatusColors(status);
                const percentage = getPercentage(
                  nutrition.calories.current,
                  nutrition.calories.target
                );
                return (
                  <div className='mb-6'>
                    <div className='flex justify-between items-end mb-2'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-gray-700'>
                          Calories
                        </span>
                        <span
                          className={`text-xs font-semibold ${colors.text}`}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <span className='text-sm font-medium text-gray-800'>
                        {formatNumber(nutrition.calories.current)} /{' '}
                        {formatNumber(nutrition.calories.target)}{' '}
                        {nutrition.calories.unit}
                      </span>
                    </div>
                    <div className='h-4 bg-gray-100 rounded-full overflow-hidden'>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full ${colors.bg} rounded-full relative`}
                      >
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent' />
                      </motion.div>
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      Il vous reste{' '}
                      {formatNumber(
                        nutrition.calories.target - nutrition.calories.current
                      )}{' '}
                      kcal pour atteindre votre objectif
                    </p>
                  </div>
                );
              })()}

              {/* Macros avec indicateurs dynamiques */}
              <div className='grid grid-cols-3 gap-4'>
                {/* Protéines */}
                {(() => {
                  const status = getProgressStatus(
                    nutrition.proteins.current,
                    nutrition.proteins.target
                  );
                  const colors = getStatusColors(status);
                  const percentage = getPercentage(
                    nutrition.proteins.current,
                    nutrition.proteins.target
                  );
                  return (
                    <div
                      className={`rounded-lg p-4 border ${colors.border} ${colors.bgLight}`}
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <span className='text-xs font-medium text-gray-600'>
                          Protéines
                        </span>
                        <span
                          className={`text-xs font-semibold ${colors.text}`}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <div className='h-2 bg-white/50 rounded-full overflow-hidden'>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className={`h-full ${colors.bg} rounded-full`}
                        />
                      </div>
                      <p className='text-sm font-medium mt-2 text-gray-800'>
                        {nutrition.proteins.current} /{' '}
                        {nutrition.proteins.target}
                        {nutrition.proteins.unit}
                      </p>
                    </div>
                  );
                })()}

                {/* Glucides */}
                {(() => {
                  const status = getProgressStatus(
                    nutrition.carbs.current,
                    nutrition.carbs.target
                  );
                  const colors = getStatusColors(status);
                  const percentage = getPercentage(
                    nutrition.carbs.current,
                    nutrition.carbs.target
                  );
                  return (
                    <div
                      className={`rounded-lg p-4 border ${colors.border} ${colors.bgLight}`}
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <span className='text-xs font-medium text-gray-600'>
                          Glucides
                        </span>
                        <span
                          className={`text-xs font-semibold ${colors.text}`}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <div className='h-2 bg-white/50 rounded-full overflow-hidden'>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className={`h-full ${colors.bg} rounded-full`}
                        />
                      </div>
                      <p className='text-sm font-medium mt-2 text-gray-800'>
                        {nutrition.carbs.current} / {nutrition.carbs.target}
                        {nutrition.carbs.unit}
                      </p>
                    </div>
                  );
                })()}

                {/* Lipides */}
                {(() => {
                  const status = getProgressStatus(
                    nutrition.fats.current,
                    nutrition.fats.target
                  );
                  const colors = getStatusColors(status);
                  const percentage = getPercentage(
                    nutrition.fats.current,
                    nutrition.fats.target
                  );
                  return (
                    <div
                      className={`rounded-lg p-4 border ${colors.border} ${colors.bgLight}`}
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <span className='text-xs font-medium text-gray-600'>
                          Lipides
                        </span>
                        <span
                          className={`text-xs font-semibold ${colors.text}`}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <div className='h-2 bg-white/50 rounded-full overflow-hidden'>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className={`h-full ${colors.bg} rounded-full`}
                        />
                      </div>
                      <p className='text-sm font-medium mt-2 text-gray-800'>
                        {nutrition.fats.current} / {nutrition.fats.target}
                        {nutrition.fats.unit}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </motion.div>

            {/* Hydratation - DASH-002 avec historique et objectif personnalisable */}
            {(() => {
              const waterStatus = getProgressStatus(
                hydrationCurrentL,
                hydrationTargetL
              );
              const waterColors = getStatusColors(waterStatus);
              const waterPercentage = getPercentage(
                hydrationCurrentL,
                hydrationTargetL
              );
              // Calcul du strokeDashoffset: 352 (circonférence) - (352 * percentage / 100)
              const strokeDashoffset = 352 - (352 * waterPercentage) / 100;

              // Mapping des couleurs CSS pour le SVG
              const svgStrokeColor =
                waterStatus === 'excellent'
                  ? '#10B981'
                  : waterStatus === 'good'
                    ? '#1B998B'
                    : waterStatus === 'warning'
                      ? '#F59E0B'
                      : '#EF4444';

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className={`bg-white rounded-xl p-6 border ${waterColors.border} flex flex-col`}
                >
                  {/* Header avec bouton paramètres */}
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-semibold text-gray-800'>Hydratation</h3>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${waterColors.bgLight} ${waterColors.text}`}
                      >
                        {waterPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Jauge circulaire */}
                  <div className='flex flex-col items-center'>
                    <div className='relative w-28 h-28 mb-3'>
                      <svg className='w-full h-full transform -rotate-90'>
                        <circle
                          cx='56'
                          cy='56'
                          r='48'
                          stroke='#E5E7EB'
                          strokeWidth='10'
                          fill='none'
                        />
                        <motion.circle
                          cx='56'
                          cy='56'
                          r='48'
                          stroke={svgStrokeColor}
                          strokeWidth='10'
                          fill='none'
                          strokeDasharray='302'
                          initial={{ strokeDashoffset: 302 }}
                          animate={{
                            strokeDashoffset:
                              302 - (302 * waterPercentage) / 100,
                          }}
                          transition={{ duration: 1, delay: 0.3 }}
                          strokeLinecap='round'
                        />
                      </svg>
                      <div className='absolute inset-0 flex flex-col items-center justify-center'>
                        <Droplets
                          className={`w-4 h-4 ${waterColors.text} mb-0.5`}
                        />
                        <span className='text-xl font-bold text-gray-800'>
                          {hydrationCurrentL}L
                        </span>
                        <span className='text-xs text-gray-500'>
                          / {hydrationTargetL}L
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-xs ${waterColors.text} font-medium mb-3`}
                    >
                      {getStatusLabel(waterStatus)}
                    </p>

                    {/* Boutons d'ajout rapide */}
                    <div className='w-full grid grid-cols-3 gap-2 mb-3'>
                      {waterAmountOptions.map(option => (
                        <button
                          key={option.amount}
                          onClick={() => addWater(option.amount)}
                          className={`py-2 px-1 ${waterColors.bgLight} ${waterColors.text} rounded-lg text-xs font-medium hover:opacity-80 transition-all hover:scale-105 active:scale-95`}
                        >
                          <span className='block text-sm'>{option.icon}</span>
                          <span>+{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </div>

          {/* DASH-003: Enregistrement rapide des repas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className='mt-6 bg-white rounded-xl p-6 border border-gray-200'
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-semibold text-gray-800'>
                Enregistrer un repas
              </h3>
              <span className='text-xs text-gray-400'>
                {meals.filter(m => m.logged).length}/{meals.length} enregistrés
              </span>
            </div>
            <div className='grid grid-cols-4 gap-4'>
              {meals.map(meal => (
                <motion.div
                  key={meal.id}
                  onClick={() => openMealModal(meal)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left group cursor-pointer ${
                    meal.logged
                      ? 'border-[#1B998B]/40 bg-gradient-to-br from-[#1B998B]/5 to-[#1B998B]/10'
                      : 'border-dashed border-gray-200 hover:border-[#1B998B]/50 hover:bg-[#1B998B]/5'
                  }`}
                >
                  {/* Icône du repas */}
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-xl'>{meal.icon}</span>
                    {meal.logged ? (
                      <div className='flex items-center gap-1'>
                        <CheckCircle2 className='w-4 h-4 text-[#1B998B]' />
                      </div>
                    ) : (
                      <Plus className='w-4 h-4 text-gray-400 group-hover:text-[#1B998B] transition-colors' />
                    )}
                  </div>

                  {/* Label du repas */}
                  <p className='text-sm font-medium text-gray-800 mb-1'>
                    {meal.label}
                  </p>

                  {/* Détails si enregistré */}
                  {meal.logged ? (
                    <div className='space-y-1'>
                      <div className='flex items-center gap-1 text-xs text-gray-500'>
                        <Clock className='w-3 h-3' />
                        <span>{meal.time}</span>
                        <span className='mx-1'>•</span>
                        <span className='font-medium text-[#1B998B]'>
                          {meal.calories} kcal
                        </span>
                      </div>
                      {meal.description && (
                        <p className='text-xs text-gray-400 truncate'>
                          {meal.description}
                        </p>
                      )}
                      {/* Bouton pour supprimer */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          removeMealLog(meal.id);
                        }}
                        className='absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all'
                        title="Supprimer l'enregistrement"
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </div>
                  ) : (
                    <p className='text-xs text-gray-400'>
                      Cliquez pour ajouter
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* DASH-003: Modal d'enregistrement rapide */}
          {showMealModal && selectedMeal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
              onClick={closeMealModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className='bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl'
                onClick={e => e.stopPropagation()}
              >
                {/* Header du modal */}
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>{selectedMeal.icon}</span>
                    <div>
                      <h3 className='font-semibold text-gray-800'>
                        {selectedMeal.label}
                      </h3>
                      <p className='text-xs text-gray-500'>
                        {selectedMeal.logged
                          ? 'Modifier ou supprimer'
                          : 'Choisissez une option'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeMealModal}
                    className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    <X className='w-5 h-5' />
                  </button>
                </div>

                {/* Options d'enregistrement rapide */}
                {!selectedMeal.logged && (
                  <div className='space-y-3 mb-6'>
                    <p className='text-sm font-medium text-gray-700'>
                      Ajouter rapidement
                    </p>
                    <div className='grid grid-cols-2 gap-3'>
                      {quickMealOptions.map(option => (
                        <button
                          key={option.action}
                          onClick={() =>
                            logMealQuickly(selectedMeal.id, option.action)
                          }
                          className='flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#1B998B]/50 hover:bg-[#1B998B]/5 transition-all text-left'
                        >
                          <span className='text-xl'>{option.icon}</span>
                          <span className='text-sm font-medium text-gray-700'>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affichage si repas déjà enregistré */}
                {selectedMeal.logged && (
                  <div className='mb-6'>
                    <div className='p-4 bg-[#1B998B]/5 rounded-xl border border-[#1B998B]/20 mb-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <span className='text-sm font-medium text-gray-700'>
                          Enregistré à {selectedMeal.time}
                        </span>
                        <span className='text-lg font-bold text-[#1B998B]'>
                          {selectedMeal.calories} kcal
                        </span>
                      </div>
                      {selectedMeal.description && (
                        <p className='text-sm text-gray-600 mb-3'>
                          {selectedMeal.description}
                        </p>
                      )}
                      <div className='grid grid-cols-3 gap-2 text-center'>
                        <div className='bg-white rounded-lg p-2'>
                          <p className='text-xs text-gray-500'>Protéines</p>
                          <p className='text-sm font-semibold text-gray-800'>
                            {selectedMeal.proteins}g
                          </p>
                        </div>
                        <div className='bg-white rounded-lg p-2'>
                          <p className='text-xs text-gray-500'>Glucides</p>
                          <p className='text-sm font-semibold text-gray-800'>
                            {selectedMeal.carbs}g
                          </p>
                        </div>
                        <div className='bg-white rounded-lg p-2'>
                          <p className='text-xs text-gray-500'>Lipides</p>
                          <p className='text-sm font-semibold text-gray-800'>
                            {selectedMeal.fats}g
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        removeMealLog(selectedMeal.id);
                        closeMealModal();
                      }}
                      className='w-full py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2'
                    >
                      <X className='w-4 h-4' />
                      Supprimer cet enregistrement
                    </button>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className='flex gap-3'>
                  <button
                    onClick={closeMealModal}
                    className='flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors'
                  >
                    Annuler
                  </button>
                  {!selectedMeal.logged && (
                    <button
                      onClick={() => {
                        // TODO: Ouvrir la page complète d'enregistrement
                        console.log('Ouvrir page complète');
                        closeMealModal();
                      }}
                      className='flex-1 py-3 bg-[#1B998B] text-white rounded-xl text-sm font-medium hover:bg-[#147569] transition-colors flex items-center justify-center gap-2'
                    >
                      <UtensilsCrossed className='w-4 h-4' />
                      Enregistrement détaillé
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </section>

        <PatientDashboardBelowFold />
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
