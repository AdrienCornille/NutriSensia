'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Section Pricing - Design 2025
 *
 * Section de pricing transparente avec 3 forfaits clairement définis.
 * Guide naturellement vers le forfait Transformation tout en respectant
 * tous les choix.
 *
 * Features:
 * - 3 cartes de forfaits avec pricing transparent
 * - Forfait Transformation mis en avant (highlighted)
 * - Features avec checkmarks personnalisés
 * - CTAs différenciés par forfait
 * - Animations stagger au scroll
 * - Responsive mobile avec stack vertical
 */
export function PackagesPreviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Données des 3 forfaits
  const packages = [
    {
      id: 1,
      badge: 'Pour commencer',
      name: 'FORFAIT FONDATION',
      duration: '2 mois',
      price: '449',
      description: 'Idéal pour démarrer sur de bonnes bases',
      features: [
        '3 consultations de suivi (1h chacune)',
        'Programme nutritionnel personnalisé',
        'Accès plateforme 2 mois',
        'Suivi alimentaire illimité',
        'Ressources éducatives',
      ],
      ctaText: 'Choisir ce forfait',
      ctaLink: '/reservation?package=fondation',
      isHighlighted: false,
      ctaStyle: 'secondary',
    },
    {
      id: 2,
      badge: '⭐ Le plus choisi',
      name: 'FORFAIT TRANSFORMATION',
      duration: '3 mois',
      price: "1'199",
      description: 'Le plus populaire : pour ancrer de vraies habitudes',
      features: [
        '6 consultations de suivi (1h chacune)',
        'Programme nutritionnel évolutif',
        'Accès plateforme 3 mois',
        'Suivi complet + ressources avancées',
        'Messagerie prioritaire (option)',
      ],
      ctaText: 'Choisir ce forfait',
      ctaLink: '/reservation?package=transformation',
      isHighlighted: true,
      ctaStyle: 'primary',
    },
    {
      id: 3,
      badge: 'Engagement long terme',
      name: 'FORFAIT PARCOURS COMPLET',
      duration: '6 mois',
      price: "2'199",
      description: 'Pour une transformation profonde et durable',
      features: [
        '12 consultations de suivi (1h chacune)',
        'Accompagnement longue durée',
        'Accès plateforme 6 mois',
        'Ressources premium',
        'Chat inclus pour suivi rapproché',
      ],
      ctaText: 'Choisir ce forfait',
      ctaLink: '/reservation?package=parcours-complet',
      isHighlighted: false,
      ctaStyle: 'secondary',
    },
  ];

  return (
    <section
      id='packages'
      className={cn(
        'relative',
        'bg-gradient-to-b from-white to-[#E8F3EF]/[0.03]',
        'py-[100px] px-10',
        'md:py-[100px] md:px-10'
      )}
    >
      {/* Container principal */}
      <div className='container mx-auto max-w-[1370px]'>
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
            VOS FORFAITS
          </motion.div>

          {/* H2 Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              "font-sans",
              'text-[2rem] md:text-[2.5rem]',
              'font-bold',
              'text-[#2C3E3C]',
              'mb-5'
            )}
          >
            Choisissez Votre Formule
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.125rem]',
              'text-[#667674]'
            )}
          >
            Tous les forfaits incluent la plateforme digitale et sont
            remboursables par votre assurance.
          </motion.p>
        </div>

        {/* ============================================ */}
        {/* PACKAGES GRID                                */}
        {/* ============================================ */}
        <div
          ref={ref}
          className={cn('grid', 'md:grid-cols-3', 'gap-8', 'mx-auto')}
        >
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.6,
                delay: 0.3 + index * 0.15,
                ease: 'easeOut',
              }}
              className={cn(
                'relative',
                'bg-white',
                'rounded-2xl',
                'p-10',
                'md:p-10',
                'border-2',
                'transition-all duration-300 ease-out',
                'hover:-translate-y-[5px]',
                // Base styling for non-highlighted cards
                !pkg.isHighlighted && [
                  'border-[#E5E7E6]',
                  'shadow-[0_2px_15px_rgba(44,62,60,0.06)]',
                  'hover:shadow-[0_4px_25px_rgba(44,62,60,0.12)]',
                ],
                // Highlighted package styling
                pkg.isHighlighted && [
                  'border-primary',
                  'shadow-[0_8px_30px_rgba(124,152,133,0.15)]',
                  'md:scale-105',
                  'z-10',
                  'hover:shadow-[0_12px_40px_rgba(124,152,133,0.2)]',
                ]
              )}
            >
              {/* Badge */}
              {pkg.badge && (
                <div
                  className={cn(
                    'inline-block',
                    'px-[14px] py-[6px]',
                    'rounded-full',
                    'bg-primary/10',
                    'text-primary',
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[0.75rem]',
                    'uppercase',
                    'font-semibold',
                    'tracking-[0.5px]',
                    'mb-5'
                  )}
                >
                  {pkg.badge}
                </div>
              )}

              {/* Package Name */}
              <h3
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1.5rem] md:text-[1.75rem]',
                  'font-bold',
                  'text-[#2C3E3C]',
                  'uppercase',
                  'tracking-[0.5px]',
                  'mb-2'
                )}
              >
                {pkg.name}
              </h3>

              {/* Duration */}
              <p
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1rem]',
                  'text-[#667674]',
                  'mb-5'
                )}
              >
                {pkg.duration}
              </p>

              {/* Price */}
              <div className='flex items-baseline mb-4'>
                <span
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1.25rem]',
                    'text-[#667674]',
                    'mr-1'
                  )}
                >
                  CHF
                </span>
                <span
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[2.5rem] md:text-[3rem]',
                    'font-bold',
                    'text-primary',
                    'leading-none'
                  )}
                >
                  {pkg.price}
                </span>
              </div>

              {/* Description */}
              <p
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[0.95rem]',
                  'italic',
                  'text-[#667674]',
                  'mb-[30px]',
                  'leading-[1.5]'
                )}
              >
                {pkg.description}
              </p>

              {/* Separator */}
              <div className='w-full h-[1px] bg-[#E5E7E6] mb-6' />

              {/* Features */}
              <ul className='space-y-4 mb-8'>
                {pkg.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={
                      isInView
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0.8 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + index * 0.15 + featureIndex * 0.05,
                    }}
                    className={cn(
                      'flex items-start gap-3',
                      "font-['Inter',system-ui,sans-serif]",
                      'text-[0.95rem]',
                      'text-[#667674]',
                      'leading-[1.6]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5',
                        'flex-shrink-0',
                        'rounded',
                        'bg-[#6BA583]/10',
                        'flex items-center justify-center',
                        'mt-0.5'
                      )}
                    >
                      <Check
                        className={cn('w-3.5 h-3.5', 'text-[#6BA583]')}
                        strokeWidth={3}
                      />
                    </div>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                onClick={() => {
                  window.location.href = pkg.ctaLink;
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full',
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1rem]',
                  'font-semibold',
                  'px-6 py-[14px]',
                  'rounded-lg',
                  'transition-all duration-300',
                  'mt-auto',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
                  // Highlighted button (primary)
                  pkg.isHighlighted && [
                    'bg-primary',
                    'text-white',
                    'hover:bg-primary/90',
                    'shadow-md',
                    'hover:shadow-lg',
                  ],
                  // Non-highlighted button (outline)
                  !pkg.isHighlighted && [
                    'bg-transparent',
                    'text-primary',
                    'border-2 border-primary',
                    'hover:bg-primary/5',
                  ]
                )}
              >
                {pkg.ctaText}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* ============================================ */}
        {/* SECTION CTA LINK                             */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className={cn('text-center', 'mt-[50px]')}
        >
          <motion.a
            href='/forfaits'
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
            whileHover={{ scale: 1.02 }}
          >
            <span className='transition-transform group-hover:translate-x-1'>
              →
            </span>
            <span className='border-b-2 border-transparent group-hover:border-primary transition-all'>
              Comparer tous les forfaits en détail
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
