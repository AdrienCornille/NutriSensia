'use client';

import React from 'react';
import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';
import {
  HeroSection,
  MyApproachSection,
  HowItWorksSection,
  ProcessSection,
  WhyNutriSensiaSection,
  SpecializationsSection,
  InsuranceSection,
  FreeTrialSection,
  FAQSection,
  FinalCTASection,
} from './home';
import { cn } from '@/lib/utils';

/**
 * Props du composant HomePage
 */
export interface HomePageProps {
  /**
   * Classes CSS personnalisées
   */
  className?: string;
}

/**
 * Page d'accueil complète de NutriSensia
 *
 * Cette page présente l'ensemble de l'offre nutritionnelle :
 * 1. Hero Section - Proposition de valeur principale
 * 2. Vous Vous Reconnaissez ? - Identification des besoins
 * 3. Mon Approche - Expertise et parcours
 * 4. Le Processus - Parcours d'accompagnement
 * 5. Pourquoi NutriSensia ? - Différenciateurs
 * 6. La Plateforme - Fonctionnalités digitales
 * 7. Mes Spécialisations - Domaines d'expertise
 * 8. Remboursement Assurance - Prise en charge
 * 9. Essai Gratuit - Test de l'offre
 * 10. FAQ - Questions fréquentes
 * 11. CTA Finale - Appel à l'action
 *
 * Design :
 * - Mobile-first responsive
 * - Navigation fixe en haut
 * - Sections avec espacement cohérent
 * - Footer complet
 *
 * @example
 * ```tsx
 * <HomePage />
 * ```
 */
export function HomePage({ className }: HomePageProps) {
  return (
    <div
      className={cn('relative min-h-screen bg-background-primary', className)}
    >
      {/* Header de navigation principal - fixe en haut */}
      <MarketingHeader />

      {/* Contenu principal - avec padding-top pour compenser le header flotant */}
      <main className='pt-20'>
        {/* Section 1 : Hero - Au-dessus de la ligne de flottaison */}
        <HeroSection />

        {/* Section 2 : Vous vous reconnaissez ? */}
        <HowItWorksSection />

        {/* Section 3 : Mon Approche */}
        <MyApproachSection />

        {/* Section 4 : Le Processus */}
        <ProcessSection />

        {/* Section 5 : Pourquoi NutriSensia ? */}
        <WhyNutriSensiaSection />

        {/* Section 6 : Mes Spécialisations */}
        <SpecializationsSection />

        {/* Section 8 : Remboursement Assurance */}
        <InsuranceSection />

        {/* Section 9 : Essai Gratuit 7 Jours */}
        <FreeTrialSection />

        {/* Section 10 : FAQ Rapides */}
        <FAQSection />

        {/* Section 11 : CTA Finale */}
        <FinalCTASection />
      </main>

      {/* Footer complet - Navigation, Contact, Légal, etc. */}
      <MarketingFooter />
    </div>
  );
}

export default HomePage;
