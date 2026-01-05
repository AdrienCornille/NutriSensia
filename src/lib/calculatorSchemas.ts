import { z } from 'zod';

/**
 * Schema de validation pour le calculateur de calories
 * Utilise la formule Mifflin-St Jeor pour le calcul du métabolisme de base
 */

// Niveaux d'activité avec leurs multiplicateurs
export const ACTIVITY_LEVELS = {
  sedentary: 1.2,
  lightlyActive: 1.375,
  moderatelyActive: 1.55,
  veryActive: 1.725,
  athlete: 1.9,
} as const;

// Ajustements selon l'objectif
export const GOAL_ADJUSTMENTS = {
  maintain: 0,
  lose: -500,
  gain: 300,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_LEVELS;
export type Goal = keyof typeof GOAL_ADJUSTMENTS;
export type Gender = 'male' | 'female';

// Schema de validation du formulaire
export const calorieCalculatorSchema = z.object({
  age: z
    .number()
    .min(13, "L'âge minimum est de 13 ans")
    .max(120, "L'âge maximum est de 120 ans"),

  height: z
    .number()
    .min(100, 'La taille minimum est de 100 cm')
    .max(250, 'La taille maximum est de 250 cm'),

  weight: z
    .number()
    .min(30, 'Le poids minimum est de 30 kg')
    .max(300, 'Le poids maximum est de 300 kg'),

  gender: z.enum(['male', 'female']),

  activityLevel: z.enum([
    'sedentary',
    'lightlyActive',
    'moderatelyActive',
    'veryActive',
    'athlete',
  ]),

  goal: z.enum(['maintain', 'lose', 'gain']),
});

export type CalorieCalculatorData = z.infer<typeof calorieCalculatorSchema>;

// Schema pour le formulaire email
export const emailCaptureSchema = z.object({
  email: z.string().email('Veuillez entrer un email valide'),
});

export type EmailCaptureData = z.infer<typeof emailCaptureSchema>;

// Interface pour les résultats du calcul
export interface CalculatorResults {
  bmr: number; // Métabolisme de base (Basal Metabolic Rate)
  tdee: number; // Dépense énergétique totale (Total Daily Energy Expenditure)
  targetCalories: number; // Objectif calorique quotidien
  macros: {
    protein: number; // en grammes
    carbs: number; // en grammes
    fat: number; // en grammes
  };
}

/**
 * Calcule les besoins caloriques selon la formule Mifflin-St Jeor
 *
 * Homme: MB = (10 × poids) + (6.25 × taille) - (5 × âge) + 5
 * Femme: MB = (10 × poids) + (6.25 × taille) - (5 × âge) - 161
 */
export function calculateCalories(
  data: CalorieCalculatorData
): CalculatorResults {
  // Calcul du métabolisme de base (BMR) selon Mifflin-St Jeor
  let bmr: number;
  if (data.gender === 'male') {
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
  } else {
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
  }

  // Calcul de la dépense énergétique totale (TDEE)
  const tdee = bmr * ACTIVITY_LEVELS[data.activityLevel];

  // Ajustement selon l'objectif
  const targetCalories = Math.round(tdee + GOAL_ADJUSTMENTS[data.goal]);

  // Calcul des macronutriments suggérés
  const protein = Math.round(data.weight * 1.6); // 1.6g/kg de poids corporel
  const fat = Math.round((targetCalories * 0.25) / 9); // 25% des calories en lipides (9 kcal/g)
  const carbs = Math.round((targetCalories - protein * 4 - fat * 9) / 4); // Reste en glucides (4 kcal/g)

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    macros: {
      protein,
      carbs,
      fat,
    },
  };
}
