/**
 * Fonctions Supabase pour la nouvelle structure de base de données
 * Remplace les anciennes fonctions après migration
 */

import { supabase } from './supabase';
import { NutritionistOnboardingData } from '@/types/onboarding';

// =====================================================
// TYPES POUR LA NOUVELLE STRUCTURE
// =====================================================

export interface ProfileCore {
  id: string;
  email: string;
  role: 'nutritionist' | 'patient' | 'admin';
  email_verified: boolean;
  two_factor_enabled: boolean;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NutritionistProfile {
  id: string;
  // Informations personnelles
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  locale?: string;
  timezone?: string;

  // Identifiants professionnels
  asca_number?: string;
  rme_number?: string;
  ean_code?: string;

  // Informations professionnelles
  specializations?: string[];
  bio?: string;
  consultation_rates?: {
    initial?: number;
    follow_up?: number;
    express?: number;
  };
  practice_address?: {
    street?: string;
    postal_code?: string;
    city?: string;
    canton?: string;
    country?: string;
  };
  consultation_types?: string[];
  available_languages?: string[];

  // Statuts
  verified: boolean;
  is_active: boolean;
  max_patients: number;

  // Onboarding
  onboarding_completed: number; // 0-100: pourcentage de completion
  onboarding_completed_at?: string;
  onboarding_data?: any;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string;
  // Informations personnelles
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  locale?: string;
  timezone?: string;

  // Informations de santé
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  height_cm?: number;
  weight_kg?: number;
  activity_level?:
    | 'sedentary'
    | 'light'
    | 'moderate'
    | 'active'
    | 'very-active';

  // Préférences et restrictions
  dietary_restrictions?: string[];
  allergies?: string[];
  medical_conditions?: string[];
  medications?: string[];
  goals?: string[];

  // Onboarding
  onboarding_completed: number; // 0-100: pourcentage de completion
  onboarding_completed_at?: string;
  onboarding_data?: any;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// =====================================================
// FONCTIONS POUR LES PROFILS CORE
// =====================================================

export async function getCoreProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as ProfileCore;
}

export async function updateCoreProfile(
  userId: string,
  updates: Partial<ProfileCore>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as ProfileCore;
}

// =====================================================
// FONCTIONS POUR LES NUTRITIONNISTES
// =====================================================

export async function getNutritionistProfile(userId: string) {
  const { data, error } = await supabase
    .from('nutritionist_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as NutritionistProfile;
}

export async function createNutritionistProfile(
  userId: string,
  profileData: Partial<NutritionistProfile>
) {
  const { data, error } = await supabase
    .from('nutritionist_profiles')
    .insert({
      id: userId,
      ...profileData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as NutritionistProfile;
}

export async function updateNutritionistProfile(
  userId: string,
  updates: Partial<NutritionistProfile>
) {
  const { data, error } = await supabase
    .from('nutritionist_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as NutritionistProfile;
}

export async function upsertNutritionistProfile(
  userId: string,
  profileData: Partial<NutritionistProfile>
) {
  const { data, error } = await supabase
    .from('nutritionist_profiles')
    .upsert({
      id: userId,
      ...profileData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as NutritionistProfile;
}

// =====================================================
// FONCTIONS POUR LES PATIENTS
// =====================================================

export async function getPatientProfile(userId: string) {
  const { data, error } = await supabase
    .from('patient_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as PatientProfile;
}

export async function createPatientProfile(
  userId: string,
  profileData: Partial<PatientProfile>
) {
  const { data, error } = await supabase
    .from('patient_profiles')
    .insert({
      id: userId,
      ...profileData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PatientProfile;
}

export async function updatePatientProfile(
  userId: string,
  updates: Partial<PatientProfile>
) {
  const { data, error } = await supabase
    .from('patient_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as PatientProfile;
}

export async function upsertPatientProfile(
  userId: string,
  profileData: Partial<PatientProfile>
) {
  const { data, error } = await supabase
    .from('patient_profiles')
    .upsert({
      id: userId,
      ...profileData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PatientProfile;
}

// =====================================================
// FONCTIONS D'ONBOARDING (NOUVELLE STRUCTURE)
// =====================================================

export async function saveNutritionistOnboardingProgress(
  userId: string,
  data: Partial<NutritionistOnboardingData>
) {
  // Convertir les données d'onboarding vers la structure nutritionist_profile
  const profileUpdate: Partial<NutritionistProfile> = {};

  // Informations personnelles
  if (data.firstName) profileUpdate.first_name = data.firstName;
  if (data.lastName) profileUpdate.last_name = data.lastName;
  if (data.phone) profileUpdate.phone = data.phone;
  if (data.locale) profileUpdate.locale = data.locale;

  // Identifiants professionnels
  if (data.ascaNumber) profileUpdate.asca_number = data.ascaNumber;
  if (data.rmeNumber) profileUpdate.rme_number = data.rmeNumber;
  if (data.eanCode) profileUpdate.ean_code = data.eanCode;

  // Informations professionnelles
  if (data.specializations)
    profileUpdate.specializations = data.specializations;
  if (data.bio) profileUpdate.bio = data.bio;
  if (data.consultationRates)
    profileUpdate.consultation_rates = data.consultationRates;
  if (data.practiceAddress)
    profileUpdate.practice_address = data.practiceAddress;
  if (data.consultationTypes)
    profileUpdate.consultation_types = data.consultationTypes;
  if (data.availableLanguages)
    profileUpdate.available_languages = data.availableLanguages;
  if (data.maxPatients) profileUpdate.max_patients = data.maxPatients;

  // Consentements légaux (RGPD)
  if (data.termsAccepted !== undefined) {
    profileUpdate.terms_accepted = data.termsAccepted;
    if (data.termsAccepted) {
      profileUpdate.terms_accepted_at = new Date().toISOString();
    }
  }
  if (data.privacyPolicyAccepted !== undefined) {
    profileUpdate.privacy_policy_accepted = data.privacyPolicyAccepted;
    if (data.privacyPolicyAccepted) {
      profileUpdate.privacy_policy_accepted_at = new Date().toISOString();
    }
  }
  if (data.marketingConsent !== undefined) {
    profileUpdate.marketing_consent = data.marketingConsent;
    profileUpdate.marketing_consent_at = new Date().toISOString(); // Toujours enregistrer la date du choix
  }

  // Sauvegarder les données d'onboarding brutes
  profileUpdate.onboarding_data = data;

  return await upsertNutritionistProfile(userId, profileUpdate);
}

export async function completeNutritionistOnboarding(
  userId: string,
  data: NutritionistOnboardingData
) {
  // Sauvegarder toutes les données + marquer comme terminé
  const profileData = await saveNutritionistOnboardingProgress(userId, data);

  return await updateNutritionistProfile(userId, {
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
    is_active: true,
  });
}

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

export async function getFullUserProfile(userId: string) {
  // Récupérer le profil core
  const coreProfile = await getCoreProfile(userId);

  // Récupérer le profil spécifique selon le rôle
  let specificProfile = null;

  if (coreProfile.role === 'nutritionist') {
    try {
      specificProfile = await getNutritionistProfile(userId);
    } catch (error) {
      // Profil nutritionniste n'existe pas encore
      specificProfile = null;
    }
  } else if (coreProfile.role === 'patient') {
    try {
      specificProfile = await getPatientProfile(userId);
    } catch (error) {
      // Profil patient n'existe pas encore
      specificProfile = null;
    }
  }

  return {
    core: coreProfile,
    specific: specificProfile,
    role: coreProfile.role,
  };
}

export async function getAllNutritionists(filters?: {
  verified?: boolean;
  active?: boolean;
  specializations?: string[];
}) {
  let query = supabase.from('nutritionist_profiles').select('*');

  if (filters?.verified !== undefined) {
    query = query.eq('verified', filters.verified);
  }

  if (filters?.active !== undefined) {
    query = query.eq('is_active', filters.active);
  }

  if (filters?.specializations && filters.specializations.length > 0) {
    query = query.overlaps('specializations', filters.specializations);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as NutritionistProfile[];
}
