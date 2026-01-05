'use client';

import '@/styles/ocean-theme-aggressive.css'; // Import du thème "Deep Ocean" (CSS agressif)
import { ColorReplacer } from './color-replacer'; // Remplacer les couleurs dynamiquement
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

/**
 * PAGE DE TEST POUR NOUVELLES COULEURS
 *
 * Cette page est une copie de la page d'accueil pour tester
 * la nouvelle palette de couleurs "Deep Ocean" (tons bleu-marine).
 *
 * Palette proposée :
 * - Primaire: #2C5282 (Bleu marine profond)
 * - Primaire sombre: #1E3A5F
 * - Secondaire: #5A7BA6 (Bleu clair)
 * - Secondaire pâle: #E8EEF5
 * - Sage: #B8C8DC
 * - Accent Teal: #3B7EA1
 * - Accent Mint: #7FA9C9
 * - Accent Coral: #E87A5D
 *
 * Pour activer cette palette, vous devrez :
 * 1. Créer un fichier tailwind.config.test.ts avec la nouvelle palette
 * 2. Modifier les composants pour utiliser les nouvelles couleurs
 * 3. Comparer visuellement avec la page d'accueil actuelle
 */

export default function TestColorsPage() {
  return (
    <SmoothScrollProvider>
      <ColorReplacer />
      <div className='min-h-screen bg-background'>
        {/* Banner d'avertissement pour indiquer qu'il s'agit d'une page de test */}
        <div className='bg-[#3B7EA1] text-white py-3 text-center font-semibold'>
          🎨 PAGE DE TEST - Nouvelle palette "Deep Ocean" (Bleu Marine)
        </div>

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
