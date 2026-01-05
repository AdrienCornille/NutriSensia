'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';

/**
 * Section "Mes Principes" - Page L'Approche
 *
 * Cette section présente les 3 piliers fondamentaux de l'approche
 * nutritionnelle avec des cartes verticales empilées.
 *
 * Features:
 * - 3 cartes verticales (pas côte à côte)
 * - Badges numérotés circulaires
 * - Why boxes avec explications
 * - Animations hover et scroll
 * - Design cohérent avec le système
 * - Responsive mobile/desktop
 *
 * @example
 * ```tsx
 * <PhilosophySection />
 * ```
 */
export function PhilosophySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Données des 3 piliers
  const pillars = [
    {
      number: '1',
      title: 'Écouter Avant de Prescrire',
      subtitle: "Vous N'Êtes Pas Un Cas, Vous Êtes Une Personne",
      content: [
        'Trop de nutritionnistes appliquent des protocoles génériques sans prendre le temps de comprendre QUI vous êtes vraiment.',
        'Moi, je commence par écouter :',
        [
          'Votre histoire avec la nourriture',
          'Vos symptômes et votre quotidien',
          'Vos goûts, votre culture alimentaire',
          'Vos objectifs réels (pas ceux que vous pensez devoir avoir)',
        ],
      ],
      whyBox:
        "Pourquoi c'est essentiel : Un plan qui ne tient pas compte de votre réalité ne sera jamais suivi. Et un plan non suivi ne sert à rien.",
    },
    {
      number: '2',
      title: 'Science + Intuition',
      subtitle: 'Le Meilleur des Deux Mondes',
      content: [
        "D'un côté, la science :",
        "Micronutrition, nutrition fonctionnelle, gestion de l'inflammation, équilibre hormonal.",
        "De l'autre, votre intuition :",
        'Vos signaux de faim et satiété, votre ressenti face aux aliments, votre contexte émotionnel.',
      ],
      whyBox:
        "Pourquoi les deux : La science seule crée des robots. L'intuition seule crée de la confusion. Les deux ensemble créent des résultats durables.",
    },
    {
      number: '3',
      title: 'Transformation, Pas Perfection',
      subtitle: "L'Objectif N'Est Pas d'Être Parfaite",
      content: [
        "Je ne crois pas à la perfection alimentaire. Je ne crois pas qu'il faille tout bannir ou se sentir coupable après un écart.",
        'Ce que je crois :',
        [
          'Vous avez le droit de manger un dessert sans culpabiliser',
          'Les « écarts » sont normaux et ne ruinent pas vos progrès',
          "L'équilibre, c'est 80% d'habitudes solides et 20% de flexibilité",
        ],
      ],
      whyBox:
        "Pourquoi c'est libérateur : Les régimes restrictifs créent de la frustration. La bienveillance crée des résultats qui durent.",
    },
  ];

  return (
    <section
      ref={ref}
      id='philosophy'
      className={cn(
        // Container principal
        'relative',
        // Gradient de fond vert sage (3% à 5% d'opacité)
        'bg-gradient-to-b from-[#f8faf9] to-[#f6f9f7]',
        'section-padding', // Classe responsive centralisée
        'prevent-overflow'
      )}
    >
      {/* Container centré avec max-width */}
      <div className='container mx-auto max-w-[1200px]'>
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
            MES PRINCIPES
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
            Les 3 Piliers de Mon Approche
          </motion.h2>
        </div>

        {/* ============================================ */}
        {/* CARDS LAYOUT - 3 CARTES VERTICALES           */}
        {/* ============================================ */}
        <div
          className={cn('flex flex-col', 'gap-10', 'max-w-[900px]', 'mx-auto')}
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.6,
                delay: 0.2 + index * 0.2, // Stagger de 0.2s entre chaque carte
                ease: 'easeOut',
              }}
              className={cn(
                // Base styling
                'relative',
                'bg-white',
                'p-[50px]',
                'max-md:p-[30px]',
                'rounded-2xl',
                'border-l-[6px] border-primary',
                'shadow-[0_4px_20px_rgba(44,62,60,0.08)]',
                'transition-all duration-300 ease-out',
                // Hover effects
                'hover:transform hover:translate-x-[5px]',
                'hover:shadow-[0_6px_30px_rgba(44,62,60,0.12)]',
                'cursor-default'
              )}
            >
              {/* Badge numéroté circulaire */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={
                  isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
                }
                transition={{
                  duration: 0.5,
                  delay: 0.4 + index * 0.2,
                  type: 'spring',
                  stiffness: 200,
                }}
                className={cn(
                  'absolute -top-6 left-[50px]',
                  'max-md:left-[30px]',
                  'w-[50px] h-[50px]',
                  'max-md:w-[40px] max-md:h-[40px]',
                  'bg-primary',
                  'rounded-full',
                  'flex items-center justify-center',
                  'shadow-lg'
                )}
              >
                <span
                  className={cn(
                    'text-white',
                    'font-bold',
                    'text-[1.5rem]',
                    'max-md:text-[1.25rem]'
                  )}
                >
                  {pillar.number}
                </span>
              </motion.div>

              {/* Contenu de la carte */}
              <div className='pt-6'>
                {/* Titre H3 */}
                <h3
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1.75rem]',
                    'max-md:text-[1.5rem]',
                    'font-bold',
                    'text-[#2C3E3C]',
                    'leading-[1.3]',
                    'mb-4'
                  )}
                >
                  {pillar.title}
                </h3>

                {/* Sous-titre (tagline) */}
                <p
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1.125rem]',
                    'italic',
                    'text-primary',
                    'leading-[1.4]',
                    'mb-6'
                  )}
                >
                  {pillar.subtitle}
                </p>

                {/* Contenu principal */}
                <div
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1rem]',
                    'leading-[1.7]',
                    'text-[#667674]',
                    'space-y-4'
                  )}
                >
                  {pillar.content.map((item, itemIndex) => {
                    if (Array.isArray(item)) {
                      // Liste à puces
                      return (
                        <ul key={itemIndex} className='ml-6 space-y-2'>
                          {item.map((listItem, listIndex) => (
                            <li key={listIndex} className='list-disc'>
                              {listItem}
                            </li>
                          ))}
                        </ul>
                      );
                    } else {
                      // Paragraphe normal
                      return <p key={itemIndex}>{item}</p>;
                    }
                  })}
                </div>

                {/* Why Box */}
                <div
                  className={cn(
                    'mt-6',
                    'bg-primary/5',
                    'p-5',
                    'rounded-lg',
                    'border-l-[3px] border-primary'
                  )}
                >
                  <p
                    className={cn(
                      "font-['Inter',system-ui,sans-serif]",
                      'text-[0.95rem]',
                      'italic',
                      'text-[#2C3E3C]',
                      'leading-[1.6]'
                    )}
                  >
                    {pillar.whyBox}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PhilosophySection;
