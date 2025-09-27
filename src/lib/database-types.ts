// =====================================================
// NutriSensia - Types de Base de Données
// Générés à partir du schéma des profils utilisateur
// =====================================================

import { Database } from '@supabase/supabase-js';

// Types générés automatiquement par Supabase
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// =====================================================
// TYPES DES TABLES PRINCIPALES
// =====================================================

// Table profiles
export type Profile = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];

// Table nutritionists
export type Nutritionist = Tables['nutritionists']['Row'];
export type NutritionistInsert = Tables['nutritionists']['Insert'];
export type NutritionistUpdate = Tables['nutritionists']['Update'];

// Table patients
export type Patient = Tables['patients']['Row'];
export type PatientInsert = Tables['patients']['Insert'];
export type PatientUpdate = Tables['patients']['Update'];

// =====================================================
// TYPES DES VUES
// =====================================================

// Vue nutritionist_profiles
export type NutritionistProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  locale: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  asca_number: string | null;
  rme_number: string | null;
  ean_code: string | null;
  specializations: string[] | null;
  bio: string | null;
  consultation_rates: ConsultationRates | null;
  practice_address: PracticeAddress | null;
  verified: boolean;
  is_active: boolean;
  max_patients: number;
};

// Vue patient_profiles
export type PatientProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  locale: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  nutritionist_id: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  emergency_contact: EmergencyContact | null;
  height: number | null;
  initial_weight: number | null;
  target_weight: number | null;
  activity_level: ActivityLevel | null;
  allergies: string[] | null;
  dietary_restrictions: string[] | null;
  medical_conditions: string[] | null;
  medications: string[] | null;
  subscription_tier: number | null;
  subscription_status: SubscriptionStatus | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  package_credits: PackageCredits | null;
};

// =====================================================
// TYPES DES ENUMS
// =====================================================

export type UserRole = 'nutritionist' | 'patient' | 'admin';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';
export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'expired';

// =====================================================
// TYPES DES STRUCTURES JSON
// =====================================================

// Tarifs de consultation (nutritionists.consultation_rates)
export interface ConsultationRates {
  initial: number; // CHF en centimes (22500 = CHF 225.00)
  follow_up: number; // CHF en centimes (15000 = CHF 150.00)
  express: number; // CHF en centimes (7500 = CHF 75.00)
}

// Adresse du cabinet (nutritionists.practice_address)
export interface PracticeAddress {
  street: string;
  postal_code: string;
  city: string;
  canton: string;
  country: string;
}

// Contact d'urgence (patients.emergency_contact)
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// Crédits du package (patients.package_credits)
export interface PackageCredits {
  consultations_remaining: number;
  meal_plans_remaining: number;
  support_priority: 'standard' | 'priority' | 'premium';
}

// =====================================================
// TYPES UTILITAIRES
// =====================================================

// Profil utilisateur complet avec données spécifiques au rôle
export type UserProfile = {
  profile: Profile;
  nutritionist?: Nutritionist;
  patient?: Patient;
};

// Données de formulaire pour la création/modification de profil
export interface ProfileFormData {
  // Champs communs
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  locale?: string;
  timezone?: string;

  // Champs spécifiques aux nutritionnistes
  asca_number?: string;
  rme_number?: string;
  ean_code?: string;
  specializations?: string[];
  bio?: string;
  consultation_rates?: ConsultationRates;
  practice_address?: PracticeAddress;
  verified?: boolean;
  is_active?: boolean;
  max_patients?: number;

  // Champs spécifiques aux patients
  nutritionist_id?: string;
  date_of_birth?: string;
  gender?: Gender;
  emergency_contact?: EmergencyContact;
  height?: number;
  initial_weight?: number;
  target_weight?: number;
  activity_level?: ActivityLevel;
  allergies?: string[];
  dietary_restrictions?: string[];
  medical_conditions?: string[];
  medications?: string[];
  subscription_tier?: number;
  subscription_status?: SubscriptionStatus;
  subscription_start_date?: string;
  subscription_end_date?: string;
  package_credits?: PackageCredits;
}

// =====================================================
// TYPES POUR LES REQUÊTES
// =====================================================

// Options de filtrage pour les requêtes de profils
export interface ProfileFilters {
  role?: UserRole;
  verified?: boolean;
  is_active?: boolean;
  subscription_status?: SubscriptionStatus;
  nutritionist_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Options de tri pour les requêtes de profils
export interface ProfileSortOptions {
  field: 'created_at' | 'updated_at' | 'first_name' | 'last_name' | 'email';
  direction: 'asc' | 'desc';
}

// Résultat paginé des requêtes
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =====================================================
// TYPES POUR LES STATISTIQUES
// =====================================================

// Statistiques des nutritionnistes
export interface NutritionistStats {
  total_nutritionists: number;
  verified_nutritionists: number;
  active_nutritionists: number;
  average_patients_per_nutritionist: number;
  total_patients: number;
}

// Statistiques des patients
export interface PatientStats {
  total_patients: number;
  active_subscriptions: number;
  average_age: number;
  gender_distribution: Record<Gender, number>;
  subscription_tier_distribution: Record<number, number>;
}

// =====================================================
// TYPES POUR LES VALIDATIONS
// =====================================================

// Erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Résultat de validation
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// =====================================================
// TYPES POUR LES ÉVÉNEMENTS
// =====================================================

// Événements de profil
export type ProfileEvent =
  | { type: 'PROFILE_CREATED'; data: Profile }
  | { type: 'PROFILE_UPDATED'; data: Profile; previous: Profile }
  | { type: 'PROFILE_DELETED'; data: Profile }
  | { type: 'NUTRITIONIST_VERIFIED'; data: Nutritionist }
  | { type: 'PATIENT_SUBSCRIPTION_CHANGED'; data: Patient; previous: Patient };

// =====================================================
// TYPES POUR LES HOOKS REACT
// =====================================================

// État du hook useProfile
export interface UseProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
}

// Actions du hook useProfile
export interface UseProfileActions {
  updateProfile: (data: Partial<ProfileFormData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

// Hook useProfile complet
export type UseProfile = UseProfileState & UseProfileActions;

// =====================================================
// TYPES POUR LES API ROUTES
// =====================================================

// Réponse API standard
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Requête de création de profil
export interface CreateProfileRequest {
  email: string;
  role: UserRole;
  profileData: Partial<ProfileFormData>;
}

// Requête de mise à jour de profil
export interface UpdateProfileRequest {
  profileData: Partial<ProfileFormData>;
}

// =====================================================
// TYPES POUR LES TESTS
// =====================================================

// Données de test
export interface TestData {
  profiles: Profile[];
  nutritionists: Nutritionist[];
  patients: Patient[];
}

// Configuration de test
export interface TestConfig {
  createTestData: boolean;
  cleanupAfterTest: boolean;
  mockAuth: boolean;
}

// =====================================================
// EXPORTS PRINCIPAUX
// =====================================================

export type {
  // Tables
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Nutritionist,
  NutritionistInsert,
  NutritionistUpdate,
  Patient,
  PatientInsert,
  PatientUpdate,

  // Vues
  NutritionistProfile,
  PatientProfile,

  // Structures JSON
  ConsultationRates,
  PracticeAddress,
  EmergencyContact,
  PackageCredits,

  // Utilitaires
  UserProfile,
  ProfileFormData,
  ProfileFilters,
  ProfileSortOptions,
  PaginatedResult,

  // Statistiques
  NutritionistStats,
  PatientStats,

  // Validation
  ValidationError,
  ValidationResult,

  // Événements
  ProfileEvent,

  // Hooks
  UseProfileState,
  UseProfileActions,
  UseProfile,

  // API
  ApiResponse,
  CreateProfileRequest,
  UpdateProfileRequest,

  // Tests
  TestData,
  TestConfig,
};

// =====================================================
// CONSTANTES
// =====================================================

// Valeurs par défaut
export const DEFAULT_CONSULTATION_RATES: ConsultationRates = {
  initial: 22500, // CHF 225.00
  follow_up: 15000, // CHF 150.00
  express: 7500, // CHF 75.00
};

export const DEFAULT_PACKAGE_CREDITS: PackageCredits = {
  consultations_remaining: 0,
  meal_plans_remaining: 0,
  support_priority: 'standard',
};

export const DEFAULT_PRACTICE_ADDRESS: PracticeAddress = {
  street: '',
  postal_code: '',
  city: '',
  canton: '',
  country: 'CH',
};

export const DEFAULT_EMERGENCY_CONTACT: EmergencyContact = {
  name: '',
  phone: '',
  relationship: '',
};

// Limites et contraintes
export const PROFILE_LIMITS = {
  MAX_FIRST_NAME_LENGTH: 100,
  MAX_LAST_NAME_LENGTH: 100,
  MAX_PHONE_LENGTH: 20,
  MAX_BIO_LENGTH: 1000,
  MAX_SPECIALIZATIONS: 10,
  MAX_PATIENTS_PER_NUTRITIONIST: 100,
  MIN_HEIGHT: 100, // cm
  MAX_HEIGHT: 250, // cm
  MIN_WEIGHT: 20, // kg
  MAX_WEIGHT: 300, // kg
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  PROFILE_NOT_FOUND: 'Profil utilisateur non trouvé',
  INVALID_ROLE: 'Rôle utilisateur invalide',
  INVALID_EMAIL: 'Adresse email invalide',
  INVALID_PHONE: 'Numéro de téléphone invalide',
  INVALID_DATE: 'Date invalide',
  INVALID_WEIGHT: 'Poids invalide',
  INVALID_HEIGHT: 'Taille invalide',
  INVALID_ASCA_NUMBER: 'Numéro ASCA invalide',
  INVALID_RME_NUMBER: 'Numéro RME invalide',
  INVALID_EAN_CODE: 'Code EAN invalide',
  INVALID_SUBSCRIPTION_TIER: "Niveau d'abonnement invalide",
  UNAUTHORIZED: 'Accès non autorisé',
  VALIDATION_FAILED: 'Échec de la validation',
  UPDATE_FAILED: 'Échec de la mise à jour',
  CREATE_FAILED: 'Échec de la création',
} as const;
