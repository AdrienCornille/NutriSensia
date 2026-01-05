'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MarketingHeader } from '../MarketingHeader';
import { MarketingFooter } from '../MarketingFooter';
import { ApproachHeroSectionAnimated } from './ApproachHeroSectionAnimated';
import { PersonalStorySection } from './PersonalStorySection';
import { PhilosophySection } from './PhilosophySection';
import { MethodologySectionResponsive } from './MethodologySectionResponsive';
import { DifferentiationSection } from './DifferentiationSection';
import { MethodsSection } from './MethodsSection';
import { ExpectationsSection } from './ExpectationsSection';
import { FinalCTASectionResponsive } from './FinalCTASectionResponsive';

export interface ApproachPageResponsiveProps {
  className?: string;
}

/**
 * Page L'Approche - Version Responsive Complète
 *
 * Cette page intègre toutes les sections avec un design responsive
 * optimisé selon les spécifications du système de breakpoints.
 *
 * Features:
 * - Breakpoints: Mobile < 768px, Tablet 768-1024px, Desktop >= 1024px
 * - Typographie adaptative selon les spécifications
 * - Layouts adaptatifs pour chaque section
 * - Cibles tactiles 44px minimum
 * - Animations optimisées pour mobile
 * - Navigation sticky responsive
 * - Débordements prévenus
 *
 * @example
 * ```tsx
 * <ApproachPageResponsive />
 * ```
 */
export function ApproachPageResponsive({
  className,
}: ApproachPageResponsiveProps) {
  return (
    <div
      className={cn(
        'relative min-h-screen',
        'bg-background-primary',
        'prevent-overflow', // Prévient les débordements horizontaux
        className
      )}
    >
      {/* Header Marketing Responsive */}
      <MarketingHeader />

      {/* Contenu principal avec padding-top pour compenser le header flotant */}
      <main
        className={cn(
          'header-responsive', // Padding-top responsive selon la hauteur du header
          'pt-20 md:pt-20 max-md:pt-16' // Ajustement fin selon les breakpoints
        )}
      >
        {/* Section 1 : Hero - Introduction à l'approche */}
        <ApproachHeroSectionAnimated />

        {/* Section 2 : Mon Parcours - Histoire personnelle */}
        <PersonalStorySection />

        {/* Section 3 : Mes Principes - Les 3 piliers de l'approche */}
        <PhilosophySection />

        {/* Section 4 : Comment Ça Marche - Processus en 4 étapes */}
        <MethodologySectionResponsive />

        {/* Section 5 : Ma Différence - 4 différenciateurs clés */}
        <DifferentiationSection />

        {/* Section 6 : Mes Méthodes - Outils thérapeutiques */}
        <MethodsSection />

        {/* Section 7 : À Quoi S'Attendre - Première consultation */}
        <ExpectationsSection />

        {/* Section 8 : CTA Finale - Appel à l'action convaincant */}
        <FinalCTASectionResponsive />
      </main>

      {/* Footer Marketing */}
      <MarketingFooter />
    </div>
  );
}

export default ApproachPageResponsive;
