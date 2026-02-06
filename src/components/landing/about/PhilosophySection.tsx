'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Section Philosophie - Principes de Travail (Style Bento Grid 2025)
 *
 * Cette section présente les 5 principes fondamentaux qui guident
 * l'approche de Lucie dans ses accompagnements nutritionnels.
 *
 * Features:
 * - Design Bento Grid moderne et épuré
 * - 5 principes avec icônes et descriptions concises
 * - Animations au scroll avec délais échelonnés
 * - Design responsive complet
 * - Accessibilité optimisée
 */
export function PhilosophySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: '-100px',
  });

  // Données des principes
  const principles = [
    {
      emoji: '🔍',
      title: 'Votre corps a toujours une raison',
      description:
        'Si vous avez des symptômes, il y a une cause. Mon travail est de la trouver avec vous.',
    },
    {
      emoji: '🚫',
      title: 'Zéro régime restrictif',
      description:
        "L'alimentation ne devrait pas être une source de stress, mais de plaisir et d'énergie.",
    },
    {
      emoji: '🧬',
      title: 'Approche holistique',
      description:
        'Votre corps est un système complexe. Je le regarde dans son ensemble.',
    },
    {
      emoji: '🎯',
      title: 'Solutions personnalisées',
      description:
        'Votre programme est créé pour VOUS, ajusté à VOS contraintes, adapté à VOS goûts.',
    },
    {
      emoji: '💪',
      title: 'Autonomie, pas dépendance',
      description:
        'Mon objectif est que vous compreniez votre corps et deveniez votre propre experte.',
    },
  ];

  return (
    <section
      ref={ref}
      className={cn(
        'relative w-full',
        'bg-white',
        'py-[100px] px-10',
        'max-md:py-[60px] max-md:px-6'
      )}
    >
      <div className='container mx-auto max-w-[1300px]'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[60px]'>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              lineHeight: '57.6px',
              fontWeight: 700,
              color: '#3f6655',
              textAlign: 'center',
              marginBottom: '16px',
            }}
            className='max-md:!text-[2rem] max-md:!leading-[2.4rem]'
          >
            Comment Je Travaille (Et Pourquoi C'est Différent)
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.125rem]',
              'text-[#667674]',
              'mb-8'
            )}
          >
            Cinq principes qui guident chaque accompagnement
          </motion.p>
        </div>

        {/* ============================================ */}
        {/* BENTO GRID LAYOUT                            */}
        {/* ============================================ */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1100px] mx-auto'>
          {principles.map((principle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className={cn(
                'p-6',
                'bg-white',
                'border border-[#E8F3EF]',
                'rounded-xl',
                'hover:border-primary/30',
                'transition-all duration-300',
                'hover:shadow-[0_4px_20px_rgba(44,62,60,0.08)]',
                'flex flex-col gap-4'
              )}
            >
              {/* Emoji */}
              <div className='text-[2.5rem] leading-none'>
                {principle.emoji}
              </div>

              {/* Title */}
              <h3
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1.125rem]',
                  'font-semibold',
                  'text-[#2C3E3C]'
                )}
              >
                {principle.title}
              </h3>

              {/* Description */}
              <p
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[0.875rem]',
                  'text-[#667674]',
                  'leading-[1.6]'
                )}
              >
                {principle.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PhilosophySection;
