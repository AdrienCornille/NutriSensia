'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import {
  ClipboardList,
  Target,
  Zap,
  FileText,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';

/**
 * Section Méthodologie - Version Responsive Complète
 *
 * Cette section présente le processus en 4 étapes avec une timeline
 * qui s'adapte parfaitement à tous les appareils.
 *
 * Features:
 * - Timeline verticale responsive
 * - Cartes de contenu adaptatives
 * - Cercles numérotés avec animations
 * - Layout stack sur mobile
 * - Cibles tactiles optimisées
 * - Animations fluides
 *
 * @example
 * ```tsx
 * <MethodologySectionResponsive />
 * ```
 */
export function MethodologySectionResponsive() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Données des 4 étapes
  const steps = [
    {
      number: '1',
      title: 'Consultation Découverte',
      badge: '1h30',
      icon: ClipboardList,
      content: [
        {
          icon: ClipboardList,
          text: 'Historique complet : Santé, habitudes, symptômes',
        },
        {
          icon: Target,
          text: 'Vos objectifs : Ce que VOUS voulez vraiment',
        },
        {
          icon: Zap,
          text: 'Analyse approfondie : Énergie, digestion, sommeil, hormones',
        },
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
      icon: FileText,
      content: [
        {
          icon: FileText,
          text: 'Plan alimentaire adapté à VOS goûts et contraintes',
        },
        {
          icon: Target,
          text: 'Recommandations spécifiques pour VOTRE corps',
        },
        {
          icon: BookOpen,
          text: 'Éducation : Vous comprenez le « pourquoi », pas juste le « quoi »',
        },
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
      icon: Users,
      content: [
        'La magie opère dans le suivi. À chaque consultation (1h) :',
        '• Analyse de vos progrès',
        '• Ajustements du plan',
        '• Résolution des difficultés',
        '• Coaching et motivation',
      ],
      highlight: {
        title: 'Fréquence selon votre forfait :',
        items: ['Toutes les 2-3 semaines.'],
      },
    },
    {
      number: '4',
      title: 'Autonomisation',
      icon: CheckCircle,
      content: [
        'Mon objectif : Vous rendre autonome, pas dépendante.',
        'Vous apprenez à :',
        '• Comprendre les signaux de votre corps',
        '• Faire les bons choix partout (restaurant, voyage, fêtes)',
        '• Ajuster vous-même selon vos besoins',
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
        'bg-white',
        'section-padding', // Classe responsive centralisée
        'prevent-overflow'
      )}
    >
      {/* Container centré */}
      <div className='container-responsive max-w-[1100px]'>
        {/* Header */}
        <div className='text-center mb-[70px]'>
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.875rem]',
              'uppercase',
              'tracking-[1.5px]',
              'font-semibold',
              'text-primary',
              'margin-responsive'
            )}
          >
            COMMENT ÇA MARCHE
          </motion.div>

          {/* H2 */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn(
              "font-['Playfair_Display',Georgia,serif]",
              'responsive-h2', // Classe responsive centralisée
              'font-bold',
              'text-primary-dark',
              'text-center'
            )}
          >
            Comment Nous Travaillons Ensemble
          </motion.h2>
        </div>

        {/* Timeline Container */}
        <div className='relative'>
          {/* Timeline Line - Masquée sur mobile */}
          <div
            className={cn(
              'hidden-mobile', // Masquer sur mobile
              'absolute left-1/2 transform -translate-x-1/2',
              'top-0 bottom-0',
              'w-0.5 bg-primary',
              'z-0'
            )}
            aria-hidden='true'
          />

          {/* Steps */}
          <div className='space-y-[60px] md:space-y-[80px]'>
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                className={cn(
                  'relative',
                  'grid grid-cols-1 md:grid-cols-12 gap-8',
                  'items-center'
                )}
              >
                {/* Number Circle - Centré sur mobile, sur timeline desktop */}
                <div
                  className={cn(
                    'md:col-start-6 md:col-span-2',
                    'flex justify-center',
                    'relative z-10',
                    'order-1 md:order-2'
                  )}
                >
                  <div
                    className={cn(
                      'w-[80px] h-[80px]',
                      'max-md:w-[60px] max-md:h-[60px]',
                      'rounded-full',
                      'bg-white',
                      'border-4 border-primary',
                      'flex items-center justify-center',
                      'shadow-[0_4px_15px_rgba(124,152,133,0.2)]',
                      'touch-target' // Cible tactile
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
                  </div>
                </div>

                {/* Content Card */}
                <div
                  className={cn(
                    // Position alternée sur desktop, centrée sur mobile
                    index % 2 === 0
                      ? 'md:col-start-8 md:col-span-5'
                      : 'md:col-start-1 md:col-span-5',
                    'order-2 md:order-1',
                    // Card styling
                    'bg-[#f8faf9]',
                    'card-padding', // Padding responsive
                    'rounded-xl',
                    'shadow-[0_2px_12px_rgba(44,62,60,0.06)]',
                    'transition-all duration-300 ease-out',
                    'hover:translate-y-[-3px] hover:shadow-[0_4px_20px_rgba(44,62,60,0.1)]',
                    'touch-target' // Cible tactile
                  )}
                >
                  {/* Badge et Title */}
                  <div className='mb-4'>
                    {step.badge && (
                      <div
                        className={cn(
                          'inline-block',
                          'bg-primary text-white',
                          'px-3 py-1 mb-3',
                          'rounded-full',
                          'responsive-small', // Taille responsive
                          'font-semibold'
                        )}
                      >
                        {step.badge}
                      </div>
                    )}

                    <h3
                      className={cn(
                        "font-['Inter',system-ui,sans-serif]",
                        'responsive-h3', // Taille responsive
                        'font-bold',
                        'text-primary-dark',
                        'margin-responsive'
                      )}
                    >
                      {step.title}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className='space-y-3 mb-5'>
                    {step.content.map((item, itemIndex) => (
                      <div key={itemIndex} className='flex items-start gap-3'>
                        {typeof item === 'object' ? (
                          <>
                            <item.icon className='w-4 h-4 text-primary mt-1 flex-shrink-0' />
                            <span
                              className={cn(
                                "font-['Inter',system-ui,sans-serif]",
                                'responsive-small',
                                'text-text-secondary',
                                'leading-relaxed'
                              )}
                            >
                              {item.text}
                            </span>
                          </>
                        ) : (
                          <span
                            className={cn(
                              "font-['Inter',system-ui,sans-serif]",
                              'responsive-small',
                              'text-text-secondary',
                              'leading-relaxed'
                            )}
                          >
                            {item}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Highlight Box */}
                  {step.highlight && (
                    <div
                      className={cn(
                        'bg-white',
                        'border-l-3 border-accent',
                        'p-4',
                        'rounded-r-lg'
                      )}
                    >
                      <div
                        className={cn(
                          "font-['Inter',system-ui,sans-serif]",
                          'responsive-small',
                          'font-medium',
                          'text-primary-dark',
                          'mb-2'
                        )}
                      >
                        {step.highlight.title}
                      </div>
                      {step.highlight.items.map((item, itemIndex) => (
                        <div key={itemIndex} className='flex items-start gap-2'>
                          <span className='text-accent'>•</span>
                          <span
                            className={cn(
                              "font-['Inter',system-ui,sans-serif]",
                              'responsive-small',
                              'text-text-secondary'
                            )}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MethodologySectionResponsive;
