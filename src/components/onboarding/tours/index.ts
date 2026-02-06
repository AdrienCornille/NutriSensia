/**
 * Index des tours guidés pour l'onboarding
 *
 * Note: OnboardingTour (react-joyride) est désactivé car incompatible avec React 18+/Next.js 15
 * Utiliser SimpleTour à la place qui est une implémentation maison sans dépendances problématiques
 */

// OnboardingTour désactivé - react-joyride utilise des APIs React deprecated
// export { OnboardingTour, useOnboardingTour } from './OnboardingTours';

export { SimpleTour, useSimpleTour, TourHelpButton } from './SimpleTour';
