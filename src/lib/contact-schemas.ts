import { z } from 'zod';

/**
 * Schémas de validation Zod pour les formulaires de contact NutriSensia
 *
 * Ces schémas définissent la validation côté client et serveur pour
 * tous les types de formulaires de contact de la plateforme.
 */

// Validation commune pour les champs de base
const baseContactFields = {
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'
    ),

  email: z
    .string()
    .email('Veuillez saisir une adresse email valide')
    .max(255, "L'adresse email ne peut pas dépasser 255 caractères"),

  phone: z
    .string()
    .optional()
    .refine(
      phone =>
        !phone || /^(\+41|0041|0)[1-9]\d{8}$/.test(phone.replace(/\s/g, '')),
      'Veuillez saisir un numéro de téléphone suisse valide (ex: +41 XX XXX XX XX)'
    ),

  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message ne peut pas dépasser 2000 caractères'),

  // Champ honeypot pour la protection anti-spam (doit rester vide)
  website: z.string().max(0, 'Ce champ doit rester vide').optional(),

  // Consentement RGPD
  consent: z
    .boolean()
    .refine(
      val => val === true,
      'Vous devez accepter le traitement de vos données personnelles'
    ),
};

/**
 * Schéma pour le formulaire de contact général
 */
export const generalContactSchema = z.object({
  ...baseContactFields,
  subject: z
    .string()
    .min(5, 'Le sujet doit contenir au moins 5 caractères')
    .max(200, 'Le sujet ne peut pas dépasser 200 caractères'),

  category: z.enum(
    ['information', 'support', 'partnership', 'media', 'other'],
    {
      errorMap: () => ({ message: 'Veuillez sélectionner une catégorie' }),
    }
  ),
});

/**
 * Schéma pour le formulaire de contact patient
 */
export const patientContactSchema = z.object({
  ...baseContactFields,

  // Informations spécifiques aux patients
  age: z
    .number()
    .min(16, 'Vous devez avoir au moins 16 ans')
    .max(120, 'Veuillez saisir un âge valide')
    .optional(),

  healthConditions: z
    .string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),

  consultationType: z.enum(
    [
      'first-consultation',
      'follow-up',
      'nutrition-plan',
      'weight-management',
      'sports-nutrition',
      'medical-nutrition',
      'other',
    ],
    {
      errorMap: () => ({
        message: 'Veuillez sélectionner un type de consultation',
      }),
    }
  ),

  urgency: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: "Veuillez indiquer le niveau d'urgence" }),
  }),

  preferredContact: z.enum(['email', 'phone', 'both'], {
    errorMap: () => ({
      message: 'Veuillez indiquer votre préférence de contact',
    }),
  }),

  insuranceInfo: z
    .string()
    .max(
      500,
      "Les informations d'assurance ne peuvent pas dépasser 500 caractères"
    )
    .optional(),
});

/**
 * Schéma pour le formulaire de partenariat nutritionniste
 */
export const nutritionistPartnershipSchema = z.object({
  ...baseContactFields,

  // Informations professionnelles
  professionalTitle: z
    .string()
    .min(2, 'Le titre professionnel doit contenir au moins 2 caractères')
    .max(100, 'Le titre professionnel ne peut pas dépasser 100 caractères'),

  credentials: z
    .array(z.string())
    .min(1, 'Veuillez sélectionner au moins une certification')
    .max(10, 'Vous ne pouvez pas sélectionner plus de 10 certifications'),

  specializations: z
    .array(z.string())
    .min(1, 'Veuillez sélectionner au moins une spécialisation')
    .max(5, 'Vous ne pouvez pas sélectionner plus de 5 spécialisations'),

  yearsExperience: z
    .number()
    .min(0, "L'expérience ne peut pas être négative")
    .max(50, 'Veuillez saisir une expérience réaliste'),

  currentPractice: z
    .string()
    .max(
      500,
      'La description de votre pratique actuelle ne peut pas dépasser 500 caractères'
    )
    .optional(),

  location: z
    .string()
    .min(2, 'Veuillez indiquer votre localisation')
    .max(100, 'La localisation ne peut pas dépasser 100 caractères'),

  availabilityHours: z
    .number()
    .min(1, 'Vous devez être disponible au moins 1 heure par semaine')
    .max(60, 'La disponibilité ne peut pas dépasser 60 heures par semaine'),

  motivationLetter: z
    .string()
    .min(100, 'La lettre de motivation doit contenir au moins 100 caractères')
    .max(2000, 'La lettre de motivation ne peut pas dépasser 2000 caractères'),

  websiteUrl: z
    .string()
    .url('Veuillez saisir une URL valide')
    .optional()
    .or(z.literal('')),

  linkedinUrl: z
    .string()
    .url('Veuillez saisir une URL LinkedIn valide')
    .optional()
    .or(z.literal('')),
});

/**
 * Schéma pour la demande de démo (version simplifiée du formulaire nutritionniste)
 */
export const demoRequestSchema = z.object({
  name: baseContactFields.name,
  email: baseContactFields.email,
  phone: baseContactFields.phone,
  website: baseContactFields.website,
  consent: baseContactFields.consent,

  specialization: z.enum(
    [
      'nutrition-generale',
      'nutrition-sportive',
      'nutrition-clinique',
      'nutrition-pediatrique',
      'troubles-alimentaires',
      'autre',
    ],
    {
      errorMap: () => ({ message: 'Veuillez sélectionner une spécialisation' }),
    }
  ),

  experience: z.enum(['0-2', '3-5', '6-10', '10+'], {
    errorMap: () => ({ message: 'Veuillez indiquer votre expérience' }),
  }),

  message: z
    .string()
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères')
    .optional(),
});

// Types TypeScript dérivés des schémas Zod
export type GeneralContactFormData = z.infer<typeof generalContactSchema>;
export type PatientContactFormData = z.infer<typeof patientContactSchema>;
export type NutritionistPartnershipFormData = z.infer<
  typeof nutritionistPartnershipSchema
>;
export type DemoRequestFormData = z.infer<typeof demoRequestSchema>;

// Union type pour tous les types de formulaires
export type ContactFormData =
  | GeneralContactFormData
  | PatientContactFormData
  | NutritionistPartnershipFormData
  | DemoRequestFormData;

/**
 * Énumérations pour les options de sélection
 */
export const CONTACT_CATEGORIES = [
  { value: 'information', label: "Demande d'information" },
  { value: 'support', label: 'Support technique' },
  { value: 'partnership', label: 'Partenariat' },
  { value: 'media', label: 'Presse & Médias' },
  { value: 'other', label: 'Autre' },
] as const;

export const CONSULTATION_TYPES = [
  { value: 'first-consultation', label: 'Première consultation' },
  { value: 'follow-up', label: 'Suivi nutritionnel' },
  { value: 'nutrition-plan', label: 'Plan nutritionnel personnalisé' },
  { value: 'weight-management', label: 'Gestion du poids' },
  { value: 'sports-nutrition', label: 'Nutrition sportive' },
  { value: 'medical-nutrition', label: 'Nutrition thérapeutique' },
  { value: 'other', label: 'Autre' },
] as const;

export const URGENCY_LEVELS = [
  { value: 'low', label: 'Pas urgent (réponse sous 48h)' },
  { value: 'medium', label: 'Modéré (réponse sous 24h)' },
  { value: 'high', label: 'Urgent (réponse sous 4h)' },
] as const;

export const CONTACT_PREFERENCES = [
  { value: 'email', label: 'Email uniquement' },
  { value: 'phone', label: 'Téléphone uniquement' },
  { value: 'both', label: 'Email et téléphone' },
] as const;

export const NUTRITIONIST_CREDENTIALS = [
  {
    value: 'asca',
    label: 'ASCA (Fondation Suisse pour les Médecines Complémentaires)',
  },
  { value: 'rme', label: 'RME (Registre de Médecine Empirique)' },
  { value: 'sge', label: 'SGE (Société Suisse de Nutrition)' },
  { value: 'svde', label: 'SVDE (Association Suisse des Diététicien-ne-s)' },
  { value: 'university-degree', label: 'Diplôme universitaire en nutrition' },
  { value: 'hes-degree', label: 'Diplôme HES en nutrition' },
  { value: 'other', label: 'Autre certification' },
] as const;

export const NUTRITIONIST_SPECIALIZATIONS = [
  { value: 'general-nutrition', label: 'Nutrition générale' },
  { value: 'clinical-nutrition', label: 'Nutrition clinique' },
  { value: 'sports-nutrition', label: 'Nutrition sportive' },
  { value: 'pediatric-nutrition', label: 'Nutrition pédiatrique' },
  { value: 'geriatric-nutrition', label: 'Nutrition gériatrique' },
  { value: 'eating-disorders', label: 'Troubles du comportement alimentaire' },
  { value: 'weight-management', label: 'Gestion du poids' },
  { value: 'diabetes', label: 'Diabète' },
  { value: 'cardiovascular', label: 'Maladies cardiovasculaires' },
  { value: 'digestive-disorders', label: 'Troubles digestifs' },
  { value: 'allergies-intolerances', label: 'Allergies et intolérances' },
  { value: 'plant-based', label: 'Nutrition végétale' },
] as const;

export const DEMO_SPECIALIZATIONS = [
  { value: 'nutrition-generale', label: 'Nutrition générale' },
  { value: 'nutrition-sportive', label: 'Nutrition sportive' },
  { value: 'nutrition-clinique', label: 'Nutrition clinique' },
  { value: 'nutrition-pediatrique', label: 'Nutrition pédiatrique' },
  { value: 'troubles-alimentaires', label: 'Troubles alimentaires' },
  { value: 'autre', label: 'Autre' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: '0-2', label: '0-2 ans' },
  { value: '3-5', label: '3-5 ans' },
  { value: '6-10', label: '6-10 ans' },
  { value: '10+', label: 'Plus de 10 ans' },
] as const;
