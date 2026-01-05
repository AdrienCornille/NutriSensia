'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Stethoscope, UserCheck, Brain, Leaf } from 'lucide-react';

/**
 * Section Réseau Professionnel - Je Travaille en Réseau
 *
 * Cette section démontre l'approche collaborative de Lucie et sa capacité
 * à travailler en équipe avec d'autres professionnels de santé.
 *
 * Features:
 * - Grille 2x2 des types de collaboration
 * - Cartes professionnelles avec icônes et descriptions
 * - Texte de conclusion sur la collaboration
 * - Animations au scroll avec délais échelonnés
 * - Design professionnel mais chaleureux
 */
export function ProfessionalNetworkSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: '-100px',
  });

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1 },
  };

  const closingVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Données des collaborations
  const collaborations = [
    {
      icon: Stethoscope,
      title: 'Médecins Généralistes et Endocrinologues',
      description: 'Pour les bilans hormonaux et le suivi médical',
    },
    {
      icon: UserCheck,
      title: 'Gynécologues',
      description: 'Pour les cas de SOPK, endométriose, fertilité',
    },
    {
      icon: Brain,
      title: 'Psychologues et Thérapeutes',
      description:
        "Pour l'accompagnement émotionnel et les troubles du comportement alimentaire",
    },
    {
      icon: Leaf,
      title: 'Naturopathes et Ostéopathes',
      description: 'Pour une approche intégrative',
    },
  ];

  return (
    <section
      ref={ref}
      className={cn(
        // Container principal
        'relative w-full',
        // Background sage léger
        'bg-[#F8FAF9]',
        // Padding responsive
        'py-20 px-10',
        'max-md:py-[60px] max-md:px-6',
        'prevent-overflow'
      )}
    >
      {/* Container centré avec max-width */}
      <div className='container mx-auto max-w-[1000px]'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[50px]'>
          {/* H2 Title */}
          <motion.h2
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={headerVariants}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              lineHeight: '57.6px',
              fontWeight: 700,
              color: '#3f6655',
              textAlign: 'center',
              marginBottom: '24px',
            }}
            className='max-md:!text-[2rem] max-md:!leading-[2.4rem]'
          >
            Je Travaille en Réseau
          </motion.h2>

          {/* Intro Text */}
          <motion.p
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={headerVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.125rem] max-md:text-[1rem]',
              'leading-[1.7]',
              'text-[#6B7280]', // Text secondary
              'text-center',
              'max-w-[800px]',
              'mx-auto',
              'mb-[50px]'
            )}
          >
            La nutrition est une pièce du puzzle, pas le puzzle entier. C'est
            pourquoi je collabore régulièrement avec :
          </motion.p>
        </div>

        {/* ============================================ */}
        {/* COLLABORATIONS GRID                          */}
        {/* ============================================ */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-[30px] max-md:gap-5 mb-[50px]'>
          {collaborations.map((collaboration, index) => (
            <motion.div
              key={index}
              initial='hidden'
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
              className={cn(
                // Card styling
                'bg-white',
                'p-[30px] max-md:p-[25px]',
                'rounded-xl',
                'border-t-4 border-primary',
                'shadow-[0_2px_12px_rgba(44,62,60,0.06)]',
                // Layout
                'flex flex-col',
                'text-center',
                'min-h-[200px]',
                // Interactions
                'transition-all duration-300 ease-out',
                'hover:-translate-y-2 hover:shadow-[0_8px_25px_rgba(44,62,60,0.12)]'
              )}
            >
              {/* Icon */}
              <motion.div
                className='mb-5 flex justify-center'
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                variants={iconVariants}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.15 }}
              >
                <collaboration.icon
                  className='w-10 h-10 text-primary'
                  aria-hidden='true'
                />
              </motion.div>

              {/* Title */}
              <h3
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1.125rem]',
                  'font-bold',
                  'text-[#2C3E3C]', // Primary dark
                  'text-center',
                  'leading-[1.3]',
                  'mb-4'
                )}
              >
                {collaboration.title}
              </h3>

              {/* Description */}
              <p
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[0.95rem] max-md:text-[0.9rem]',
                  'leading-[1.6]',
                  'text-[#6B7280]', // Text secondary
                  'text-center',
                  'max-w-[250px]',
                  'mx-auto'
                )}
              >
                {collaboration.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ============================================ */}
        {/* CLOSING TEXT                                 */}
        {/* ============================================ */}
        <motion.div
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          variants={closingVariants}
          transition={{ duration: 0.6, delay: 0.6 }}
          className={cn(
            // Background et styling
            'bg-primary/10',
            'border-l-4 border-primary',
            'p-[25px] max-md:p-5',
            'rounded-lg',
            'max-w-[800px]',
            'mx-auto',
            'shadow-[0_2px_10px_rgba(44,62,60,0.04)]'
          )}
        >
          <p
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1rem] max-md:text-[0.95rem]',
              'leading-[1.7]',
              'text-[#6B7280]', // Text secondary
              'text-center',
              'italic'
            )}
          >
            Si votre situation nécessite un suivi médical complémentaire, je
            vous l'indiquerai clairement et je peux vous recommander des
            professionnels de confiance.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ProfessionalNetworkSection;















