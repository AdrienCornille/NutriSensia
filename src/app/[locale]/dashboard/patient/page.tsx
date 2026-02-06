'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  useDailySummary,
  useTodayMeals,
  useDeleteMeal,
} from '@/hooks/useMeals';
import { useNextAppointment } from '@/hooks/useAppointments';
import { useUnreadCount, useConversations } from '@/hooks/useConversations';
import { useWeeklyObjectives } from '@/hooks/useObjectives';
import {
  useTodayHydration,
  useHydrationGoal,
  useAddWaterLog,
} from '@/hooks/useHydration';
import { mlToLiters } from '@/lib/hydration-transformers';
import { useWeightEntries } from '@/hooks/useWeight';
import {
  UtensilsCrossed,
  TrendingUp,
  FolderOpen,
  Calendar,
  ChefHat,
  Apple,
  MessageSquare,
  Star,
  Bell,
  Droplets,
  ArrowRight,
  Check,
  AlertCircle,
  CheckCircle2,
  Plus,
  Clock,
  X,
} from 'lucide-react';

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

// DASH-005: Types pour les rendez-vous
type AppointmentType = 'initial' | 'follow-up' | 'nutrition-plan' | 'check-in';
type AppointmentMode = 'visio' | 'cabinet' | 'phone';

// DASH-007: Types pour les objectifs hebdomadaires
type ObjectiveCategory =
  | 'nutrition'
  | 'hydration'
  | 'activity'
  | 'recipes'
  | 'tracking'
  | 'custom';

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

/**
 * DASH-004: Génère un path SVG sparkline pour les données de poids
 * Optimisé pour maximiser l'amplitude visuelle même avec de petites variations
 * @param data - Tableau de valeurs de poids
 * @param width - Largeur du SVG
 * @param height - Hauteur du SVG
 * @param paddingY - Padding vertical en pixels (défaut: 8)
 * @returns Le path SVG sous forme de string
 */
function generateSparklinePath(
  data: number[],
  width: number,
  height: number,
  paddingY: number = 8
): string {
  if (data.length < 2) return '';

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.1; // Petite valeur par défaut pour éviter division par zéro

  const paddingX = 8;
  const effectiveHeight = height - paddingY * 2;
  const effectiveWidth = width - paddingX * 2;

  // Calculer les points avec une meilleure utilisation de l'espace vertical
  const points = data.map((value, index) => {
    const x = paddingX + (index / (data.length - 1)) * effectiveWidth;
    // Normaliser la valeur entre 0 et 1, puis mapper sur la hauteur disponible
    const normalizedY = (max - value) / range;
    const y = paddingY + normalizedY * effectiveHeight;
    return { x, y };
  });

  // Créer le path avec des courbes de Bézier cubiques pour un effet plus lisse
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    // Points de contrôle pour une courbe plus douce
    const cp1x = prev.x + (curr.x - prev.x) * 0.5;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) * 0.5;
    const cp2y = curr.y;
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
  }

  return path;
}

/**
 * DASH-004: Génère le path pour l'aire sous la courbe (pour le gradient)
 */
function generateSparklineAreaPath(
  data: number[],
  width: number,
  height: number,
  paddingY: number = 8
): string {
  const linePath = generateSparklinePath(data, width, height, paddingY);
  if (!linePath) return '';

  const paddingX = 8;
  const effectiveWidth = width - paddingX * 2;

  // Fermer le path pour créer une aire
  const lastX = paddingX + effectiveWidth;
  const firstX = paddingX;

  return `${linePath} L ${lastX.toFixed(2)} ${height} L ${firstX.toFixed(2)} ${height} Z`;
}

/**
 * DASH-005: Calcule le nombre de jours jusqu'à une date
 */
function getDaysUntil(date: Date): number {
  const now = new Date();
  const target = new Date(date);
  // Réinitialiser les heures pour comparer uniquement les jours
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * DASH-005: Formate le compte à rebours en texte lisible
 */
function formatCountdown(date: Date): string {
  const days = getDaysUntil(date);

  if (days < 0) return 'Passé';
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';
  if (days < 7) return `Dans ${days} jours`;
  if (days < 14) return 'La semaine prochaine';
  return `Dans ${Math.ceil(days / 7)} semaines`;
}

/**
 * DASH-005: Retourne le label du type de rendez-vous
 */
function getAppointmentTypeLabel(type: AppointmentType): string {
  switch (type) {
    case 'initial':
      return 'Consultation initiale';
    case 'follow-up':
      return 'Consultation de suivi';
    case 'nutrition-plan':
      return 'Révision du plan';
    case 'check-in':
      return 'Point rapide';
  }
}

/**
 * DASH-005: Retourne le label et la couleur du mode de RDV
 */
function getAppointmentModeInfo(mode: AppointmentMode): {
  label: string;
  color: string;
  icon: string;
} {
  switch (mode) {
    case 'visio':
      return {
        label: 'En visio',
        color: 'text-blue-600 bg-blue-50',
        icon: '📹',
      };
    case 'cabinet':
      return {
        label: 'Au cabinet',
        color: 'text-purple-600 bg-purple-50',
        icon: '🏥',
      };
    case 'phone':
      return {
        label: 'Par téléphone',
        color: 'text-amber-600 bg-amber-50',
        icon: '📞',
      };
  }
}

/**
 * DASH-006: Formate le timestamp en temps relatif
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/**
 * DASH-007: Calcule le temps restant jusqu'à une date limite
 */
function getTimeRemaining(endDate: Date): {
  days: number;
  hours: number;
  text: string;
  isUrgent: boolean;
} {
  const now = new Date();
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Fin de journée

  const diffMs = end.getTime() - now.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let text = '';
  let isUrgent = false;

  if (diffMs <= 0) {
    text = 'Terminé';
  } else if (days === 0) {
    text = hours <= 1 ? 'Dernière heure !' : `${hours}h restantes`;
    isUrgent = true;
  } else if (days === 1) {
    text = 'Demain';
    isUrgent = true;
  } else if (days < 3) {
    text = `${days}j restants`;
    isUrgent = true;
  } else {
    text = `${days}j restants`;
  }

  return { days, hours, text, isUrgent };
}

/**
 * DASH-007: Retourne l'icône et les couleurs pour une catégorie d'objectif
 */
function getObjectiveCategoryInfo(category: ObjectiveCategory): {
  icon: string;
  bgColor: string;
  textColor: string;
  label: string;
} {
  switch (category) {
    case 'nutrition':
      return {
        icon: '🍎',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        label: 'Nutrition',
      };
    case 'hydration':
      return {
        icon: '💧',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        label: 'Hydratation',
      };
    case 'activity':
      return {
        icon: '🏃',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-600',
        label: 'Activité',
      };
    case 'recipes':
      return {
        icon: '👨‍🍳',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600',
        label: 'Recettes',
      };
    case 'tracking':
      return {
        icon: '📊',
        bgColor: 'bg-indigo-100',
        textColor: 'text-indigo-600',
        label: 'Suivi',
      };
    case 'custom':
    default:
      return {
        icon: '🎯',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        label: 'Personnalisé',
      };
  }
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

// DASH-005 à DASH-007: Données réelles via hooks API
// useNextAppointment(), useUnreadCount(), useConversations(), useWeeklyObjectives()

// Accès rapide - avec liens vers les pages correspondantes
const quickAccess = [
  {
    icon: <ChefHat className='w-6 h-6' />,
    label: 'Recettes',
    desc: '124 recettes',
    color: 'bg-orange-50 text-orange-600',
    href: '/dashboard/recettes',
  },
  {
    icon: <Apple className='w-6 h-6' />,
    label: 'Base aliments',
    desc: 'Rechercher',
    color: 'bg-green-50 text-green-600',
    href: '/dashboard/aliments',
  },
  {
    icon: <Star className='w-6 h-6' />,
    label: 'Contenu exclusif',
    desc: '3 nouveaux',
    color: 'bg-purple-50 text-purple-600',
    href: '/dashboard/suivi',
  },
  {
    icon: <FolderOpen className='w-6 h-6' />,
    label: 'Mon dossier',
    desc: 'Anamnèse, objectifs',
    color: 'bg-blue-50 text-blue-600',
    href: '/dashboard/dossier',
  },
];

function DashboardContent() {
  const { user } = useAuth();

  // DASH-005: Prochain rendez-vous depuis l'API
  const { data: nextAppointmentData, isLoading: appointmentLoading } =
    useNextAppointment();

  // DASH-006: Messages non lus et conversations depuis l'API
  const { data: unreadCountData } = useUnreadCount();
  const { data: conversationsData } = useConversations();
  const unreadCount = unreadCountData?.unread_count || 0;
  const recentConversations = conversationsData?.conversations || [];

  // Récupérer les vraies données depuis l'API
  const { data: dailySummaryData, isLoading: summaryLoading } =
    useDailySummary();
  const { data: todayMealsData, isLoading: todayMealsLoading } =
    useTodayMeals();

  // DASH-007: Objectifs hebdomadaires depuis l'API
  const { data: weeklyObjectivesData, isLoading: objectivesLoading } = useWeeklyObjectives();

  // DASH-004: Données de poids depuis l'API (7 derniers jours)
  const { data: weightData, isLoading: weightLoading } = useWeightEntries({ limit: 7 });
  const weightEntries = weightData?.entries || [];
  const currentWeight = weightData?.statistics?.current_weight ?? null;
  const weightChange = weightData?.statistics?.total_change ?? 0;
  const weightHistory = weightEntries
    .map(e => e.weight_kg)
    .reverse(); // API retourne DESC, on veut ASC pour le sparkline

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
        water: { current: hydrationCurrentL, target: hydrationTargetL, unit: 'L' },
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

        {/* Zone secondaire - Cette semaine */}
        <section className='mb-8'>
          <h2 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4'>
            Cette semaine
          </h2>

          <div className='grid grid-cols-3 gap-6'>
            {/* DASH-004: Progression avec sparkline et comparaisons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className='bg-white rounded-xl p-6 border border-gray-200'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-gray-800'>Progression</h3>
                <span className='text-xs text-gray-400'>Cette semaine</span>
              </div>

              {/* Tendance du poids avec mini graphique sparkline */}
              <div className='mb-4'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                      <TrendingUp className='w-4 h-4 text-blue-600' />
                    </div>
                    <span className='text-sm font-medium text-gray-700'>
                      Poids
                    </span>
                  </div>
                  {currentWeight !== null ? (
                    <div className='text-right'>
                      <span className='text-lg font-bold text-gray-800'>
                        {currentWeight} kg
                      </span>
                      {weightChange !== 0 && (
                        <span
                          className={`ml-2 text-sm font-medium ${weightChange < 0 ? 'text-emerald-600' : 'text-red-500'}`}
                        >
                          {weightChange > 0 ? '+' : ''}
                          {weightChange} kg
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className='text-sm text-gray-400'>Aucune donnée</span>
                  )}
                </div>

                {/* Mini graphique sparkline - affiché uniquement si des données existent */}
                {weightHistory.length >= 2 ? (
                <div className='mt-3 mb-1'>
                  <div className='h-16 w-full relative bg-gradient-to-b from-[#1B998B]/5 to-transparent rounded-lg overflow-hidden'>
                    <svg
                      className='w-full h-full'
                      viewBox='0 0 200 64'
                      preserveAspectRatio='none'
                    >
                      {/* Définitions des gradients */}
                      <defs>
                        <linearGradient
                          id='weightAreaGradient'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='0%'
                            stopColor='#1B998B'
                            stopOpacity='0.25'
                          />
                          <stop
                            offset='50%'
                            stopColor='#1B998B'
                            stopOpacity='0.1'
                          />
                          <stop
                            offset='100%'
                            stopColor='#1B998B'
                            stopOpacity='0'
                          />
                        </linearGradient>
                        <linearGradient
                          id='weightLineGradient'
                          x1='0'
                          y1='0'
                          x2='1'
                          y2='0'
                        >
                          <stop
                            offset='0%'
                            stopColor='#1B998B'
                            stopOpacity='0.6'
                          />
                          <stop
                            offset='50%'
                            stopColor='#1B998B'
                            stopOpacity='1'
                          />
                          <stop
                            offset='100%'
                            stopColor='#1B998B'
                            stopOpacity='1'
                          />
                        </linearGradient>
                      </defs>

                      {/* Lignes de grille horizontales subtiles */}
                      <line
                        x1='0'
                        y1='16'
                        x2='200'
                        y2='16'
                        stroke='#E5E7EB'
                        strokeWidth='0.5'
                        strokeOpacity='0.5'
                      />
                      <line
                        x1='0'
                        y1='32'
                        x2='200'
                        y2='32'
                        stroke='#E5E7EB'
                        strokeWidth='0.5'
                        strokeOpacity='0.5'
                      />
                      <line
                        x1='0'
                        y1='48'
                        x2='200'
                        y2='48'
                        stroke='#E5E7EB'
                        strokeWidth='0.5'
                        strokeOpacity='0.5'
                      />

                      {/* Aire sous la courbe avec gradient */}
                      <motion.path
                        d={generateSparklineAreaPath(
                          weightHistory,
                          200,
                          64,
                          6
                        )}
                        fill='url(#weightAreaGradient)'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />

                      {/* Courbe du poids - ligne principale */}
                      <motion.path
                        d={generateSparklinePath(
                          weightHistory,
                          200,
                          64,
                          6
                        )}
                        fill='none'
                        stroke='url(#weightLineGradient)'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />

                      {/* Point final (dernier jour) avec effet glow */}
                      {(() => {
                        const data = weightHistory;
                        const min = Math.min(...data);
                        const max = Math.max(...data);
                        const range = max - min || 0.1;
                        const lastIndex = data.length - 1;
                        const x = 8 + (lastIndex / (data.length - 1)) * 184;
                        const y = 6 + ((max - data[lastIndex]) / range) * 52;
                        return (
                          <>
                            {/* Glow effect */}
                            <motion.circle
                              cx={x}
                              cy={y}
                              r='8'
                              fill='#1B998B'
                              opacity='0.2'
                              initial={{ scale: 0 }}
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: 1.2,
                              }}
                            />
                            {/* Point principal */}
                            <motion.circle
                              cx={x}
                              cy={y}
                              r='4'
                              fill='#1B998B'
                              stroke='#fff'
                              strokeWidth='2'
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: 1.2 }}
                            />
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Légende des jours */}
                  <div className='flex justify-between text-[10px] text-gray-400 px-1 mt-1'>
                    <span>Lun</span>
                    <span>Mar</span>
                    <span>Mer</span>
                    <span>Jeu</span>
                    <span>Ven</span>
                    <span>Sam</span>
                    <span className='font-medium text-[#1B998B]'>Auj.</span>
                  </div>
                </div>
                ) : (
                  <p className='mt-3 text-xs text-gray-400 text-center'>
                    Ajoutez au moins 2 pesées pour voir votre courbe
                  </p>
                )}
              </div>
            </motion.div>

            {/* DASH-005: Prochain RDV avec compte à rebours (données réelles) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className='bg-white rounded-xl p-6 border border-gray-200'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-gray-800'>
                  Prochain rendez-vous
                </h3>
                {nextAppointmentData?.appointment && (
                  <span className='inline-flex items-center px-2 py-1 bg-[#1B998B]/10 text-[#1B998B] text-xs font-medium rounded-full'>
                    {formatCountdown(new Date(nextAppointmentData.appointment.scheduled_at))}
                  </span>
                )}
              </div>

              {appointmentLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='w-6 h-6 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
                </div>
              ) : nextAppointmentData?.appointment ? (
                (() => {
                  const appt = nextAppointmentData.appointment;
                  const apptDate = new Date(appt.scheduled_at);
                  const apptEndDate = new Date(appt.scheduled_end_at);
                  const consultTypeName = appt.consultation_type?.name_fr || getAppointmentTypeLabel(
                    (appt.consultation_type_code === 'follow_up' ? 'follow-up' : appt.consultation_type_code) as AppointmentType
                  );
                  const nutriName = appt.nutritionist?.title || appt.nutritionist?.cabinet_name || 'Nutritionniste';
                  const nutriInitials = nutriName
                    .split(' ')
                    .map((w: string) => w[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <>
                      {/* Carte du rendez-vous */}
                      <div className='bg-gradient-to-br from-[#1B998B]/5 to-[#1B998B]/10 rounded-xl p-4 mb-4 border border-[#1B998B]/10'>
                        <div className='flex items-start gap-4'>
                          {/* Date stylisée */}
                          <div className='w-14 h-14 bg-white rounded-xl flex flex-col items-center justify-center border border-[#1B998B]/20 shadow-sm'>
                            <span className='text-[10px] text-[#1B998B] font-semibold uppercase'>
                              {apptDate.toLocaleDateString('fr-FR', { month: 'short' })}
                            </span>
                            <span className='text-xl font-bold text-gray-800'>
                              {apptDate.getDate()}
                            </span>
                          </div>

                          {/* Détails */}
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-semibold text-gray-800 mb-1'>
                              {consultTypeName}
                            </p>
                            <p className='text-sm text-gray-600 mb-2'>
                              {apptDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              {' - '}
                              {apptEndDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>

                            {/* Mode du RDV */}
                            {(() => {
                              const modeInfo = getAppointmentModeInfo(appt.mode as AppointmentMode);
                              return (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${modeInfo.color}`}
                                >
                                  <span>{modeInfo.icon}</span>
                                  {modeInfo.label}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Nutritionniste */}
                        <div className='flex items-center gap-2 mt-3 pt-3 border-t border-[#1B998B]/10'>
                          <div className='w-6 h-6 bg-[#1B998B] rounded-full flex items-center justify-center text-white text-[10px] font-medium'>
                            {nutriInitials}
                          </div>
                          <span className='text-xs text-gray-600'>
                            avec{' '}
                            <span className='font-medium text-gray-800'>
                              {nutriName}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Lien vers l'agenda */}
                      <Link
                        href='/dashboard/patient/agenda'
                        className='w-full py-2.5 text-sm text-[#1B998B] font-medium hover:bg-[#1B998B]/5 rounded-lg transition-colors flex items-center justify-center gap-1'
                      >
                        <Calendar className='w-4 h-4' />
                        Voir l&apos;agenda complet
                        <ArrowRight className='w-4 h-4' />
                      </Link>
                    </>
                  );
                })()
              ) : (
                /* Aucun RDV planifié */
                <div className='text-center py-6'>
                  <div className='w-14 h-14 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                    <Calendar className='w-7 h-7 text-gray-400' />
                  </div>
                  <p className='text-sm font-medium text-gray-600 mb-1'>
                    Aucun rendez-vous planifié
                  </p>
                  <p className='text-xs text-gray-400 mb-4'>
                    Prenez rendez-vous avec votre nutritionniste
                  </p>
                  <Link
                    href='/dashboard/patient/agenda'
                    className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white text-sm font-medium rounded-lg hover:bg-[#147569] transition-colors'
                  >
                    <Calendar className='w-4 h-4' />
                    Prendre rendez-vous
                  </Link>
                </div>
              )}
            </motion.div>

            {/* DASH-006: Messages avec badge dynamique (données réelles) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className='bg-white rounded-xl p-6 border border-gray-200'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-gray-800'>Messages</h3>
                {unreadCount > 0 && (
                  <motion.span
                    key={unreadCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className='bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1'
                  >
                    <span className='relative flex h-2 w-2'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
                      <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
                    </span>
                    {unreadCount} non lu
                    {unreadCount > 1 ? 's' : ''}
                  </motion.span>
                )}
              </div>

              {/* Liste des conversations récentes (max 2) */}
              <div className='space-y-2 max-h-40 overflow-y-auto'>
                {recentConversations.length > 0 ? (
                  recentConversations.slice(0, 2).map(conv => (
                    <Link key={conv.id} href='/dashboard/patient/messagerie'>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          conv.unreadCount > 0
                            ? 'bg-[#1B998B]/5 hover:bg-[#1B998B]/10'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className='w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 bg-[#1B998B]'>
                          {conv.nutritionist.initials}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <p
                              className={`text-sm ${conv.unreadCount > 0 ? 'font-semibold text-gray-800' : 'font-medium text-gray-600'}`}
                            >
                              {conv.nutritionist.name}
                            </p>
                          </div>
                          {conv.lastMessage && (
                            <>
                              <p
                                className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-700' : 'text-gray-500'}`}
                              >
                                {conv.lastMessage.content}
                              </p>
                              <p className='text-[10px] text-gray-400 mt-0.5'>
                                {formatRelativeTime(conv.lastMessage.timestamp)}
                              </p>
                            </>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className='w-2 h-2 bg-[#1B998B] rounded-full mt-2 flex-shrink-0'></div>
                        )}
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <div className='text-center py-4'>
                    <p className='text-sm text-gray-500'>Aucun message</p>
                  </div>
                )}
              </div>

              <Link
                href='/dashboard/patient/messagerie'
                className='w-full py-2.5 mt-3 text-sm text-[#1B998B] font-medium hover:bg-[#1B998B]/5 rounded-lg transition-colors flex items-center justify-center gap-1'
              >
                <MessageSquare className='w-4 h-4' />
                Ouvrir la messagerie
                <ArrowRight className='w-4 h-4' />
              </Link>
            </motion.div>
          </div>

          {/* DASH-007: Objectifs de la semaine - données depuis l'API */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className='mt-6 bg-white rounded-xl p-6 border border-gray-200'
          >
            {objectivesLoading ? (
              <div className='animate-pulse space-y-4'>
                <div className='h-5 bg-gray-200 rounded w-48' />
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className='h-40 bg-gray-100 rounded-xl' />
                  ))}
                </div>
              </div>
            ) : weeklyObjectivesData && weeklyObjectivesData.objectives.length > 0 ? (
              <>
                {/* Header avec progression globale et temps restant */}
                <div className='flex items-center justify-between mb-5'>
                  <div className='flex items-center gap-3'>
                    <h3 className='font-semibold text-gray-800'>
                      Objectifs de la semaine
                    </h3>
                    <span className='inline-flex items-center px-2 py-0.5 bg-[#1B998B]/10 text-[#1B998B] text-xs font-medium rounded-full'>
                      {weeklyObjectivesData.completed_objectives}/
                      {weeklyObjectivesData.total_objectives} atteints
                    </span>
                  </div>
                  {weeklyObjectivesData.time_remaining && (
                    <span
                      className={`text-xs font-medium flex items-center gap-1 ${
                        weeklyObjectivesData.time_remaining.days <= 2 ? 'text-amber-600' : 'text-gray-500'
                      }`}
                    >
                      <Clock className='w-3 h-3' />
                      {weeklyObjectivesData.time_remaining.label}
                    </span>
                  )}
                </div>

                {/* Grille des objectifs */}
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                  {weeklyObjectivesData.objectives.map((objective, index) => {
                    const objStatus = getProgressStatus(objective.progress, 100);
                    const objColors = getStatusColors(objStatus);
                    const categoryInfo = getObjectiveCategoryInfo(
                      objective.category as ObjectiveCategory
                    );
                    const weekEndDate = new Date(weeklyObjectivesData.week_end + 'T23:59:59');
                    const timeLeft = getTimeRemaining(weekEndDate);

                    return (
                      <motion.div
                        key={objective.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        className={`relative p-4 rounded-xl border-2 transition-all group ${
                          objective.isCompleted
                            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50'
                            : `${objColors.border} ${objColors.bgLight}`
                        }`}
                      >
                        {/* Animation de célébration pour objectif atteint */}
                        {objective.isCompleted && (
                          <>
                            <motion.div
                              className='absolute -top-1 -right-1'
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 15,
                                delay: 0.8 + index * 0.1,
                              }}
                            >
                              <div className='w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg'>
                                <Check className='w-4 h-4 text-white' />
                              </div>
                            </motion.div>
                            <motion.div
                              className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-xl'
                              initial={{ x: '-100%' }}
                              animate={{ x: '200%' }}
                              transition={{
                                duration: 1.5,
                                delay: 1 + index * 0.1,
                                ease: 'easeInOut',
                              }}
                            />
                          </>
                        )}

                        {/* Icône de catégorie et temps restant */}
                        <div className='flex items-center justify-between mb-3'>
                          <div
                            className={`w-8 h-8 rounded-lg ${categoryInfo.bgColor} flex items-center justify-center`}
                          >
                            <span className='text-sm'>{categoryInfo.icon}</span>
                          </div>
                          {!objective.isCompleted && (
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                timeLeft.isUrgent
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {timeLeft.text}
                            </span>
                          )}
                          {objective.isCompleted && (
                            <span className='text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700'>
                              Atteint !
                            </span>
                          )}
                        </div>

                        {/* Label et description */}
                        <p
                          className={`text-sm font-medium mb-1 ${
                            objective.isCompleted
                              ? 'text-emerald-800'
                              : 'text-gray-800'
                          }`}
                        >
                          {objective.label}
                        </p>
                        {objective.description && (
                          <p className='text-[10px] text-gray-500 mb-3 line-clamp-1'>
                            {objective.description}
                          </p>
                        )}

                        {/* Barre de progression */}
                        <div className='mb-2'>
                          <div className='flex items-center justify-between mb-1'>
                            <span
                              className={`text-xs font-semibold ${
                                objective.isCompleted
                                  ? 'text-emerald-600'
                                  : objColors.text
                              }`}
                            >
                              {objective.progress}%
                            </span>
                            <span className='text-[10px] text-gray-500'>
                              {objective.current}/{objective.target}{' '}
                              {objective.unit}
                            </span>
                          </div>
                          <div className='h-2 bg-white/70 rounded-full overflow-hidden shadow-inner'>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${objective.progress}%` }}
                              transition={{
                                duration: 0.8,
                                delay: 0.8 + index * 0.1,
                                ease: 'easeOut',
                              }}
                              className={`h-full rounded-full ${
                                objective.isCompleted
                                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                  : objColors.bg
                              }`}
                            />
                          </div>
                        </div>

                        {/* Défini par */}
                        {objective.definedBy && (
                          <div className='flex items-center gap-1.5 pt-2 border-t border-gray-200/50'>
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium text-white ${
                                objective.definedBy.role === 'nutritionist'
                                  ? 'bg-[#1B998B]'
                                  : 'bg-blue-500'
                              }`}
                            >
                              {objective.definedBy.initials}
                            </div>
                            <span className='text-[10px] text-gray-400'>
                              {objective.definedBy.role === 'nutritionist'
                                ? 'Défini par'
                                : 'Suggéré par'}{' '}
                              {objective.definedBy.name}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Encouragement si tous les objectifs sont atteints */}
                {weeklyObjectivesData.completed_objectives ===
                  weeklyObjectivesData.total_objectives &&
                  weeklyObjectivesData.total_objectives > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className='mt-4 p-4 bg-gradient-to-r from-emerald-50 to-[#1B998B]/10 rounded-xl border border-emerald-200 text-center'
                  >
                    <div className='flex items-center justify-center gap-2 mb-1'>
                      <span className='text-2xl'>🎉</span>
                      <span className='font-semibold text-emerald-800'>
                        Félicitations !
                      </span>
                      <span className='text-2xl'>🎉</span>
                    </div>
                    <p className='text-sm text-emerald-700'>
                      Vous avez atteint tous vos objectifs cette semaine. Continuez
                      ainsi !
                    </p>
                  </motion.div>
                )}
              </>
            ) : (
              <div className='text-center py-6'>
                <h3 className='font-semibold text-gray-800 mb-2'>
                  Objectifs de la semaine
                </h3>
                <p className='text-sm text-gray-500'>
                  Aucun objectif défini pour cette semaine.
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  Votre nutritionniste peut vous définir des objectifs personnalisés.
                </p>
              </div>
            )}
          </motion.div>

        </section>

        {/* Zone tertiaire - Accès rapide */}
        <section>
          <h2 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4'>
            Accès rapide
          </h2>

          <div className='grid grid-cols-4 gap-4'>
            {quickAccess.map((item, index) => (
              <Link key={index} href={item.href as any}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  className='bg-white rounded-xl p-5 border border-gray-200 text-left hover:border-[#1B998B]/50 hover:shadow-md transition-all h-full'
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}
                  >
                    {item.icon}
                  </div>
                  <p className='font-medium text-gray-800'>{item.label}</p>
                  <p className='text-sm text-gray-500'>{item.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
