'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, Award, Heart } from 'lucide-react';

/**
 * Section "Mon Parcours" - Page L'Approche
 *
 * Cette section établit la connexion émotionnelle en partageant
 * l'histoire personnelle de Lucie et son parcours professionnel.
 *
 * Features:
 * - Design split (40% image / 60% contenu)
 * - Image professionnelle avec ombres subtiles
 * - Histoire personnelle en 6 paragraphes
 * - Badges de qualifications (TCMA, ASCA, RME)
 * - Animations d'entrée au scroll
 * - Responsive mobile/desktop
 *
 * @example
 * ```tsx
 * <PersonalStorySection />
 * ```
 */
export function PersonalStorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Badges de qualifications
  const credentials = [
    {
      icon: GraduationCap,
      text: 'Diplômée en Nutrition & Micronutrition (TCMA)',
    },
    {
      icon: Award,
      text: 'Agréments ASCA & RME',
    },
    {
      icon: Heart,
      text: '10+ années dans le milieu médical',
    },
  ];

  return (
    <section
      ref={ref}
      id='personal-story'
      className={cn(
        // Container principal
        'relative',
        'bg-white',
        'section-padding', // Classe responsive centralisée
        'prevent-overflow'
      )}
    >
      {/* Container centré avec max-width */}
      <div className='container-responsive'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[60px]'>
          {/* Section Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.875rem] uppercase',
              'tracking-[1.5px]',
              'text-primary',
              'font-semibold',
              'mb-3'
            )}
          >
            MON PARCOURS
          </motion.div>

          {/* H2 Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              "font-['Playfair_Display',Georgia,serif]",
              'text-[2.5rem] md:text-[2.5rem]',
              'max-md:text-[2rem]',
              'font-bold',
              'text-[#2C3E3C]',
              'text-center'
            )}
          >
            Pourquoi J'ai Créé Cette Approche
          </motion.h2>
        </div>

        {/* ============================================ */}
        {/* SPLIT LAYOUT - 40% IMAGE / 60% CONTENT       */}
        {/* ============================================ */}
        <div className='split-layout'>
          {/* LEFT SIDE - IMAGE (40%) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              'lg:col-span-2',
              'flex justify-center lg:justify-start',
              'image-responsive',
              'center-mobile'
            )}
          >
            {/* Container image avec forme décorative */}
            <div className='relative'>
              {/* Forme décorative subtile derrière l'image */}
              <div
                className={cn(
                  'absolute -top-4 -right-4',
                  'w-[120%] h-[120%]',
                  'bg-primary/5',
                  'rounded-2xl',
                  'transform rotate-2',
                  'z-0'
                )}
                aria-hidden='true'
              />

              {/* Image professionnelle */}
              <div className='relative z-10'>
                <img
                  src='/images/hero-nutritionist.jpg'
                  alt='Lucie, nutritionniste diplômée, souriante et professionnelle dans son cabinet'
                  className={cn(
                    'w-full max-w-[350px]',
                    'aspect-[3/4]',
                    'object-cover',
                    'rounded-xl',
                    'shadow-[0_8px_30px_rgba(124,152,133,0.2)]',
                    // Mobile responsive
                    'max-md:max-w-[300px]'
                  )}
                />
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE - CONTENT (60%) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={cn('lg:col-span-3', 'max-w-[600px]', 'mx-auto lg:mx-0')}
          >
            {/* Histoire personnelle - 6 paragraphes */}
            <div className='space-y-5'>
              {[
                "Pendant des années, j'ai vécu ce que vous vivez peut-être aujourd'hui.",
                "Les régimes yo-yo. La culpabilité à chaque repas. L'impression de ne jamais être « assez ». La frustration de ne pas comprendre pourquoi rien ne fonctionnait durablement.",
                "Jusqu'au jour où j'ai compris que la nutrition n'était pas une punition, mais un outil de transformation.",
                "Après des années comme aide-soignante en EMS et assistante administrative au CHUV, j'ai décidé de me former sérieusement en nutrition et micronutrition. Mais ce n'est pas seulement mon diplôme qui fait ma différence.",
                "C'est d'avoir vécu ce parcours. De savoir ce que c'est de se sentir découragée, de vouloir abandonner, et de finalement réussir.",
                "Aujourd'hui, j'accompagne des femmes et des actifs qui veulent sortir du cercle vicieux des régimes et retrouver une relation apaisée avec leur corps.",
              ].map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + index * 0.05, // Stagger subtil
                  }}
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1.125rem]',
                    'max-md:text-[1rem]',
                    'leading-[1.8]',
                    'text-[#667674]',
                    'text-justify'
                  )}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            {/* Badges de qualifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className={cn(
                'mt-10',
                'flex flex-wrap gap-3',
                'justify-center lg:justify-start'
              )}
            >
              {credentials.map((credential, index) => {
                const IconComponent = credential.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={
                      isInView
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0.9 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: 0.9 + index * 0.1,
                    }}
                    className={cn(
                      'inline-flex items-center gap-2',
                      'px-4 py-2.5',
                      'bg-primary/10',
                      'text-primary',
                      'rounded-full',
                      'text-[0.875rem]',
                      'font-medium',
                      'transition-all duration-300',
                      'hover:bg-primary/15',
                      'hover:scale-105'
                    )}
                  >
                    <IconComponent
                      className='w-4 h-4 flex-shrink-0'
                      aria-hidden='true'
                    />
                    <span>{credential.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PersonalStorySection;
