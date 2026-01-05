import { z } from 'zod';

// =====================================================
// SCHÉMAS DE BASE ET UTILITAIRES
// =====================================================

// Schéma pour les codes postaux suisses
const swissPostalCodeSchema = z
  .string()
  .regex(/^[1-9]\d{3}$/, 'Code postal suisse invalide (format: 1000-9999)');

// Schéma pour les numéros de téléphone suisses
const swissPhoneSchema = z
  .string()
  .regex(/^(\+41|0)[1-9]\d{8}$/, 'Numéro de téléphone suisse invalide')
  .transform(val => (val.startsWith('0') ? '+41' + val.slice(1) : val));

// Schéma pour les codes ASCA (Association Suisse des Conseillers en Alimentation)
const ascaNumberSchema = z
  .string()
  .regex(/^[A-Z]{2}\d{6}$/, 'Numéro ASCA invalide (format: XX123456)')
  .toUpperCase();

// Schéma pour les codes RME (Registre Médecins Empiriques)
const rmeNumberSchema = z
  .string()
  .regex(/^RME\d{6}$/, 'Numéro RME invalide (format: RME123456)')
  .toUpperCase();

// Schéma pour les codes EAN (European Article Number)
const eanCodeSchema = z
  .string()
  .regex(/^\d{13}$/, 'Code EAN invalide (13 chiffres requis)');

// =====================================================
// SCHÉMAS POUR LES STRUCTURES JSON
// =====================================================

// Schéma pour les tarifs de consultation (en francs CHF)
export const consultationRatesSchema = z.object({
  initial: z
    .number()
    .min(0, 'Tarif initial minimum: CHF 0.00')
    .max(1000, 'Tarif initial maximum: CHF 1000.00'),
  follow_up: z
    .number()
    .min(0, 'Tarif suivi minimum: CHF 0.00')
    .max(1000, 'Tarif suivi maximum: CHF 1000.00'),
  express: z
    .number()
    .min(0, 'Tarif express minimum: CHF 0.00')
    .max(1000, 'Tarif express maximum: CHF 1000.00'),
});

// Schéma pour l'adresse du cabinet
export const practiceAddressSchema = z.object({
  street: z
    .string()
    .min(5, 'Adresse trop courte')
    .max(100, 'Adresse trop longue'),
  postal_code: swissPostalCodeSchema,
  city: z.string().min(2, 'Ville trop courte').max(50, 'Ville trop longue'),
  canton: z.enum([
    'AG',
    'AI',
    'AR',
    'BE',
    'BL',
    'BS',
    'FR',
    'GE',
    'GL',
    'GR',
    'JU',
    'LU',
    'NE',
    'NW',
    'OW',
    'SG',
    'SH',
    'SO',
    'SZ',
    'TG',
    'TI',
    'UR',
    'VD',
    'VS',
    'ZG',
    'ZH',
  ]),
  country: z.literal('CH'),
});

// Schéma pour le contact d'urgence
export const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(2, "Nom du contact d'urgence trop court")
    .max(50, "Nom du contact d'urgence trop long"),
  phone: swissPhoneSchema,
  relationship: z
    .string()
    .min(2, 'Relation trop courte')
    .max(30, 'Relation trop longue'),
});

// Schéma pour les crédits du package
export const packageCreditsSchema = z.object({
  consultations_remaining: z
    .number()
    .int()
    .min(0, 'Nombre de consultations restantes invalide'),
  meal_plans_remaining: z
    .number()
    .int()
    .min(0, 'Nombre de plans de repas restants invalide'),
  support_priority: z.enum(['standard', 'priority', 'premium']),
});

// =====================================================
// SCHÉMAS POUR LES CHAMPS COMMUNS
// =====================================================

// Schéma pour les champs communs à tous les utilisateurs
export const commonProfileSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    ),
  last_name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    ),
  phone: swissPhoneSchema.optional(),
  avatar_url: z.string().url("URL d'avatar invalide").optional(),
  locale: z.enum(['fr-CH', 'de-CH', 'it-CH', 'en-CH']).default('fr-CH'),
  timezone: z
    .string()
    .regex(/^Europe\/[A-Za-z_]+$/, 'Fuseau horaire européen invalide')
    .default('Europe/Zurich'),
});

// =====================================================
// SCHÉMAS POUR LES NUTRITIONNISTES
// =====================================================

// Schéma pour les champs spécifiques aux nutritionnistes
export const nutritionistProfileSchema = z
  .object({
    // Informations d'identification professionnelle
    asca_number: ascaNumberSchema.optional(),
    rme_number: rmeNumberSchema.optional(),
    ean_code: eanCodeSchema.optional(),

    // Spécialisations
    specializations: z
      .array(
        z
          .string()
          .min(3, 'Spécialisation trop courte')
          .max(50, 'Spécialisation trop longue')
      )
      .min(1, 'Au moins une spécialisation est requise')
      .max(10, 'Maximum 10 spécialisations')
      .optional(),

    // Bio professionnelle
    bio: z
      .string()
      .min(50, 'La bio doit contenir au moins 50 caractères')
      .max(1000, 'La bio ne peut pas dépasser 1000 caractères')
      .optional(),

    // Tarifs de consultation
    consultation_rates: consultationRatesSchema.optional(),

    // Adresse du cabinet
    practice_address: practiceAddressSchema.optional(),

    // Statut professionnel
    verified: z.boolean().default(false),
    is_active: z.boolean().default(true),
    max_patients: z
      .number()
      .int()
      .min(1, 'Nombre minimum de patients: 1')
      .max(500, 'Nombre maximum de patients: 500')
      .default(50),
  })
  .refine(
    data => {
      // Au moins un numéro d'identification professionnelle est requis
      return data.asca_number || data.rme_number || data.ean_code;
    },
    {
      message:
        "Au moins un numéro d'identification professionnelle (ASCA, RME ou EAN) est requis",
      path: ['asca_number'],
    }
  );

// =====================================================
// SCHÉMAS POUR LES PATIENTS
// =====================================================

// Schéma pour les champs spécifiques aux patients
export const patientProfileSchema = z
  .object({
    // Référence au nutritionniste
    nutritionist_id: z
      .string()
      .uuid('ID de nutritionniste invalide')
      .optional(),

    // Informations personnelles
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
      .refine(
        date => {
          const birthDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 13 && age <= 120;
        },
        {
          message: "L'âge doit être compris entre 13 et 120 ans",
        }
      )
      .optional(),

    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),

    // Contact d'urgence
    emergency_contact: emergencyContactSchema.optional(),

    // Mesures physiques
    height: z
      .number()
      .min(100, 'Taille minimum: 100 cm')
      .max(250, 'Taille maximum: 250 cm')
      .optional(),

    initial_weight: z
      .number()
      .min(30, 'Poids initial minimum: 30 kg')
      .max(300, 'Poids initial maximum: 300 kg')
      .optional(),

    target_weight: z
      .number()
      .min(30, 'Poids cible minimum: 30 kg')
      .max(300, 'Poids cible maximum: 300 kg')
      .optional(),

    // Niveau d'activité
    activity_level: z
      .enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
      .optional(),

    // Informations médicales
    allergies: z
      .array(
        z
          .string()
          .min(2, 'Allergie trop courte')
          .max(50, 'Allergie trop longue')
      )
      .max(20, 'Maximum 20 allergies')
      .optional(),

    dietary_restrictions: z
      .array(
        z
          .string()
          .min(2, 'Restriction trop courte')
          .max(50, 'Restriction trop longue')
      )
      .max(15, 'Maximum 15 restrictions alimentaires')
      .optional(),

    medical_conditions: z
      .array(
        z
          .string()
          .min(3, 'Condition médicale trop courte')
          .max(100, 'Condition médicale trop longue')
      )
      .max(10, 'Maximum 10 conditions médicales')
      .optional(),

    medications: z
      .array(
        z
          .string()
          .min(2, 'Médicament trop court')
          .max(100, 'Médicament trop long')
      )
      .max(15, 'Maximum 15 médicaments')
      .optional(),

    // Informations d'abonnement
    subscription_tier: z
      .number()
      .int()
      .min(1, "Niveau d'abonnement minimum: 1")
      .max(5, "Niveau d'abonnement maximum: 5")
      .optional(),

    subscription_status: z
      .enum(['active', 'inactive', 'suspended', 'expired'])
      .optional(),

    subscription_start_date: z
      .string()
      .datetime("Date de début d'abonnement invalide")
      .optional(),

    subscription_end_date: z
      .string()
      .datetime("Date de fin d'abonnement invalide")
      .optional(),

    // Crédits du package
    package_credits: packageCreditsSchema.optional(),
  })
  .refine(
    data => {
      // Si un poids cible est spécifié, un poids initial doit aussi être spécifié
      if (data.target_weight && !data.initial_weight) {
        return false;
      }
      return true;
    },
    {
      message:
        'Un poids initial doit être spécifié si un poids cible est défini',
      path: ['initial_weight'],
    }
  )
  .refine(
    data => {
      // Si un poids cible est spécifié, il doit être différent du poids initial
      if (
        data.target_weight &&
        data.initial_weight &&
        data.target_weight === data.initial_weight
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Le poids cible doit être différent du poids initial',
      path: ['target_weight'],
    }
  );

// =====================================================
// SCHÉMAS COMPLETS POUR LES PROFILS
// =====================================================

// Schéma complet pour un profil de nutritionniste
export const completeNutritionistProfileSchema = commonProfileSchema.merge(
  nutritionistProfileSchema
);

// Schéma complet pour un profil de patient
export const completePatientProfileSchema =
  commonProfileSchema.merge(patientProfileSchema);

// Schéma pour la mise à jour de profil (tous les champs optionnels)
export const profileUpdateSchema = z.object({
  // Champs communs
  first_name: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    )
    .optional(),
  last_name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    )
    .optional(),
  phone: swissPhoneSchema.optional(),
  avatar_url: z.string().url("URL d'avatar invalide").optional(),
  locale: z.enum(['fr-CH', 'de-CH', 'it-CH', 'en-CH']).optional(),
  timezone: z
    .string()
    .regex(/^Europe\/[A-Za-z_]+$/, 'Fuseau horaire européen invalide')
    .optional(),

  // Champs nutritionniste
  asca_number: ascaNumberSchema.optional(),
  rme_number: rmeNumberSchema.optional(),
  ean_code: eanCodeSchema.optional(),
  specializations: z
    .array(
      z
        .string()
        .min(3, 'Spécialisation trop courte')
        .max(50, 'Spécialisation trop longue')
    )
    .min(1, 'Au moins une spécialisation est requise')
    .max(10, 'Maximum 10 spécialisations')
    .optional(),
  bio: z
    .string()
    .min(50, 'La bio doit contenir au moins 50 caractères')
    .max(1000, 'La bio ne peut pas dépasser 1000 caractères')
    .optional(),
  consultation_rates: consultationRatesSchema.optional(),
  practice_address: practiceAddressSchema.optional(),
  verified: z.boolean().optional(),
  is_active: z.boolean().optional(),
  max_patients: z
    .number()
    .int()
    .min(1, 'Nombre minimum de patients: 1')
    .max(500, 'Nombre maximum de patients: 500')
    .optional(),

  // Champs patient
  nutritionist_id: z.string().uuid('ID de nutritionniste invalide').optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .refine(
      date => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 13 && age <= 120;
      },
      {
        message: "L'âge doit être compris entre 13 et 120 ans",
      }
    )
    .optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  emergency_contact: emergencyContactSchema.optional(),
  height: z
    .number()
    .min(100, 'Taille minimum: 100 cm')
    .max(250, 'Taille maximum: 250 cm')
    .optional(),
  initial_weight: z
    .number()
    .min(30, 'Poids initial minimum: 30 kg')
    .max(300, 'Poids initial maximum: 300 kg')
    .optional(),
  target_weight: z
    .number()
    .min(30, 'Poids cible minimum: 30 kg')
    .max(300, 'Poids cible maximum: 300 kg')
    .optional(),
  activity_level: z
    .enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .optional(),
  allergies: z
    .array(
      z.string().min(2, 'Allergie trop courte').max(50, 'Allergie trop longue')
    )
    .max(20, 'Maximum 20 allergies')
    .optional(),
  dietary_restrictions: z
    .array(
      z
        .string()
        .min(2, 'Restriction trop courte')
        .max(50, 'Restriction trop longue')
    )
    .max(15, 'Maximum 15 restrictions alimentaires')
    .optional(),
  medical_conditions: z
    .array(
      z
        .string()
        .min(3, 'Condition médicale trop courte')
        .max(100, 'Condition médicale trop longue')
    )
    .max(10, 'Maximum 10 conditions médicales')
    .optional(),
  medications: z
    .array(
      z
        .string()
        .min(2, 'Médicament trop court')
        .max(100, 'Médicament trop long')
    )
    .max(15, 'Maximum 15 médicaments')
    .optional(),
  subscription_tier: z
    .number()
    .int()
    .min(1, "Niveau d'abonnement minimum: 1")
    .max(5, "Niveau d'abonnement maximum: 5")
    .optional(),
  subscription_status: z
    .enum(['active', 'inactive', 'suspended', 'expired'])
    .optional(),
  subscription_start_date: z
    .string()
    .datetime("Date de début d'abonnement invalide")
    .optional(),
  subscription_end_date: z
    .string()
    .datetime("Date de fin d'abonnement invalide")
    .optional(),
  package_credits: packageCreditsSchema.optional(),
});

// =====================================================
// SCHÉMAS EXISTANTS (GARDÉS POUR COMPATIBILITÉ)
// =====================================================

// Schéma pour l'inscription utilisateur
export const signUpSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Adresse email invalide'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

// Schéma pour la connexion
export const signInSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Schéma pour les préférences nutritionnelles
export const nutritionPreferencesSchema = z.object({
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  goals: z.array(
    z.enum(['weight_loss', 'muscle_gain', 'maintenance', 'health'])
  ),
  activityLevel: z.enum([
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
    'extremely_active',
  ]),
  age: z.number().min(13).max(120),
  weight: z.number().min(30).max(300), // en kg
  height: z.number().min(100).max(250), // en cm
  gender: z.enum(['male', 'female', 'other']).optional(),
});

// Schéma pour un repas
export const mealSchema = z.object({
  name: z.string().min(1, 'Le nom du repas est requis'),
  description: z.string().optional(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    })
  ),
  totalCalories: z.number().min(0),
  totalProtein: z.number().min(0),
  totalCarbs: z.number().min(0),
  totalFat: z.number().min(0),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
});

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
});

// =====================================================
// TYPES TYPESCRIPT DÉRIVÉS DES SCHÉMAS
// =====================================================

// Types pour les nouveaux schémas de profil
export type CommonProfile = z.infer<typeof commonProfileSchema>;
export type NutritionistProfile = z.infer<
  typeof completeNutritionistProfileSchema
>;
export type PatientProfile = z.infer<typeof completePatientProfileSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

// Types pour les structures JSON
export type ConsultationRates = z.infer<typeof consultationRatesSchema>;
export type PracticeAddress = z.infer<typeof practiceAddressSchema>;
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type PackageCredits = z.infer<typeof packageCreditsSchema>;

// Types existants (gardés pour compatibilité)
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type NutritionPreferences = z.infer<typeof nutritionPreferencesSchema>;
export type Meal = z.infer<typeof mealSchema>;
export type MealPlan = z.infer<typeof mealPlanSchema>;
