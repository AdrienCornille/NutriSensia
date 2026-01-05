/**
 * Index des composants d'onboarding pour les patients
 * Exporte tous les composants nécessaires à l'onboarding des patients
 */

// Composant principal
export { PatientOnboardingWizard } from './PatientOnboardingWizard';

// Étapes individuelles
export { WelcomeStep } from './steps/WelcomeStep';
export { PersonalInfoStep } from './steps/PersonalInfoStep';
export { HealthProfileStep } from './steps/HealthProfileStep';
export { HealthGoalsStep } from './steps/HealthGoalsStep';
export { DietaryInfoStep } from './steps/DietaryInfoStep';
export { MedicalInfoStep } from './steps/MedicalInfoStep';
export { LifestyleStep } from './steps/LifestyleStep';
export { AppTourStep } from './steps/AppTourStep';
export { CompletionStep } from './steps/CompletionStep';

// Types spécifiques aux patients
export type {
  PatientOnboardingData,
  PatientOnboardingStep,
} from '@/types/onboarding';
