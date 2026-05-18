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
 * Page complète La Plateforme (DS v2 — Editorial sage/cream/peps)
 */
export function PlatformPage() {
  return (
    <SmoothScrollProvider>
      <div
        className='ns2 relative min-h-screen'
        style={{ backgroundColor: 'var(--ns-cream-100)' }}
      >
        <MarketingHeader />
        <main>
          <PlatformHeroSection />
          <PlatformFeaturesHorizontal />
          <PlatformBonusSection />
          <PlatformMultiDeviceSection />
          <PlatformFinalCTASection />
          <PlatformFAQSection />
        </main>
        <MarketingFooter />
      </div>
    </SmoothScrollProvider>
  );
}
