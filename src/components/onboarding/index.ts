/**
 * Export principal des composants d'onboarding
 * Point d'entrée pour tous les types d'onboarding (nutritionniste, patient, admin)
 */

// Composants de base
export { WizardLayout, WizardStep, WizardTip } from './WizardLayout';
export { StepIndicator } from './StepIndicator';

// Onboarding nutritionnistes
export * from './nutritionist';
export * from './patient';

// Éléments visuels et animations
export * from './illustrations';
export * from './animations';
export * from './tours';
export * from './enhanced';

// Configuration des animations
export * from './config/AnimationConfig';

// Hook principal
export { useOnboardingProgress } from '@/hooks/useOnboardingProgress';

// Types et schémas (exports spécifiques pour éviter les conflits)
export type {
  OnboardingStep,
  OnboardingData,
  OnboardingProgress,
  OnboardingStepInfo,
  UseOnboarding,
  OnboardingEvent,
  OnboardingMetrics
} from '@/types/onboarding';

export {
  getStepSchema,
  getCompleteSchema
} from '@/lib/onboarding-schemas';

// Utilitaires
export const ONBOARDING_ROUTES = {
  nutritionist: '/onboarding/nutritionist',
  patient: '/onboarding/patient', 
  admin: '/onboarding/admin',
} as const;

/**
 * Obtenir la route d'onboarding appropriée selon le rôle
 */
export const getOnboardingRoute = (role: string): string => {
  switch (role) {
    case 'nutritionist':
      return ONBOARDING_ROUTES.nutritionist;
    case 'patient':
      return ONBOARDING_ROUTES.patient;
    case 'admin':
      return ONBOARDING_ROUTES.admin;
    default:
      return '/dashboard';
  }
};
