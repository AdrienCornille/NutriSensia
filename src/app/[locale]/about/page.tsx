'use client';

import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import {
  AboutHeroSection,
  PersonalJourneySection,
  AboutCTABannerSection,
  ExpertiseSection,
  ValuesSection,
  ExpertiseDomainsSection,
  WhyChooseSection,
} from '@/components/landing/about';

export default function AboutPage() {
  return (
    <div className='min-h-screen' style={{ backgroundColor: '#FBF9F7' }}>
      {/* Header Marketing */}
      <MarketingHeader />

      {/* Contenu principal */}
      <main>
        {/* Section Hero personnelle */}
        <AboutHeroSection />

        {/* Section Parcours Personnel */}
        <PersonalJourneySection />

        {/* CTA Banner séparateur */}
        <AboutCTABannerSection />

        {/* Section Expertise */}
        <ExpertiseSection />

        {/* Section Valeurs */}
        <ValuesSection />

        {/* Section Domaines d'Expertise */}
        <ExpertiseDomainsSection />

        {/* Section Pourquoi Choisir NutriSensia */}
        <WhyChooseSection />
      </main>

      {/* Footer Marketing */}
      <MarketingFooter />
    </div>
  );
}
