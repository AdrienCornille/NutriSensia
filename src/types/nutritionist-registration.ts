/**
 * Types pour l'inscription nutritionniste
 * @see AUTH-008, AUTH-009, AUTH-010 dans USER_STORIES.md
 */

// ==================== TYPES DE BASE ====================

export type NutritionistStatus =
  | 'pending'
  | 'active'
  | 'rejected'
  | 'info_required'
  | 'suspended';

export type DocumentType =
  | 'asca_certificate'
  | 'rme_certificate'
  | 'diploma'
  | 'photo'
  | 'other';

export type RegistrationStep = 1 | 2 | 3 | 4 | 5;

// ==================== DOCUMENTS ====================

export interface NutritionistDocument {
  id?: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt?: Date;
  verified?: boolean;
}

// ==================== DONNÉES DU FORMULAIRE ====================

export interface PersonalInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ProfessionalInfoData {
  ascaNumber?: string;
  rmeNumber?: string;
  specializations: string[];
  yearsOfExperience: string;
  languages: string[];
  bio?: string;
  cabinetAddress?: {
    street?: string;
    postalCode?: string;
    city?: string;
    canton?: string;
  };
}

export interface DocumentsData {
  ascaCertificate?: NutritionistDocument;
  rmeCertificate?: NutritionistDocument;
  diploma?: NutritionistDocument;
  photo?: NutritionistDocument;
}

export interface TermsData {
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptSalesTerms: boolean;
  certifyAccuracy: boolean;
}

export interface NutritionistRegistrationData {
  personalInfo: PersonalInfoData;
  professionalInfo: ProfessionalInfoData;
  documents: DocumentsData;
  terms: TermsData;
}

// ==================== ÉTAT DU FORMULAIRE ====================

export interface RegistrationFormState {
  currentStep: RegistrationStep;
  data: Partial<NutritionistRegistrationData>;
  isSubmitting: boolean;
  error: string | null;
  stepErrors: Record<RegistrationStep, Record<string, string>>;
}

// ==================== CONFIGURATIONS ====================

export const SPECIALIZATIONS = [
  'Nutrition sportive',
  'Nutrition pédiatrique',
  'Troubles alimentaires',
  'Diabète et maladies métaboliques',
  'Nutrition végétarienne/vegan',
  'Allergies et intolérances',
  'Gestion du poids',
  'Nutrition gériatrique',
  'Nutrition clinique',
  'Nutrition préventive',
  'Gain de masse musculaire',
  'Nutrition oncologique',
] as const;

export const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Allemand' },
  { code: 'it', label: 'Italien' },
  { code: 'en', label: 'Anglais' },
  { code: 'es', label: 'Espagnol' },
  { code: 'pt', label: 'Portugais' },
] as const;

export const YEARS_OF_EXPERIENCE = [
  { value: '0-2', label: 'Moins de 2 ans' },
  { value: '2-5', label: '2 à 5 ans' },
  { value: '5-10', label: '5 à 10 ans' },
  { value: '10+', label: 'Plus de 10 ans' },
] as const;

export const SWISS_CANTONS = [
  { code: 'AG', label: 'Argovie' },
  { code: 'AI', label: 'Appenzell Rhodes-Intérieures' },
  { code: 'AR', label: 'Appenzell Rhodes-Extérieures' },
  { code: 'BE', label: 'Berne' },
  { code: 'BL', label: 'Bâle-Campagne' },
  { code: 'BS', label: 'Bâle-Ville' },
  { code: 'FR', label: 'Fribourg' },
  { code: 'GE', label: 'Genève' },
  { code: 'GL', label: 'Glaris' },
  { code: 'GR', label: 'Grisons' },
  { code: 'JU', label: 'Jura' },
  { code: 'LU', label: 'Lucerne' },
  { code: 'NE', label: 'Neuchâtel' },
  { code: 'NW', label: 'Nidwald' },
  { code: 'OW', label: 'Obwald' },
  { code: 'SG', label: 'Saint-Gall' },
  { code: 'SH', label: 'Schaffhouse' },
  { code: 'SO', label: 'Soleure' },
  { code: 'SZ', label: 'Schwytz' },
  { code: 'TG', label: 'Thurgovie' },
  { code: 'TI', label: 'Tessin' },
  { code: 'UR', label: 'Uri' },
  { code: 'VD', label: 'Vaud' },
  { code: 'VS', label: 'Valais' },
  { code: 'ZG', label: 'Zoug' },
  { code: 'ZH', label: 'Zurich' },
] as const;

export const DOCUMENT_CONFIG: Record<
  DocumentType,
  {
    label: string;
    description: string;
    required: boolean;
    acceptedTypes: string[];
    maxSize: number;
  }
> = {
  asca_certificate: {
    label: 'Certificat ASCA',
    description: 'Votre certificat de reconnaissance ASCA (PDF ou image)',
    required: false, // Required if no RME
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  rme_certificate: {
    label: 'Certificat RME',
    description: 'Votre certificat de reconnaissance RME (PDF ou image)',
    required: false, // Required if no ASCA
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  diploma: {
    label: 'Diplôme',
    description: 'Votre diplôme de nutritionniste (optionnel)',
    required: false,
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  photo: {
    label: 'Photo professionnelle',
    description: 'Une photo de profil professionnelle',
    required: true,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
  },
  other: {
    label: 'Autre document',
    description: 'Tout autre document pertinent',
    required: false,
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};

// ==================== HELPERS ====================

export function getStepTitle(step: RegistrationStep): string {
  const titles: Record<RegistrationStep, string> = {
    1: 'Informations personnelles',
    2: 'Informations professionnelles',
    3: 'Documents',
    4: 'Conditions',
    5: 'Récapitulatif',
  };
  return titles[step];
}

export function getStepDescription(step: RegistrationStep): string {
  const descriptions: Record<RegistrationStep, string> = {
    1: 'Renseignez vos coordonnées et créez votre compte',
    2: 'Partagez votre expérience et vos qualifications',
    3: 'Téléchargez vos certifications et documents',
    4: 'Lisez et acceptez les conditions',
    5: 'Vérifiez vos informations avant soumission',
  };
  return descriptions[step];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function isValidSwissPhone(phone: string): boolean {
  // Format suisse: +41 XX XXX XX XX ou 0XX XXX XX XX
  const swissPhoneRegex = /^(\+41|0)[1-9][0-9]{8}$/;
  return swissPhoneRegex.test(phone.replace(/\s/g, ''));
}

export function hasAtLeastOneCertification(documents: DocumentsData): boolean {
  return !!(documents.ascaCertificate || documents.rmeCertificate);
}
