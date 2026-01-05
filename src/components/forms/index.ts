/**
 * Composants de formulaires de contact NutriSensia
 *
 * Ce module exporte tous les composants de formulaires avec validation,
 * protection anti-spam et accessibilité intégrées.
 */

// Composant de base
export { ContactForm } from './ContactForm';
export type { ContactFormProps } from './ContactForm';

// Formulaires spécialisés
export { GeneralContactForm } from './GeneralContactForm';
export type { GeneralContactFormProps } from './GeneralContactForm';

export { PatientContactForm } from './PatientContactForm';
export type { PatientContactFormProps } from './PatientContactForm';

export { NutritionistPartnershipForm } from './NutritionistPartnershipForm';
export type { NutritionistPartnershipFormProps } from './NutritionistPartnershipForm';

export { DemoRequestForm } from './DemoRequestForm';
export type { DemoRequestFormProps } from './DemoRequestForm';

// Schémas et types
export * from '@/lib/contact-schemas';
