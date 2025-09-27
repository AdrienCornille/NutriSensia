/**
 * Export des composants d'onboarding pour les nutritionnistes
 * Point d'entrée principal pour l'onboarding des professionnels de la nutrition
 */

// Composant principal
export { NutritionistOnboardingWizard } from './NutritionistOnboardingWizard';

// Étapes individuelles
export { WelcomeStep } from './steps/WelcomeStep';
export { PersonalInfoStep } from './steps/PersonalInfoStep';
export { CredentialsStep } from './steps/CredentialsStep';
export { PracticeDetailsStep } from './steps/PracticeDetailsStep';
export { SpecializationsStep } from './steps/SpecializationsStep';
export { ConsultationRatesStep } from './steps/ConsultationRatesStep';
export { PlatformTrainingStep } from './steps/PlatformTrainingStep';
export { CompletionStep } from './steps/CompletionStep';

// Types et interfaces
export type {
  NutritionistOnboardingData,
  NutritionistOnboardingStep,
} from '@/types/onboarding';

// Schémas de validation
export {
  nutritionistOnboardingSchema,
  nutritionistCredentialsSchema,
  nutritionistExpertiseSchema,
  practiceDetailsSchema,
  consultationRatesSchema,
} from '@/lib/onboarding-schemas';

