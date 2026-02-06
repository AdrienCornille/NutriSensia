/**
 * Types pour le système de logging de repas
 * Page: /dashboard/repas
 */

// ==================== MEAL TYPES ====================

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealTypeConfig {
  id: MealType;
  label: string;
  icon: string;
  timeRange: string;
}

// ==================== FOOD TYPES ====================

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  emoji?: string;
  barcode?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  source?: 'database' | 'user' | 'openfoodfacts';
}

export type PortionUnit = 'g' | 'ml' | 'portion';

export interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SelectedFood extends FoodItem {
  quantity: number;
  unit: PortionUnit;
  calculatedNutrition: NutritionValues;
}

export interface StandardPortion {
  label: string;
  grams: number;
}

// ==================== MEAL CONTEXT ====================

export type MealContext =
  | 'home'
  | 'work'
  | 'restaurant'
  | 'family'
  | 'friends'
  | 'alone';

export interface MealContextConfig {
  id: MealContext;
  label: string;
  icon: string;
}

// ==================== PREVIOUS MEALS ====================

export interface PreviousMeal {
  id: string;
  type: MealType;
  label: string;
  description: string;
  calories: number;
  date: Date;
}

// ==================== NUTRITION TARGETS ====================

export interface NutritionTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealPlanTargets {
  breakfast: NutritionTarget;
  lunch: NutritionTarget;
  dinner: NutritionTarget;
  snack: NutritionTarget;
}

// ==================== STATE MANAGEMENT ====================

export type MealLoggingStep = 1 | 2 | 3;

export interface MealLoggingState {
  step: MealLoggingStep;
  mealType: MealType | null;
  foods: SelectedFood[];
  photoUrl: string | null;
  notes: string;
  contextTags: MealContext[];
  isSubmitting: boolean;
  error: string | null;
}

export type MealLoggingAction =
  | { type: 'SET_STEP'; step: MealLoggingStep }
  | { type: 'SELECT_MEAL_TYPE'; mealType: MealType }
  | { type: 'ADD_FOOD'; food: SelectedFood }
  | { type: 'UPDATE_FOOD'; food: SelectedFood }
  | { type: 'REMOVE_FOOD'; foodId: string }
  | { type: 'SET_PHOTO'; url: string | null }
  | { type: 'SET_NOTES'; notes: string }
  | { type: 'TOGGLE_TAG'; tag: MealContext }
  | { type: 'DUPLICATE_MEAL'; meal: PreviousMeal }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'RESET' };

// ==================== SEARCH ====================

export interface FoodSearchResult {
  foods: FoodItem[];
  isLoading: boolean;
  error: string | null;
}

// ==================== SUBMISSION ====================

export interface MealSubmission {
  mealType: MealType;
  foods: SelectedFood[];
  totalNutrition: NutritionValues;
  photoUrl?: string;
  notes?: string;
  contextTags: MealContext[];
  loggedAt: Date;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate nutrition values for a given quantity
 */
export function calculateNutrition(
  food: FoodItem,
  quantity: number,
  unit: PortionUnit
): NutritionValues {
  // For 'portion' unit, assume 1 portion = 100g as default
  const grams = unit === 'portion' ? quantity * 100 : quantity;
  const multiplier = grams / 100;

  return {
    calories: Math.round(food.caloriesPer100g * multiplier),
    protein: Math.round(food.proteinPer100g * multiplier * 10) / 10,
    carbs: Math.round(food.carbsPer100g * multiplier * 10) / 10,
    fat: Math.round(food.fatPer100g * multiplier * 10) / 10,
  };
}

/**
 * Calculate total nutrition from selected foods
 */
export function calculateTotalNutrition(
  foods: SelectedFood[]
): NutritionValues {
  return foods.reduce(
    (total, food) => ({
      calories: total.calories + food.calculatedNutrition.calories,
      protein:
        Math.round((total.protein + food.calculatedNutrition.protein) * 10) /
        10,
      carbs:
        Math.round((total.carbs + food.calculatedNutrition.carbs) * 10) / 10,
      fat: Math.round((total.fat + food.calculatedNutrition.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Initial state for meal logging
 */
export const initialMealLoggingState: MealLoggingState = {
  step: 1,
  mealType: null,
  foods: [],
  photoUrl: null,
  notes: '',
  contextTags: [],
  isSubmitting: false,
  error: null,
};

/**
 * Reducer for meal logging state
 */
export function mealLoggingReducer(
  state: MealLoggingState,
  action: MealLoggingAction
): MealLoggingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };

    case 'SELECT_MEAL_TYPE':
      return { ...state, mealType: action.mealType };

    case 'ADD_FOOD':
      return { ...state, foods: [...state.foods, action.food] };

    case 'UPDATE_FOOD':
      return {
        ...state,
        foods: state.foods.map(f =>
          f.id === action.food.id ? action.food : f
        ),
      };

    case 'REMOVE_FOOD':
      return {
        ...state,
        foods: state.foods.filter(f => f.id !== action.foodId),
      };

    case 'SET_PHOTO':
      return { ...state, photoUrl: action.url };

    case 'SET_NOTES':
      return { ...state, notes: action.notes };

    case 'TOGGLE_TAG':
      return {
        ...state,
        contextTags: state.contextTags.includes(action.tag)
          ? state.contextTags.filter(t => t !== action.tag)
          : [...state.contextTags, action.tag],
      };

    case 'DUPLICATE_MEAL':
      // This would need to load the actual foods from the duplicated meal
      return {
        ...state,
        mealType: action.meal.type,
      };

    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, error: null };

    case 'SUBMIT_SUCCESS':
      return { ...initialMealLoggingState };

    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, error: action.error };

    case 'RESET':
      return { ...initialMealLoggingState };

    default:
      return state;
  }
}
