'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';

/**
 * Section Process Streamlined - Design 2025
 *
 * Section processus simplifiée qui montre le parcours d'accompagnement
 * de manière claire et rassurante.
 *
 * Features:
 * - Timeline verticale avec ligne de connexion (desktop)
 * - 4 étapes avec numéros circulaires
 * - Cartes de contenu avec hover effects
 * - Animations stagger au scroll
 * - Responsive mobile sans timeline
 * - Design épuré et professionnel
 */
export function ProcessSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Données des 4 étapes du processus
  const processSteps = [
    {
      id: 1,
      number: '1',
      title: 'Consultation Découverte (1h30)',
      description:
        'Ensemble, nous explorons votre parcours, vos symptômes, vos objectifs et ce qui vous freine. Vous repartez avec une feuille de route claire et personnalisée, conçue pour vous.',
    },
    {
      id: 2,
      number: '2',
      title: 'Votre Programme Personnalisé',
      description:
        "Un plan sur mesure qui vous ressemble vraiment : basé sur VOS besoins physiologiques, VOS goûts, VOTRE vie. Parce qu'un plan que vous ne suivrez pas ne vous aidera pas.",
    },
    {
      id: 3,
      number: '3',
      title: 'Votre Plateforme Digitale 24/7',
      description:
        'Plans de repas, listes de courses, journal alimentaire, suivi de vos progrès - tout centralisé au même endroit. Accessible depuis votre téléphone ou ordinateur, quand vous en avez besoin.',
    },
    {
      id: 4,
      number: '4',
      title: 'Suivi & Ajustements Main dans la Main',
      description:
        'Des consultations de suivi pour ajuster votre programme, répondre à toutes vos questions et garantir des résultats durables. Nous parcourons ce chemin ensemble, à votre rythme.',
    },
  ];

  return (
    <section
      id='process'
      className={cn(
        'relative',
        'bg-white',
        'py-[100px] px-10',
        'md:py-[100px] md:px-10'
      )}
    >
      {/* Container principal - Max 1200px centré */}
      <div className='container mx-auto max-w-[1370px]'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[70px]'>
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
            LE PROCESSUS
          </motion.div>

          {/* H2 Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              'font-sans',
              'text-[2rem] md:text-[2.5rem]',
              'font-bold',
              'text-[#2C3E3C]'
            )}
          >
            Un Accompagnement Simple et Progressif
          </motion.h2>
        </div>

        {/* ============================================ */}
        {/* TIMELINE CONTAINER                           */}
        {/* ============================================ */}
        <div ref={ref} className='relative'>
          {/* Timeline Line (Desktop Only) */}
          <motion.div
            initial={{ height: 0 }}
            animate={isInView ? { height: 'calc(100% - 60px)' } : { height: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            className={cn(
              'absolute left-[60px] top-[30px]',
              'w-1',
              'bg-gradient-to-b from-primary to-primary/40',
              'hidden md:block',
              'z-0'
            )}
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, currentColor 0, currentColor 8px, transparent 8px, transparent 14px)',
            }}
            aria-hidden='true'
          />

          {/* Steps Container */}
          <div className='space-y-[50px]'>
            {processSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{
                  duration: 0.6,
                  delay: 0.2 + index * 0.2,
                  ease: 'easeOut',
                }}
                className={cn(
                  'relative',
                  'flex items-start',
                  // Desktop: padding for timeline space
                  'md:pl-[140px]',
                  // Mobile: no padding
                  'pl-0'
                )}
              >
                {/* Number Circle */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={isInView ? { scale: 1 } : { scale: 0.8 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.4 + index * 0.2,
                    ease: 'easeOut',
                  }}
                  className={cn(
                    // Desktop: Absolute positioning on timeline
                    'md:absolute md:left-[30px] md:top-0',
                    'md:w-[60px] md:h-[60px]',
                    // Mobile: Inline positioning
                    'relative md:relative',
                    'w-[50px] h-[50px] md:w-[60px] md:h-[60px]',
                    'flex-shrink-0',
                    'mr-4 md:mr-0',
                    // Styling
                    'bg-primary',
                    'rounded-full',
                    'flex items-center justify-center',
                    'shadow-[0_4px_12px_rgba(124,152,133,0.3)]',
                    'z-10'
                  )}
                >
                  <span
                    className={cn(
                      "font-['Inter',system-ui,sans-serif]",
                      'text-[1.5rem] md:text-[1.75rem]',
                      'font-bold',
                      'text-white'
                    )}
                  >
                    {step.number}
                  </span>
                </motion.div>

                {/* Content Card */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }
                  }
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + index * 0.2,
                    ease: 'easeOut',
                  }}
                  className={cn(
                    // Base styling
                    'bg-[#F8FAF9]',
                    'p-8 md:p-8',
                    'rounded-xl',
                    'shadow-[0_2px_12px_rgba(44,62,60,0.08)]',
                    'flex-1',
                    'transition-all duration-300 ease-out',
                    // Hover effects
                    'hover:-translate-y-[3px]',
                    'hover:shadow-[0_4px_20px_rgba(44,62,60,0.12)]'
                  )}
                >
                  {/* Step Title (H3) */}
                  <h3
                    className={cn(
                      "font-['Inter',system-ui,sans-serif]",
                      'text-[1.25rem] md:text-[1.5rem]',
                      'font-bold',
                      'text-[#2C3E3C]',
                      'mb-3'
                    )}
                  >
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p
                    className={cn(
                      "font-['Inter',system-ui,sans-serif]",
                      'text-[1rem]',
                      'leading-[1.7]',
                      'text-[#667674]'
                    )}
                  >
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* MINI CTA                                     */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className={cn('text-center', 'mt-[50px]')}
        >
          <motion.a
            href='#contact'
            className={cn(
              'inline-flex items-center gap-2',
              "font-['Inter',system-ui,sans-serif]",
              'text-[1rem]',
              'font-semibold',
              'text-primary',
              'transition-all duration-300',
              'hover:gap-3',
              'group',
              'cursor-pointer'
            )}
            onClick={e => {
              e.preventDefault();
              const packagesSection = document.querySelector('#packages');
              if (packagesSection) {
                packagesSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                // Fallback vers une page dédiée si pas de section packages
                window.location.href = '/prix';
              }
            }}
            whileHover={{ scale: 1.02 }}
          >
            <span className='border-b-2 border-transparent group-hover:border-primary transition-all'>
              Voir les forfaits d&apos;accompagnement
            </span>
            <span className='transition-transform group-hover:translate-x-1'>
              →
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
