'use client';

import '@/styles/terra-theme-aggressive.css';
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

export default function TestColorsTerraPage() {
  return (
    <SmoothScrollProvider>
      <ColorReplacer />
      <div className='min-h-screen bg-background'>
        <div className='bg-[#C17A58] text-white py-3 text-center font-semibold'>
          🌾 PAGE DE TEST - Nouvelle palette "Terra Natura" (Tons Terre &
          Naturels)
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
