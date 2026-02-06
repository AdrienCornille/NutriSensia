'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { Award, BookOpen, Shield, Heart } from 'lucide-react';

/**
 * Section Trust Signals - Pour Démarrage Sans Témoignages
 *
 * Cette section met en avant les qualifications, diplômes et agréments
 * pour établir la crédibilité sans avoir besoin de témoignages clients.
 *
 * Features:
 * - 4 colonnes de trust signals (diplômes, expérience, agréments, approche)
 * - Grid responsive (2x2 mobile, 4 colonnes desktop)
 * - Animations stagger au scroll
 * - Design cohérent avec le reste du site
 */
export function TrustSignalsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Données des trust signals
  const trustSignals = [
    {
      id: 1,
      iconName: 'Award',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      title: 'Diplômée TCMA',
      description: 'Formation complète en nutrition clinique et micronutrition',
      detail: 'Certifiée 2024',
    },
    {
      id: 2,
      iconName: 'BookOpen',
      iconColor: 'text-accent-teal',
      iconBg: 'bg-accent-teal/10',
      title: "4 Ans d'Études",
      description: 'Spécialisée en nutrition hormonale et métabolique',
      detail: 'Formation continue',
    },
    {
      id: 3,
      iconName: 'Shield',
      iconColor: 'text-accent-mint',
      iconBg: 'bg-accent-mint/10',
      title: 'ASCA & RME',
      description:
        'Agréments officiels suisses pour remboursement par assurance',
      detail: 'Remboursable',
    },
    {
      id: 4,
      iconName: 'Heart',
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-50',
      title: 'Approche Holistique',
      description: 'Accompagnement personnalisé centré sur vos besoins uniques',
      detail: 'Pour vous',
    },
  ];

  // Fonction pour obtenir le composant d'icône
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Award':
        return Award;
      case 'BookOpen':
        return BookOpen;
      case 'Shield':
        return Shield;
      case 'Heart':
        return Heart;
      default:
        return Award;
    }
  };

  return (
    <section
      id='trust-signals'
      className={cn(
        'relative',
        'bg-white',
        'py-[80px] px-10',
        'md:py-[80px] md:px-16 lg:px-20'
      )}
    >
      {/* Container principal */}
      <div className='container mx-auto max-w-[1370px]'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[50px]'>
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
            POURQUOI ME FAIRE CONFIANCE
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
              'text-[#2C3E3C]',
              'mb-4'
            )}
          >
            Une Expertise Reconnue à Votre Service
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.125rem]',
              'text-[#667674]',
              'max-w-[840px]',
              'mx-auto'
            )}
          >
            Des qualifications solides pour un accompagnement de qualité
          </motion.p>
        </div>

        {/* ============================================ */}
        {/* TRUST SIGNALS GRID - 4 colonnes             */}
        {/* ============================================ */}
        <div
          ref={ref}
          className={cn(
            'grid',
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
            'gap-8',
            'mb-[40px]'
          )}
        >
          {trustSignals.map((signal, index) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.6,
                delay: 0.1 * index,
                ease: 'easeOut',
              }}
              className={cn(
                'text-center',
                'p-6',
                'rounded-xl',
                'bg-gradient-to-br from-white to-[#F8FAF9]',
                'border border-gray-100',
                'shadow-sm',
                'transition-all duration-300',
                'hover:-translate-y-1',
                'hover:shadow-md'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-16 h-16 rounded-full',
                  'flex items-center justify-center',
                  signal.iconBg,
                  'mx-auto mb-4'
                )}
              >
                {React.createElement(getIconComponent(signal.iconName), {
                  className: cn('w-8 h-8', signal.iconColor),
                  strokeWidth: 2,
                })}
              </div>

              {/* Title */}
              <h3
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1.125rem]',
                  'font-bold',
                  'text-[#2C3E3C]',
                  'mb-2'
                )}
              >
                {signal.title}
              </h3>

              {/* Description */}
              <p
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[0.875rem]',
                  'text-[#667674]',
                  'leading-[1.6]',
                  'mb-3'
                )}
              >
                {signal.description}
              </p>

              {/* Badge Detail */}
              <div
                className={cn(
                  'inline-flex items-center',
                  'px-3 py-1',
                  'bg-primary/10',
                  'rounded-full',
                  'text-[0.75rem]',
                  'font-semibold',
                  'text-primary'
                )}
              >
                {signal.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
