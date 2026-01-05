/**
 * Types et constantes pour le système d'onboarding NutriSensia
 */

// Types de base pour l'onboarding
export type OnboardingStep = string;
export type NutritionistOnboardingStep =
  | 'welcome'
  | 'personal-info'
  | 'credentials'
  | 'practice-details'
  | 'specializations'
  | 'consultation-rates'
  | 'platform-training'
  | 'completion';

export type PatientOnboardingStep =
  | 'welcome'
  | 'personal-info'
  | 'health-profile'
  | 'dietary-preferences'
  | 'goals'
  | 'completion';

// Interface pour les données d'onboarding des nutritionnistes
export interface NutritionistOnboardingData {
  // Étape de bienvenue
  welcomeViewed?: boolean;
  onboardingStartedAt?: string;

  // Informations personnelles (PersonalInfoStep)
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  locale?: string; // Langue préférée
  avatar_url?: string | null; // URL de l'avatar

  // Identifiants professionnels (CredentialsStep)
  ascaNumber?: string;
  rmeNumber?: string;
  eanCode?: string;

  // Détails du cabinet (PracticeDetailsStep)
  practiceAddress?: {
    street?: string;
    postal_code?: string;
    city?: string;
    canton?: string;
    country?: string;
  };
  consultationRates?: {
    initial?: number; // En centimes
    follow_up?: number; // En centimes
    express?: number; // En centimes
  };
  maxPatients?: number;
  consultationTypes?: string[]; // ['in-person', 'online', 'home-visit']
  availableLanguages?: string[]; // ['fr', 'de', 'it', 'en']

  // Spécialisations (SpecializationsStep)
  specializations?: string[];
  bio?: string;
  yearsOfExperience?: number; // Années d'expérience (0-50)
  certifications?: string[]; // Liste des certifications et formations
  continuingEducation?: boolean; // Engagement formation continue

  // Formation à la plateforme (PlatformTrainingStep)
  platformTraining?: {
    completed?: boolean;
    completedModules?: string[];
  };

  // Finalisation (CompletionStep)
  completed?: boolean;
  completedAt?: string;
  termsAccepted?: boolean;
  privacyPolicyAccepted?: boolean;
  marketingConsent?: boolean;
}

// Interface pour les données d'onboarding des patients
export interface PatientOnboardingData {
  // Étape de bienvenue
  welcomeViewed?: boolean;
  onboardingStartedAt?: string;

  // Informations personnelles
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';

  // Profil de santé
  healthProfile?: {
    height?: number;
    weight?: number;
    activityLevel?:
      | 'sedentary'
      | 'light'
      | 'moderate'
      | 'active'
      | 'very-active';
    medicalConditions?: string[];
    medications?: string[];
    allergies?: string[];
  };

  // Préférences alimentaires
  dietaryPreferences?: {
    dietType?:
      | 'omnivore'
      | 'vegetarian'
      | 'vegan'
      | 'pescatarian'
      | 'keto'
      | 'paleo'
      | 'other';
    restrictions?: string[];
    dislikes?: string[];
    culturalConsiderations?: string[];
  };

  // Objectifs
  goals?: {
    primaryGoal?:
      | 'weight-loss'
      | 'weight-gain'
      | 'maintenance'
      | 'muscle-gain'
      | 'health-improvement'
      | 'other';
    targetWeight?: number;
    timeframe?: string;
    motivation?: string;
  };

  // Finalisation
  completed?: boolean;
  completedAt?: string;
}

// Interface pour la progression de l'onboarding
export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  stepsData: Record<string, any>;
  lastUpdated: string;
}

// Constantes pour les langues disponibles
export const AVAILABLE_LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'en', label: 'English' },
  { value: 'rm', label: 'Rumantsch' },
] as const;

// Constantes pour les cantons suisses
export const SWISS_CANTONS = [
  { value: 'AG', label: 'Argovie (AG)' },
  { value: 'AI', label: 'Appenzell Rhodes-Intérieures (AI)' },
  { value: 'AR', label: 'Appenzell Rhodes-Extérieures (AR)' },
  { value: 'BE', label: 'Berne (BE)' },
  { value: 'BL', label: 'Bâle-Campagne (BL)' },
  { value: 'BS', label: 'Bâle-Ville (BS)' },
  { value: 'FR', label: 'Fribourg (FR)' },
  { value: 'GE', label: 'Genève (GE)' },
  { value: 'GL', label: 'Glaris (GL)' },
  { value: 'GR', label: 'Grisons (GR)' },
  { value: 'JU', label: 'Jura (JU)' },
  { value: 'LU', label: 'Lucerne (LU)' },
  { value: 'NE', label: 'Neuchâtel (NE)' },
  { value: 'NW', label: 'Nidwald (NW)' },
  { value: 'OW', label: 'Obwald (OW)' },
  { value: 'SG', label: 'Saint-Gall (SG)' },
  { value: 'SH', label: 'Schaffhouse (SH)' },
  { value: 'SO', label: 'Soleure (SO)' },
  { value: 'SZ', label: 'Schwytz (SZ)' },
  { value: 'TG', label: 'Thurgovie (TG)' },
  { value: 'TI', label: 'Tessin (TI)' },
  { value: 'UR', label: 'Uri (UR)' },
  { value: 'VD', label: 'Vaud (VD)' },
  { value: 'VS', label: 'Valais (VS)' },
  { value: 'ZG', label: 'Zoug (ZG)' },
  { value: 'ZH', label: 'Zurich (ZH)' },
] as const;

// Constantes pour les spécialisations nutritionnelles
export const NUTRITION_SPECIALIZATIONS = [
  { value: 'clinical-nutrition', label: 'Nutrition clinique' },
  { value: 'sports-nutrition', label: 'Nutrition sportive' },
  { value: 'pediatric-nutrition', label: 'Nutrition pédiatrique' },
  { value: 'geriatric-nutrition', label: 'Nutrition gériatrique' },
  { value: 'weight-management', label: 'Gestion du poids' },
  { value: 'eating-disorders', label: 'Troubles alimentaires' },
  { value: 'diabetes-management', label: 'Gestion du diabète' },
  { value: 'cardiovascular-nutrition', label: 'Nutrition cardiovasculaire' },
  { value: 'digestive-health', label: 'Santé digestive' },
  { value: 'plant-based-nutrition', label: 'Nutrition végétale' },
  { value: 'functional-nutrition', label: 'Nutrition fonctionnelle' },
  { value: 'oncology-nutrition', label: 'Nutrition oncologique' },
] as const;

// Types dérivés des constantes
export type AvailableLanguage = (typeof AVAILABLE_LANGUAGES)[number]['value'];
export type SwissCanton = (typeof SWISS_CANTONS)[number]['value'];
export type NutritionSpecialization =
  (typeof NUTRITION_SPECIALIZATIONS)[number]['value'];

// =====================================================
// TYPES POUR LA NOUVELLE ARCHITECTURE OPTIMISÉE
// =====================================================

// Interface pour les profils de base (table profiles)
export interface BaseProfile {
  id: string;
  email: string;
  role: 'patient' | 'nutritionist' | 'admin';
  email_verified: boolean;
  two_factor_enabled: boolean;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
}

// Interface pour les nutritionnistes (table nutritionists)
export interface NutritionistProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  locale: string;
  asca_number?: string;
  rme_number?: string;
  ean_code?: string;
  specializations: string[];
  bio?: string;
  consultation_rates: {
    initial: number;
    follow_up: number;
    express: number;
  };
  practice_address: {
    street: string;
    postal_code: string;
    city: string;
    canton: string;
    country: string;
  };
  verified: boolean;
  is_active: boolean;
  max_patients: number;
  profile_public: boolean;
  allow_contact: boolean;
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  onboarding_completed: number; // 0-100: pourcentage de completion
  onboarding_completed_at?: string;
  onboarding_data: any;
  // Champs de consentement légal (RGPD)
  terms_accepted: boolean;
  terms_accepted_at?: string;
  privacy_policy_accepted: boolean;
  privacy_policy_accepted_at?: string;
  marketing_consent: boolean;
  marketing_consent_at?: string;
  created_at: string;
  updated_at: string;
}

// Interface pour les patients (table patients)
export interface PatientProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  locale: string;
  height_cm?: number;
  weight_kg?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activity_level?:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extremely_active';
  dietary_restrictions: string[];
  allergies: string[];
  goals: string[];
  profile_public: boolean;
  allow_contact: boolean;
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  onboarding_completed: number; // 0-100: pourcentage de completion
  onboarding_completed_at?: string;
  onboarding_data: any;
  created_at: string;
  updated_at: string;
}

// Types combinés pour les vues complètes
export interface CompleteNutritionistProfile
  extends BaseProfile,
    Omit<NutritionistProfile, 'id'> {}
export interface CompletePatientProfile
  extends BaseProfile,
    Omit<PatientProfile, 'id'> {}
