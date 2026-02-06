/**
 * Types pour le Plan Alimentaire
 *
 * PLAN-001: Vue d'ensemble du plan alimentaire
 * - Affichage des objectifs journaliers (macros + micros)
 * - Vue jour avec détails des repas
 * - Vue semaine avec grille récapitulative
 */

// ==================== ENUMS ====================

export type MealPlanViewMode = 'day' | 'week';

export type PlanMealType =
  | 'petit-dejeuner'
  | 'dejeuner'
  | 'collation'
  | 'diner';

export type NutrientStatus = 'good' | 'warning' | 'low';

/**
 * Catégories d'aliments pour la liste de courses (PLAN-006)
 */
export type ShoppingCategory =
  | 'legumes'
  | 'fruits'
  | 'viandes-poissons'
  | 'produits-laitiers'
  | 'feculents-cereales'
  | 'oleagineux'
  | 'huiles-condiments'
  | 'autres';

// ==================== INTERFACES ====================

/**
 * Jour de la semaine pour le sélecteur
 */
export interface WeekDay {
  short: string;
  full: string;
  date: string;
  dayNumber: number;
  isToday: boolean;
  dateObj: Date;
}

/**
 * Objectifs nutritionnels journaliers
 */
export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

/**
 * Alternative pour un aliment
 */
export interface FoodAlternative {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Aliment dans un repas planifié
 */
export interface PlanFood {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: ShoppingCategory;
  alternatives?: FoodAlternative[];
}

/**
 * Repas planifié
 */
export interface PlanMeal {
  id: string;
  type: PlanMealType;
  label: string;
  icon: string;
  time: string;
  targetCalories: number;
  foods: PlanFood[];
  alternatives?: string;
}

/**
 * Micronutriment avec statut
 */
export interface Micronutrient {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: NutrientStatus;
}

/**
 * Résumé d'un repas pour la vue semaine
 */
export interface MealSummary {
  summary: string;
  calories: number;
}

/**
 * Données d'un jour pour la vue semaine
 */
export interface WeeklyDayData {
  day: WeekDay;
  meals: Record<PlanMealType, MealSummary>;
  totalCalories: number;
}

/**
 * Informations sur le créateur du plan
 */
export interface PlanCreator {
  name: string;
  initials: string;
  role: 'nutritionist' | 'system';
}

/**
 * Informations sur le plan alimentaire
 */
export interface PlanInfo {
  id: string;
  creator: PlanCreator;
  lastUpdated: Date;
  objective: string;
  isActive: boolean;
  weekStart: Date;
  weekEnd: Date;
}

/**
 * Données complètes du plan alimentaire pour un jour
 */
export interface DailyPlanData {
  date: Date;
  targets: DailyTargets;
  meals: Record<PlanMealType, PlanMeal>;
  micronutrients: Micronutrient[];
}

/**
 * Données complètes du plan alimentaire pour une semaine
 */
export interface WeeklyPlanData {
  weekStart: Date;
  weekEnd: Date;
  days: WeeklyDayData[];
  targets: DailyTargets;
}

// ==================== STATE ====================

/**
 * État du composant Plan Alimentaire
 */
export interface MealPlanState {
  viewMode: MealPlanViewMode;
  selectedDayIndex: number;
  expandedMealId: PlanMealType | null;
  showNutrientDetail: boolean;
}

/**
 * Actions pour le reducer du Plan Alimentaire
 */
export type MealPlanAction =
  | { type: 'SET_VIEW_MODE'; mode: MealPlanViewMode }
  | { type: 'SET_SELECTED_DAY'; index: number }
  | { type: 'TOGGLE_MEAL_EXPANDED'; mealId: PlanMealType }
  | { type: 'COLLAPSE_MEAL' }
  | { type: 'TOGGLE_NUTRIENT_DETAIL' }
  | { type: 'GO_TO_TODAY'; todayIndex: number };

// ==================== INITIAL STATE ====================

export const initialMealPlanState: MealPlanState = {
  viewMode: 'day',
  selectedDayIndex: 0,
  expandedMealId: null,
  showNutrientDetail: false,
};

// ==================== REDUCER ====================

export function mealPlanReducer(
  state: MealPlanState,
  action: MealPlanAction
): MealPlanState {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode };
    case 'SET_SELECTED_DAY':
      return { ...state, selectedDayIndex: action.index };
    case 'TOGGLE_MEAL_EXPANDED':
      return {
        ...state,
        expandedMealId:
          state.expandedMealId === action.mealId ? null : action.mealId,
      };
    case 'COLLAPSE_MEAL':
      return { ...state, expandedMealId: null };
    case 'TOGGLE_NUTRIENT_DETAIL':
      return { ...state, showNutrientDetail: !state.showNutrientDetail };
    case 'GO_TO_TODAY':
      return { ...state, selectedDayIndex: action.todayIndex, viewMode: 'day' };
    default:
      return state;
  }
}

// ==================== HELPERS ====================

/**
 * Configuration des types de repas
 */
export const mealTypeConfig: Record<
  PlanMealType,
  { label: string; icon: string; defaultTime: string }
> = {
  'petit-dejeuner': {
    label: 'Petit-déjeuner',
    icon: '🌅',
    defaultTime: '7:00 - 9:00',
  },
  dejeuner: { label: 'Déjeuner', icon: '☀️', defaultTime: '12:00 - 14:00' },
  collation: { label: 'Collation', icon: '🍎', defaultTime: '16:00 - 17:00' },
  diner: { label: 'Dîner', icon: '🌙', defaultTime: '19:00 - 21:00' },
};

/**
 * Calcule les totaux nutritionnels d'un repas
 */
export function calculateMealTotal(foods: PlanFood[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  return foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Génère les jours de la semaine à partir d'une date de début
 */
export function generateWeekDays(weekStart: Date): WeekDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: WeekDay[] = [];
  const dayNames = {
    short: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    full: [
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
      'Dimanche',
    ],
  };

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    date.setHours(0, 0, 0, 0);

    days.push({
      short: dayNames.short[i],
      full: dayNames.full[i],
      date: date.getDate().toString(),
      dayNumber: date.getDate(),
      isToday: date.getTime() === today.getTime(),
      dateObj: date,
    });
  }

  return days;
}

/**
 * Trouve l'index du jour actuel dans la semaine
 */
export function findTodayIndex(weekDays: WeekDay[]): number {
  const index = weekDays.findIndex(day => day.isToday);
  return index >= 0 ? index : 0;
}

/**
 * Totaux nutritionnels calculés pour une journée
 */
export interface DailyPlanTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Statut de progression d'un macro par rapport à l'objectif
 */
export type MacroStatus = 'under' | 'good' | 'over';

/**
 * Calcule les totaux nutritionnels de tous les repas d'une journée
 */
export function calculateDailyPlanTotal(
  meals: Record<PlanMealType, PlanMeal>
): DailyPlanTotals {
  const mealTypes: PlanMealType[] = [
    'petit-dejeuner',
    'dejeuner',
    'collation',
    'diner',
  ];

  return mealTypes.reduce(
    (acc, mealType) => {
      const meal = meals[mealType];
      const mealTotal = calculateMealTotal(meal.foods);
      return {
        calories: acc.calories + mealTotal.calories,
        protein: acc.protein + mealTotal.protein,
        carbs: acc.carbs + mealTotal.carbs,
        fat: acc.fat + mealTotal.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Détermine le statut d'un macro par rapport à son objectif
 * - under: < 90% de l'objectif
 * - good: entre 90% et 110% de l'objectif
 * - over: > 110% de l'objectif
 */
export function getMacroStatus(current: number, target: number): MacroStatus {
  const ratio = current / target;
  if (ratio < 0.9) return 'under';
  if (ratio > 1.1) return 'over';
  return 'good';
}

/**
 * Calcule le pourcentage de progression (plafonné à 100 pour l'affichage)
 */
export function getProgressPercentage(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100);
}

/**
 * Formate la différence calorique entre un aliment et son alternative
 */
export function formatCalorieDifference(
  originalCalories: number,
  alternativeCalories: number
): string {
  const diff = alternativeCalories - originalCalories;
  if (Math.abs(diff) <= 10) return '≈ similaire';
  return diff > 0 ? `+${diff} kcal` : `${diff} kcal`;
}

// ==================== DEMANDES DE MODIFICATION ====================

/**
 * Statut d'une demande de modification
 */
export type ModificationRequestStatus =
  | 'pending'
  | 'reviewed'
  | 'approved'
  | 'rejected';

/**
 * Demande de modification du plan alimentaire
 */
export interface ModificationRequestData {
  id: string;
  createdAt: Date;
  meal?: PlanMealType;
  mealLabel?: string;
  food?: string;
  reason: string;
  status: ModificationRequestStatus;
  nutritionistResponse?: string;
  respondedAt?: Date;
}

/**
 * Formulaire de création de demande de modification
 */
export interface ModificationRequestFormData {
  meal?: PlanMealType;
  food?: string;
  reason: string;
}

/**
 * Configuration des statuts de demande
 */
export const modificationStatusConfig: Record<
  ModificationRequestStatus,
  { label: string; bgColor: string; textColor: string; icon: string }
> = {
  pending: {
    label: 'En attente',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: '🟡',
  },
  reviewed: {
    label: "En cours d'examen",
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: '🔵',
  },
  approved: {
    label: 'Approuvée',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: '🟢',
  },
  rejected: {
    label: 'Refusée',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: '🔴',
  },
};

/**
 * Formate une date relative (il y a X jours)
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30)
    return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  return `Il y a ${Math.floor(diffDays / 30)} mois`;
}

// ==================== LISTE DE COURSES (PLAN-006) ====================

/**
 * Configuration des catégories avec icônes et labels
 */
export const shoppingCategoryConfig: Record<
  ShoppingCategory,
  { label: string; icon: string; order: number }
> = {
  legumes: { label: 'Légumes', icon: '🥬', order: 1 },
  fruits: { label: 'Fruits', icon: '🍎', order: 2 },
  'viandes-poissons': { label: 'Viandes & Poissons', icon: '🥩', order: 3 },
  'produits-laitiers': { label: 'Produits laitiers', icon: '🥛', order: 4 },
  'feculents-cereales': { label: 'Féculents & Céréales', icon: '🌾', order: 5 },
  oleagineux: { label: 'Oléagineux', icon: '🥜', order: 6 },
  'huiles-condiments': { label: 'Huiles & Condiments', icon: '🫒', order: 7 },
  autres: { label: 'Autres', icon: '🍯', order: 8 },
};

/**
 * Item dans la liste de courses
 */
export interface ShoppingItem {
  id: string;
  name: string;
  category: ShoppingCategory;
  quantity: string;
  weeklyQuantity: string; // Quantité cumulée pour la semaine
  occurrences: number; // Nombre de fois dans la semaine
  checked: boolean;
}

/**
 * Liste de courses groupée par catégorie
 */
export interface ShoppingList {
  weekStart: Date;
  weekEnd: Date;
  categories: {
    category: ShoppingCategory;
    items: ShoppingItem[];
  }[];
  totalItems: number;
}
