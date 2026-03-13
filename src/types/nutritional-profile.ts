/**
 * Types for Nutritional Profile feature (Phase 2.5)
 * Used by both nutritionist and patient sides.
 */

// =====================================================
// ENUMS
// =====================================================

export type BmrFormula = 'mifflin_st_jeor' | 'harris_benedict_revised' | 'harris_benedict_original' | 'katch_mcardle';
export type ProfileGoal = 'lose' | 'maintain' | 'gain';
export type SpecialCase = 'none' | 'pregnancy_t1' | 'pregnancy_t2' | 'pregnancy_t3' | 'breastfeeding' | 'athlete' | 'senior' | 'adolescent';
export type ProfileStatus = 'draft' | 'active' | 'archived';
export type ActivityLevel = 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive' | 'athlete';

// =====================================================
// MICRO TARGETS
// =====================================================

export interface MicroTargets {
  fiber_g?: number;
  sodium_mg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  magnesium_mg?: number;
  phosphorus_mg?: number;
  potassium_mg?: number;
  zinc_mg?: number;
  vitamin_a_ug?: number;
  vitamin_b1_mg?: number;
  vitamin_b2_mg?: number;
  vitamin_b3_mg?: number;
  vitamin_b6_mg?: number;
  vitamin_b9_ug?: number;
  vitamin_b12_ug?: number;
  vitamin_c_mg?: number;
  vitamin_d_ug?: number;
  vitamin_e_mg?: number;
  vitamin_k_ug?: number;
  cholesterol_mg?: number;
}

// =====================================================
// NUTRITIONAL PROFILE
// =====================================================

export interface NutritionalProfile {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  name: string;
  status: ProfileStatus;
  version: number;

  // Patient data snapshot
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: 'male' | 'female';
  body_fat_pct: number | null;

  // Calculation parameters
  bmr_formula: BmrFormula;
  activity_level: ActivityLevel;
  goal: ProfileGoal;
  goal_adjustment_kcal: number;
  special_case: SpecialCase;
  special_case_adjustment_kcal: number | null;

  // Macro distribution
  macro_template: string | null;
  protein_pct: number;
  carbs_pct: number;
  fat_pct: number;

  // Calculated results
  calculated_bmr: number | null;
  calculated_tdee: number | null;
  calculated_calories: number | null;
  calculated_protein_g: number | null;
  calculated_carbs_g: number | null;
  calculated_fat_g: number | null;

  // Micro targets
  micro_targets: MicroTargets | null;

  // Notes
  notes: string | null;
  private_notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

/** Profile without private_notes - for patient-side API */
export type NutritionalProfilePatient = Omit<NutritionalProfile, 'private_notes'>;

/** Summary for list views */
export interface NutritionalProfileSummary {
  id: string;
  name: string;
  status: ProfileStatus;
  version: number;
  calculated_calories: number | null;
  goal: ProfileGoal;
  bmr_formula: BmrFormula;
  created_at: string;
  archived_at: string | null;
}

// =====================================================
// COMPARISON
// =====================================================

export interface ProfileComparison {
  profile_a: NutritionalProfile;
  profile_b: NutritionalProfile;
  deltas: {
    calories: number;
    bmr: number;
    tdee: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    weight_kg: number;
  };
}

// =====================================================
// CREATE / UPDATE PAYLOADS
// =====================================================

export interface CreateNutritionalProfilePayload {
  name: string;
  status?: ProfileStatus;
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: 'male' | 'female';
  body_fat_pct?: number | null;
  bmr_formula: BmrFormula;
  activity_level: ActivityLevel;
  goal: ProfileGoal;
  goal_adjustment_kcal?: number;
  special_case?: SpecialCase;
  special_case_adjustment_kcal?: number;
  macro_template?: string | null;
  protein_pct: number;
  carbs_pct: number;
  fat_pct: number;
  micro_targets?: MicroTargets | null;
  notes?: string | null;
  private_notes?: string | null;
}

export interface UpdateNutritionalProfilePayload {
  name?: string;
  status?: ProfileStatus;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  gender?: 'male' | 'female';
  body_fat_pct?: number | null;
  bmr_formula?: BmrFormula;
  activity_level?: ActivityLevel;
  goal?: ProfileGoal;
  goal_adjustment_kcal?: number;
  special_case?: SpecialCase;
  special_case_adjustment_kcal?: number;
  macro_template?: string | null;
  protein_pct?: number;
  carbs_pct?: number;
  fat_pct?: number;
  micro_targets?: MicroTargets | null;
  notes?: string | null;
  private_notes?: string | null;
}

