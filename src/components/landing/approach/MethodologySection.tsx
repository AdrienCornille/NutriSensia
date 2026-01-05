'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import {
  Clock,
  FileText,
  Target,
  Zap,
  Utensils,
  GraduationCap,
  TrendingUp,
  Heart,
} from 'lucide-react';

/**
 * Section "Comment Ça Marche" - Page L'Approche
 *
 * Cette section présente le processus d'accompagnement en 4 étapes
 * avec une timeline verticale alternante sur desktop.
 *
 * Features:
 * - Timeline verticale avec alternance gauche/droite
 * - 4 étapes du processus d'accompagnement
 * - Badges de durée et highlight boxes
 * - Animations de timeline qui se dessine
 * - Responsive mobile (stack vertical)
 *
 * @example
 * ```tsx
 * <MethodologySection />
 * ```
 */
export function MethodologySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Données des 4 étapes
  const steps = [
    {
      number: '1',
      title: 'Consultation Découverte',
      badge: '1h30',
      icon: FileText,
      content: [
        'On prend le temps. Vraiment.',
        '',
        '📋 Historique complet : Santé, habitudes, symptômes',
        '🎯 Vos objectifs : Ce que VOUS voulez vraiment',
        '⚡ Analyse approfondie : Énergie, digestion, sommeil, hormones',
      ],
      highlight: {
        title: 'Vous repartez avec :',
        items: [
          'Une compréhension claire de votre situation',
          'Des premiers ajustements immédiats',
          "L'accès à votre plateforme digitale",
        ],
      },
    },
    {
      number: '2',
      title: 'Programme Personnalisé',
      badge: '48-72h après',
      icon: Utensils,
      content: [
        'Entre les consultations, je crée votre programme sur mesure :',
        '',
        '🍴 Plan alimentaire adapté à VOS goûts et contraintes',
        '📝 Recommandations spécifiques pour VOTRE corps',
        '🎓 Éducation : Vous comprenez le « pourquoi », pas juste le « quoi »',
      ],
      highlight: {
        title: 'Important :',
        items: ["Ce n'est pas figé. On ajuste ensemble selon vos résultats."],
      },
    },
    {
      number: '3',
      title: 'Suivi & Ajustements',
      badge: 'Toutes les 2-3 semaines',
      icon: TrendingUp,
      content: [
        'La magie opère dans le suivi.',
        '',
        'À chaque consultation (1h) :',
        '- Analyse de vos progrès',
        '- Ajustements du plan',
        '- Résolution des difficultés',
        '- Coaching et motivation',
      ],
      highlight: {
        title: 'Fréquence selon votre forfait :',
        items: ['Toutes les 2-3 semaines.'],
      },
    },
    {
      number: '4',
      title: 'Autonomisation',
      badge: null,
      icon: Heart,
      content: [
        'Mon objectif : Vous rendre autonome, pas dépendante.',
        '',
        'Vous apprenez à :',
        '- Comprendre les signaux de votre corps',
        '- Faire les bons choix partout (restaurant, voyage, fêtes)',
        '- Ajuster vous-même selon vos besoins',
      ],
      highlight: {
        title: 'À la fin, vous avez les outils pour continuer seule.',
        items: [],
      },
    },
  ];

  return (
    <section
      ref={ref}
      id='methodology'
      className={cn(
        // Container principal
        'relative',
        'bg-white',
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
            COMMENT ÇA MARCHE
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
            Comment Nous Travaillons Ensemble
          </motion.h2>
        </div>

        {/* ============================================ */}
        {/* TIMELINE CONTAINER                           */}
        {/* ============================================ */}
        <div className='relative'>
          {/* Timeline Line (Desktop only) */}
          <motion.div
            initial={{ height: 0 }}
            animate={isInView ? { height: '100%' } : { height: 0 }}
            transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
            className={cn(
              'absolute left-1/2 top-0 bottom-0',
              'w-[2px]',
              'bg-gradient-to-b from-primary via-primary to-primary/50',
              'transform -translate-x-1/2',
              'z-[1]',
              // Masquer sur mobile
              'max-md:hidden'
            )}
            aria-hidden='true'
          />

          {/* Steps */}
          <div className='space-y-[60px]'>
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                  }
                  transition={{
                    duration: 0.6,
                    delay: 0.5 + index * 0.25, // Stagger de 0.25s
                    ease: 'easeOut',
                  }}
                  className={cn(
                    'relative flex items-center',
                    // Desktop: alternance gauche/droite
                    'md:flex-row',
                    isEven ? 'md:flex-row-reverse' : '',
                    // Mobile: toujours en colonne
                    'max-md:flex-col max-md:items-start'
                  )}
                >
                  {/* Step Number Circle (au centre sur desktop) */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.7 + index * 0.25,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    className={cn(
                      // Desktop: position absolue au centre
                      'md:absolute md:left-1/2 md:transform md:-translate-x-1/2',
                      'w-[80px] h-[80px]',
                      'bg-white',
                      'border-4 border-primary',
                      'rounded-full',
                      'flex items-center justify-center',
                      'shadow-[0_4px_15px_rgba(124,152,133,0.2)]',
                      'z-[10]',
                      // Mobile: position normale
                      'max-md:relative max-md:left-auto max-md:transform-none',
                      'max-md:w-[60px] max-md:h-[60px]',
                      'max-md:mb-4'
                    )}
                  >
                    <span
                      className={cn(
                        "font-['Playfair_Display',Georgia,serif]",
                        'text-[2rem] max-md:text-[1.5rem]',
                        'font-bold',
                        'text-primary'
                      )}
                    >
                      {step.number}
                    </span>
                  </motion.div>

                  {/* Content Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                    animate={
                      isInView
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: isEven ? 30 : -30 }
                    }
                    transition={{
                      duration: 0.6,
                      delay: 0.8 + index * 0.25,
                    }}
                    className={cn(
                      // Desktop: positionnement selon alternance
                      'md:max-w-[500px]',
                      isEven
                        ? 'md:mr-auto md:pr-[60px]'
                        : 'md:ml-auto md:pl-[60px]',
                      // Mobile: pleine largeur
                      'max-md:w-full',
                      // Styles de la carte
                      'bg-[#f8faf9]/50',
                      'p-[40px] max-md:p-[30px]',
                      'rounded-xl',
                      'shadow-[0_2px_12px_rgba(44,62,60,0.06)]'
                    )}
                  >
                    {/* Header avec titre et badge */}
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3
                          className={cn(
                            "font-['Inter',system-ui,sans-serif]",
                            'text-[1.5rem] max-md:text-[1.25rem]',
                            'font-bold',
                            'text-[#2C3E3C]',
                            'leading-[1.3]'
                          )}
                        >
                          {step.title}
                        </h3>
                      </div>

                      {/* Badge durée */}
                      {step.badge && (
                        <div
                          className={cn(
                            'ml-4 px-3 py-1',
                            'bg-primary',
                            'text-white',
                            'text-[0.875rem]',
                            'font-medium',
                            'rounded-full',
                            'whitespace-nowrap'
                          )}
                        >
                          {step.badge}
                        </div>
                      )}
                    </div>

                    {/* Contenu principal */}
                    <div
                      className={cn(
                        "font-['Inter',system-ui,sans-serif]",
                        'text-[0.95rem]',
                        'leading-[1.7]',
                        'text-[#667674]',
                        'space-y-2'
                      )}
                    >
                      {step.content.map((line, lineIndex) => {
                        if (line === '') {
                          return <div key={lineIndex} className='h-2' />;
                        }
                        return <p key={lineIndex}>{line}</p>;
                      })}
                    </div>

                    {/* Highlight Box */}
                    <div
                      className={cn(
                        'mt-5',
                        'bg-white',
                        'p-4',
                        'rounded-lg',
                        'border-l-[3px] border-accent-teal'
                      )}
                    >
                      <p
                        className={cn(
                          "font-['Inter',system-ui,sans-serif]",
                          'text-[0.9rem]',
                          'font-semibold',
                          'text-[#2C3E3C]',
                          'mb-2'
                        )}
                      >
                        {step.highlight.title}
                      </p>

                      {step.highlight.items.length > 0 && (
                        <ul
                          className={cn(
                            "font-['Inter',system-ui,sans-serif]",
                            'text-[0.9rem]',
                            'text-[#667674]',
                            'space-y-1'
                          )}
                        >
                          {step.highlight.items.map((item, itemIndex) => (
                            <li key={itemIndex} className='flex items-start'>
                              <span className='text-accent-teal mr-2'>•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MethodologySection;
