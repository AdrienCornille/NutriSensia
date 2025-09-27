/**
 * Point d'entrée pour tous les composants de profil et de suivi de complétude
 * 
 * Ce fichier exporte tous les composants et hooks liés au système de suivi
 * de complétude du profil pour faciliter leur importation dans l'application.
 */

// Composants principaux
export { ProfileCompletionCard } from './ProfileCompletionCard';
export { ProfileProgressBar } from './ProfileProgressBar';
export { ProfileOnboardingGuide } from './ProfileOnboardingGuide';
export { ProfilePrivacySettings } from './ProfilePrivacySettings';
export { ProfileCompletionDashboard } from './ProfileCompletionDashboard';

// Hooks
export { 
  useProfileCompletion,
  useProfileCompletionPercentage,
  useCriticalMissingFields,
  useProfileLevelCheck
} from '@/hooks/useProfileCompletion';

// Types et utilitaires
export type { 
  ProfileCompletion,
  UserRole,
  ProfileData
} from '@/lib/profile-completion';

export {
  calculateProfileCompletion,
  getRequiredFieldsForLevel,
  estimateCompletionTime
} from '@/lib/profile-completion';



