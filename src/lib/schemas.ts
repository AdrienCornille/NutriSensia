import { z } from 'zod'

// Schéma pour l'inscription utilisateur
export const signUpSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

// Schéma pour la connexion
export const signInSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

// Schéma pour les préférences nutritionnelles
export const nutritionPreferencesSchema = z.object({
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  goals: z.array(z.enum(['weight_loss', 'muscle_gain', 'maintenance', 'health'])),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']),
  age: z.number().min(13).max(120),
  weight: z.number().min(30).max(300), // en kg
  height: z.number().min(100).max(250), // en cm
  gender: z.enum(['male', 'female', 'other']).optional(),
})

// Schéma pour un repas
export const mealSchema = z.object({
  name: z.string().min(1, 'Le nom du repas est requis'),
  description: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unit: z.string(),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  })),
  totalCalories: z.number().min(0),
  totalProtein: z.number().min(0),
  totalCarbs: z.number().min(0),
  totalFat: z.number().min(0),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
})

// Schéma pour un plan de repas
export const mealPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom du plan est requis'),
  description: z.string().optional(),
  meals: z.array(mealSchema),
  totalCalories: z.number().min(0),
  totalProtein: z.number().min(0),
  totalCarbs: z.number().min(0),
  totalFat: z.number().min(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Types TypeScript dérivés des schémas
export type SignUpData = z.infer<typeof signUpSchema>
export type SignInData = z.infer<typeof signInSchema>
export type NutritionPreferences = z.infer<typeof nutritionPreferencesSchema>
export type Meal = z.infer<typeof mealSchema>
export type MealPlan = z.infer<typeof mealPlanSchema>
