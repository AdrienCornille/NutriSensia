'use client';

import React from 'react';
import { ContactForm, ContactFormProps } from './ContactForm';
import {
  demoRequestSchema,
  DemoRequestFormData,
  DEMO_SPECIALIZATIONS,
  EXPERIENCE_LEVELS,
} from '@/lib/contact-schemas';

/**
 * Props du formulaire de demande de démo
 */
export interface DemoRequestFormProps extends Omit<
  ContactFormProps<DemoRequestFormData>,
  'schema' | 'fields' | 'formType'
> {
  /**
   * Masquer certains champs (optionnel)
   */
  hiddenFields?: string[];
}

/**
 * Formulaire de demande de démonstration
 *
 * Ce formulaire simplifié permet aux nutritionnistes intéressés de demander
 * une démonstration de la plateforme NutriSensia.
 */
export const DemoRequestForm: React.FC<DemoRequestFormProps> = ({
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
      description: 'Pour planifier la démonstration',
    },
    {
      name: 'specialization',
      label: 'Spécialisation principale',
      type: 'select' as const,
      options: DEMO_SPECIALIZATIONS,
      required: true,
    },
    {
      name: 'experience',
      label: "Années d'expérience",
      type: 'select' as const,
      options: EXPERIENCE_LEVELS,
      required: true,
    },
    {
      name: 'message',
      label: 'Message (optionnel)',
      type: 'textarea' as const,
      placeholder:
        'Parlez-nous de vos besoins spécifiques ou des fonctionnalités qui vous intéressent le plus...',
      rows: 4,
      description: 'Cela nous aide à personnaliser la démonstration',
    },
    {
      name: 'consent',
      label: 'Consentement',
      type: 'checkbox' as const,
      placeholder:
        "J'accepte d'être contacté par l'équipe NutriSensia pour planifier une démonstration personnalisée.",
      required: true,
    },
  ].filter(field => !hiddenFields.includes(field.name));

  return (
    <ContactForm<DemoRequestFormData>
      schema={demoRequestSchema}
      fields={fields}
      formType='demo'
      title='Demander une démonstration'
      description='Découvrez comment NutriSensia peut transformer votre pratique nutritionnelle avec une démonstration personnalisée.'
      submitText='Demander une démo'
      {...props}
    />
  );
};

export default DemoRequestForm;
