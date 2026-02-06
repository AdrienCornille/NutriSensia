'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MarketingHeader } from '../MarketingHeader';
import { MarketingFooter } from '../MarketingFooter';
import { HeroBanner } from './HeroBanner';
import { PrinciplesSection } from './PrinciplesSection';
import { MethodsSection } from './MethodsSection';
import ProcessTimelineCards from '../ProcessTimelineCards';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

/**
 * Interface pour les props de la page L'Approche
 */
export interface ApproachPageWithIntroProps {
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Page complète "L'Approche" de NutriSensia
 *
 * Cette page présente l'approche nutritionnelle complète avec :
 * 0. Hero Banner - Bandeau avec image et titres
 * 1. Principles - Les 3 piliers de l'approche
 * 2. Methods - Les 5 approches thérapeutiques
 * 3. Process Timeline - Comment nous travaillons ensemble (3 étapes)
 *
 * Design :
 * - Mobile-first responsive
 * - Navigation fixe en haut
 * - Hero banner full-width avec image
 * - Sections avec espacement cohérent
 * - Smooth scrolling activé
 * - Footer complet
 *
 * @example
 * ```tsx
 * <ApproachPageWithIntro />
 * ```
 */
export function ApproachPageWithIntro({
  className,
}: ApproachPageWithIntroProps) {
  // Active le smooth scrolling avec momentum (effet mobile)
  useSmoothScroll({
    duration: 1.2, // Durée de l'animation en secondes
    smooth: true, // Active le smooth scrolling
    smoothTouch: false, // Désactive sur mobile pour éviter les conflits
  });

  return (
    <div
      className={cn('relative min-h-screen bg-background-primary', className)}
    >
      {/* Header de navigation principal - fixe en haut */}
      <MarketingHeader />

      {/* Section Hero : Bandeau avec image et titres - tout en haut */}
      <HeroBanner />

      {/* Contenu principal */}
      <main>
        {/* Section 1 : Mes Principes - Les 3 piliers de l'approche */}
        <div id='principles'>
          <PrinciplesSection />
        </div>

        {/* Section 2 : Mes Méthodes - Les 5 approches thérapeutiques */}
        <div id='methods'>
          <MethodsSection />
        </div>

        {/* Section 3 : Comment nous travaillons ensemble - Cartes défilantes */}
        <div id='process'>
          <ProcessTimelineCards />
        </div>
      </main>

      {/* Footer complet - Navigation, Contact, Légal, etc. */}
      <MarketingFooter />
    </div>
  );
}

export default ApproachPageWithIntro;
