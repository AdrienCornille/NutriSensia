/**
 * Types pour le Dossier Patient cote Nutritionniste (Epic 3)
 *
 * DOSSIER-001 a DOSSIER-010
 * Extends src/types/dossier.ts avec les types d'ecriture
 */

import type { AnamneseSection } from './dossier';

// ==================== DOSSIER SUMMARY ====================

export interface DossierSummary {
  anamnesis_status: string | null;
  anamnesis_updated_at: string | null;
  pending_questionnaires: number;
  completed_questionnaires: number;
  total_documents: number;
  total_consultations: number;
  last_consultation_date: string | null;
  active_objectives: number;
  objectives_on_track: number;
  pending_changes: number;
}

// ==================== ANAMNESE ====================

export interface AnamneseVersion {
  id: string;
  version: number;
  status: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnamneseResponse {
  current: {
    id: string;
    version: number;
    status: string;
    created_at: string;
    updated_at: string;
    sections: AnamneseSection[];
  } | null;
  history?: AnamneseVersion[];
}

// ==================== CHANGE REPORTS ====================

export interface ChangeReport {
  id: string;
  patient_id: string;
  anamnesis_section_id: string;
  change_type: 'health' | 'medication' | 'allergy' | 'lifestyle' | 'other';
  title: string;
  description: string;
  old_value: string | null;
  new_value: string | null;
  status: 'pending' | 'reviewed' | 'integrated';
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  created_at: string;
}

// ==================== QUESTIONNAIRES ====================

export interface QuestionnaireQuestion {
  id: string;
  question: string;
  type: 'text' | 'scale' | 'choice' | 'boolean' | 'number';
  options?: string[];
  required: boolean;
}

export interface QuestionnaireAnswer {
  question_id: string;
  answer: string | number | boolean;
}

export interface QuestionnaireDetail {
  id: string;
  patient_id: string;
  title: string;
  questionnaire_type: string;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  questions: QuestionnaireQuestion[];
  answers: QuestionnaireAnswer[] | null;
  consultation_id: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== DOCUMENTS ====================

export interface DocumentDetail {
  id: string;
  patient_id: string;
  uploaded_by: string;
  uploader_type: 'patient' | 'nutritionist';
  name: string;
  file_type: string;
  mime_type: string | null;
  file_url: string;
  file_size: number | null;
  category: string;
  description: string | null;
  consultation_id: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== OBJECTIVES ====================

export interface ObjectiveProgressLog {
  id: string;
  progress: number;
  value: string | null;
  notes: string | null;
  updated_by: string | null;
  created_at: string;
}

export interface PatientObjectiveDetail {
  id: string;
  patient_id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  category: string;
  target_value: string | null;
  target_unit: string | null;
  current_value: string | null;
  start_value: string | null;
  progress: number;
  start_date: string;
  deadline: string | null;
  status: string;
  priority: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  progress_logs?: ObjectiveProgressLog[];
}

// ==================== CONSULTATIONS (read-only for Epic 3) ====================

export interface ConsultationDetail {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  appointment_id: string | null;
  date: string;
  start_time: string | null;
  duration_minutes: number | null;
  consultation_type: string | null;
  mode: string;
  summary: string | null;
  key_points: string[] | null;
  next_steps: string | null;
  private_notes: string | null;
  status: 'draft' | 'final';
  created_at: string;
  updated_at: string;
}

// ==================== MEAL PLANS (PLAN-N-001) ====================

export interface NutritionalTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sodium: number | null;
}

export interface MealPlanSummary {
  id: string;
  name: string;
  objective: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  start_date: string;
  end_date: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  days_count: number;
  meals_count: number;
}

export interface MealPlanDetail extends MealPlanSummary {
  description: string | null;
  notes: string | null;
  nutritional_targets: NutritionalTargets | null;
  meal_types: MealType[] | null;
  patient_id: string;
  nutritionist_id: string;
}

// ==================== MEAL PLAN DAYS & MEALS (PLAN-N-002) ====================

export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';

export interface FoodMicronutrientData {
  // Vitamines
  vitamin_a: number | null;    // µg
  vitamin_c: number | null;    // mg
  vitamin_d: number | null;    // µg
  vitamin_e: number | null;    // mg
  vitamin_k: number | null;    // µg
  vitamin_b1: number | null;   // mg (thiamine)
  vitamin_b2: number | null;   // mg (riboflavine)
  vitamin_b3: number | null;   // mg (niacine)
  vitamin_b6: number | null;   // mg
  vitamin_b9: number | null;   // µg (folate)
  vitamin_b12: number | null;  // µg
  // Minéraux
  calcium: number | null;      // mg
  iron: number | null;         // mg
  magnesium: number | null;    // mg
  phosphorus: number | null;   // mg
  zinc: number | null;         // mg
}

export interface MealPlanFood {
  id: string;
  food_id: string | null;
  custom_name: string | null;
  quantity: number;
  unit: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g?: number | null;
  display_order: number;
  micronutrients?: FoodMicronutrientData | null;
}

export interface MealPlanMeal {
  id: string;
  meal_type: MealType;
  title: string | null;
  description: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  suggested_time: string | null;
  display_order: number;
  notes: string | null;
  foods: MealPlanFood[];
}

export interface MealPlanDay {
  id: string;
  day_number: number;
  day_name: string;
  date: string | null;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  notes: string | null;
  meals: MealPlanMeal[];
}

// ==================== MEAL PLAN ALTERNATIVES (PLAN-N-004) ====================

export interface MealPlanAlternative {
  id: string;
  plan_food_id: string;
  alternative_food_id: string | null;
  alternative_name: string;
  reason: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  preference_order: number;
  created_at?: string;
}

// ==================== CONSULTATION STATISTICS (CONSULT-007) ====================

export interface ConsultationStatistics {
  period: { month: string; label: string };
  total_consultations: number;
  by_type: { type: string; count: number; label: string }[];
  average_duration_minutes: number | null;
  mode_distribution: { visio: number; cabinet: number; phone: number };
  unique_patients: number;
  no_show_count: number;
  no_show_rate: number;
  monthly_trend: { month: string; label: string; count: number }[];
}
