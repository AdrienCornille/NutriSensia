'use client';

import React from 'react';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { SmoothScrollProvider } from '@/components/ui/SmoothScrollProvider';
import {
  CalculatorHeroSection,
  CalculatorFormSection,
} from '@/components/landing/calculator';

/**
 * Page Calculateur de Calories - NutriSensia
 *
 * Page gratuite permettant aux utilisateurs de calculer leurs besoins caloriques
 * en utilisant la formule scientifique Mifflin-St Jeor.
 *
 * URL: /calculateur-calories (FR) | /en/calorie-calculator (EN)
 *
 * Sections:
 * 1. Hero - "Arrêtez de manger au hasard"
 * 2. Calculateur - Formulaire interactif + affichage résultats
 * 3. Et maintenant? - CTA avec formulaire email pour guide gratuit
 *
 * Design: Palette Méditerranée
 * - Turquoise Azur: #1B998B
 * - Terracotta: #E76F51
 * - Beige Sand: #E5DED6
 * - Warm Cream: #FBF9F7
 */
export default function CalorieCalculatorPage() {
  return (
    <SmoothScrollProvider>
      <div className='min-h-screen' style={{ backgroundColor: '#FBF9F7' }}>
        <MarketingHeader />

        <main>
          {/* Section Hero - Fond crème */}
          <CalculatorHeroSection />

          {/* Séparateur */}
          <div
            style={{
              width: '100%',
              maxWidth: '800px',
              height: '1px',
              backgroundColor: '#E5DED6',
              margin: '0 auto',
            }}
          />

          {/* Section Calculateur - Fond blanc */}
          <CalculatorFormSection />
        </main>

        <MarketingFooter />
      </div>
    </SmoothScrollProvider>
  );
}
