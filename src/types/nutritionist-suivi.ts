/**
 * Types for Nutritionist Suivi & Progression (Epic 8)
 * SUIVI-001 to SUIVI-007
 */

import type { MeasurementType, TimeRange } from './suivi';

// ==================== SUB-TAB ENUM ====================

export type NutritionistSuiviTab =
  | 'synthese'
  | 'poids'
  | 'mensurations'
  | 'bien-etre'
  | 'activite'
  | 'hydratation'
  | 'repas';

export { TimeRange };

// ==================== WEIGHT (SUIVI-001) ====================

export interface NutriWeightEntry {
  id: string;
  weight_kg: number;
  date: string;
  notes: string | null;
  source: string | null;
}

export interface NutriWeightStats {
  current_weight: number | null;
  goal_weight: number | null;
  initial_weight: number | null;
  total_change: number;
  weekly_change: number;
  trend: 'up' | 'down' | 'stable';
  entries_count: number;
}

export interface NutriWeightGoal {
  id: string;
  initial_weight_kg: number;
  target_weight_kg: number;
  target_date: string | null;
}

export interface NutriWeightData {
  entries: NutriWeightEntry[];
  statistics: NutriWeightStats;
  goal: NutriWeightGoal | null;
}

// ==================== MEASUREMENTS (SUIVI-002) ====================

export interface NutriMeasurementEntry {
  id: string;
  measurement_type: MeasurementType;
  value_cm: number;
  date: string;
  notes: string | null;
}

export interface NutriMeasurementsStats {
  measurements_count: number;
  types_measured: number;
}

export interface NutriMeasurementsData {
  measurements: NutriMeasurementEntry[];
  statistics: NutriMeasurementsStats;
}

// ==================== WELLBEING (SUIVI-003) ====================

export interface NutriWellbeingLog {
  id: string;
  date: string;
  energy_level: number | null;
  sleep_quality: number | null;
  sleep_hours: number | null;
  mood: string | null;
  digestion: string | null;
  symptoms: string[] | null;
  notes: string | null;
}

export interface NutriWellbeingAverages {
  energy: number | null;
  sleep_quality: number | null;
  sleep_hours: number | null;
}

export interface NutriWellbeingData {
  logs: NutriWellbeingLog[];
  count: number;
  averages: NutriWellbeingAverages;
  distributions: {
    mood: Record<string, number>;
    digestion: Record<string, number>;
  };
}

// ==================== ACTIVITY (SUIVI-004) ====================

export interface NutriActivityLog {
  id: string;
  date: string;
  duration_minutes: number;
  intensity: string;
  calories_burned: number | null;
  notes: string | null;
  activity_type: {
    slug: string;
    name_fr: string;
    emoji: string;
    met_value: number;
  };
}

export interface NutriWeeklySummary {
  sessions: number;
  total_minutes: number;
  total_calories: number;
  goal_sessions: number;
}

export interface NutriActivityData {
  logs: NutriActivityLog[];
  count: number;
  weekly_summary: NutriWeeklySummary;
}

// ==================== HYDRATION (SUIVI-005) ====================

export interface NutriDailyHydration {
  date: string;
  total_ml: number;
  goal_ml: number;
  percentage: number;
}

export interface NutriHydrationSummary {
  average_daily_ml: number;
  goal_ml: number;
  days_goal_reached: number;
  total_days: number;
  alert: boolean;
}

export interface NutriHydrationData {
  daily_totals: NutriDailyHydration[];
  summary: NutriHydrationSummary;
}

// ==================== MEALS (SUIVI-007) ====================

export interface MealFeedback {
  id: string;
  comment: string;
  feedback_type: 'general' | 'positive' | 'warning' | 'suggestion';
  created_at: string;
}

export interface NutriMealFood {
  id: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface NutriMeal {
  id: string;
  meal_type: string;
  consumed_at: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  notes: string | null;
  photo_url: string | null;
  location: string | null;
  foods: NutriMealFood[];
  feedback: MealFeedback[];
}

export interface NutriDailySummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
}

export interface NutriMealsData {
  meals: NutriMeal[];
  daily_summary: NutriDailySummary | null;
  total: number;
}

// ==================== FEEDBACK TYPES ====================

export type FeedbackType = 'general' | 'positive' | 'warning' | 'suggestion';

export const feedbackTypeConfig: Record<
  FeedbackType,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  general: {
    label: 'Commentaire',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: '💬',
  },
  positive: {
    label: 'Positif',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: '👍',
  },
  warning: {
    label: 'Attention',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: '⚠️',
  },
  suggestion: {
    label: 'Suggestion',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: '💡',
  },
};
