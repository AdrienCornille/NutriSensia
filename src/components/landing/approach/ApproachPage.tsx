'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MarketingHeader } from '../MarketingHeader';
import { MarketingFooter } from '../MarketingFooter';
import { ApproachHeroSectionAnimated } from './ApproachHeroSectionAnimated';
import { PersonalStorySection } from './PersonalStorySection';
import { PhilosophySection } from './PhilosophySection';
import { MethodologySection } from './MethodologySection';
import { DifferentiationSection } from './DifferentiationSection';
import { MethodsSection } from './MethodsSection';
import { ExpectationsSection } from './ExpectationsSection';
import { FinalCTASection } from './FinalCTASection';

/**
 * Interface pour les props de la page L'Approche
 */
export interface ApproachPageProps {
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Page complète "L'Approche" de NutriSensia
 *
 * Cette page présente l'approche nutritionnelle complète avec :
 * 1. Hero Section - Introduction à l'approche
 * 2. [Futures sections à ajouter selon les prompts suivants]
 *
 * Design :
 * - Mobile-first responsive
 * - Navigation fixe en haut
 * - Sections avec espacement cohérent
 * - Footer complet
 *
 * @example
 * ```tsx
 * <ApproachPage />
 * ```
 */
export function ApproachPage({ className }: ApproachPageProps) {
  return (
    <div
      className={cn('relative min-h-screen bg-background-primary', className)}
    >
      {/* Header de navigation principal - fixe en haut */}
      <MarketingHeader />

      {/* Contenu principal - avec padding-top pour compenser le header flotant */}
      <main className='pt-20'>
        {/* Section 1 : Hero - Introduction à l'approche */}
        <ApproachHeroSectionAnimated />

        {/* Section 2 : Mon Parcours - Histoire personnelle */}
        <PersonalStorySection />

        {/* Section 3 : Mes Principes - Les 3 piliers de l'approche */}
        <PhilosophySection />

        {/* Section 4 : Comment Ça Marche - Processus en 4 étapes */}
        <MethodologySection />

        {/* Section 5 : Ma Différence - Les 4 différenciateurs clés */}
        <DifferentiationSection />

        {/* Section 6 : Mes Méthodes - Les 5 approches thérapeutiques */}
        <MethodsSection />

        {/* Section 7 : À Quoi S'Attendre - Déroulement première consultation */}
        <ExpectationsSection />

        {/* Section 8 : CTA Finale - Appel à l'action pour conversion */}
        <FinalCTASection />
      </main>

      {/* Footer complet - Navigation, Contact, Légal, etc. */}
      <MarketingFooter />
    </div>
  );
}

export default ApproachPage;
