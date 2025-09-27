/**
 * Schémas de validation Zod pour l'onboarding
 * Validation des données d'onboarding par rôle et par étape
 */

import { z } from 'zod';
import { UserRole, Gender, ActivityLevel } from '@/lib/database-types';

// =====================================================
// SCHÉMAS DE BASE COMMUNS
// =====================================================

/**
 * Validation des informations personnelles de base
 */
export const basePersonalInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Le prénom ne peut contenir que des lettres'),
  
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Le nom ne peut contenir que des lettres'),
  
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optionnel
      return /^(\+41|0)[1-9]\d{8}$/.test(val.replace(/\s/g, ''));
    }, 'Numéro de téléphone suisse invalide (ex: +41 21 123 45 67)'),
  
  locale: z
    .string()
    .default('fr-CH'),
  
  avatar_url: z
    .string()
    .url('URL d\'avatar invalide')
    .optional()
    .nullable(),
});

/**
 * Validation des consentements et acceptation des conditions
 */
export const consentSchema = z.object({
  marketingConsent: z.boolean().default(false),
  
  termsAccepted: z
    .boolean()
    .refine(val => val === true, 'Vous devez accepter les conditions d\'utilisation'),
  
  privacyPolicyAccepted: z
    .boolean()
    .refine(val => val === true, 'Vous devez accepter la politique de confidentialité'),
});

/**
 * Validation des adresses suisses
 */
export const swissAddressSchema = z.object({
  street: z
    .string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .max(100, 'L\'adresse ne peut pas dépasser 100 caractères'),
  
  postal_code: z
    .string()
    .regex(/^\d{4}$/, 'Le code postal doit contenir 4 chiffres'),
  
  city: z
    .string()
    .min(2, 'La ville doit contenir au moins 2 caractères')
    .max(50, 'La ville ne peut pas dépasser 50 caractères'),
  
  canton: z
    .string()
    .length(2, 'Le canton doit être un code à 2 lettres (ex: VD, GE)')
    .toUpperCase(),
  
  country: z
    .string()
    .default('CH'),
});

/**
 * Validation des tarifs de consultation
 */
export const consultationRatesSchema = z.object({
  initial: z
    .number()
    .min(5000, 'Le tarif initial doit être d\'au moins CHF 50.00')
    .max(50000, 'Le tarif initial ne peut pas dépasser CHF 500.00'),
  
  follow_up: z
    .number()
    .min(3000, 'Le tarif de suivi doit être d\'au moins CHF 30.00')
    .max(40000, 'Le tarif de suivi ne peut pas dépasser CHF 400.00'),
  
  express: z
    .number()
    .min(2000, 'Le tarif express doit être d\'au moins CHF 20.00')
    .max(30000, 'Le tarif express ne peut pas dépasser CHF 300.00'),
});

/**
 * Validation du contact d'urgence
 */
export const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom du contact doit contenir au moins 2 caractères')
    .max(100, 'Le nom du contact ne peut pas dépasser 100 caractères'),
  
  phone: z
    .string()
    .regex(/^(\+41|0)[1-9]\d{8}$/, 'Numéro de téléphone suisse invalide'),
  
  relationship: z
    .string()
    .min(2, 'La relation doit être spécifiée')
    .max(50, 'La relation ne peut pas dépasser 50 caractères'),
});

// =====================================================
// SCHÉMAS SPÉCIFIQUES AUX NUTRITIONNISTES
// =====================================================

/**
 * Validation des informations d'identification professionnelle
 */
export const nutritionistCredentialsSchema = z.object({
  ascaNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optionnel
      return /^[A-Z]\d{6}$/.test(val);
    }, 'Le numéro ASCA doit être au format A123456'),
  
  rmeNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optionnel
      return /^[0-9]{7}$/.test(val);
    }, 'Le numéro RME doit contenir 7 chiffres'),
  
  eanCode: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optionnel
      return /^[0-9]{13}$/.test(val);
    }, 'Le code EAN doit contenir 13 chiffres'),
});

/**
 * Validation des spécialisations et expertise
 */
export const nutritionistExpertiseSchema = z.object({
  specializations: z
    .array(z.string().min(1, 'La spécialisation ne peut pas être vide'))
    .min(1, 'Veuillez sélectionner au moins une spécialisation')
    .max(10, 'Vous ne pouvez pas sélectionner plus de 10 spécialisations'),
  
  bio: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optionnel
      return val.length <= 1000;
    }, 'La biographie ne peut pas dépasser 1000 caractères'),
  
  yearsOfExperience: z
    .number()
    .optional()
    .refine((val) => {
      if (val === undefined) return true; // Optionnel
      return val >= 0 && val <= 50;
    }, 'L\'expérience doit être entre 0 et 50 ans'),
  
  certifications: z
    .array(z.string().min(1, 'La certification ne peut pas être vide'))
    .optional()
    .default([]),
  
  continuingEducation: z.boolean().optional().default(false),
  
  platformTrainingCompleted: z.boolean().optional().default(false),
});

/**
 * Validation des détails du cabinet
 */
export const practiceDetailsSchema = z.object({
  practiceAddress: swissAddressSchema,
  
  consultationRates: consultationRatesSchema,
  
  maxPatients: z
    .number()
    .min(1, 'Le nombre maximum de patients doit être d\'au moins 1')
    .max(500, 'Le nombre maximum de patients ne peut pas dépasser 500')
    .default(100),
  
  consultationTypes: z
    .array(z.enum(['in-person', 'video', 'phone']))
    .min(1, 'Veuillez sélectionner au moins un type de consultation'),
  
  availableLanguages: z
    .array(z.string().min(1, 'La langue ne peut pas être vide'))
    .min(1, 'Veuillez sélectionner au moins une langue'),
});

/**
 * Schéma complet pour l'onboarding nutritionniste
 */
export const nutritionistOnboardingSchema = basePersonalInfoSchema
  .merge(consentSchema)
  .merge(nutritionistCredentialsSchema)
  .merge(nutritionistExpertiseSchema)
  .merge(practiceDetailsSchema);

// =====================================================
// SCHÉMAS SPÉCIFIQUES AUX PATIENTS
// =====================================================

/**
 * Validation des informations démographiques
 */
export const patientDemographicsSchema = z.object({
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optionnel
      const date = new Date(val);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      return age >= 16 && age <= 120;
    }, 'L\'âge doit être entre 16 et 120 ans'),
  
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say'] as const)
    .optional(),
});

/**
 * Validation des objectifs de santé
 */
export const healthGoalsSchema = z.object({
  primaryGoals: z
    .array(z.string().min(1, 'L\'objectif ne peut pas être vide'))
    .min(1, 'Veuillez sélectionner au moins un objectif principal')
    .max(5, 'Vous ne pouvez pas sélectionner plus de 5 objectifs principaux'),
  
  secondaryGoals: z
    .array(z.string().min(1, 'L\'objectif ne peut pas être vide'))
    .max(5, 'Vous ne pouvez pas sélectionner plus de 5 objectifs secondaires')
    .default([]),
  
  motivations: z
    .array(z.string().min(1, 'La motivation ne peut pas être vide'))
    .min(1, 'Veuillez sélectionner au moins une motivation')
    .max(10, 'Vous ne pouvez pas sélectionner plus de 10 motivations'),
});

/**
 * Validation des mesures physiques
 */
export const physicalMeasurementsSchema = z.object({
  height: z
    .number()
    .optional()
    .refine((val) => {
      if (val === undefined) return true; // Optionnel
      return val >= 100 && val <= 250;
    }, 'La taille doit être entre 100 et 250 cm'),
  
  currentWeight: z
    .number()
    .optional()
    .refine((val) => {
      if (val === undefined) return true; // Optionnel
      return val >= 20 && val <= 300;
    }, 'Le poids actuel doit être entre 20 et 300 kg'),
  
  targetWeight: z
    .number()
    .optional()
    .refine((val) => {
      if (val === undefined) return true; // Optionnel
      return val >= 20 && val <= 300;
    }, 'Le poids cible doit être entre 20 et 300 kg'),
  
  activityLevel: z
    .enum(['sedentary', 'light', 'moderate', 'active', 'very_active'] as const)
    .optional(),
});

/**
 * Validation des restrictions et allergies
 */
export const dietaryRestrictionsSchema = z.object({
  dietaryRestrictions: z
    .array(z.string().min(1, 'La restriction ne peut pas être vide'))
    .default([]),
  
  allergies: z
    .array(z.string().min(1, 'L\'allergie ne peut pas être vide'))
    .default([]),
  
  medicalConditions: z
    .array(z.string().min(1, 'La condition ne peut pas être vide'))
    .default([]),
  
  medications: z
    .array(z.string().min(1, 'Le médicament ne peut pas être vide'))
    .default([]),
});

/**
 * Validation des préférences alimentaires
 */
export const foodPreferencesSchema = z.object({
  cuisinePreferences: z
    .array(z.string().min(1, 'La préférence ne peut pas être vide'))
    .default([]),
  
  cookingSkillLevel: z
    .enum(['beginner', 'intermediate', 'advanced'] as const)
    .default('beginner'),
  
  mealPrepTime: z
    .enum(['quick', 'moderate', 'elaborate'] as const)
    .default('moderate'),
});

/**
 * Validation des préférences de notification
 */
export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
});

/**
 * Schéma complet pour l'onboarding patient
 */
export const patientOnboardingSchema = basePersonalInfoSchema
  .merge(consentSchema)
  .merge(patientDemographicsSchema)
  .merge(healthGoalsSchema)
  .merge(physicalMeasurementsSchema)
  .merge(dietaryRestrictionsSchema)
  .merge(foodPreferencesSchema)
  .merge(z.object({
    emergencyContact: emergencyContactSchema.optional(),
    appTourCompleted: z.boolean().default(false),
    notificationPreferences: notificationPreferencesSchema,
  }));

// Export pour compatibilité avec les composants
export const PatientOnboardingSchema = patientOnboardingSchema;

// =====================================================
// SCHÉMAS SPÉCIFIQUES AUX ADMINISTRATEURS
// =====================================================

/**
 * Validation des informations administratives
 */
export const adminInfoSchema = z.object({
  department: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optionnel
      return val.length >= 2 && val.length <= 50;
    }, 'Le département doit contenir entre 2 et 50 caractères'),
  
  accessLevel: z
    .enum(['super-admin', 'admin', 'moderator'] as const)
    .default('moderator'),
});

/**
 * Validation des préférences système
 */
export const systemPreferencesSchema = z.object({
  defaultLanguage: z.string().default('fr'),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
  numberFormat: z.enum(['1,234.56', '1.234,56', '1 234,56']).default('1 234,56'),
});

/**
 * Validation des préférences de rapports
 */
export const reportingPreferencesSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly'] as const).default('weekly'),
  format: z.enum(['email', 'dashboard', 'both'] as const).default('both'),
});

/**
 * Schéma complet pour l'onboarding administrateur
 */
export const adminOnboardingSchema = basePersonalInfoSchema
  .merge(consentSchema)
  .merge(adminInfoSchema)
  .merge(z.object({
    systemPreferences: systemPreferencesSchema,
    userManagementTraining: z.boolean().default(false),
    canCreateNutritionists: z.boolean().default(false),
    canManageSubscriptions: z.boolean().default(false),
    analyticsAccess: z.array(z.string()).default([]),
    reportingPreferences: reportingPreferencesSchema,
    securityTrainingCompleted: z.boolean().default(false),
    twoFactorEnabled: z.boolean().default(false),
  }));

// =====================================================
// SCHÉMAS PAR ÉTAPE
// =====================================================

/**
 * Schémas de validation par étape pour les nutritionnistes
 */
export const nutritionistStepSchemas = {
  'welcome': z.object({}), // Pas de validation nécessaire
  'personal-info': basePersonalInfoSchema,
  'credentials': nutritionistCredentialsSchema,
  'practice-details': practiceDetailsSchema,
  'specializations': nutritionistExpertiseSchema,
  'consultation-rates': z.object({ consultationRates: consultationRatesSchema }),
  'platform-training': z.object({ platformTrainingCompleted: z.boolean() }),
  'completion': consentSchema,
};

// Exports individuels pour les schémas patient (utilisés dans les composants)
export const healthProfileSchema = patientDemographicsSchema.merge(physicalMeasurementsSchema);
export const dietaryInfoSchema = dietaryRestrictionsSchema.merge(foodPreferencesSchema);
export const medicalInfoSchema = z.object({
  medicalConditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  emergencyContact: emergencyContactSchema.optional(),
  hasHealthInsurance: z.boolean().default(true),
  previousNutritionistExperience: z.boolean().default(false),
});
export const lifestyleSchema = z.object({
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  exerciseFrequency: z.enum(['never', '1-2-times', '3-4-times', '5-6-times', 'daily']),
  sleepHours: z.number().min(4).max(12),
  stressLevel: z.enum(['very-low', 'low', 'moderate', 'high', 'very-high']),
  workSchedule: z.enum(['regular', 'shift-work', 'flexible', 'irregular']),
  smokingStatus: z.enum(['never', 'former', 'occasional', 'regular']),
  alcoholConsumption: z.enum(['never', 'rarely', 'occasionally', 'regularly', 'daily']),
});
export const appTourSchema = z.object({
  appTourCompleted: z.boolean().default(false),
  notificationPreferences: notificationPreferencesSchema,
  communicationPreferences: z.object({
    preferredLanguage: z.enum(['fr', 'en', 'de', 'it']).default('fr'),
    preferredContactMethod: z.enum(['email', 'phone', 'app']).default('app'),
    reminderFrequency: z.enum(['none', 'daily', 'weekly', 'bi-weekly']).default('weekly'),
  }),
  privacySettings: z.object({
    shareDataForResearch: z.boolean().default(false),
    allowMarketingEmails: z.boolean().default(false),
    profileVisibility: z.enum(['private', 'nutritionist-only', 'community']).default('nutritionist-only'),
  }),
});

/**
 * Schémas de validation par étape pour les patients
 */
export const patientStepSchemas = {
  'welcome': z.object({}), // Pas de validation nécessaire
  'personal-info': basePersonalInfoSchema,
  'health-profile': healthProfileSchema,
  'health-goals': healthGoalsSchema,
  'dietary-info': dietaryInfoSchema,
  'medical-info': medicalInfoSchema,
  'lifestyle': lifestyleSchema,
  'app-tour': appTourSchema,
  'completion': consentSchema,
};

/**
 * Schémas de validation par étape pour les administrateurs
 */
export const adminStepSchemas = {
  'welcome': z.object({}), // Pas de validation nécessaire
  'personal-info': basePersonalInfoSchema.merge(adminInfoSchema),
  'system-overview': systemPreferencesSchema,
  'user-management': z.object({
    userManagementTraining: z.boolean(),
    canCreateNutritionists: z.boolean(),
    canManageSubscriptions: z.boolean(),
  }),
  'analytics-setup': z.object({
    analyticsAccess: z.array(z.string()),
    reportingPreferences: reportingPreferencesSchema,
  }),
  'security-config': z.object({
    securityTrainingCompleted: z.boolean(),
    twoFactorEnabled: z.boolean(),
  }),
  'completion': consentSchema,
};

// =====================================================
// UTILITAIRES DE VALIDATION
// =====================================================

/**
 * Obtenir le schéma de validation pour une étape spécifique
 */
export const getStepSchema = (role: UserRole, step: string) => {
  switch (role) {
    case 'nutritionist':
      return nutritionistStepSchemas[step as keyof typeof nutritionistStepSchemas];
    case 'patient':
      return patientStepSchemas[step as keyof typeof patientStepSchemas];
    case 'admin':
      return adminStepSchemas[step as keyof typeof adminStepSchemas];
    default:
      return z.object({});
  }
};

/**
 * Obtenir le schéma complet pour un rôle
 */
export const getCompleteSchema = (role: UserRole) => {
  switch (role) {
    case 'nutritionist':
      return nutritionistOnboardingSchema;
    case 'patient':
      return patientOnboardingSchema;
    case 'admin':
      return adminOnboardingSchema;
    default:
      return basePersonalInfoSchema.merge(consentSchema);
  }
};

/**
 * Types inférés des schémas
 */
export type NutritionistOnboardingData = z.infer<typeof nutritionistOnboardingSchema>;
export type PatientOnboardingData = z.infer<typeof patientOnboardingSchema>;
export type AdminOnboardingData = z.infer<typeof adminOnboardingSchema>;
export type BasePersonalInfo = z.infer<typeof basePersonalInfoSchema>;
export type ConsentData = z.infer<typeof consentSchema>;

export default {
  nutritionistOnboardingSchema,
  patientOnboardingSchema,
  adminOnboardingSchema,
  getStepSchema,
  getCompleteSchema,
};
