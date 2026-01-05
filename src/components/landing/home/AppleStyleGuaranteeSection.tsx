'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Award, BookOpen, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Section Garantie avec Sticky Scroll - Inspiration Apple
 *
 * Design moderne avec effet de scroll sticky où le contenu
 * texte reste fixe pendant que les visuels défilent en arrière-plan.
 *
 * Features:
 * - Sticky content : Le texte reste fixe pendant le scroll
 * - Transitions fluides entre les différentes garanties
 * - Images/icônes qui changent progressivement
 * - Effet de parallaxe et de profondeur
 * - Animations élégantes et subtiles
 * - CTA final après la séquence
 */

interface GuaranteeItem {
  id: number;
  icon: any;
  title: string;
  description: string;
  color: string;
  gradient: string;
}

const guaranteeItems: GuaranteeItem[] = [
  {
    id: 1,
    icon: Award,
    title: 'Diplômée TCMA',
    description:
      'Formation complète en nutrition clinique et micronutrition. Une expertise reconnue pour vous accompagner efficacement.',
    color: 'text-primary',
    gradient: 'from-primary/20 to-primary/10',
  },
  {
    id: 2,
    icon: BookOpen,
    title: "4 Ans d'Études",
    description:
      'Spécialisée en nutrition hormonale et métabolique. Une formation continue pour rester à la pointe des connaissances.',
    color: 'text-accent-teal',
    gradient: 'from-teal-500/20 to-teal-600/10',
  },
  {
    id: 3,
    icon: Shield,
    title: 'ASCA & RME',
    description:
      'Agréments officiels suisses pour remboursement par assurance. Consultations prises en charge par votre complémentaire santé.',
    color: 'text-accent-mint',
    gradient: 'from-[#7FD1C1]/20 to-[#7FD1C1]/10',
  },
  {
    id: 4,
    icon: Heart,
    title: 'Approche Holistique',
    description:
      'Accompagnement personnalisé centré sur vos besoins uniques. Pas de méthode standardisée, un suivi adapté à VOUS.',
    color: 'text-rose-500',
    gradient: 'from-rose-500/20 to-rose-600/10',
  },
];

export function AppleStyleGuaranteeSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Calculer quel item est actif basé sur le scroll
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      // Diviser le scroll en segments pour chaque item
      // On laisse plus de temps pour le dernier item (75% du scroll pour les 4 items)
      const totalItems = guaranteeItems.length;
      const scrollThreshold = 0.75; // Les items occupent 75% du scroll
      const progress = Math.max(0, Math.min(latest / scrollThreshold, 1));
      const index = Math.min(
        Math.floor(progress * totalItems),
        totalItems - 1
      );
      setActiveIndex(index);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <section
      ref={containerRef}
      id='guarantee'
      className={cn(
        'relative',
        'min-h-[500vh]', // Hauteur importante pour permettre le scroll (500vh pour 4 items + section finale)
        'bg-gradient-to-b from-white via-[#E8F3EF]/10 to-white'
      )}
    >
      {/* Sticky Container */}
      <div className='sticky top-0 h-screen flex items-center justify-center overflow-hidden'>
        {/* Background Gradient Animé */}
        <motion.div
          className={cn(
            'absolute inset-0 -z-10',
            'bg-gradient-to-br',
            guaranteeItems[activeIndex].gradient,
            'transition-all duration-1000 ease-out'
          )}
        />

        {/* Contenu principal */}
        <div className='container mx-auto max-w-[1370px] px-6 md:px-10 lg:px-14 xl:px-20'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            {/* LEFT SIDE - Contenu texte qui change */}
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className='space-y-6'
            >
              {/* Section Label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[0.875rem] uppercase',
                  'tracking-[1.5px]',
                  'text-primary',
                  'font-semibold',
                  'mb-2'
                )}
              >
                POURQUOI ME FAIRE CONFIANCE
              </motion.div>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className={cn(
                  'w-20 h-20 rounded-full',
                  'bg-white shadow-lg',
                  'flex items-center justify-center',
                  'mb-4'
                )}
              >
                {React.createElement(guaranteeItems[activeIndex].icon, {
                  className: cn('w-10 h-10', guaranteeItems[activeIndex].color),
                  strokeWidth: 2,
                })}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(
                  "font-sans",
                  'text-[2rem] md:text-[2.5rem] lg:text-[3rem]',
                  'font-bold',
                  'text-[#2C3E3C]',
                  'leading-[1.1]'
                )}
              >
                {guaranteeItems[activeIndex].title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1.125rem] md:text-[1.25rem]',
                  'text-[#667674]',
                  'leading-[1.7]',
                  'max-w-[720px]'
                )}
              >
                {guaranteeItems[activeIndex].description}
              </motion.p>

              {/* Progress Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className='flex gap-2 pt-4'
              >
                {guaranteeItems.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1 rounded-full transition-all duration-500',
                      index === activeIndex
                        ? 'w-12 bg-primary'
                        : 'w-8 bg-gray-300'
                    )}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT SIDE - Visual avec Shield principal */}
            <div className='relative hidden lg:flex items-center justify-center'>
              {/* Grand Shield avec effet de glow */}
              <motion.div
                key={`shield-${activeIndex}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                }}
                className='relative'
              >
                {/* Glow effect */}
                <div
                  className={cn(
                    'absolute inset-0',
                    'bg-gradient-to-br',
                    guaranteeItems[activeIndex].gradient,
                    'rounded-full blur-3xl',
                    'scale-150',
                    'opacity-60',
                    'transition-all duration-1000'
                  )}
                />

                {/* Main Icon - Change selon l'item actif */}
                <div
                  className={cn(
                    'relative',
                    'w-64 h-64 md:w-80 md:h-80',
                    'bg-white',
                    'rounded-full',
                    'shadow-2xl',
                    'flex items-center justify-center',
                    'border-4 border-white'
                  )}
                >
                  {React.createElement(guaranteeItems[activeIndex].icon, {
                    className: cn(
                      'w-32 h-32 md:w-40 md:h-40',
                      guaranteeItems[activeIndex].color,
                      'transition-colors duration-500'
                    ),
                    strokeWidth: 1.5,
                  })}
                </div>

                {/* Floating badges autour */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className='absolute -top-4 -right-4 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-primary/20'
                >
                  <span className='text-primary font-bold text-sm'>
                    Certifiée 2024
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                  className='absolute -bottom-4 -left-4 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-primary/20'
                >
                  <span className='text-primary font-bold text-sm'>
                    ASCA/RME
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator en bas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className='absolute bottom-10 left-1/2 -translate-x-1/2 text-center'
        >
          <p className='text-sm text-gray-500 mb-2'>Scrollez pour découvrir</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className='w-6 h-10 border-2 border-gray-300 rounded-full flex items-start justify-center p-2'
          >
            <div className='w-1 h-2 bg-gray-400 rounded-full' />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
