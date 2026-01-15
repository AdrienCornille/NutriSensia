'use client';

import dynamic from 'next/dynamic';
import { MarketingHeader, MarketingFooter } from '@/components/landing';
import { SmoothScrollProvider } from '@/components/ui/SmoothScrollProvider';
// Sections critiques (above the fold) - chargement immédiat
import { HeroSection, AccordionBenefitsSection } from '@/components/landing/home';

// Sections below the fold - lazy loading pour améliorer les performances
const HowItWorksSection = dynamic(
  () => import('@/components/landing/home/HowItWorksSection').then(mod => ({ default: mod.HowItWorksSection })),
  { ssr: true }
);
const IsThisForYouSection = dynamic(
  () => import('@/components/landing/home/IsThisForYouSection').then(mod => ({ default: mod.IsThisForYouSection })),
  { ssr: true }
);
const CTABannerSection = dynamic(
  () => import('@/components/landing/home/CTABannerSection').then(mod => ({ default: mod.CTABannerSection })),
  { ssr: true }
);
const AboutMeSection = dynamic(
  () => import('@/components/landing/home/AboutMeSection').then(mod => ({ default: mod.AboutMeSection })),
  { ssr: true }
);
const BlogPreviewSection = dynamic(
  () => import('@/components/landing/home/BlogPreviewSection').then(mod => ({ default: mod.BlogPreviewSection })),
  { ssr: true }
);
const FAQSection = dynamic(
  () => import('@/components/landing/home/FAQSection').then(mod => ({ default: mod.FAQSection })),
  { ssr: true }
);

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
