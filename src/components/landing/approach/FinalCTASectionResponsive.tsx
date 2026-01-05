'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ScrollAnimation } from '@/components/ui/ScrollAnimation';
import { cn } from '@/lib/utils';
import { Calendar, MessageCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

/**
 * Section CTA Finale - Version Responsive Complète
 *
 * Cette section présente un appel à l'action final convaincant
 * avec un design responsive optimisé pour tous les appareils.
 *
 * Features:
 * - Design responsive avec breakpoints système
 * - Cibles tactiles 44px minimum
 * - Boutons stack sur mobile
 * - Typographie adaptative
 * - Animations scroll optimisées
 * - Accessibilité complète
 *
 * @example
 * ```tsx
 * <FinalCTASectionResponsive />
 * ```
 */
export function FinalCTASectionResponsive() {
  return (
    <section
      id='final-cta'
      className={cn(
        'relative',
        'bg-white',
        'section-padding', // Classe responsive centralisée
        'prevent-overflow'
      )}
    >
      <ScrollAnimation animation='fadeScaleIn' delay={0}>
        <div
          className={cn(
            // Gradient de fond
            'bg-gradient-to-br from-[#7C9885] to-[#6A8773]',
            // Dimensions et forme responsive
            'container-responsive',
            'rounded-[20px] md:rounded-[20px]',
            'max-md:rounded-[16px]',
            // Padding responsive avec classes centralisées
            'card-padding',
            'md:p-[80px]',
            // Ombre
            'shadow-[0_10px_40px_rgba(124,152,133,0.25)]',
            // Layout
            'text-center',
            'relative z-10'
          )}
        >
          {/* H2: Prête à Commencer ? */}
          <ScrollAnimation animation='fadeIn' delay={0.1}>
            <h2
              className={cn(
                "font-['Playfair_Display',Georgia,serif]",
                'responsive-h2', // Classe responsive centralisée
                'font-bold',
                'text-white',
                'margin-responsive',
                'drop-shadow-sm'
              )}
            >
              Prête à Commencer ?
            </h2>
          </ScrollAnimation>

          {/* Texte de support */}
          <div className='container-narrow mx-auto mb-10'>
            <ScrollAnimation animation='fadeIn' delay={0.2}>
              <div className='space-y-4'>
                <p
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'responsive-body', // Classe responsive centralisée
                    'font-normal',
                    'text-white/95'
                  )}
                >
                  Si vous êtes arrivée jusqu&apos;ici, c&apos;est que quelque
                  chose résonne.
                </p>
                <p
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'responsive-body',
                    'font-normal',
                    'text-white/95'
                  )}
                >
                  Mon approche n&apos;est pas magique. Elle demande de
                  l&apos;investissement, de l&apos;ouverture et du temps.
                </p>
                <p
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'responsive-body',
                    'font-normal',
                    'text-white/95'
                  )}
                >
                  Mais elle fonctionne. Parce qu&apos;elle respecte votre corps,
                  votre vie et votre rythme.
                </p>
              </div>
            </ScrollAnimation>
          </div>

          {/* Groupe de boutons CTA - Stack sur mobile */}
          <ScrollAnimation animation='fadeSlideUp' delay={0.3}>
            <div
              className={cn(
                'stack-mobile', // Stack vertical sur mobile
                'justify-center items-center',
                'grid-gap', // Gap responsive
                'mb-6',
                'touch-spacing' // Espacement tactile
              )}
            >
              {/* Bouton primaire */}
              <Button
                variant='primary'
                size='lg'
                className={cn(
                  // Styles spécifiques au CTA
                  'bg-white text-primary-dark',
                  'shadow-[0_4px_15px_rgba(0,0,0,0.15)]',
                  'hover:scale-[1.03] hover:translate-y-[-2px]',
                  'hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]',
                  'transition-all duration-300 ease-out',
                  // Classes responsive centralisées
                  'button-responsive',
                  'touch-target',
                  // Focus pour accessibilité
                  'focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary'
                )}
              >
                <Calendar className='mr-2 h-5 w-5 md:h-5 md:w-5 max-md:h-4 max-md:w-4' />
                <span className='hidden sm:inline'>
                  Réserver Ma Consultation Découverte (1h30)
                </span>
                <span className='sm:hidden'>Réserver Ma Consultation</span>
              </Button>

              {/* Bouton secondaire */}
              <Link href='/contact?type=question'>
                <Button
                  variant='outline'
                  className={cn(
                    // Styles spécifiques au bouton outline
                    'border-2 border-white text-white',
                    'bg-transparent',
                    'hover:bg-white/15 hover:translate-y-[-2px]',
                    'transition-all duration-300 ease-out',
                    // Classes responsive centralisées
                    'button-responsive',
                    'touch-target',
                    // Focus pour accessibilité
                    'focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary'
                  )}
                >
                  <MessageCircle className='mr-2 h-5 w-5 md:h-5 md:w-5 max-md:h-4 max-md:w-4' />
                  Me Poser Une Question
                </Button>
              </Link>
            </div>
          </ScrollAnimation>

          {/* Texte de réassurance */}
          <ScrollAnimation animation='fadeIn' delay={0.4}>
            <p
              className={cn(
                "font-['Inter',system-ui,sans-serif]",
                'responsive-small', // Classe responsive centralisée
                'text-white/85',
                'tracking-wide',
                // Mobile: Stack les éléments
                'max-md:space-y-1'
              )}
            >
              <span className='block md:inline'>En ligne</span>
              <span className='hidden md:inline'> • </span>
              <span className='block md:inline'>Remboursable</span>
              <span className='hidden md:inline'> • </span>
              <span className='block md:inline'>
                Premier pas vers une vraie transformation
              </span>
            </p>
          </ScrollAnimation>
        </div>
      </ScrollAnimation>
    </section>
  );
}

export default FinalCTASectionResponsive;
