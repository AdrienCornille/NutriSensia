'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ScrollAnimation } from '@/components/ui/ScrollAnimation';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Section Hero pour la page "L'Approche" - Version avec animations améliorées
 *
 * Cette section présente l'approche nutritionnelle de NutriSensia avec :
 * - Design centré et épuré (60vh de hauteur)
 * - Gradient subtil de fond (blanc vers vert sage 3%)
 * - Animations séquencées avec ScrollAnimation
 * - Typographie hiérarchisée (Label + H1 + Subheadline + CTA)
 * - Responsive mobile/desktop complet
 * - Éléments décoratifs subtils en arrière-plan
 *
 * @example
 * ```tsx
 * <ApproachHeroSectionAnimated />
 * ```
 */
export function ApproachHeroSectionAnimated() {
  return (
    <section
      id='approach-hero'
      className={cn(
        // Container principal
        'relative',
        'hero-responsive', // Classe responsive centralisée
        'flex items-center justify-center',
        'text-center',
        // Gradient de fond subtil (blanc vers vert sage 3%)
        'bg-gradient-to-b from-white to-[#f8faf9]',
        // Prévention débordement
        'prevent-overflow'
      )}
    >
      {/* Éléments décoratifs subtils en arrière-plan */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Forme décorative subtile - très discrète */}
        <div
          className={cn(
            'absolute top-1/4 left-1/4',
            'w-[300px] h-[300px]',
            'bg-gradient-to-br from-primary/5 to-secondary/5',
            'rounded-full blur-3xl',
            'opacity-50'
          )}
          aria-hidden='true'
        />
        <div
          className={cn(
            'absolute bottom-1/4 right-1/4',
            'w-[400px] h-[400px]',
            'bg-gradient-to-tl from-secondary/3 to-primary/3',
            'rounded-full blur-3xl',
            'opacity-30'
          )}
          aria-hidden='true'
        />
      </div>

      {/* Container de contenu centré */}
      <div
        className={cn('relative z-10', 'max-w-[900px]', 'mx-auto', 'w-full')}
      >
        {/* 1. Label au-dessus du H1 */}
        <ScrollAnimation animation='fadeIn' delay={0}>
          <div
            className={cn(
              // Typographie selon spécifications
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.875rem]',
              'uppercase',
              'tracking-[2px]',
              'font-semibold',
              // Couleur primaire
              'text-primary',
              // Espacement
              'mb-5'
            )}
          >
            MON APPROCHE
          </div>
        </ScrollAnimation>

        {/* 2. Titre principal (H1) */}
        <ScrollAnimation animation='fadeSlideUp' delay={0.1}>
          <h1
            className={cn(
              // Typographie Playfair Display selon spécifications
              "font-['Playfair_Display',Georgia,serif]",
              'responsive-h1', // Classe responsive centralisée
              'font-bold',
              // Couleur primaire foncée
              'text-[#2C3E3C]',
              // Centrage et largeur max
              'text-center',
              'max-w-[800px]',
              'mx-auto',
              // Espacement
              'margin-responsive'
            )}
          >
            Une Approche Nutritionnelle Qui Respecte Votre Corps et Votre Vie
          </h1>
        </ScrollAnimation>

        {/* 3. Sous-titre descriptif */}
        <ScrollAnimation animation='fadeSlideUp' delay={0.2}>
          <p
            className={cn(
              // Typographie Inter selon spécifications
              "font-['Inter',system-ui,sans-serif]",
              'responsive-body', // Classe responsive centralisée
              'font-normal',
              // Couleur secondaire
              'text-[#667674]',
              // Centrage et largeur max
              'text-center',
              'max-w-[700px]',
              'mx-auto',
              // Espacement
              'mb-10'
            )}
          >
            Fini les régimes restrictifs qui ne fonctionnent pas. Place à une
            méthode scientifique, personnalisée et bienveillante.
          </p>
        </ScrollAnimation>

        {/* 4. CTA Button */}
        <ScrollAnimation animation='fadeSlideUp' delay={0.3}>
          <div className='flex justify-center'>
            <motion.div
              whileHover={{
                scale: 1.02,
                y: -2,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant='primary'
                size='lg'
                className={cn(
                  // Responsive button avec cibles tactiles
                  'button-responsive',
                  'touch-target',
                  // Animations hover standards du design system
                  'transition-all duration-300 ease-out',
                  'hover:shadow-lg',
                  // Focus pour accessibilité
                  'focus:ring-2 focus:ring-primary focus:ring-offset-2'
                )}
                onClick={() => {
                  // Scroll vers section contact ou ouvrir modal
                  const contactSection = document.querySelector('#contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Calendar className='w-5 h-5 mr-2' aria-hidden='true' />
                Réserver Ma Consultation Découverte
              </Button>
            </motion.div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}

export default ApproachHeroSectionAnimated;
