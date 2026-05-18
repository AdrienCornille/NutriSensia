'use client';

import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { SmoothScrollProvider } from '@/components/ui/SmoothScrollProvider';
import {
  AboutHeroSection,
  PersonalJourneySection,
  AboutCTABannerSection,
  ExpertiseSection,
  ValuesSection,
  ExpertiseDomainsSection,
} from '@/components/landing/about';

export default function AboutPage() {
  return (
    <SmoothScrollProvider>
      <div
        className='ns2 relative min-h-screen'
        style={{ backgroundColor: 'var(--ns-cream-100)' }}
      >
        <MarketingHeader />
        <main>
          <AboutHeroSection />
          <PersonalJourneySection />
          <AboutCTABannerSection />
          <ExpertiseSection />
          <ValuesSection />
          <ExpertiseDomainsSection />
        </main>
        <MarketingFooter />
      </div>
    </SmoothScrollProvider>
  );
}
