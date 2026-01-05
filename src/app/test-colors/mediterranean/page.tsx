'use client';

import '@/styles/mediterranean-theme-aggressive.css';
import { ColorReplacer } from './color-replacer';
import { MarketingHeader, MarketingFooter } from '@/components/landing';
import { SmoothScrollProvider } from '@/components/ui/SmoothScrollProvider';
import {
  HeroSection,
  AccordionBenefitsSection,
  HowItWorksSection,
  IsThisForYouSection,
  CTABannerSection,
  AboutMeSection,
  BlogPreviewSection,
  FAQSection,
} from '@/components/landing/home';

export default function TestColorsMediterraneanPage() {
  return (
    <SmoothScrollProvider>
      <ColorReplacer />
      <div className='min-h-screen bg-background'>
        <div className='bg-[#E76F51] text-white py-3 text-center font-semibold'>
          🌊 PAGE DE TEST - Nouvelle palette "Méditerranée" (Turquoise, Sable &
          Terracotta)
        </div>
        <MarketingHeader />
        <main>
          <HeroSection />
          <AccordionBenefitsSection />
          <HowItWorksSection />
          <IsThisForYouSection />
          <CTABannerSection />
          <AboutMeSection />
          <BlogPreviewSection />
          <FAQSection />
        </main>
        <MarketingFooter />
      </div>
    </SmoothScrollProvider>
  );
}
