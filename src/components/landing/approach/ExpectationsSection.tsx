'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { Calendar, Video, Mail, ArrowRight, Check } from 'lucide-react';

/**
 * Section "À Quoi S'Attendre" - Page L'Approche
 *
 * Cette section détaille le déroulement de la première consultation
 * en 3 phases pour rassurer et encourager la prise de rendez-vous.
 *
 * Features:
 * - Timeline horizontale avec 3 phases (Avant/Pendant/Après)
 * - Badges colorés et connecteurs entre phases
 * - Contenu détaillé pour chaque phase
 * - Animations stagger et responsive design
 * - Design rassurant et professionnel
 *
 * @example
 * ```tsx
 * <ExpectationsSection />
 * ```
 */
export function ExpectationsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Données des 3 phases
  const phases = [
    {
      id: 1,
      badge: 'AVANT',
      title: 'Chez Vous',
      duration: '15 min',
      icon: Calendar,
      content: [
        'Questionnaire de santé en ligne',
        'Préparez vos questions',
        'Documents médicaux si disponibles (bilans, ordonnances)',
      ],
    },
    {
      id: 2,
      badge: 'PENDANT',
      title: 'En Visioconférence',
      duration: '1h30',
      icon: Video,
      content: [
        '0-20 min : Accueil et contexte',
        '20-50 min : Anamnèse détaillée',
        '50-70 min : Analyse et recommandations',
        "70-90 min : Questions et plan d'action",
      ],
    },
    {
      id: 3,
      badge: 'APRÈS',
      title: 'Suivi Immédiat',
      duration: '48-72h',
      icon: Mail,
      content: [
        'Récapitulatif par email',
        'Programme personnalisé sous 48-72h',
        'Accès à votre plateforme',
        'Messagerie disponible pour vos questions',
      ],
    },
  ];

  return (
    <section
      ref={ref}
      id='expectations'
      className={cn(
        // Container principal
        'relative',
        // Gradient de fond vert sage (3% à 5% d'opacité)
        'bg-gradient-to-b from-[#f8faf9] to-[#f6f9f7]',
        'py-[100px] px-10',
        // Mobile responsive
        'max-md:py-[60px] max-md:px-6'
      )}
    >
      {/* Container centré avec max-width */}
      <div className='container mx-auto max-w-[1100px]'>
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
            VOTRE PREMIÈRE FOIS
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
            À Quoi S'Attendre Pour Votre Première Consultation
          </motion.h2>
        </div>

        {/* ============================================ */}
        {/* TIMELINE HORIZONTAL - 3 PHASES               */}
        {/* ============================================ */}
        <div
          className={cn(
            'flex',
            'flex-col md:flex-row',
            'items-center md:items-stretch',
            'justify-between',
            'gap-8 md:gap-10'
          )}
        >
          {phases.map((phase, index) => {
            const IconComponent = phase.icon;
            const isLast = index === phases.length - 1;

            return (
              <React.Fragment key={phase.id}>
                {/* Phase Container */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                  }
                  transition={{
                    duration: 0.6,
                    delay: 0.2 + index * 0.2, // Stagger de 0.2s
                    ease: 'easeOut',
                  }}
                  className={cn(
                    'flex-1',
                    'flex flex-col',
                    'items-center md:items-center',
                    'max-w-[320px]'
                  )}
                >
                  {/* Badge Phase */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.4 + index * 0.2,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    className={cn(
                      'bg-primary',
                      'text-white',
                      'px-5 py-2',
                      'rounded-full',
                      'text-[0.875rem]',
                      'font-bold uppercase',
                      'mb-6',
                      'shadow-lg'
                    )}
                  >
                    {phase.badge}
                  </motion.div>

                  {/* Content Card */}
                  <div
                    className={cn(
                      'bg-white',
                      'p-[30px]',
                      'max-md:p-[25px]',
                      'rounded-xl',
                      'shadow-[0_2px_12px_rgba(44,62,60,0.08)]',
                      'w-full',
                      'transition-all duration-300',
                      'hover:-translate-y-1',
                      'hover:shadow-[0_4px_20px_rgba(44,62,60,0.12)]'
                    )}
                  >
                    {/* Header avec icône et titre */}
                    <div className='flex items-center justify-center mb-4'>
                      <IconComponent
                        className='w-6 h-6 text-primary mr-3'
                        aria-hidden='true'
                      />
                      <div className='text-center'>
                        <h3
                          className={cn(
                            "font-['Inter',system-ui,sans-serif]",
                            'text-[1.25rem]',
                            'font-bold',
                            'text-[#2C3E3C]',
                            'leading-[1.3]'
                          )}
                        >
                          {phase.title}
                        </h3>
                        <p
                          className={cn(
                            "font-['Inter',system-ui,sans-serif]",
                            'text-[0.875rem]',
                            'text-[#667674]',
                            'mt-1'
                          )}
                        >
                          {phase.duration}
                        </p>
                      </div>
                    </div>

                    {/* Liste du contenu */}
                    <ul className='space-y-3'>
                      {phase.content.map((item, itemIndex) => (
                        <li key={itemIndex} className='flex items-start'>
                          <Check
                            className='w-4 h-4 text-primary mr-3 mt-0.5 flex-shrink-0'
                            aria-hidden='true'
                          />
                          <span
                            className={cn(
                              "font-['Inter',system-ui,sans-serif]",
                              'text-[0.95rem]',
                              'leading-[1.7]',
                              'text-[#667674]'
                            )}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Connecteur entre phases (sauf pour la dernière) */}
                {!isLast && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={
                      isInView
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0 }
                    }
                    transition={{
                      duration: 0.5,
                      delay: 0.6 + index * 0.2,
                    }}
                    className={cn(
                      'flex items-center justify-center',
                      // Desktop : flèche horizontale
                      'hidden md:flex',
                      'w-10 h-10',
                      'text-primary'
                    )}
                  >
                    <ArrowRight className='w-6 h-6' aria-hidden='true' />
                  </motion.div>
                )}

                {/* Connecteur mobile (flèche vers le bas) */}
                {!isLast && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={
                      isInView
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0 }
                    }
                    transition={{
                      duration: 0.5,
                      delay: 0.6 + index * 0.2,
                    }}
                    className={cn(
                      'flex items-center justify-center',
                      // Mobile : flèche verticale
                      'md:hidden',
                      'w-10 h-10',
                      'text-primary',
                      'my-4'
                    )}
                  >
                    <div className='transform rotate-90'>
                      <ArrowRight className='w-6 h-6' aria-hidden='true' />
                    </div>
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ExpectationsSection;
