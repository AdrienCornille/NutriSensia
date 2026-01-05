'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Interface pour les props de la section Intro
 */
export interface IntroSectionProps {
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Section Intro de la page L'Approche
 *
 * Une introduction simple et élégante qui présente l'approche nutritionnelle
 * de manière humaine et scientifique.
 *
 * Design System NutriSensia :
 * - Police : Inter (famille sans-serif du design system)
 * - Couleurs : Primary (#2E7D5E), Accent Teal (#00A693), Neutral Dark (#374151)
 * - Typographie : text-h1, text-h3, text-body-large
 * - Spacing : 16dp, 24dp, 32dp, 48dp, 64dp
 * - Animations : duration-emphasis (300ms) avec timing-emphasis
 * - Background : background-primary (#FFFFFF)
 *
 * @example
 * ```tsx
 * <IntroSection />
 * ```
 */
export function IntroSection({ className }: IntroSectionProps) {
  return (
    <section
      className={cn(
        'relative w-full',
        'min-h-[85vh] flex items-center justify-center',
        'bg-gradient-to-b from-background-primary via-sage-50/30 to-background-primary',
        'py-64dp sm:py-96dp',
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-teal/5 rounded-full blur-3xl" />
      </div>

      <div className='container mx-auto px-16dp sm:px-24dp lg:px-32dp relative z-10'>
        <motion.div
          className='mx-auto max-w-4xl'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0.0, 0.2, 1], // timing-emphasis
          }}
        >
          {/* Titre principal - Hero style */}
          <h1 className='mb-32dp text-center font-sans text-primary-dark sm:leading-[1.1] lg:leading-[1.05]
            text-5xl sm:text-6xl lg:text-7xl font-bold'>
            Mon Approche Nutritionnelle
          </h1>

          {/* Sous-titre - Hero style */}
          <p className='text-center font-sans font-semibold text-accent-teal leading-[1.4]
            text-2xl sm:text-3xl lg:text-4xl max-w-3xl mx-auto'>
            Une méthode scientifique, personnalisée et bienveillante qui
            respecte votre corps et votre vie
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default IntroSection;
