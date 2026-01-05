'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ScrollAnimation } from '@/components/ui/ScrollAnimation';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

/**
 * Section Hero pour la page "L'Approche" - NutriSensia
 *
 * Cette section présente l'approche nutritionnelle de NutriSensia avec :
 * - Design centré et épuré (60vh de hauteur)
 * - Gradient subtil de fond (blanc vers vert sage 3%)
 * - Animations séquencées avec Framer Motion
 * - Typographie hiérarchisée (Label + H1 + Subheadline + CTA)
 * - Responsive mobile/desktop complet
 * - Éléments décoratifs subtils en arrière-plan
 *
 * @example
 * ```tsx
 * <ApproachHeroSection />
 * ```
 */
export function ApproachHeroSection() {
  return (
    <section
      id='approach-hero'
      className={cn(
        // Container principal
        'relative',
        'min-h-[60vh]',
        'flex items-center justify-center',
        'text-center',
        // Gradient de fond subtil (blanc vers vert sage 3%)
        'bg-gradient-to-b from-white to-[#f8faf9]',
        // Padding responsive
        'px-10 py-[120px]',
        'md:px-10 md:py-[120px]',
        // Mobile
        'max-md:px-6 max-md:py-[100px]'
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0,
            ease: 'easeOut',
          }}
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
        </motion.div>

        {/* 2. Titre principal (H1) */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: 'easeOut',
          }}
          className={cn(
            // Typographie Playfair Display selon spécifications
            "font-['Playfair_Display',Georgia,serif]",
            'text-[3rem] leading-[1.2]',
            'md:text-[3rem]',
            // Mobile responsive
            'max-md:text-[2.25rem]',
            'font-bold',
            // Couleur primaire foncée
            'text-[#2C3E3C]',
            // Centrage et largeur max
            'text-center',
            'max-w-[800px]',
            'mx-auto',
            // Espacement
            'mb-6'
          )}
        >
          Une Approche Nutritionnelle Qui Respecte Votre Corps et Votre Vie
        </motion.h1>

        {/* 3. Sous-titre descriptif */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: 'easeOut',
          }}
          className={cn(
            // Typographie Inter selon spécifications
            "font-['Inter',system-ui,sans-serif]",
            'text-[1.25rem] leading-[1.6]',
            // Mobile responsive
            'max-md:text-[1.125rem]',
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
        </motion.p>

        {/* 4. CTA Button (optionnel selon spécifications) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            ease: 'easeOut',
          }}
          className='flex justify-center'
        >
          <Button
            variant='primary'
            size='lg'
            className={cn(
              // Padding selon spécifications
              'px-8 py-4',
              'text-[1.125rem]',
              // Mobile responsive
              'max-md:w-full max-md:min-w-[280px]',
              // Animations hover standards du design system
              'transition-all duration-300 ease-out',
              'hover:transform hover:scale-[1.02]',
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
    </section>
  );
}

export default ApproachHeroSection;
