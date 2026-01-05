'use client';

import React from 'react';
import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';
import HeroSection from './HeroSection';
import PatientSection from './PatientSection';
import NutritionistSection from './NutritionistSection';
import { TestimonialsSection } from './TestimonialsSection';
import SectionNavigation from './SectionNavigation';
import { cn } from '@/lib/utils';

/**
 * Props du composant LandingPage
 */
export interface LandingPageProps {
  /**
   * Classes CSS personnalisées
   */
  className?: string;
}

/**
 * Composant LandingPage complet pour NutriSensia
 *
 * Cette page combine tous les éléments de la landing page :
 * - Section hero avec proposition de valeur
 * - Section dédiée aux patients
 * - Section dédiée aux nutritionnistes
 * - Navigation fluide entre les sections
 *
 * @example
 * ```tsx
 * <LandingPage />
 * ```
 */
export const LandingPage: React.FC<LandingPageProps> = ({ className }) => {
  return (
    <div className={cn('relative', className)}>
      {/* Header de navigation principal */}
      <MarketingHeader />

      {/* Navigation flottante */}
      <SectionNavigation position='fixed' />

      {/* Section Hero - avec padding-top pour compenser le header fixe */}
      <div id='hero' className='pt-72dp md:pt-96dp'>
        <HeroSection />
      </div>

      {/* Section Patients */}
      <PatientSection id='patients' />

      {/* Section Nutritionnistes */}
      <NutritionistSection id='nutritionnistes' />

      {/* Section Témoignages */}
      <TestimonialsSection id='testimonials' />

      {/* Footer complet */}
      <MarketingFooter />
    </div>
  );
};

export default LandingPage;
