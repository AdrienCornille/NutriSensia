/**
 * Types for the Meals History feature
 * Page: /dashboard/repas
 */

import type { MealType, SelectedFood, NutritionValues, MealContext } from './meals';

// ==================== VIEW MODES ====================

export type ViewMode = 'day' | 'week' | 'list';

export type ListFilter = 'all' | MealType;

// ==================== LOGGED MEAL ====================

export interface LoggedMeal {
  id: string;
  userId: string;
  type: MealType;
  loggedAt: Date;
  foods: SelectedFood[];
  totalNutrition: NutritionValues;
  photoUrl?: string | null;
  notes?: string;
  contextTags: MealContext[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== DAILY DATA ====================

export interface DailyMeals {
  breakfast: LoggedMeal | null;
  lunch: LoggedMeal | null;
  dinner: LoggedMeal | null;
  snack: LoggedMeal | null;
}

export interface DailyMealsData {
  date: Date;
  meals: DailyMeals;
  totalNutrition: NutritionValues;
  targets: NutritionValues;
  adherencePercentage: number;
}

// ==================== WEEK DATA ====================

export interface WeekDayMeals {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  snack: boolean;
}

export interface WeekDayData {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isFuture: boolean;
  meals: WeekDayMeals;
  totalCalories: number;
  targetCalories: number;
  caloriePercentage: number;
}

export interface WeeklyMealsData {
  weekStart: Date;
  weekEnd: Date;
  days: WeekDayData[];
}

// ==================== LIST DATA ====================

export interface MealsListGroup {
  label: string; // "Aujourd'hui", "Hier", "Avant-hier", or formatted date
  date: Date;
  meals: LoggedMeal[];
}

export interface MealsListData {
  groups: MealsListGroup[];
  hasMore: boolean;
  totalCount: number;
}

// ==================== SIDEBAR DATA ====================

export interface CaloriesData {
  consumed: number;
  target: number;
  remaining: number;
}

export interface MacroData {
  current: number;
  target: number;
}

export interface MacrosData {
  protein: MacroData;
  carbs: MacroData;
  fat: MacroData;
}

export interface DailySummaryData {
  calories: CaloriesData;
  macros: MacrosData;
}

export type PlanStatus = 'excellent' | 'good' | 'warning' | 'poor';

export type MacroType = 'protein' | 'carbs' | 'fat' | 'calories';

export interface MacroDeviation {
  macro: MacroType;
  label: string;
  current: number;
  target: number;
  percentage: number;
  deviation: number; // positive = over, negative = under
  status: 'ok' | 'slight' | 'significant';
}

export interface PlanComparisonData {
  adherencePercentage: number;
  status: PlanStatus;
  statusLabel: string;
  message: string;
  deviations: MacroDeviation[];
  biggestDeviation: MacroDeviation | null;
}

// ==================== STATE ====================

export interface MealsHistoryState {
  viewMode: ViewMode;
  selectedDate: Date;
  listFilter: ListFilter;
  expandedMealId: string | null;
  isDrawerOpen: boolean;
  drawerMealType: MealType | null;
}

export type MealsHistoryAction =
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'SET_SELECTED_DATE'; date: Date }
  | { type: 'GO_TO_TODAY' }
  | { type: 'NAVIGATE_DATE'; direction: 'prev' | 'next' }
  | { type: 'SET_LIST_FILTER'; filter: ListFilter }
  | { type: 'TOGGLE_MEAL_EXPANDED'; mealId: string }
  | { type: 'COLLAPSE_MEAL' }
  | { type: 'OPEN_ADD_DRAWER'; mealType?: MealType }
  | { type: 'CLOSE_DRAWER' };

// ==================== REDUCER ====================

export const initialMealsHistoryState: MealsHistoryState = {
  viewMode: 'day',
  selectedDate: new Date(),
  listFilter: 'all',
  expandedMealId: null,
  isDrawerOpen: false,
  drawerMealType: null,
};

export function mealsHistoryReducer(
  state: MealsHistoryState,
  action: MealsHistoryAction
): MealsHistoryState {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode, expandedMealId: null };

    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.date, expandedMealId: null };

    case 'GO_TO_TODAY':
      return { ...state, selectedDate: new Date(), expandedMealId: null };

    case 'NAVIGATE_DATE': {
      const offset = action.direction === 'prev' ? -1 : 1;
      const unit = state.viewMode === 'week' ? 7 : 1;
      const newDate = new Date(state.selectedDate);
      newDate.setDate(newDate.getDate() + offset * unit);
      return { ...state, selectedDate: newDate, expandedMealId: null };
    }

    case 'SET_LIST_FILTER':
      return { ...state, listFilter: action.filter };

    case 'TOGGLE_MEAL_EXPANDED':
      return {
        ...state,
        expandedMealId: state.expandedMealId === action.mealId ? null : action.mealId,
      };

    case 'COLLAPSE_MEAL':
      return { ...state, expandedMealId: null };

    case 'OPEN_ADD_DRAWER':
      return {
        ...state,
        isDrawerOpen: true,
        drawerMealType: action.mealType ?? null,
      };

    case 'CLOSE_DRAWER':
      return { ...state, isDrawerOpen: false, drawerMealType: null };

    default:
      return state;
  }
}

// ==================== UTILITY TYPES ====================

export interface MealTypeConfig {
  type: MealType;
  label: string;
  icon: string;
  timeRange: string;
  bgColor: string;
  textColor: string;
}

export const mealTypeConfigs: MealTypeConfig[] = [
  {
    type: 'breakfast',
    label: 'Petit-déjeuner',
    icon: '🌅',
    timeRange: '06:00 - 10:00',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  {
    type: 'lunch',
    label: 'Déjeuner',
    icon: '☀️',
    timeRange: '11:00 - 14:00',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
  },
  {
    type: 'dinner',
    label: 'Dîner',
    icon: '🌙',
    timeRange: '18:00 - 21:00',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
  },
  {
    type: 'snack',
    label: 'Collation',
    icon: '🍎',
    timeRange: 'À tout moment',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
  },
];

export function getMealTypeConfig(type: MealType): MealTypeConfig {
  return mealTypeConfigs.find((c) => c.type === type) ?? mealTypeConfigs[0];
}
