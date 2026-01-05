'use client';

import React from 'react';
import { ContactForm, ContactFormProps } from './ContactForm';
import {
  patientContactSchema,
  PatientContactFormData,
  CONSULTATION_TYPES,
  URGENCY_LEVELS,
  CONTACT_PREFERENCES,
} from '@/lib/contact-schemas';

/**
 * Props du formulaire de contact patient
 */
export interface PatientContactFormProps
  extends Omit<
    ContactFormProps<PatientContactFormData>,
    'schema' | 'fields' | 'formType'
  > {
  /**
   * Masquer certains champs (optionnel)
   */
  hiddenFields?: string[];
}

/**
 * Formulaire de contact spécialisé pour les patients
 *
 * Ce formulaire permet aux patients de prendre contact avec des nutritionnistes
 * et de fournir des informations spécifiques à leurs besoins de santé.
 */
export const PatientContactForm: React.FC<PatientContactFormProps> = ({
  hiddenFields = [],
  ...props
}) => {
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
      label: 'Adresse email',
      type: 'email' as const,
      placeholder: 'votre.email@exemple.com',
      required: true,
    },
    {
      name: 'phone',
      label: 'Téléphone',
      type: 'tel' as const,
      placeholder: '+41 XX XXX XX XX',
      description: 'Recommandé pour un contact rapide',
    },
    {
      name: 'age',
      label: 'Âge',
      type: 'number' as const,
      placeholder: 'Votre âge',
      description: 'Optionnel - aide à personnaliser les conseils',
    },
    {
      name: 'consultationType',
      label: 'Type de consultation souhaité',
      type: 'select' as const,
      options: CONSULTATION_TYPES,
      required: true,
    },
    {
      name: 'urgency',
      label: "Niveau d'urgence",
      type: 'radio' as const,
      options: URGENCY_LEVELS,
      required: true,
    },
    {
      name: 'healthConditions',
      label: 'Conditions de santé particulières',
      type: 'textarea' as const,
      placeholder:
        'Décrivez brièvement vos conditions de santé, allergies, ou traitements en cours...',
      rows: 4,
      description:
        'Ces informations aident le nutritionniste à mieux vous accompagner',
    },
    {
      name: 'insuranceInfo',
      label: "Informations d'assurance",
      type: 'textarea' as const,
      placeholder:
        'Nom de votre assurance complémentaire, numéro de police (optionnel)...',
      rows: 3,
      description: 'Pour vérifier la prise en charge de vos consultations',
    },
    {
      name: 'preferredContact',
      label: 'Préférence de contact',
      type: 'radio' as const,
      options: CONTACT_PREFERENCES,
      required: true,
    },
    {
      name: 'message',
      label: 'Message détaillé',
      type: 'textarea' as const,
      placeholder:
        'Décrivez vos objectifs nutritionnels, vos habitudes alimentaires actuelles, ou toute autre information pertinente...',
      rows: 6,
      required: true,
    },
    {
      name: 'consent',
      label: 'Consentement',
      type: 'checkbox' as const,
      placeholder:
        "J'accepte que mes données personnelles et de santé soient traitées de manière confidentielle pour répondre à ma demande et me mettre en relation avec un nutritionniste qualifié.",
      required: true,
    },
  ].filter(field => !hiddenFields.includes(field.name));

  return (
    <ContactForm<PatientContactFormData>
      schema={patientContactSchema}
      fields={fields}
      formType='patient'
      title='Demande de consultation nutritionnelle'
      description='Remplissez ce formulaire pour être mis en relation avec un nutritionniste qualifié qui répondra à vos besoins spécifiques.'
      submitText='Demander une consultation'
      {...props}
    />
  );
};

export default PatientContactForm;
