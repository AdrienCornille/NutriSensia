'use client';

import React from 'react';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import {
  PrestationsSection,
  RemboursementBanner,
  ModalitesSection,
  PricingFAQSection,
} from '@/components/landing/pricing';

/**
 * Page Prix — DS v2.
 * Wrapped in `.ns2` so descendant base styles (cream bg, ink fg, Inter body,
 * Fraunces on h1-h4) apply throughout. Sections are extracted into
 * `src/components/landing/pricing/` for clarity and reuse.
 */
export default function PrixPage() {
  return (
    <div
      className='ns2 min-h-screen'
      style={{ backgroundColor: 'var(--ns-cream-100)' }}
    >
      <MarketingHeader />
      <main>
        <PrestationsSection />
        <RemboursementBanner />
        <ModalitesSection />
        <PricingFAQSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
