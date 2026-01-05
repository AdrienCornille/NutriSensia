'use client';

import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { SmoothScrollProvider } from '@/components/ui/SmoothScrollProvider';
import { PlatformHeroSection } from './PlatformHeroSection';
import { PlatformFeaturesHorizontal } from './PlatformFeaturesHorizontal';
import { PlatformBonusSection } from './PlatformBonusSection';
import { PlatformMultiDeviceSection } from './PlatformMultiDeviceSection';
import { PlatformFAQSection } from './PlatformFAQSection';
import { PlatformFinalCTASection } from './PlatformFinalCTASection';

/**
 * Page complète La Plateforme
 *
 * Présente la plateforme digitale NutriSensia avec une section hero impressionnante,
 * une section problème pour l'identification, et un showcase détaillé des 6 fonctionnalités
 * principales dans un design moderne et engageant.
 * Inclut le header et footer marketing.
 */
export function PlatformPage() {
  return (
    <SmoothScrollProvider>
      <div className='relative min-h-screen bg-background'>
        {/* Header de navigation - fixe en haut */}
        <MarketingHeader />

        {/* Contenu principal */}
        <main>
          {/* Section Hero - Nouvelle section impressionnante */}
          <PlatformHeroSection />

          {/* Ligne séparatrice de section */}
          <div
            style={{
              height: '4px',
              backgroundColor: '#E5DED6' /* Beige Sand - Méditerranée */,
              width: '100%',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          />

          {/* Section Fonctionnalités - Scroll horizontal style Apple */}
          <PlatformFeaturesHorizontal />

          {/* Section Bonus - Fonctionnalités supplémentaires incluses */}
          <PlatformBonusSection />

          {/* Section Multi-Device - Compatibilité tous appareils */}
          <PlatformMultiDeviceSection />

          {/* Section CTA - Bande violette */}
          <PlatformFinalCTASection />

          {/* Section FAQ - Questions fréquentes sur la plateforme */}
          <PlatformFAQSection />
        </main>

        {/* Footer complet */}
        <MarketingFooter />
      </div>
    </SmoothScrollProvider>
  );
}
