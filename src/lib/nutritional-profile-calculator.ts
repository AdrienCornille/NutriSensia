/**
 * Nutritional Profile Calculator
 *
 * Shared calculation library used by both API (server-side validation)
 * and client (real-time preview in forms).
 *
 * Supports 4 BMR formulas, 7 macro templates, 8 special cases.
 */

// =====================================================
// CONSTANTS
// =====================================================

export const ACTIVITY_LEVELS = {
  sedentary: { factor: 1.2, label: 'Sédentaire', description: 'Travail de bureau, peu ou pas d\'exercice' },
  lightlyActive: { factor: 1.375, label: 'Légèrement actif', description: 'Exercice léger 1-3 jours/semaine' },
  moderatelyActive: { factor: 1.55, label: 'Modérément actif', description: 'Exercice modéré 3-5 jours/semaine' },
  veryActive: { factor: 1.725, label: 'Très actif', description: 'Exercice intense 6-7 jours/semaine' },
  athlete: { factor: 1.9, label: 'Extrêmement actif', description: 'Athlète, travail physique très intense' },
} as const;

export const GOAL_ADJUSTMENTS = {
  lose: { kcal: -500, label: 'Perte de poids', description: 'Déficit de ~500 kcal/jour (~0.5 kg/semaine)' },
  maintain: { kcal: 0, label: 'Maintien', description: 'Maintien du poids actuel' },
  gain: { kcal: 300, label: 'Prise de poids', description: 'Surplus de ~300 kcal/jour' },
} as const;

export const SPECIAL_CASE_ADJUSTMENTS = {
  none: { kcal: 0, label: 'Aucun' },
  pregnancy_t1: { kcal: 0, label: 'Grossesse T1' },
  pregnancy_t2: { kcal: 340, label: 'Grossesse T2' },
  pregnancy_t3: { kcal: 450, label: 'Grossesse T3' },
  breastfeeding: { kcal: 500, label: 'Allaitement' },
  athlete: { kcal: 0, label: 'Athlète (PAL élevé)' },
  senior: { kcal: -150, label: 'Senior (65+)' },
  adolescent: { kcal: 300, label: 'Adolescent' },
} as const;

export const MACRO_TEMPLATES = {
  equilibre_anses: { label: 'Équilibré ANSES', protein: 15, carbs: 50, fat: 35 },
  modere_proteines: { label: 'Modéré protéines', protein: 25, carbs: 45, fat: 30 },
  high_protein: { label: 'High Protein', protein: 30, carbs: 40, fat: 30 },
  low_carb: { label: 'Low Carb', protein: 30, carbs: 25, fat: 45 },
  tres_low_carb: { label: 'Très Low Carb', protein: 30, carbs: 15, fat: 55 },
  keto: { label: 'Keto', protein: 25, carbs: 5, fat: 70 },
  zone: { label: 'Zone', protein: 30, carbs: 40, fat: 30 },
  custom: { label: 'Personnalisé', protein: 0, carbs: 0, fat: 0 },
} as const;

export const BMR_FORMULAS = {
  mifflin_st_jeor: {
    label: 'Mifflin-St Jeor (1990)',
    description: 'Recommandée - La plus précise pour la majorité des adultes',
    requiresBodyFat: false,
  },
  harris_benedict_revised: {
    label: 'Harris-Benedict révisée (1984)',
    description: 'Largement utilisée, légèrement moins précise que Mifflin-St Jeor',
    requiresBodyFat: false,
  },
  harris_benedict_original: {
    label: 'Harris-Benedict originale (1919)',
    description: 'Formule historique, peut surestimer le BMR',
    requiresBodyFat: false,
  },
  katch_mcardle: {
    label: 'Katch-McArdle',
    description: 'Précise si le taux de masse grasse est connu',
    requiresBodyFat: true,
  },
} as const;

// =====================================================
// TYPES
// =====================================================

export type ActivityLevel = keyof typeof ACTIVITY_LEVELS;
export type ProfileGoal = keyof typeof GOAL_ADJUSTMENTS;
export type SpecialCase = keyof typeof SPECIAL_CASE_ADJUSTMENTS;
export type MacroTemplate = keyof typeof MACRO_TEMPLATES;
export type BmrFormula = keyof typeof BMR_FORMULAS;

export interface CalculationInput {
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: 'male' | 'female';
  body_fat_pct?: number | null;
  bmr_formula: BmrFormula;
  activity_level: ActivityLevel;
  goal: ProfileGoal;
  goal_adjustment_kcal?: number;
  special_case: SpecialCase;
  special_case_adjustment_kcal?: number;
  protein_pct: number;
  carbs_pct: number;
  fat_pct: number;
}

export interface CalculationResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

// =====================================================
// BMR CALCULATION FUNCTIONS
// =====================================================

/**
 * Mifflin-St Jeor (1990) - Recommended
 * Male:   BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
 * Female: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161
 */
function bmrMifflinStJeor(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Harris-Benedict Revised (1984)
 * Male:   BMR = (13.397 × weight) + (4.799 × height) - (5.677 × age) + 88.362
 * Female: BMR = (9.247 × weight) + (3.098 × height) - (4.330 × age) + 447.593
 */
function bmrHarrisBenedictRevised(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return 13.397 * weight + 4.799 * height - 5.677 * age + 88.362;
  }
  return 9.247 * weight + 3.098 * height - 4.330 * age + 447.593;
}

/**
 * Harris-Benedict Original (1919)
 * Male:   BMR = 66.5 + (13.75 × weight) + (5.003 × height) - (6.755 × age)
 * Female: BMR = 655.1 + (9.563 × weight) + (1.850 × height) - (4.676 × age)
 */
function bmrHarrisBenedictOriginal(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return 66.5 + 13.75 * weight + 5.003 * height - 6.755 * age;
  }
  return 655.1 + 9.563 * weight + 1.850 * height - 4.676 * age;
}

/**
 * Katch-McArdle
 * BMR = 370 + (21.6 × lean_body_mass)
 * where LBM = weight × (1 - body_fat_pct / 100)
 */
function bmrKatchMcArdle(weight: number, bodyFatPct: number): number {
  const leanBodyMass = weight * (1 - bodyFatPct / 100);
  return 370 + 21.6 * leanBodyMass;
}

// =====================================================
// MAIN CALCULATION FUNCTION
// =====================================================

/**
 * Calculate a full nutritional profile from input parameters.
 * Pure function - no side effects, no async, suitable for real-time preview.
 */
export function calculateNutritionalProfile(input: CalculationInput): CalculationResult {
  // 1. Calculate BMR
  let bmr: number;
  switch (input.bmr_formula) {
    case 'mifflin_st_jeor':
      bmr = bmrMifflinStJeor(input.weight_kg, input.height_cm, input.age, input.gender);
      break;
    case 'harris_benedict_revised':
      bmr = bmrHarrisBenedictRevised(input.weight_kg, input.height_cm, input.age, input.gender);
      break;
    case 'harris_benedict_original':
      bmr = bmrHarrisBenedictOriginal(input.weight_kg, input.height_cm, input.age, input.gender);
      break;
    case 'katch_mcardle':
      if (!input.body_fat_pct) {
        throw new Error('body_fat_pct est requis pour la formule Katch-McArdle');
      }
      bmr = bmrKatchMcArdle(input.weight_kg, input.body_fat_pct);
      break;
  }

  // 2. Calculate TDEE (BMR × activity multiplier)
  const activityFactor = ACTIVITY_LEVELS[input.activity_level].factor;
  const tdee = bmr * activityFactor;

  // 3. Apply goal adjustment
  const goalAdjustment = input.goal_adjustment_kcal ?? GOAL_ADJUSTMENTS[input.goal].kcal;

  // 4. Apply special case adjustment
  const specialCaseAdjustment = input.special_case_adjustment_kcal ?? SPECIAL_CASE_ADJUSTMENTS[input.special_case].kcal;

  // 5. Final calorie target
  const targetCalories = Math.round(tdee + goalAdjustment + specialCaseAdjustment);

  // 6. Calculate macros in grams
  // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
  const protein_g = Math.round((targetCalories * input.protein_pct / 100) / 4 * 10) / 10;
  const carbs_g = Math.round((targetCalories * input.carbs_pct / 100) / 4 * 10) / 10;
  const fat_g = Math.round((targetCalories * input.fat_pct / 100) / 9 * 10) / 10;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.max(targetCalories, 800), // Safety minimum
    protein_g,
    carbs_g,
    fat_g,
  };
}

/**
 * Calculate BMI from weight (kg) and height (cm)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!heightCm || heightCm === 0) return 0;
  return Math.round((weightKg / ((heightCm / 100) ** 2)) * 10) / 10;
}

/**
 * Get BMI interpretation (WHO classification)
 */
export function getBMIInterpretation(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Insuffisance pondérale', color: 'blue' };
  if (bmi < 25) return { label: 'Poids normal', color: 'green' };
  if (bmi < 30) return { label: 'Surpoids', color: 'orange' };
  if (bmi < 35) return { label: 'Obésité modérée', color: 'red' };
  if (bmi < 40) return { label: 'Obésité sévère', color: 'red' };
  return { label: 'Obésité morbide', color: 'red' };
}

// =====================================================
// BODY FAT % ESTIMATION FORMULAS
// =====================================================

export type BodyFatFormula = 'deurenberg' | 'deurenberg_revised' | 'cun_bae';

export const BODY_FAT_FORMULAS = {
  deurenberg: {
    label: 'Deurenberg (1991)',
    description: 'Estimation basée sur l\'IMC, l\'âge et le sexe',
    reference: 'Deurenberg P et al. Br J Nutr. 1991;65(2):105-114',
  },
  deurenberg_revised: {
    label: 'Deurenberg révisée (1998)',
    description: 'Version révisée, meilleure précision multi-ethnique',
    reference: 'Deurenberg P et al. Asia Pacific J Clin Nutr. 1998',
  },
  cun_bae: {
    label: 'CUN-BAE (2012)',
    description: 'Clinica Universidad de Navarra — supérieure à l\'IMC seul pour le risque cardiométabolique',
    reference: 'Gómez-Ambrosi J et al. Diabetes Care. 2012;35(2):383-388',
  },
} as const;

/**
 * Deurenberg (1991)
 * BF% = (1.20 × BMI) + (0.23 × age) − (10.8 × sex) − 5.4
 * sex: male = 1, female = 0
 */
function bodyFatDeurenberg(bmi: number, age: number, gender: 'male' | 'female'): number {
  const sex = gender === 'male' ? 1 : 0;
  return 1.20 * bmi + 0.23 * age - 10.8 * sex - 5.4;
}

/**
 * Deurenberg revised (1998)
 * BF% = (1.29 × BMI) + (0.20 × age) − (11.4 × sex) − 8.0
 * sex: male = 1, female = 0
 */
function bodyFatDeurenbergRevised(bmi: number, age: number, gender: 'male' | 'female'): number {
  const sex = gender === 'male' ? 1 : 0;
  return 1.29 * bmi + 0.20 * age - 11.4 * sex - 8.0;
}

/**
 * CUN-BAE (Gómez-Ambrosi et al., 2012)
 * BF% = −44.988 + (0.503 × age) + (10.689 × sex) + (3.172 × BMI)
 *        − (0.026 × BMI²) + (0.181 × BMI × sex)
 *        − (0.02 × BMI × age) − (0.005 × BMI² × sex)
 *        + (0.00021 × BMI² × age)
 * sex: male = 0, female = 1
 */
function bodyFatCunBae(bmi: number, age: number, gender: 'male' | 'female'): number {
  const sex = gender === 'male' ? 0 : 1;
  const bmi2 = bmi * bmi;
  return (
    -44.988 +
    0.503 * age +
    10.689 * sex +
    3.172 * bmi -
    0.026 * bmi2 +
    0.181 * bmi * sex -
    0.02 * bmi * age -
    0.005 * bmi2 * sex +
    0.00021 * bmi2 * age
  );
}

/**
 * Calculate estimated body fat % using the specified formula.
 * All formulas require BMI, age and gender.
 */
export function calculateBodyFat(
  formula: BodyFatFormula,
  bmi: number,
  age: number,
  gender: 'male' | 'female'
): number {
  let result: number;
  switch (formula) {
    case 'deurenberg':
      result = bodyFatDeurenberg(bmi, age, gender);
      break;
    case 'deurenberg_revised':
      result = bodyFatDeurenbergRevised(bmi, age, gender);
      break;
    case 'cun_bae':
      result = bodyFatCunBae(bmi, age, gender);
      break;
  }
  return Math.round(result * 10) / 10;
}

/**
 * Interpret body fat % by gender (ACE classification)
 */
export function getBodyFatInterpretation(
  bf: number,
  gender: 'male' | 'female'
): { label: string; color: string } {
  if (gender === 'male') {
    if (bf < 6) return { label: 'Essentiel', color: 'blue' };
    if (bf < 14) return { label: 'Athlétique', color: 'green' };
    if (bf < 18) return { label: 'Fitness', color: 'green' };
    if (bf < 25) return { label: 'Acceptable', color: 'orange' };
    return { label: 'Excès', color: 'red' };
  }
  // female
  if (bf < 14) return { label: 'Essentiel', color: 'blue' };
  if (bf < 21) return { label: 'Athlétique', color: 'green' };
  if (bf < 25) return { label: 'Fitness', color: 'green' };
  if (bf < 32) return { label: 'Acceptable', color: 'orange' };
  return { label: 'Excès', color: 'red' };
}

// =====================================================
// IDEAL WEIGHT FORMULAS
// =====================================================

export type IdealWeightFormula = 'lorentz' | 'devine' | 'robinson' | 'miller' | 'hamwi' | 'creff';

export const IDEAL_WEIGHT_FORMULAS = {
  lorentz: {
    label: 'Lorentz (1929)',
    description: 'Taille + genre',
    params: 'height, gender',
  },
  devine: {
    label: 'Devine (1974)',
    description: 'Référence clinique (pharmacologie)',
    params: 'height, gender',
  },
  robinson: {
    label: 'Robinson (1983)',
    description: 'Modification de Devine, plus modérée',
    params: 'height, gender',
  },
  miller: {
    label: 'Miller (1983)',
    description: 'Poids de base plus élevé, incrément plus faible',
    params: 'height, gender',
  },
  hamwi: {
    label: 'Hamwi (1964)',
    description: 'Référence historique en nutrition clinique',
    params: 'height, gender',
  },
  creff: {
    label: 'Creff (1970)',
    description: 'Taille + âge (morphologie normale)',
    params: 'height, age',
  },
} as const;

/**
 * Calculate ideal weight using the specified formula.
 * All values in cm/kg.
 */
export function calculateIdealWeight(
  formula: IdealWeightFormula,
  heightCm: number,
  gender: 'male' | 'female',
  age: number
): number {
  const heightInches = heightCm / 2.54;
  let result: number;

  switch (formula) {
    case 'lorentz':
      result =
        gender === 'male'
          ? heightCm - 100 - (heightCm - 150) / 4
          : heightCm - 100 - (heightCm - 150) / 2.5;
      break;
    case 'devine':
      result =
        gender === 'male'
          ? 50 + 0.9 * (heightCm - 152.4)
          : 45.5 + 0.9 * (heightCm - 152.4);
      break;
    case 'robinson':
      result =
        gender === 'male'
          ? 52 + 1.9 * (heightInches - 60)
          : 49 + 1.7 * (heightInches - 60);
      break;
    case 'miller':
      result =
        gender === 'male'
          ? 56.2 + 1.41 * (heightInches - 60)
          : 53.1 + 1.36 * (heightInches - 60);
      break;
    case 'hamwi':
      result =
        gender === 'male'
          ? 48 + 2.7 * (heightInches - 60)
          : 45.5 + 2.2 * (heightInches - 60);
      break;
    case 'creff':
      result = (heightCm - 100 + age / 10) * 0.9;
      break;
  }

  return Math.round(result * 10) / 10;
}
