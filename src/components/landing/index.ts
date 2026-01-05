/**
 * Composants de la landing page NutriSensia
 *
 * Ce module exporte tous les composants utilisés pour créer
 * une landing page moderne et optimisée pour la conversion.
 */

// Navigation principale du site vitrine
export { MarketingHeader } from './MarketingHeader';

// Footer complet du site vitrine
export { MarketingFooter } from './MarketingFooter';

export { default as HeroSection } from './HeroSection';
export type { HeroSectionProps } from './HeroSection';

export { default as PatientSection } from './PatientSection';
export type { PatientSectionProps } from './PatientSection';

export { default as NutritionistSection } from './NutritionistSection';
export type { NutritionistSectionProps } from './NutritionistSection';

export { default as SectionNavigation } from './SectionNavigation';
export type { SectionNavigationProps } from './SectionNavigation';
export { useSectionNavigation } from './SectionNavigation';

export { default as LandingPage } from './LandingPage';
export type { LandingPageProps } from './LandingPage';

// Composants de la page "L'Approche"
export { ApproachHeroSection } from './approach';
export { default as ProcessTimeline } from './ProcessTimeline';

// Exports pour faciliter l'utilisation
export { HeroSection as Hero } from './HeroSection';
export { PatientSection as Patients } from './PatientSection';
export { NutritionistSection as Nutritionists } from './NutritionistSection';
