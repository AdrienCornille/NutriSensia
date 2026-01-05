'use client';

import React from 'react';
import { ContactForm, ContactFormProps } from './ContactForm';
import {
  nutritionistPartnershipSchema,
  NutritionistPartnershipFormData,
  NUTRITIONIST_CREDENTIALS,
  NUTRITIONIST_SPECIALIZATIONS,
} from '@/lib/contact-schemas';

/**
 * Props du formulaire de partenariat nutritionniste
 */
export interface NutritionistPartnershipFormProps
  extends Omit<
    ContactFormProps<NutritionistPartnershipFormData>,
    'schema' | 'fields' | 'formType'
  > {
  /**
   * Masquer certains champs (optionnel)
   */
  hiddenFields?: string[];
}

/**
 * Formulaire de candidature pour les nutritionnistes
 *
 * Ce formulaire permet aux nutritionnistes de postuler pour rejoindre
 * la plateforme NutriSensia en fournissant leurs qualifications professionnelles.
 */
export const NutritionistPartnershipForm: React.FC<
  NutritionistPartnershipFormProps
> = ({ hiddenFields = [], ...props }) => {
  // Configuration des champs du formulaire
  const fields = [
    {
      name: 'name',
      label: 'Nom complet',
      type: 'text' as const,
      placeholder: 'Votre nom et prénom',
      required: true,
    },
    {
      name: 'email',
      label: 'Adresse email professionnelle',
      type: 'email' as const,
      placeholder: 'votre.email@exemple.com',
      required: true,
    },
    {
      name: 'phone',
      label: 'Téléphone',
      type: 'tel' as const,
      placeholder: '+41 XX XXX XX XX',
      required: true,
    },
    {
      name: 'professionalTitle',
      label: 'Titre professionnel',
      type: 'text' as const,
      placeholder: 'Ex: Diététicienne diplômée, Nutritionniste clinique',
      required: true,
    },
    {
      name: 'credentials',
      label: 'Certifications et diplômes',
      type: 'multiselect' as const,
      options: NUTRITIONIST_CREDENTIALS,
      description: 'Sélectionnez toutes vos certifications applicables',
      required: true,
    },
    {
      name: 'specializations',
      label: 'Spécialisations',
      type: 'multiselect' as const,
      options: NUTRITIONIST_SPECIALIZATIONS,
      description: "Sélectionnez vos domaines d'expertise (maximum 5)",
      required: true,
    },
    {
      name: 'yearsExperience',
      label: "Années d'expérience",
      type: 'number' as const,
      placeholder: "Nombre d'années de pratique",
      required: true,
    },
    {
      name: 'location',
      label: 'Localisation',
      type: 'text' as const,
      placeholder: 'Ville, Canton',
      description: 'Où exercez-vous principalement ?',
      required: true,
    },
    {
      name: 'currentPractice',
      label: 'Pratique actuelle',
      type: 'textarea' as const,
      placeholder:
        'Décrivez brièvement votre pratique actuelle (cabinet privé, hôpital, freelance, etc.)',
      rows: 3,
    },
    {
      name: 'availabilityHours',
      label: 'Disponibilité hebdomadaire',
      type: 'number' as const,
      placeholder: 'Heures par semaine',
      description:
        "Combien d'heures par semaine pouvez-vous consacrer à la plateforme ?",
      required: true,
    },
    {
      name: 'websiteUrl',
      label: 'Site web professionnel',
      type: 'text' as const,
      placeholder: 'https://votre-site.com',
      description: 'Optionnel',
    },
    {
      name: 'linkedinUrl',
      label: 'Profil LinkedIn',
      type: 'text' as const,
      placeholder: 'https://linkedin.com/in/votre-profil',
      description: 'Optionnel',
    },
    {
      name: 'motivationLetter',
      label: 'Lettre de motivation',
      type: 'textarea' as const,
      placeholder:
        'Expliquez pourquoi vous souhaitez rejoindre NutriSensia, vos objectifs professionnels, et comment vous pourriez contribuer à notre mission...',
      rows: 8,
      required: true,
      description: 'Minimum 100 caractères',
    },
    {
      name: 'message',
      label: 'Informations complémentaires',
      type: 'textarea' as const,
      placeholder: 'Toute autre information que vous souhaitez partager...',
      rows: 4,
    },
    {
      name: 'consent',
      label: 'Consentement',
      type: 'checkbox' as const,
      placeholder:
        "J'accepte que mes données professionnelles soient traitées pour évaluer ma candidature et, le cas échéant, pour créer mon profil sur la plateforme NutriSensia.",
      required: true,
    },
  ].filter(field => !hiddenFields.includes(field.name));

  return (
    <ContactForm<NutritionistPartnershipFormData>
      schema={nutritionistPartnershipSchema}
      fields={fields}
      formType='nutritionist'
      title='Candidature Nutritionniste'
      description='Rejoignez notre réseau de nutritionnistes qualifiés et développez votre pratique avec NutriSensia.'
      submitText='Soumettre ma candidature'
      {...props}
    />
  );
};

export default NutritionistPartnershipForm;
