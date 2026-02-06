/**
 * Constantes pour le système de repas
 */

import type { NutritionValues } from '@/types/meals';

// ============================================================================
// OBJECTIFS NUTRITIONNELS PAR DÉFAUT
// ============================================================================

/**
 * Objectifs nutritionnels quotidiens par défaut
 * TODO: À terme, ces valeurs seront récupérées depuis le plan alimentaire de l'utilisateur
 */
export const DAILY_NUTRITION_TARGETS: NutritionValues = {
  calories: 2100,
  protein: 140, // grammes
  carbs: 230, // grammes
  fat: 70, // grammes
};

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Nombre d'items par page pour la vue liste
 */
export const ITEMS_PER_PAGE = 20;

/**
 * Incrément de chargement pour "Charger plus"
 */
export const LOAD_INCREMENT = 20;

/**
 * Limite maximale de repas à charger en une fois
 */
export const MAX_ITEMS_PER_LOAD = 100;

/**
 * Nombre maximum de repas par jour (tous types confondus)
 */
export const MAX_MEALS_PER_DAY = 50;

// ============================================================================
// CACHE ET PERFORMANCE
// ============================================================================

/**
 * Durée de validité du cache React Query pour les repas (1 minute)
 */
export const MEALS_STALE_TIME = 1 * 60 * 1000;

/**
 * Durée de validité du cache React Query pour les détails d'un repas (5 minutes)
 */
export const MEAL_DETAIL_STALE_TIME = 5 * 60 * 1000;

/**
 * Durée de validité du cache React Query pour les favoris (5 minutes)
 */
export const FAVORITES_STALE_TIME = 5 * 60 * 1000;

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Nombre minimum d'aliments requis pour créer un repas
 */
export const MIN_FOODS_PER_MEAL = 1;

/**
 * Nombre maximum d'aliments autorisés par repas
 */
export const MAX_FOODS_PER_MEAL = 50;

/**
 * Calories minimales pour qu'un repas soit valide
 */
export const MIN_CALORIES_PER_MEAL = 10;

/**
 * Calories maximales pour qu'un repas soit valide
 */
export const MAX_CALORIES_PER_MEAL = 5000;

// ============================================================================
// SEUILS D'ADHÉRENCE
// ============================================================================

/**
 * Seuils pour déterminer le statut d'adhérence au plan
 */
export const ADHERENCE_THRESHOLDS = {
  excellent: { min: 90, max: 110 }, // 90-110%
  good: { min: 80, max: 120 }, // 80-120%
  warning: { min: 70, max: 130 }, // 70-130%
  // poor: tout le reste
} as const;

/**
 * Seuils pour les déviations de macros
 */
export const DEVIATION_THRESHOLDS = {
  ok: 10, // ±10%
  slight: 20, // ±20%
  // significant: au-delà
} as const;

// ============================================================================
// MESSAGES
// ============================================================================

/**
 * Messages d'adhérence au plan
 */
export const ADHERENCE_MESSAGES = {
  excellent: 'Vous suivez parfaitement votre plan !',
  good: 'Vous suivez bien votre plan.',
  warning: 'Léger écart par rapport au plan.',
  poor: 'Écart important par rapport au plan.',
} as const;

/**
 * Labels de statut d'adhérence
 */
export const ADHERENCE_LABELS = {
  excellent: 'Excellent',
  good: 'Bon',
  warning: 'Attention',
  poor: 'À améliorer',
} as const;

// ============================================================================
// FORMATS DE DATE
// ============================================================================

/**
 * Format de date pour l'API (YYYY-MM-DD)
 */
export const API_DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Format de date pour l'affichage (format français)
 */
export const DISPLAY_DATE_FORMAT = 'dd MMMM yyyy';

/**
 * Format de date et heure pour l'affichage
 */
export const DISPLAY_DATETIME_FORMAT = 'dd MMMM yyyy à HH:mm';

// ============================================================================
// TYPES DE REPAS
// ============================================================================

/**
 * Configuration des types de repas avec emojis et couleurs
 * Note: Les configurations complètes sont dans @/types/meals-history
 * Ceci est une version simplifiée pour référence
 */
export const MEAL_TYPE_EMOJIS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
} as const;

/**
 * Plages horaires par défaut pour chaque type de repas
 */
export const MEAL_TIME_RANGES = {
  breakfast: { start: 6, end: 10 },
  lunch: { start: 11, end: 14 },
  dinner: { start: 18, end: 21 },
  snack: null, // À tout moment
} as const;

// ============================================================================
// EXPORT GROUPÉ
// ============================================================================

/**
 * Configuration complète exportée
 */
export const MEALS_CONFIG = {
  nutrition: {
    targets: DAILY_NUTRITION_TARGETS,
    minCalories: MIN_CALORIES_PER_MEAL,
    maxCalories: MAX_CALORIES_PER_MEAL,
    minFoods: MIN_FOODS_PER_MEAL,
    maxFoods: MAX_FOODS_PER_MEAL,
  },
  pagination: {
    itemsPerPage: ITEMS_PER_PAGE,
    loadIncrement: LOAD_INCREMENT,
    maxItemsPerLoad: MAX_ITEMS_PER_LOAD,
    maxMealsPerDay: MAX_MEALS_PER_DAY,
  },
  cache: {
    mealsStaleTime: MEALS_STALE_TIME,
    mealDetailStaleTime: MEAL_DETAIL_STALE_TIME,
    favoritesStaleTime: FAVORITES_STALE_TIME,
  },
  adherence: {
    thresholds: ADHERENCE_THRESHOLDS,
    deviationThresholds: DEVIATION_THRESHOLDS,
    messages: ADHERENCE_MESSAGES,
    labels: ADHERENCE_LABELS,
  },
} as const;
