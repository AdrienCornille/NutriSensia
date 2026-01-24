/**
 * Point d'entrée pour tous les composants de profil et de suivi de complétude
 *
 * Ce fichier exporte tous les composants et hooks liés au système de suivi
 * de complétude du profil pour faciliter leur importation dans l'application.
 */

// Composants principaux de complétude de profil
export { ProfileCompletionCard } from './ProfileCompletionCard';
export { ProfileProgressBar } from './ProfileProgressBar';
export { ProfileOnboardingGuide } from './ProfileOnboardingGuide';
export { ProfilePrivacySettings } from './ProfilePrivacySettings';
export { ProfileCompletionDashboard } from './ProfileCompletionDashboard';

// Composants de la page Profil & Paramètres
export { ProfileHeader } from './ProfileHeader';
export { ProfileTabs } from './ProfileTabs';
export { ProfileSidebar } from './ProfileSidebar';
export { ProfileSection } from './ProfileSection';
export { SecuritySection } from './SecuritySection';
export { NotificationsSection } from './NotificationsSection';
export { IntegrationsSection } from './IntegrationsSection';
export { PreferencesSection } from './PreferencesSection';
export { DataSection } from './DataSection';
export { BadgesSection } from './BadgesSection';

// Modals
export { EditFieldModal } from './EditFieldModal';
export { PasswordModal } from './PasswordModal';
export { TwoFactorModal } from './TwoFactorModal';
export { ExportDataModal } from './ExportDataModal';
export { DeleteAccountModal } from './DeleteAccountModal';

// UI Components
export { NotificationToggle } from './NotificationToggle';

// Hooks
export {
  useProfileCompletion,
  useProfileCompletionPercentage,
  useCriticalMissingFields,
  useProfileLevelCheck,
} from '@/hooks/useProfileCompletion';

// Types et utilitaires
export type {
  ProfileCompletion,
  UserRole,
  ProfileData,
} from '@/lib/profile-completion';

export {
  calculateProfileCompletion,
  getRequiredFieldsForLevel,
  estimateCompletionTime,
} from '@/lib/profile-completion';
