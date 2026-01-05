'use client';

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

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div className='min-h-screen bg-background'>
        <MarketingHeader />
        <main>
          {/* 1 - Hero (critique - chargement immédiat) */}
          <HeroSection />
          {/* 2 - Une approche qui respecte votre vie (critique - chargement immédiat) */}
          <AccordionBenefitsSection />
          {/* 3 - Comment nous vous accompagnons (lazy) */}
          <HowItWorksSection />
          {/* 4 - Les troubles que nous accompagnons (lazy) */}
          <IsThisForYouSection />
          {/* CTA Banner séparateur (lazy) */}
          <CTABannerSection />
          {/* 5 - Pourquoi nous faire confiance ? (lazy) */}
          <AboutMeSection />
          {/* 6 - Nos derniers articles de blog (lazy) */}
          <BlogPreviewSection />
          {/* 7 - FAQ (lazy) */}
          <FAQSection />
        </main>
        <MarketingFooter />
      </div>
    </SmoothScrollProvider>
  );
}
