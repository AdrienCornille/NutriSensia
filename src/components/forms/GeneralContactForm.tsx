'use client';

import React from 'react';
import { ContactForm, ContactFormProps } from './ContactForm';
import {
  generalContactSchema,
  GeneralContactFormData,
  CONTACT_CATEGORIES,
} from '@/lib/contact-schemas';

/**
 * Props du formulaire de contact général
 */
export interface GeneralContactFormProps extends Omit<
  ContactFormProps<GeneralContactFormData>,
  'schema' | 'fields' | 'formType'
> {
  /**
   * Masquer certains champs (optionnel)
   */
  hiddenFields?: string[];
}

/**
 * Formulaire de contact général pour NutriSensia
 *
 * Ce formulaire permet aux visiteurs de contacter l'équipe NutriSensia
 * pour des demandes d'information générales, du support ou des partenariats.
 */
export const GeneralContactForm: React.FC<GeneralContactFormProps> = ({
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
      description: 'Optionnel - pour un contact plus rapide',
    },
    {
      name: 'category',
      label: 'Catégorie de votre demande',
      type: 'select' as const,
      options: CONTACT_CATEGORIES,
      required: true,
    },
    {
      name: 'subject',
      label: 'Sujet',
      type: 'text' as const,
      placeholder: 'Résumé de votre demande',
      required: true,
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea' as const,
      placeholder: 'Décrivez votre demande en détail...',
      rows: 6,
      required: true,
    },
    {
      name: 'consent',
      label: 'Consentement',
      type: 'checkbox' as const,
      placeholder:
        "J'accepte que mes données personnelles soient traitées pour répondre à ma demande, conformément à la politique de confidentialité.",
      required: true,
    },
  ].filter(field => !hiddenFields.includes(field.name));

  return (
    <ContactForm<GeneralContactFormData>
      schema={generalContactSchema}
      fields={fields}
      formType='general'
      title='Contactez-nous'
      description="Vous avez une question ou souhaitez en savoir plus sur NutriSensia ? N'hésitez pas à nous contacter."
      submitText='Envoyer le message'
      {...props}
    />
  );
};

export default GeneralContactForm;
